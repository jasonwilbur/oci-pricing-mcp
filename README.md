# OCI Pricing MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that provides Oracle Cloud Infrastructure pricing data to AI assistants like Claude.

> **Important Note:** This server provides pricing data from Oracle's public pricing API and bundled data. We cannot guarantee that AI assistants will always interpret pricing correctly or identify the absolute cheapest options. Always verify pricing on [Oracle's official price list](https://www.oracle.com/cloud/price-list/) before making decisions. All API calls are free of charge (no authentication required).

## Why This Exists

AWS, Azure, and GCP all have pricing MCP servers. OCI did not - until now.

| Provider | Pricing MCP | Type |
|----------|-------------|------|
| AWS | [aws-pricing-mcp-server](https://awslabs.github.io/mcp/servers/aws-pricing-mcp-server) | Official |
| Azure | [azure-pricing-mcp](https://github.com/charris-msft/azure-pricing-mcp) | Community |
| GCP | [gcp-cost-mcp-server](https://github.com/nozomi-koborinai/gcp-cost-mcp-server) | Community |
| OCI | **oci-pricing-mcp** | Community |

### Example: "How much does a 4 OCPU, 32GB VM cost on OCI?"

**You ask Claude:**
> What's the monthly cost for a VM with 4 OCPUs and 32GB RAM on OCI?

**Claude responds (using this MCP):**
```
For a VM.Standard.E5.Flex with 4 OCPUs and 32GB RAM:

  OCPU cost:    4 OCPUs × $0.03/hr = $0.12/hr
  Memory cost:  32 GB × $0.002/hr  = $0.064/hr
  Total hourly: $0.184/hr

  Monthly cost (730 hrs): $134.32

For comparison, the Arm-based A1 shape would be significantly cheaper:

  A1 total:     4 × $0.01 + 32 × $0.0015 = $0.088/hr
  Monthly:      $64.24 (52% savings)
```

### Example: "Compare OCI vs AWS for data egress"

**You ask Claude:**
> How much would I save on OCI vs AWS for 5TB of monthly data egress?

**Claude responds (using this MCP):**
```
Data Egress Cost Comparison (5 TB/month):

  OCI:
    First 10 TB free → $0.00

  AWS:
    First 10 GB: free
    Next 9.99 TB @ $0.09/GB → ~$450/month

  Monthly savings with OCI: $450 (100% savings)

OCI includes 10 TB of free outbound data transfer monthly,
making it significantly more cost-effective for data-heavy workloads.
```

## Installation

### Via npx (Recommended)

```bash
claude mcp add oci-pricing -- npx -y oci-pricing-mcp
```

### Global Install

```bash
npm install -g oci-pricing-mcp
claude mcp add oci-pricing -- oci-pricing-mcp
```

### From Source

```bash
git clone https://github.com/jasonwilbur/oci-pricing-mcp.git
cd oci-pricing-mcp
npm install
npm run build
claude mcp add oci-pricing -- node /path/to/oci-pricing-mcp/dist/index.js
```

## Available Tools

### Core Tools

| Tool | Description |
|------|-------------|
| `get_pricing` | Get pricing for any OCI resource by service/type |
| `list_services` | List all OCI services with pricing categories |
| `compare_regions` | Compare pricing across regions (OCI has consistent global pricing) |
| `list_regions` | List all available OCI regions |
| `calculate_monthly_cost` | Estimate monthly spend for a configuration |
| `quick_estimate` | Get cost estimates for common deployment presets |

### Compute Tools

| Tool | Description |
|------|-------------|
| `list_compute_shapes` | List VM shapes (E4, E5, A1, GPU, etc.) with pricing |
| `get_compute_shape_details` | Get detailed info for a specific shape |
| `compare_compute_shapes` | Compare pricing between shapes |

### Storage Tools

| Tool | Description |
|------|-------------|
| `list_storage_options` | Block, object, file, archive storage pricing |
| `calculate_storage_cost` | Calculate cost for specific storage config |
| `compare_storage_tiers` | Compare all tiers for a given size |

### Database Tools

| Tool | Description |
|------|-------------|
| `list_database_options` | Autonomous DB, MySQL, PostgreSQL pricing |
| `calculate_database_cost` | Calculate database cost |
| `compare_database_options` | Compare options for workload type |

### Networking Tools

| Tool | Description |
|------|-------------|
| `list_networking_options` | Load balancers, FastConnect, VPN, egress |
| `calculate_networking_cost` | Calculate networking cost with free tier |
| `compare_data_egress` | Compare OCI egress vs AWS/Azure/GCP |

### Kubernetes Tools

| Tool | Description |
|------|-------------|
| `list_kubernetes_options` | OKE cluster options (Basic is FREE) |
| `calculate_kubernetes_cost` | Calculate cluster cost |
| `compare_kubernetes_providers` | Compare OKE vs EKS/AKS/GKE |

### Utility Tools

| Tool | Description |
|------|-------------|
| `get_free_tier` | OCI Always Free tier details |
| `get_pricing_info` | Pricing data metadata |

### Real-Time Pricing Tools

| Tool | Description |
|------|-------------|
| `fetch_realtime_pricing` | Fetch live pricing from Oracle's API (600+ products) |
| `list_realtime_categories` | List all 109 service categories from the API |

## Usage Examples

### Ask Claude about OCI pricing

```
What's the cost of running a VM.Standard.E5.Flex with 4 OCPUs and 32GB RAM?
```

```
Compare OCI block storage tiers for 1TB of data
```

```
Estimate monthly cost for a Kubernetes cluster with 3 nodes
```

```
How much would I save using OCI vs AWS for 5TB of monthly data egress?
```

### Quick Estimates

```
Give me a quick estimate for a small web app on OCI
```

Available presets:
- `small-web-app` - 1 OCPU, 8GB, 100GB storage, LB
- `medium-api-server` - 4 OCPU, 32GB, 500GB storage
- `large-database` - 8 OCPU, 128GB, Autonomous DB
- `ml-training` - 8x A100 GPUs (part-time)
- `kubernetes-cluster` - 3 nodes, 4 OCPU each

## OCI Pricing Highlights

### Key Differentiators

- **Consistent Global Pricing**: Unlike AWS/Azure/GCP, OCI prices are the same across all commercial regions
- **10 TB Free Egress**: First 10 TB of outbound data transfer is free monthly
- **Free Kubernetes Control Plane**: OKE Basic clusters have no management fee
- **Network Load Balancer**: Completely free (no hourly or data charges)
- **Always Free Tier**: Never expires - 4 Arm OCPUs, 24GB RAM, 200GB storage, 2 Autonomous DBs

### Cost-Effective Shapes

| Shape | OCPU Price | Best For |
|-------|------------|----------|
| VM.Standard.A1.Flex (Arm) | $0.01/hr | Best value, Arm workloads |
| VM.Standard.E5.Flex | $0.03/hr | New x86 deployments |
| VM.Standard.E4.Flex | $0.025/hr | Previous gen, still good |

### OCPU vs vCPU

1 OCPU = 2 vCPUs for x86 architectures. OCPUs represent physical cores, so OCI's $0.03/OCPU/hr is equivalent to $0.015/vCPU/hr.

## Data Sources

This MCP server supports two data modes:

### Bundled Data (Default)

Pricing data is sourced from [Oracle Cloud Price List](https://www.oracle.com/cloud/price-list/) and bundled with the server. This provides fast, offline access to 101 curated SKUs across 12 service categories.

- **Last updated**: January 2026
- **SKUs**: 101 products
- **Categories**: 12 (compute, storage, database, networking, kubernetes, serverless, containers, observability, security, data analytics, AI/ML, edge)

### Real-Time API

For the most current pricing, use the `fetch_realtime_pricing` tool which queries Oracle's public pricing API directly:

```
https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/
```

- **Products**: 600+ SKUs
- **Categories**: 109 service categories
- **Authentication**: None required (public API)
- **Multi-currency**: USD, EUR, GBP, JPY, AUD, CAD, and more

## FAQ

### Does OCI have a pricing API?

Yes! Oracle provides a public pricing API at `https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/` that returns all OCI product pricing in JSON format. No authentication is required. This MCP server uses this API for the `fetch_realtime_pricing` tool.

### Where does the pricing data come from?

- **Bundled data**: Curated from [Oracle Cloud Price List](https://www.oracle.com/cloud/price-list/) and included in the npm package
- **Real-time data**: Fetched directly from Oracle's public pricing API

### How often is the bundled data updated?

The bundled pricing data is updated with each npm release. Use `fetch_realtime_pricing` for the most current prices between releases.

### Why are prices the same across all regions?

Unlike AWS, Azure, and GCP, Oracle Cloud Infrastructure maintains **consistent global pricing** across all commercial regions. This simplifies cost planning and means you can deploy anywhere without price variations.

### What's the difference between OCPU and vCPU?

1 OCPU = 2 vCPUs for x86 architectures. OCPUs represent physical cores with hyper-threading, so OCI's $0.03/OCPU/hr is equivalent to $0.015/vCPU/hr when comparing to AWS/Azure/GCP.

### Can I query my actual OCI spend?

This MCP server provides pricing data, not account spend. For actual usage and spend tracking, you would need to use the OCI Cost Management APIs with proper authentication. This could be added as a future enhancement.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/index.js

# Watch mode
npm run dev
```

## Author

**Jason Wilbur** - [jasonwilbur.com](https://jasonwilbur.com)

## License

Apache 2.0

## Contributing

Issues and pull requests welcome at [GitHub](https://github.com/jasonwilbur/oci-pricing-mcp).
