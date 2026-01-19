/**
 * OCI Services Tools
 * Tools for AI/ML, Observability, Integration, Security, Analytics, Developer, Media, VMware, Edge, and Governance services
 */

import {
  getAIMLPricing,
  getObservabilityPricing,
  getIntegrationPricing,
  getSecurityPricing,
  getAnalyticsPricing,
  getDeveloperPricing,
  getMediaPricing,
  getVMwarePricing,
  getEdgePricing,
  getGovernancePricing,
  getServiceCategoryCounts,
  getLastUpdated
} from '../data/fetcher.js';

// ============================================
// AI/ML Tools
// ============================================

export interface ListAIMLParams {
  type?: string;
  model?: string;
}

export function listAIMLServices(params: ListAIMLParams = {}) {
  let pricing = getAIMLPricing(params.type);

  // Filter by model if specified
  if (params.model) {
    const modelLower = params.model.toLowerCase();
    pricing = pricing.filter(p =>
      p.model?.toLowerCase().includes(modelLower) ||
      p.name.toLowerCase().includes(modelLower)
    );
  }

  // Group by type
  const byType: Record<string, typeof pricing> = {};
  pricing.forEach(p => {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  });

  return {
    services: pricing,
    totalCount: pricing.length,
    byType: Object.entries(byType).map(([type, items]) => ({
      type,
      count: items.length,
      items: items.slice(0, 5) // Show first 5 per type
    })),
    lastUpdated: getLastUpdated(),
    availableTypes: [...new Set(pricing.map(p => p.type))],
    availableModels: [...new Set(pricing.filter(p => p.model).map(p => p.model))],
    notes: [
      'Generative AI supports Cohere, Meta Llama, and xAI Grok models',
      'Pricing varies by model size and deployment type (on-demand vs dedicated)',
      'Vision, Speech, Language, and Document Understanding use transaction-based pricing'
    ]
  };
}

// ============================================
// Observability Tools
// ============================================

export interface ListObservabilityParams {
  type?: string;
}

export function listObservabilityServices(params: ListObservabilityParams = {}) {
  const pricing = getObservabilityPricing(params.type);

  // Group by type
  const byType: Record<string, typeof pricing> = {};
  pricing.forEach(p => {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  });

  return {
    services: pricing,
    totalCount: pricing.length,
    byType: Object.entries(byType).map(([type, items]) => ({
      type,
      count: items.length,
      items
    })),
    lastUpdated: getLastUpdated(),
    availableTypes: [...new Set(pricing.map(p => p.type))],
    freeAllowances: [
      { service: 'Logging', allowance: '10 GB/month ingest' },
      { service: 'Monitoring', allowance: '500 million datapoints/month' },
      { service: 'Notifications', allowance: '1 million notifications/month' }
    ],
    notes: [
      'Many observability services include free tier allowances',
      'APM provides end-to-end application tracing',
      'Log Analytics enables powerful log search and analysis'
    ]
  };
}

// ============================================
// Integration Tools
// ============================================

export interface ListIntegrationParams {
  type?: string;
}

export function listIntegrationServices(params: ListIntegrationParams = {}) {
  const pricing = getIntegrationPricing(params.type);

  // Group by type
  const byType: Record<string, typeof pricing> = {};
  pricing.forEach(p => {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  });

  return {
    services: pricing,
    totalCount: pricing.length,
    byType: Object.entries(byType).map(([type, items]) => ({
      type,
      count: items.length,
      items
    })),
    lastUpdated: getLastUpdated(),
    availableTypes: [...new Set(pricing.map(p => p.type))],
    notes: [
      'OCI Integration Cloud (OIC) provides pre-built adapters for SaaS and on-premises apps',
      'GoldenGate enables real-time data replication and streaming',
      'Streaming is compatible with Apache Kafka APIs'
    ]
  };
}

// ============================================
// Security Tools
// ============================================

export interface ListSecurityParams {
  type?: string;
}

export function listSecurityServices(params: ListSecurityParams = {}) {
  const pricing = getSecurityPricing(params.type);

  // Group by type
  const byType: Record<string, typeof pricing> = {};
  pricing.forEach(p => {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  });

  return {
    services: pricing,
    totalCount: pricing.length,
    byType: Object.entries(byType).map(([type, items]) => ({
      type,
      count: items.length,
      items
    })),
    lastUpdated: getLastUpdated(),
    availableTypes: [...new Set(pricing.map(p => p.type))],
    freeServices: [
      'Cloud Guard - threat detection (free)',
      'Vault - 20 key versions free',
      'Bastion - free service'
    ],
    notes: [
      'Data Safe provides database security assessment and monitoring',
      'Cloud Guard detects security threats across your tenancy',
      'WAF protects web applications from attacks'
    ]
  };
}

// ============================================
// Analytics Tools
// ============================================

export interface ListAnalyticsParams {
  type?: string;
}

export function listAnalyticsServices(params: ListAnalyticsParams = {}) {
  const pricing = getAnalyticsPricing(params.type);

  // Group by type
  const byType: Record<string, typeof pricing> = {};
  pricing.forEach(p => {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  });

  return {
    services: pricing,
    totalCount: pricing.length,
    byType: Object.entries(byType).map(([type, items]) => ({
      type,
      count: items.length,
      items
    })),
    lastUpdated: getLastUpdated(),
    availableTypes: [...new Set(pricing.map(p => p.type))],
    notes: [
      'Analytics Cloud provides enterprise BI and visualization',
      'Big Data Service runs Apache Spark and Hadoop workloads',
      'Data Flow provides serverless Spark execution'
    ]
  };
}

// ============================================
// Developer Tools
// ============================================

export interface ListDeveloperParams {
  type?: string;
}

export function listDeveloperServices(params: ListDeveloperParams = {}) {
  const pricing = getDeveloperPricing(params.type);

  // Group by type
  const byType: Record<string, typeof pricing> = {};
  pricing.forEach(p => {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  });

  return {
    services: pricing,
    totalCount: pricing.length,
    byType: Object.entries(byType).map(([type, items]) => ({
      type,
      count: items.length,
      items
    })),
    lastUpdated: getLastUpdated(),
    availableTypes: [...new Set(pricing.map(p => p.type))],
    freeServices: [
      'Functions - 2 million invocations/month free',
      'APEX - included with Autonomous Database',
      'Resource Manager (Terraform) - free'
    ],
    notes: [
      'Functions provides serverless compute with pay-per-execution',
      'Container Instances run containers without managing infrastructure',
      'API Gateway manages and secures API traffic'
    ]
  };
}

// ============================================
// Media Tools
// ============================================

export interface ListMediaParams {
  type?: string;
}

export function listMediaServices(params: ListMediaParams = {}) {
  const pricing = getMediaPricing(params.type);

  // Group by type
  const byType: Record<string, typeof pricing> = {};
  pricing.forEach(p => {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  });

  return {
    services: pricing,
    totalCount: pricing.length,
    byType: Object.entries(byType).map(([type, items]) => ({
      type,
      count: items.length,
      sample: items.slice(0, 10) // Media has many items, show sample
    })),
    lastUpdated: getLastUpdated(),
    availableTypes: [...new Set(pricing.map(p => p.type))],
    notes: [
      'Media Flow provides video transcoding and processing pipelines',
      'Media Streams enables live and on-demand video streaming',
      'Pricing based on minutes processed and output resolution'
    ]
  };
}

// ============================================
// VMware Tools
// ============================================

export function listVMwareServices() {
  const pricing = getVMwarePricing();

  return {
    services: pricing,
    totalCount: pricing.length,
    lastUpdated: getLastUpdated(),
    notes: [
      'Oracle Cloud VMware Solution (OCVS) runs VMware workloads natively',
      'Pricing is per-host with different configurations available',
      'Includes VMware vSphere, vSAN, and NSX licensing'
    ]
  };
}

// ============================================
// Edge Tools
// ============================================

export interface ListEdgeParams {
  type?: string;
}

export function listEdgeServices(params: ListEdgeParams = {}) {
  const pricing = getEdgePricing(params.type);

  return {
    services: pricing,
    totalCount: pricing.length,
    lastUpdated: getLastUpdated(),
    availableTypes: [...new Set(pricing.map(p => p.type))],
    freeAllowances: [
      { service: 'DNS', allowance: '1 million queries/month' },
      { service: 'Email Delivery', allowance: '3,000 emails/month' },
      { service: 'Health Checks', allowance: '1 million checks/month' }
    ],
    notes: [
      'DNS provides global low-latency name resolution',
      'Email Delivery is a scalable outbound email service',
      'Health Checks monitor endpoint availability'
    ]
  };
}

// ============================================
// Governance Tools
// ============================================

export interface ListGovernanceParams {
  type?: string;
}

export function listGovernanceServices(params: ListGovernanceParams = {}) {
  const pricing = getGovernancePricing(params.type);

  return {
    services: pricing,
    totalCount: pricing.length,
    lastUpdated: getLastUpdated(),
    availableTypes: [...new Set(pricing.map(p => p.type))],
    notes: [
      'Access Governance manages identity lifecycle and access reviews',
      'Fleet Application Management monitors and patches applications',
      'License Manager tracks Oracle license usage'
    ]
  };
}

// ============================================
// Summary Tool
// ============================================

export function getServicesSummary() {
  const counts = getServiceCategoryCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    categories: counts,
    totalPricingItems: total,
    lastUpdated: getLastUpdated(),
    coverage: {
      core: ['compute', 'storage', 'database', 'networking', 'kubernetes'],
      aiMl: ['generative-ai', 'vision', 'speech', 'language', 'document-understanding'],
      operations: ['observability', 'security', 'governance'],
      platform: ['integration', 'analytics', 'developer', 'media', 'vmware', 'edge'],
      multicloud: ['database@azure', 'database@aws', 'database@gcp']
    },
    notes: [
      'Pricing data sourced from Oracle Cloud Infrastructure pricing API',
      'All prices in USD, Pay-As-You-Go rates',
      'Many services include free tier allowances'
    ]
  };
}
