/**
 * OCI Pricing MCP Server - Type Definitions
 */

// Multicloud provider types
export type MulticloudProvider = 'azure' | 'aws' | 'gcp';

// Multicloud database types (simplified for availability tracking)
export type MulticloudDatabaseType =
  | 'autonomous-serverless'
  | 'autonomous-dedicated'
  | 'exadata'
  | 'exascale'
  | 'base-db';

// Multicloud database availability entry
export interface MulticloudDatabaseAvailability {
  databaseType: MulticloudDatabaseType;
  displayName: string;
  azure: boolean;
  aws: boolean;
  gcp: boolean;
  notes?: string;
}

// Multicloud pricing entry
export interface MulticloudDatabasePricing {
  databaseType: MulticloudDatabaseType;
  provider: MulticloudProvider;
  available: boolean;
  pricingModel: 'marketplace' | 'private-offer' | 'price-parity-estimate';
  ecpuPrice?: number;
  ocpuPrice?: number;
  storagePrice?: number;
  licenseIncludedPrice?: number;
  byolPrice?: number;
  licenseIncluded: boolean;
  byolAvailable: boolean;
  billingNote: string;
  marketplaceUrl?: string;
}

// Multicloud data structure
export interface MulticloudData {
  availability: MulticloudDatabaseAvailability[];
  pricing: MulticloudDatabasePricing[];
  lastUpdated: string;
  notes: string[];
}

// OCI Regions
export type OCIRegion =
  | 'us-ashburn-1'
  | 'us-phoenix-1'
  | 'us-sanjose-1'
  | 'us-chicago-1'
  | 'ca-montreal-1'
  | 'ca-toronto-1'
  | 'eu-frankfurt-1'
  | 'eu-amsterdam-1'
  | 'eu-zurich-1'
  | 'eu-madrid-1'
  | 'eu-marseille-1'
  | 'eu-milan-1'
  | 'eu-paris-1'
  | 'eu-stockholm-1'
  | 'uk-london-1'
  | 'uk-cardiff-1'
  | 'ap-tokyo-1'
  | 'ap-osaka-1'
  | 'ap-seoul-1'
  | 'ap-chuncheon-1'
  | 'ap-mumbai-1'
  | 'ap-hyderabad-1'
  | 'ap-singapore-1'
  | 'ap-sydney-1'
  | 'ap-melbourne-1'
  | 'sa-saopaulo-1'
  | 'sa-santiago-1'
  | 'sa-vinhedo-1'
  | 'me-jeddah-1'
  | 'me-dubai-1'
  | 'af-johannesburg-1'
  | 'il-jerusalem-1';

// OCI Service Categories
export type OCIServiceCategory =
  | 'compute'
  | 'storage'
  | 'database'
  | 'networking'
  | 'kubernetes'
  | 'analytics'
  | 'ai-ml'
  | 'security'
  | 'observability'
  | 'integration'
  | 'developer-services';

// Pricing unit types
export type PricingUnit =
  | 'OCPU per hour'
  | 'GB per month'
  | 'GB per hour'
  | 'instance per hour'
  | 'request'
  | 'GB transferred'
  | 'unit per hour'
  | 'node per hour';

// Compute shape families
export type ComputeShapeFamily =
  | 'VM.Standard.E4.Flex'
  | 'VM.Standard.E5.Flex'
  | 'VM.Standard.A1.Flex'
  | 'VM.Standard3.Flex'
  | 'VM.Optimized3.Flex'
  | 'VM.DenseIO.E4.Flex'
  | 'BM.Standard.E4.128'
  | 'BM.Standard.E5.192'
  | 'BM.Standard.A1.160'
  | 'BM.GPU.A10.4'
  | 'BM.GPU.H100.8'
  | 'BM.GPU.A100-v2.8';

// Storage types
export type StorageType =
  | 'block-volume'
  | 'block-volume-performance'
  | 'object-storage-standard'
  | 'object-storage-infrequent'
  | 'object-storage-archive'
  | 'file-storage';

// Database service types
export type DatabaseType =
  | 'autonomous-transaction-processing'
  | 'autonomous-data-warehouse'
  | 'autonomous-json'
  | 'mysql-heatwave'
  | 'postgresql'
  | 'nosql'
  | 'base-database-vm'
  | 'base-database-bm'
  | 'exadata-cloud';

// Networking service types
export type NetworkingType =
  | 'load-balancer-flexible'
  | 'load-balancer-network'
  | 'vcn'
  | 'fastconnect-1gbps'
  | 'fastconnect-10gbps'
  | 'fastconnect-100gbps'
  | 'outbound-data-transfer'
  | 'vpn-connect';

// Base pricing item
export interface PricingItem {
  service: string;
  type: string;
  description: string;
  unit: PricingUnit;
  pricePerUnit: number;
  currency: 'USD';
  region?: OCIRegion;
  notes?: string;
}

// Compute shape pricing
export interface ComputeShapePricing extends PricingItem {
  service: 'compute';
  shapeFamily: ComputeShapeFamily;
  ocpuPrice: number;
  memoryPricePerGB: number;
  minOCPU?: number;
  maxOCPU?: number;
  minMemoryGB?: number;
  maxMemoryGB?: number;
  memoryPerOCPURatio?: number;
  gpuCount?: number;
  localStorageGB?: number;
}

// Storage pricing
export interface StoragePricing extends PricingItem {
  service: 'storage';
  storageType: StorageType;
  minCapacityGB?: number;
  maxCapacityGB?: number;
  performanceTier?: string;
}

// Database pricing
export interface DatabasePricing extends PricingItem {
  service: 'database';
  databaseType: DatabaseType;
  licenseIncluded: boolean;
  byol?: boolean;
  ecpuPrice?: number;
  storagePrice?: number;
}

// Networking pricing
export interface NetworkingPricing extends PricingItem {
  service: 'networking';
  networkingType: NetworkingType;
  bandwidthMbps?: number;
  includedDataGB?: number;
}

// Kubernetes pricing
export interface KubernetesPricing extends PricingItem {
  service: 'kubernetes';
  clusterManagementFee: number;
  nodePoolFee?: number;
}

// AI/ML Service Types
export type AIMLServiceType =
  | 'generative-ai'
  | 'generative-ai-agents'
  | 'vision'
  | 'speech'
  | 'language'
  | 'document-understanding'
  | 'digital-assistant'
  | 'anomaly-detection'
  | 'forecasting'
  | 'data-labeling';

// AI/ML Pricing
export interface AIMLPricing {
  service: 'ai-ml';
  type: AIMLServiceType;
  name: string;
  description: string;
  model?: string;
  pricingTier: 'on-demand' | 'dedicated' | 'committed';
  unit: string;
  pricePerUnit: number;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Observability Service Types
export type ObservabilityServiceType =
  | 'apm'
  | 'logging'
  | 'log-analytics'
  | 'monitoring'
  | 'notifications'
  | 'ops-insights'
  | 'stack-monitoring'
  | 'service-connector';

// Observability Pricing
export interface ObservabilityPricing {
  service: 'observability';
  type: ObservabilityServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  freeAllowance?: number;
  freeAllowanceUnit?: string;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Integration Service Types
export type IntegrationServiceType =
  | 'integration-cloud'
  | 'goldengate'
  | 'data-integration'
  | 'streaming'
  | 'queue'
  | 'events'
  | 'api-gateway';

// Integration Pricing
export interface IntegrationPricing {
  service: 'integration';
  type: IntegrationServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Security Service Types
export type SecurityServiceType =
  | 'data-safe'
  | 'cloud-guard'
  | 'vault'
  | 'key-management'
  | 'waf'
  | 'network-firewall'
  | 'vulnerability-scanning'
  | 'bastion'
  | 'certificates';

// Security Pricing
export interface SecurityPricing {
  service: 'security';
  type: SecurityServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  freeAllowance?: number;
  freeAllowanceUnit?: string;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Analytics Service Types
export type AnalyticsServiceType =
  | 'analytics-cloud'
  | 'big-data'
  | 'data-flow'
  | 'data-catalog'
  | 'data-science';

// Analytics Pricing
export interface AnalyticsPricing {
  service: 'analytics';
  type: AnalyticsServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Developer Service Types
export type DeveloperServiceType =
  | 'functions'
  | 'container-instances'
  | 'api-gateway'
  | 'apex'
  | 'devops'
  | 'resource-manager'
  | 'visual-builder';

// Developer Services Pricing
export interface DeveloperPricing {
  service: 'developer';
  type: DeveloperServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  freeAllowance?: number;
  freeAllowanceUnit?: string;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Media Service Types
export type MediaServiceType =
  | 'media-flow'
  | 'media-streams';

// Media Pricing
export interface MediaPricing {
  service: 'media';
  type: MediaServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// VMware Service Types
export type VMwareServiceType = 'ocvs';

// VMware Pricing
export interface VMwarePricing {
  service: 'vmware';
  type: VMwareServiceType;
  name: string;
  description: string;
  hostType: string;
  unit: string;
  pricePerUnit: number;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Additional Database Types (beyond core)
export interface AdditionalDatabasePricing {
  service: 'database';
  type: string;
  name: string;
  description: string;
  databaseEngine: 'mysql' | 'postgresql' | 'nosql' | 'redis' | 'timesten' | 'other';
  unit: string;
  pricePerUnit: number;
  licenseIncluded?: boolean;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Edge Service Types
export type EdgeServiceType =
  | 'dns'
  | 'email-delivery'
  | 'web-application-acceleration'
  | 'healthchecks';

// Edge Services Pricing
export interface EdgePricing {
  service: 'edge';
  type: EdgeServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  freeAllowance?: number;
  freeAllowanceUnit?: string;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Governance Service Types
export type GovernanceServiceType =
  | 'access-governance'
  | 'fleet-management'
  | 'license-manager';

// Governance Pricing
export interface GovernancePricing {
  service: 'governance';
  type: GovernanceServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Exadata Service Types
export type ExadataServiceType =
  | 'exascale-ecpu'
  | 'exascale-ocpu'
  | 'exascale-storage'
  | 'exascale-infrastructure'
  | 'dedicated-ecpu'
  | 'dedicated-ocpu';

// Exadata Pricing
export interface ExadataPricing {
  service: 'exadata';
  type: ExadataServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  licenseIncluded?: boolean;
  byol?: boolean;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Cache (Redis) Pricing
export interface CachePricing {
  service: 'cache';
  type: 'redis';
  name: string;
  description: string;
  memoryTier: 'low' | 'high';
  unit: string;
  pricePerUnit: number;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Disaster Recovery Pricing
export interface DisasterRecoveryPricing {
  service: 'disaster-recovery';
  type: 'full-stack-dr';
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Additional Services Types
export type AdditionalServiceType =
  | 'opensearch'
  | 'secure-desktops'
  | 'blockchain'
  | 'timesten'
  | 'batch'
  | 'recovery-service'
  | 'zfs-storage'
  | 'lustre-storage'
  | 'digital-assistant';

// Additional Services Pricing
export interface AdditionalServicePricing {
  service: 'additional';
  type: AdditionalServiceType;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  licenseIncluded?: boolean;
  byol?: boolean;
  currency: 'USD';
  partNumber?: string;
  notes?: string;
}

// Monthly cost estimate input
export interface CostEstimateInput {
  compute?: {
    shape: string;
    ocpus: number;
    memoryGB: number;
    hoursPerMonth?: number;
  };
  storage?: {
    blockVolumeGB?: number;
    objectStorageGB?: number;
    archiveStorageGB?: number;
    fileStorageGB?: number;
  };
  database?: {
    type: string;
    ecpus?: number;
    storageGB?: number;
    licenseIncluded?: boolean;
  };
  networking?: {
    loadBalancerBandwidthMbps?: number;
    outboundDataGB?: number;
  };
  region?: OCIRegion;
}

// Monthly cost estimate output
export interface CostEstimateResult {
  breakdown: {
    category: string;
    item: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    monthlyTotal: number;
  }[];
  totalMonthly: number;
  currency: 'USD';
  region: OCIRegion;
  notes: string[];
}

// Region comparison result
export interface RegionComparisonResult {
  service: string;
  type: string;
  regions: {
    region: OCIRegion;
    pricePerUnit: number;
    unit: PricingUnit;
  }[];
  cheapestRegion: OCIRegion;
  mostExpensiveRegion: OCIRegion;
  priceDifferencePercent: number;
}

// Service catalog entry
export interface ServiceCatalogEntry {
  name: string;
  category: OCIServiceCategory;
  description: string;
  pricingTypes: string[];
  documentationUrl: string;
}

// Pricing data metadata
export interface PricingMetadata {
  source: string;
  sourceUrl: string;
  verifyUrl: string;
  apiLastUpdated: string;
  bundledDataGenerated: string;
  totalProducts: number;
  totalCategories: number;
  currency: string;
  pricingModel: string;
  notes: string;
}

// Full API product entry
export interface APIProduct {
  partNumber: string;
  displayName: string;
  metricName: string;
  serviceCategory: string;
  priceUSD: number;
}

// Region info
export interface RegionInfo {
  name: string;
  location: string;
  type: string;
}

// Full pricing data structure
export interface OCIPricingData {
  metadata: PricingMetadata;
  compute: ComputeShapePricing[];
  storage: StoragePricing[];
  database: DatabasePricing[];
  networking: NetworkingPricing[];
  kubernetes: KubernetesPricing[];
  // New service categories
  aiMl?: AIMLPricing[];
  observability?: ObservabilityPricing[];
  integration?: IntegrationPricing[];
  security?: SecurityPricing[];
  analytics?: AnalyticsPricing[];
  developer?: DeveloperPricing[];
  media?: MediaPricing[];
  vmware?: VMwarePricing[];
  edge?: EdgePricing[];
  governance?: GovernancePricing[];
  // Additional services (v1.3.2)
  exadata?: ExadataPricing[];
  cache?: CachePricing[];
  disasterRecovery?: DisasterRecoveryPricing[];
  additionalServices?: AdditionalServicePricing[];
  // Raw data
  products: APIProduct[];
  categories: string[];
  regions: RegionInfo[];
  freeTier: Record<string, unknown>;
  services: ServiceCatalogEntry[];
  multicloud?: MulticloudData;
}
