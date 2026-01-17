#!/usr/bin/env node
/**
 * OCI Pricing MCP Server
 * Provides Oracle Cloud Infrastructure pricing data to AI assistants via MCP protocol
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError, } from '@modelcontextprotocol/sdk/types.js';
// Import tools
import { getPricing, listServices, compareRegions, listRegions } from './tools/core.js';
import { calculateMonthlyCost, quickEstimate } from './tools/calculator.js';
import { listComputeShapes, getComputeShapeDetails, compareComputeShapes } from './tools/compute.js';
import { listStorageOptions, calculateStorageCost, compareStorageTiers } from './tools/storage.js';
import { listDatabaseOptions, calculateDatabaseCost, compareDatabaseOptions } from './tools/database.js';
import { listNetworkingOptions, calculateNetworkingCost, compareDataEgress } from './tools/networking.js';
import { listKubernetesOptions, calculateKubernetesCost, compareKubernetesProviders } from './tools/kubernetes.js';
import { getLastUpdated, getFreeTier } from './data/fetcher.js';
// Create server instance
const server = new Server({
    name: 'oci-pricing-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Define available tools
const TOOLS = [
    // Core tools
    {
        name: 'get_pricing',
        description: 'Get pricing for any OCI resource by service and type. Services: compute, storage, database, networking, kubernetes.',
        inputSchema: {
            type: 'object',
            properties: {
                service: {
                    type: 'string',
                    enum: ['compute', 'storage', 'database', 'networking', 'kubernetes'],
                    description: 'OCI service category',
                },
                type: {
                    type: 'string',
                    description: 'Optional filter for specific resource type (e.g., "E5", "block", "autonomous")',
                },
                region: {
                    type: 'string',
                    description: 'Optional region (OCI has consistent pricing across commercial regions)',
                },
            },
            required: ['service'],
        },
    },
    {
        name: 'list_services',
        description: 'List all OCI services with pricing categories. Filter by category: compute, storage, database, networking, kubernetes, ai-ml, observability, etc.',
        inputSchema: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    description: 'Filter by service category',
                },
            },
        },
    },
    {
        name: 'compare_regions',
        description: 'Compare pricing for a resource across OCI regions. Note: OCI maintains consistent pricing across all commercial regions.',
        inputSchema: {
            type: 'object',
            properties: {
                service: {
                    type: 'string',
                    enum: ['compute', 'storage', 'database', 'networking', 'kubernetes'],
                    description: 'OCI service category',
                },
                type: {
                    type: 'string',
                    description: 'Resource type to compare',
                },
            },
            required: ['service', 'type'],
        },
    },
    {
        name: 'list_regions',
        description: 'List all available OCI regions with their locations.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'calculate_monthly_cost',
        description: 'Calculate estimated monthly cost for an OCI configuration with compute, storage, database, and networking.',
        inputSchema: {
            type: 'object',
            properties: {
                compute: {
                    type: 'object',
                    properties: {
                        shape: { type: 'string', description: 'Compute shape (e.g., VM.Standard.E5.Flex)' },
                        ocpus: { type: 'number', description: 'Number of OCPUs' },
                        memoryGB: { type: 'number', description: 'Memory in GB' },
                        hoursPerMonth: { type: 'number', description: 'Hours per month (default: 730 for 24/7)' },
                    },
                    required: ['shape', 'ocpus', 'memoryGB'],
                },
                storage: {
                    type: 'object',
                    properties: {
                        blockVolumeGB: { type: 'number' },
                        objectStorageGB: { type: 'number' },
                        archiveStorageGB: { type: 'number' },
                        fileStorageGB: { type: 'number' },
                    },
                },
                database: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: 'Database type (e.g., autonomous-transaction-processing)' },
                        ecpus: { type: 'number' },
                        storageGB: { type: 'number' },
                        licenseIncluded: { type: 'boolean' },
                    },
                    required: ['type'],
                },
                networking: {
                    type: 'object',
                    properties: {
                        loadBalancerBandwidthMbps: { type: 'number' },
                        outboundDataGB: { type: 'number' },
                    },
                },
                region: { type: 'string', description: 'OCI region (default: us-ashburn-1)' },
            },
        },
    },
    {
        name: 'quick_estimate',
        description: 'Get a quick cost estimate for common deployment presets: small-web-app, medium-api-server, large-database, ml-training, kubernetes-cluster.',
        inputSchema: {
            type: 'object',
            properties: {
                preset: {
                    type: 'string',
                    enum: ['small-web-app', 'medium-api-server', 'large-database', 'ml-training', 'kubernetes-cluster'],
                    description: 'Deployment preset',
                },
                region: { type: 'string', description: 'OCI region' },
            },
            required: ['preset'],
        },
    },
    // Compute tools
    {
        name: 'list_compute_shapes',
        description: 'List all OCI compute shapes (VMs, bare metal, GPU) with OCPU and memory pricing.',
        inputSchema: {
            type: 'object',
            properties: {
                family: { type: 'string', description: 'Filter by shape family (e.g., E4, E5, A1, GPU)' },
                type: { type: 'string', description: 'Filter by type (e.g., flexible-vm, bare-metal, gpu)' },
                maxOcpuPrice: { type: 'number', description: 'Maximum OCPU price per hour' },
            },
        },
    },
    {
        name: 'get_compute_shape_details',
        description: 'Get detailed pricing and configuration options for a specific compute shape.',
        inputSchema: {
            type: 'object',
            properties: {
                shapeFamily: { type: 'string', description: 'Shape family (e.g., VM.Standard.E5.Flex)' },
            },
            required: ['shapeFamily'],
        },
    },
    {
        name: 'compare_compute_shapes',
        description: 'Compare pricing between multiple compute shapes.',
        inputSchema: {
            type: 'object',
            properties: {
                shapes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of shape families to compare',
                },
            },
            required: ['shapes'],
        },
    },
    // Storage tools
    {
        name: 'list_storage_options',
        description: 'List all OCI storage options (block, object, file, archive) with pricing.',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['block', 'object', 'file', 'archive'],
                    description: 'Filter by storage type',
                },
            },
        },
    },
    {
        name: 'calculate_storage_cost',
        description: 'Calculate storage cost for a specific configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                blockVolumeGB: { type: 'number' },
                blockPerformanceTier: { type: 'string', enum: ['basic', 'balanced', 'high', 'ultra'] },
                objectStorageGB: { type: 'number' },
                objectStorageTier: { type: 'string', enum: ['standard', 'infrequent', 'archive'] },
                fileStorageGB: { type: 'number' },
            },
        },
    },
    {
        name: 'compare_storage_tiers',
        description: 'Compare all storage tier pricing for a given size.',
        inputSchema: {
            type: 'object',
            properties: {
                sizeGB: { type: 'number', description: 'Storage size in GB' },
            },
            required: ['sizeGB'],
        },
    },
    // Database tools
    {
        name: 'list_database_options',
        description: 'List all OCI database options (Autonomous, MySQL, PostgreSQL, NoSQL) with pricing.',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['autonomous', 'mysql', 'postgresql', 'nosql', 'base-db', 'exadata'],
                    description: 'Filter by database type',
                },
                licenseType: {
                    type: 'string',
                    enum: ['included', 'byol'],
                    description: 'Filter by license type',
                },
            },
        },
    },
    {
        name: 'calculate_database_cost',
        description: 'Calculate database cost for a specific configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['autonomous-transaction-processing', 'autonomous-data-warehouse', 'autonomous-json', 'mysql-heatwave', 'postgresql', 'nosql', 'base-database-vm'],
                    description: 'Database type',
                },
                computeUnits: { type: 'number', description: 'ECPUs or OCPUs' },
                storageGB: { type: 'number' },
                licenseType: { type: 'string', enum: ['included', 'byol'] },
                hoursPerMonth: { type: 'number' },
            },
            required: ['type', 'computeUnits', 'storageGB'],
        },
    },
    {
        name: 'compare_database_options',
        description: 'Compare database options for a specific workload type.',
        inputSchema: {
            type: 'object',
            properties: {
                workloadType: {
                    type: 'string',
                    enum: ['oltp', 'analytics', 'document', 'general'],
                    description: 'Workload type',
                },
            },
            required: ['workloadType'],
        },
    },
    // Networking tools
    {
        name: 'list_networking_options',
        description: 'List all OCI networking options (load balancers, FastConnect, VPN, egress) with pricing. Many networking services are FREE.',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['load-balancer', 'fastconnect', 'vpn', 'egress', 'gateway'],
                    description: 'Filter by networking type',
                },
            },
        },
    },
    {
        name: 'calculate_networking_cost',
        description: 'Calculate networking cost for a specific configuration, including free tier credits.',
        inputSchema: {
            type: 'object',
            properties: {
                flexibleLoadBalancers: { type: 'number' },
                loadBalancerBandwidthMbps: { type: 'number' },
                networkLoadBalancers: { type: 'number' },
                outboundDataGB: { type: 'number' },
                fastConnectGbps: { type: 'number', enum: [1, 10, 100] },
                vpnConnections: { type: 'number' },
                natGateways: { type: 'number' },
            },
        },
    },
    {
        name: 'compare_data_egress',
        description: 'Compare OCI data egress pricing with AWS/Azure/GCP.',
        inputSchema: {
            type: 'object',
            properties: {
                monthlyGB: { type: 'number', description: 'Monthly outbound data in GB' },
            },
            required: ['monthlyGB'],
        },
    },
    // Kubernetes tools
    {
        name: 'list_kubernetes_options',
        description: 'List OKE (Kubernetes) cluster options and pricing. Basic clusters are FREE.',
        inputSchema: {
            type: 'object',
            properties: {
                clusterType: {
                    type: 'string',
                    enum: ['basic', 'enhanced', 'virtual-nodes'],
                    description: 'Filter by cluster type',
                },
            },
        },
    },
    {
        name: 'calculate_kubernetes_cost',
        description: 'Calculate OKE cluster cost including control plane and worker nodes.',
        inputSchema: {
            type: 'object',
            properties: {
                clusterType: { type: 'string', enum: ['basic', 'enhanced'] },
                nodeCount: { type: 'number' },
                nodeShape: { type: 'string', description: 'Worker node shape (e.g., VM.Standard.E5.Flex)' },
                nodeOcpus: { type: 'number' },
                nodeMemoryGB: { type: 'number' },
                virtualNodes: {
                    type: 'object',
                    properties: {
                        podOcpus: { type: 'number' },
                        podMemoryGB: { type: 'number' },
                        hoursPerMonth: { type: 'number' },
                    },
                },
            },
            required: ['clusterType', 'nodeCount', 'nodeShape', 'nodeOcpus', 'nodeMemoryGB'],
        },
    },
    {
        name: 'compare_kubernetes_providers',
        description: 'Compare OKE pricing with AWS EKS, Azure AKS, and GCP GKE.',
        inputSchema: {
            type: 'object',
            properties: {
                nodeCount: { type: 'number' },
                nodeOcpus: { type: 'number' },
                nodeMemoryGB: { type: 'number' },
            },
            required: ['nodeCount', 'nodeOcpus', 'nodeMemoryGB'],
        },
    },
    // Utility tools
    {
        name: 'get_free_tier',
        description: 'Get details about OCI Always Free tier resources.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'get_pricing_info',
        description: 'Get metadata about the pricing data (last updated, source, etc.).',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
];
// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const typedArgs = args;
        switch (name) {
            // Core tools
            case 'get_pricing':
                result = getPricing(typedArgs);
                break;
            case 'list_services':
                result = listServices(typedArgs);
                break;
            case 'compare_regions':
                result = compareRegions(typedArgs);
                break;
            case 'list_regions':
                result = listRegions();
                break;
            case 'calculate_monthly_cost':
                result = calculateMonthlyCost(typedArgs);
                break;
            case 'quick_estimate':
                result = quickEstimate(typedArgs);
                break;
            // Compute tools
            case 'list_compute_shapes':
                result = listComputeShapes(typedArgs);
                break;
            case 'get_compute_shape_details':
                result = getComputeShapeDetails(typedArgs.shapeFamily);
                break;
            case 'compare_compute_shapes':
                result = compareComputeShapes(typedArgs.shapes);
                break;
            // Storage tools
            case 'list_storage_options':
                result = listStorageOptions(typedArgs);
                break;
            case 'calculate_storage_cost':
                result = calculateStorageCost(typedArgs);
                break;
            case 'compare_storage_tiers':
                result = compareStorageTiers(typedArgs.sizeGB);
                break;
            // Database tools
            case 'list_database_options':
                result = listDatabaseOptions(typedArgs);
                break;
            case 'calculate_database_cost':
                result = calculateDatabaseCost(typedArgs);
                break;
            case 'compare_database_options':
                result = compareDatabaseOptions(typedArgs.workloadType);
                break;
            // Networking tools
            case 'list_networking_options':
                result = listNetworkingOptions(typedArgs);
                break;
            case 'calculate_networking_cost':
                result = calculateNetworkingCost(typedArgs);
                break;
            case 'compare_data_egress':
                result = compareDataEgress(typedArgs.monthlyGB);
                break;
            // Kubernetes tools
            case 'list_kubernetes_options':
                result = listKubernetesOptions(typedArgs);
                break;
            case 'calculate_kubernetes_cost':
                result = calculateKubernetesCost(typedArgs);
                break;
            case 'compare_kubernetes_providers':
                result = compareKubernetesProviders(typedArgs.nodeCount, typedArgs.nodeOcpus, typedArgs.nodeMemoryGB);
                break;
            // Utility tools
            case 'get_free_tier':
                result = getFreeTier();
                break;
            case 'get_pricing_info':
                result = {
                    lastUpdated: getLastUpdated(),
                    source: 'https://www.oracle.com/cloud/price-list/',
                    note: 'OCI maintains consistent pricing across all commercial regions globally.',
                    version: '1.0.0',
                };
                break;
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (error) {
        if (error instanceof McpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(ErrorCode.InternalError, errorMessage);
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('OCI Pricing MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map