#!/usr/bin/env node
/**
 * Script to generate structured pricing data from raw OCI API products
 */

const fs = require('fs');
const path = require('path');

// Load existing pricing data
const pricingDataPath = path.join(__dirname, '../src/data/pricing-data.json');
const pricingData = JSON.parse(fs.readFileSync(pricingDataPath, 'utf8'));

// Extract products by category
const products = pricingData.products || [];

// Helper to categorize products
function categorizeProducts() {
  const categories = {
    aiMl: [],
    observability: [],
    integration: [],
    security: [],
    analytics: [],
    developer: [],
    media: [],
    vmware: [],
    edge: [],
    governance: []
  };

  products.forEach(p => {
    const cat = p.serviceCategory || '';
    const name = p.displayName || '';

    // AI/ML
    if (cat.includes('Generative AI') || cat.includes('OCI Vision') ||
        cat.includes('OCI Speech') || cat.includes('OCI Language') ||
        cat.includes('OCI Document') || cat.includes('Digital Assistant') ||
        cat.includes('Anomaly Detection') || cat.includes('Forecasting') ||
        cat.includes('Data Labeling') || cat.includes('AI Data Platform')) {
      categories.aiMl.push(formatAIML(p));
    }
    // Observability
    else if (cat.includes('Observability') || cat.includes('APM') ||
             cat.includes('Log') || cat.includes('Monitoring') ||
             cat.includes('Stack Monitoring') || cat.includes('Ops Insights')) {
      categories.observability.push(formatObservability(p));
    }
    // Integration
    else if (cat.includes('Integration') || cat.includes('GoldenGate') ||
             cat.includes('Streaming') || cat.includes('Queue') ||
             cat.includes('Data Integration') || cat.includes('Data Integrator')) {
      categories.integration.push(formatIntegration(p));
    }
    // Security
    else if (cat.includes('Security') || cat.includes('Data Safe') ||
             cat.includes('Cloud Guard') || cat.includes('Key Management') ||
             cat.includes('WAF') || cat.includes('Firewall') ||
             cat.includes('Vulnerability') || cat.includes('Bastion')) {
      categories.security.push(formatSecurity(p));
    }
    // Analytics
    else if (cat.includes('Analytics') || cat.includes('Big Data') ||
             cat.includes('Data Flow') || cat.includes('Data Catalog') ||
             cat.includes('Data Science')) {
      categories.analytics.push(formatAnalytics(p));
    }
    // Developer
    else if (cat.includes('Serverless') || cat.includes('Functions') ||
             cat.includes('APEX') || cat.includes('DevOps') ||
             cat.includes('Resource Manager') || cat.includes('Visual Builder') ||
             cat.includes('API Management') || cat.includes('Container Instance')) {
      categories.developer.push(formatDeveloper(p));
    }
    // Media
    else if (cat.includes('Media Services') || cat.includes('Media Flow') ||
             cat.includes('Media Streams')) {
      categories.media.push(formatMedia(p));
    }
    // VMware
    else if (cat.includes('VMware')) {
      categories.vmware.push(formatVMware(p));
    }
    // Edge
    else if (cat.includes('DNS') || cat.includes('Email Delivery') ||
             cat.includes('Edge Services') || cat.includes('Healthcheck')) {
      categories.edge.push(formatEdge(p));
    }
    // Governance
    else if (cat.includes('Access Governance') || cat.includes('Fleet') ||
             cat.includes('License Manager')) {
      categories.governance.push(formatGovernance(p));
    }
  });

  return categories;
}

function getServiceType(cat, name) {
  // AI/ML types
  if (cat.includes('Generative AI Agents')) return 'generative-ai-agents';
  if (cat.includes('Generative AI')) return 'generative-ai';
  if (cat.includes('Vision')) return 'vision';
  if (cat.includes('Speech')) return 'speech';
  if (cat.includes('Language')) return 'language';
  if (cat.includes('Document')) return 'document-understanding';
  if (cat.includes('Digital Assistant')) return 'digital-assistant';
  if (cat.includes('Anomaly')) return 'anomaly-detection';

  // Observability types
  if (cat.includes('APM')) return 'apm';
  if (cat.includes('Log Analytics')) return 'log-analytics';
  if (cat.includes('Logging')) return 'logging';
  if (cat.includes('Monitoring')) return 'monitoring';
  if (cat.includes('Notifications')) return 'notifications';
  if (cat.includes('Ops Insights')) return 'ops-insights';
  if (cat.includes('Stack Monitoring')) return 'stack-monitoring';

  // Integration types
  if (cat.includes('OIC') || cat.includes('Application Integration')) return 'integration-cloud';
  if (cat.includes('GoldenGate')) return 'goldengate';
  if (cat.includes('Data Integration') || cat.includes('Data Integrator')) return 'data-integration';
  if (cat.includes('Streaming') || cat.includes('Kafka')) return 'streaming';
  if (cat.includes('Queue')) return 'queue';

  // Security types
  if (cat.includes('Data Safe')) return 'data-safe';
  if (cat.includes('Cloud Guard')) return 'cloud-guard';
  if (cat.includes('Key Management') || cat.includes('Vault')) return 'vault';
  if (cat.includes('WAF')) return 'waf';
  if (cat.includes('Network Firewall')) return 'network-firewall';
  if (cat.includes('Vulnerability')) return 'vulnerability-scanning';

  // Analytics types
  if (cat.includes('Analytics Cloud') || cat.includes('Analytics -')) return 'analytics-cloud';
  if (cat.includes('Big Data')) return 'big-data';
  if (cat.includes('Data Flow')) return 'data-flow';
  if (cat.includes('Data Catalog')) return 'data-catalog';
  if (cat.includes('Data Science')) return 'data-science';

  // Developer types
  if (cat.includes('Serverless') || cat.includes('Functions')) return 'functions';
  if (cat.includes('APEX')) return 'apex';
  if (cat.includes('DevOps')) return 'devops';
  if (cat.includes('API')) return 'api-gateway';
  if (cat.includes('Container')) return 'container-instances';

  // Media types
  if (cat.includes('Media Flow')) return 'media-flow';
  if (cat.includes('Media Streams')) return 'media-streams';

  // Edge types
  if (cat.includes('DNS')) return 'dns';
  if (cat.includes('Email')) return 'email-delivery';

  return 'other';
}

function getPricingTier(name) {
  if (name.includes('Dedicated')) return 'dedicated';
  if (name.includes('Committed') || name.includes('Universal Credit')) return 'committed';
  return 'on-demand';
}

function formatAIML(p) {
  const type = getServiceType(p.serviceCategory, p.displayName);
  return {
    service: 'ai-ml',
    type: type,
    name: p.displayName,
    description: `${p.displayName} - ${p.metricName}`,
    model: p.displayName.includes('Cohere') ? 'cohere' :
           p.displayName.includes('Meta') || p.displayName.includes('Llama') ? 'meta-llama' :
           p.displayName.includes('xAI') || p.displayName.includes('Grok') ? 'xai-grok' : null,
    pricingTier: getPricingTier(p.displayName),
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber
  };
}

function formatObservability(p) {
  return {
    service: 'observability',
    type: getServiceType(p.serviceCategory, p.displayName),
    name: p.displayName,
    description: `${p.displayName}`,
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber,
    freeAllowance: p.metricName.includes('GB') ? 10 : undefined,
    freeAllowanceUnit: p.metricName.includes('GB') ? 'GB/month' : undefined
  };
}

function formatIntegration(p) {
  return {
    service: 'integration',
    type: getServiceType(p.serviceCategory, p.displayName),
    name: p.displayName,
    description: `${p.displayName}`,
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber
  };
}

function formatSecurity(p) {
  return {
    service: 'security',
    type: getServiceType(p.serviceCategory, p.displayName),
    name: p.displayName,
    description: `${p.displayName}`,
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber
  };
}

function formatAnalytics(p) {
  return {
    service: 'analytics',
    type: getServiceType(p.serviceCategory, p.displayName),
    name: p.displayName,
    description: `${p.displayName}`,
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber
  };
}

function formatDeveloper(p) {
  return {
    service: 'developer',
    type: getServiceType(p.serviceCategory, p.displayName),
    name: p.displayName,
    description: `${p.displayName}`,
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber
  };
}

function formatMedia(p) {
  return {
    service: 'media',
    type: getServiceType(p.serviceCategory, p.displayName),
    name: p.displayName,
    description: `${p.displayName}`,
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber
  };
}

function formatVMware(p) {
  return {
    service: 'vmware',
    type: 'ocvs',
    name: p.displayName,
    description: `${p.displayName}`,
    hostType: p.displayName.includes('Dense') ? 'dense-io' : 'standard',
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber
  };
}

function formatEdge(p) {
  return {
    service: 'edge',
    type: getServiceType(p.serviceCategory, p.displayName),
    name: p.displayName,
    description: `${p.displayName}`,
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber
  };
}

function formatGovernance(p) {
  return {
    service: 'governance',
    type: getServiceType(p.serviceCategory, p.displayName),
    name: p.displayName,
    description: `${p.displayName}`,
    unit: p.metricName,
    pricePerUnit: p.priceUSD,
    currency: 'USD',
    partNumber: p.partNumber
  };
}

// Main execution
const categories = categorizeProducts();

// Remove null values and empty arrays
Object.keys(categories).forEach(key => {
  categories[key] = categories[key].filter(item => item !== null);
  if (categories[key].length === 0) {
    delete categories[key];
  }
});

// Output summary
console.log('=== Generated Pricing Data ===\n');
Object.entries(categories).forEach(([key, items]) => {
  console.log(`${key}: ${items.length} items`);
});

// Output JSON for each category
console.log('\n=== JSON Output ===\n');
console.log(JSON.stringify(categories, null, 2));
