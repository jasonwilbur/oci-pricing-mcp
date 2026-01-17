/**
 * OCI Kubernetes (OKE) Pricing Tools
 */

import { getKubernetesPricing, getComputePricing, getLastUpdated } from '../data/fetcher.js';

export interface ListKubernetesOptionsParams {
  clusterType?: 'basic' | 'enhanced' | 'virtual-nodes';
}

export interface KubernetesOptionInfo {
  name: string;
  type: string;
  description: string;
  managementFee: number;
  unit: string;
  monthlyExample: string;
  features: string[];
  notes?: string;
}

/**
 * List available OKE (Kubernetes) options with pricing
 */
export function listKubernetesOptions(params: ListKubernetesOptionsParams = {}): {
  options: KubernetesOptionInfo[];
  totalCount: number;
  lastUpdated: string;
  keyPoints: string[];
  tips: string[];
} {
  let k8s = getKubernetesPricing();

  // Filter by cluster type
  if (params.clusterType) {
    const typeFilter = params.clusterType.toLowerCase();
    k8s = k8s.filter((k) => k.type?.toLowerCase().includes(typeFilter));
  }

  // Transform to user-friendly format
  const options: KubernetesOptionInfo[] = k8s.map((k) => {
    const fee = (k as { clusterManagementFee?: number }).clusterManagementFee || k.pricePerUnit;
    const isFree = fee === 0;

    return {
      name: k.type,
      type: k.type?.includes('virtual') ? 'serverless' : k.type?.includes('enhanced') ? 'enhanced' : 'basic',
      description: k.description,
      managementFee: fee,
      unit: k.unit,
      monthlyExample: isFree
        ? 'FREE (pay only for worker nodes)'
        : `$${Math.round(fee * 730 * 100) / 100}/month per cluster`,
      features: getOKEFeatures(k.type),
      notes: k.notes,
    };
  });

  return {
    options,
    totalCount: options.length,
    lastUpdated: getLastUpdated(),
    keyPoints: [
      'OKE Basic clusters are FREE - pay only for worker node compute',
      'OKE Enhanced clusters: $0.10/hour ($73/month) with 99.95% SLA',
      'Virtual Nodes: Serverless pods, pay per OCPU and memory used',
      'Control plane is always managed by OCI at no extra charge',
    ],
    tips: [
      'Start with Basic cluster - upgrade to Enhanced when you need SLA guarantees',
      'Use A1.Flex (Arm) nodes for significant cost savings',
      'Virtual Nodes eliminate node management but have higher per-pod cost',
      'Consider spot/preemptible instances for non-critical workloads',
      'OKE includes built-in integration with OCI networking, storage, IAM',
    ],
  };
}

function getOKEFeatures(type: string): string[] {
  const features: Record<string, string[]> = {
    'oke-cluster-management': [
      'Managed Kubernetes control plane',
      'Auto-upgrade support',
      'kubectl/API access',
    ],
    'oke-basic-cluster': [
      'No management fee',
      'Standard Kubernetes features',
      'Manual node management',
      'Community support',
    ],
    'oke-enhanced-cluster': [
      '99.95% SLA',
      'Virtual nodes support',
      'Workload identity',
      'Cluster add-ons management',
      'Premium support eligible',
    ],
    'oke-virtual-node': [
      'Serverless pods',
      'No node management',
      'Auto-scaling',
      'Pay per pod resources',
    ],
    'oke-virtual-node-memory': [
      'Memory for virtual node pods',
    ],
  };

  return features[type] || ['Standard OKE features'];
}

/**
 * Calculate OKE cluster cost for a given configuration
 */
export interface CalculateKubernetesCostParams {
  clusterType: 'basic' | 'enhanced';
  nodeCount: number;
  nodeShape: string; // e.g., 'VM.Standard.E5.Flex'
  nodeOcpus: number;
  nodeMemoryGB: number;
  virtualNodes?: {
    podOcpus: number;
    podMemoryGB: number;
    hoursPerMonth: number;
  };
}

export function calculateKubernetesCost(params: CalculateKubernetesCostParams): {
  breakdown: Array<{ item: string; quantity: number; unit: string; unitPrice: number; monthlyTotal: number }>;
  totalMonthly: number;
  perNodeCost: number;
  notes: string[];
} {
  const k8s = getKubernetesPricing();
  const compute = getComputePricing();
  const breakdown: Array<{ item: string; quantity: number; unit: string; unitPrice: number; monthlyTotal: number }> = [];
  const notes: string[] = [];

  // Cluster management fee
  if (params.clusterType === 'enhanced') {
    const enhancedCluster = k8s.find((k) => k.type === 'oke-enhanced-cluster');
    if (enhancedCluster) {
      const clusterFee = (enhancedCluster as { clusterManagementFee?: number }).clusterManagementFee || enhancedCluster.pricePerUnit;
      const clusterCost = clusterFee * 730;
      breakdown.push({
        item: 'OKE Enhanced Cluster',
        quantity: 1,
        unit: 'cluster',
        unitPrice: clusterFee,
        monthlyTotal: Math.round(clusterCost * 100) / 100,
      });
      notes.push('Enhanced cluster includes 99.95% SLA and advanced features');
    }
  } else {
    breakdown.push({
      item: 'OKE Basic Cluster',
      quantity: 1,
      unit: 'cluster',
      unitPrice: 0,
      monthlyTotal: 0,
    });
    notes.push('Basic cluster is FREE - control plane management included');
  }

  // Worker node compute cost
  const nodeShape = compute.find(
    (c) => c.shapeFamily?.toLowerCase() === params.nodeShape.toLowerCase()
  );

  if (nodeShape) {
    // OCPU cost per node
    const nodeOcpuCost = nodeShape.ocpuPrice * params.nodeOcpus * 730;
    const totalOcpuCost = nodeOcpuCost * params.nodeCount;

    breakdown.push({
      item: `Worker Nodes - ${nodeShape.shapeFamily} OCPUs`,
      quantity: params.nodeCount * params.nodeOcpus,
      unit: 'OCPU',
      unitPrice: nodeShape.ocpuPrice,
      monthlyTotal: Math.round(totalOcpuCost * 100) / 100,
    });

    // Memory cost per node
    const nodeMemoryCost = nodeShape.memoryPricePerGB * params.nodeMemoryGB * 730;
    const totalMemoryCost = nodeMemoryCost * params.nodeCount;

    breakdown.push({
      item: `Worker Nodes - ${nodeShape.shapeFamily} Memory`,
      quantity: params.nodeCount * params.nodeMemoryGB,
      unit: 'GB',
      unitPrice: nodeShape.memoryPricePerGB,
      monthlyTotal: Math.round(totalMemoryCost * 100) / 100,
    });
  } else {
    notes.push(`Node shape "${params.nodeShape}" not found - compute costs not included`);
  }

  // Virtual nodes (if specified)
  if (params.virtualNodes) {
    const virtualNodeOcpu = k8s.find((k) => k.type === 'oke-virtual-node');
    const virtualNodeMemory = k8s.find((k) => k.type === 'oke-virtual-node-memory');

    if (virtualNodeOcpu && virtualNodeMemory) {
      const vnOcpuCost = virtualNodeOcpu.pricePerUnit * params.virtualNodes.podOcpus * params.virtualNodes.hoursPerMonth;
      const vnMemoryCost = virtualNodeMemory.pricePerUnit * params.virtualNodes.podMemoryGB * params.virtualNodes.hoursPerMonth;

      breakdown.push({
        item: 'Virtual Node Pod OCPUs',
        quantity: params.virtualNodes.podOcpus,
        unit: 'OCPU',
        unitPrice: virtualNodeOcpu.pricePerUnit,
        monthlyTotal: Math.round(vnOcpuCost * 100) / 100,
      });

      breakdown.push({
        item: 'Virtual Node Pod Memory',
        quantity: params.virtualNodes.podMemoryGB,
        unit: 'GB',
        unitPrice: virtualNodeMemory.pricePerUnit,
        monthlyTotal: Math.round(vnMemoryCost * 100) / 100,
      });

      notes.push(`Virtual nodes calculated for ${params.virtualNodes.hoursPerMonth} hours/month`);
    }
  }

  const totalMonthly = breakdown.reduce((sum, item) => sum + item.monthlyTotal, 0);

  // Calculate per-node cost for reference
  const nodeComputeItems = breakdown.filter((b) => b.item.includes('Worker Nodes'));
  const totalNodeCost = nodeComputeItems.reduce((sum, item) => sum + item.monthlyTotal, 0);
  const perNodeCost = params.nodeCount > 0 ? Math.round((totalNodeCost / params.nodeCount) * 100) / 100 : 0;

  return {
    breakdown,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    perNodeCost,
    notes,
  };
}

/**
 * Compare OKE pricing with EKS/AKS/GKE
 */
export function compareKubernetesProviders(
  nodeCount: number,
  nodeOcpus: number,
  nodeMemoryGB: number
): {
  ociBasic: number;
  ociEnhanced: number;
  awsEks: number;
  azureAks: number;
  gcpGke: number;
  notes: string[];
} {
  // Get OCI compute pricing for comparison
  const compute = getComputePricing();
  const e5Shape = compute.find((c) => c.shapeFamily === 'VM.Standard.E5.Flex');

  // Calculate OCI costs
  const ociNodeCost = e5Shape
    ? (e5Shape.ocpuPrice * nodeOcpus + e5Shape.memoryPricePerGB * nodeMemoryGB) * 730 * nodeCount
    : 0;

  const ociBasic = Math.round(ociNodeCost * 100) / 100;
  const ociEnhanced = Math.round((ociNodeCost + 73) * 100) / 100; // +$73/month for enhanced

  // Rough estimates for other providers (based on similar 4 OCPU / 8 vCPU, 32GB instances)
  // AWS: EKS cluster $73/month + EC2 costs (~$0.10-0.15/vCPU/hr)
  // Azure: AKS free control plane + VM costs
  // GCP: GKE $73/month (standard) + VM costs

  // Using rough vCPU rates for comparison (1 OCPU = 2 vCPUs)
  const vCpuCount = nodeOcpus * 2 * nodeCount;
  const awsVcpuRate = 0.048; // Rough rate for m6i in us-east-1
  const awsMemoryRate = 0.006;
  const awsComputeCost = (awsVcpuRate * vCpuCount + awsMemoryRate * nodeMemoryGB * nodeCount) * 730;
  const awsEks = Math.round((awsComputeCost + 73) * 100) / 100; // EKS cluster fee

  // Azure AKS - free control plane
  const azureVcpuRate = 0.045;
  const azureMemoryRate = 0.005;
  const azureComputeCost = (azureVcpuRate * vCpuCount + azureMemoryRate * nodeMemoryGB * nodeCount) * 730;
  const azureAks = Math.round(azureComputeCost * 100) / 100;

  // GCP GKE
  const gcpVcpuRate = 0.044;
  const gcpMemoryRate = 0.006;
  const gcpComputeCost = (gcpVcpuRate * vCpuCount + gcpMemoryRate * nodeMemoryGB * nodeCount) * 730;
  const gcpGke = Math.round((gcpComputeCost + 73) * 100) / 100; // GKE standard cluster fee

  return {
    ociBasic,
    ociEnhanced,
    awsEks,
    azureAks,
    gcpGke,
    notes: [
      'OCI Basic cluster has no management fee (others charge $73/month)',
      'OCI offers ~30-50% lower compute costs for equivalent specs',
      'OCI 1 OCPU = 2 vCPUs (physical cores vs threads)',
      'Prices are estimates; actual costs vary by region and instance type',
      'AWS EKS, GCP GKE Standard both charge $0.10/hour cluster fee',
      'Azure AKS has free control plane like OCI Basic',
    ],
  };
}
