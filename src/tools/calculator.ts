/**
 * OCI Monthly Cost Calculator
 */

import {
  getComputePricing,
  getStoragePricing,
  getDatabasePricing,
  getNetworkingPricing,
  getLastUpdated,
  getFreeTier,
} from '../data/fetcher.js';
import type { CostEstimateInput, CostEstimateResult, OCIRegion, ComputeShapePricing } from '../types.js';

const HOURS_PER_MONTH = 730; // Average hours in a month

/**
 * Calculate monthly cost for a given configuration
 */
export function calculateMonthlyCost(input: CostEstimateInput): CostEstimateResult {
  const breakdown: CostEstimateResult['breakdown'] = [];
  const notes: string[] = [];
  let totalMonthly = 0;

  // Calculate compute costs
  if (input.compute) {
    const computePricing = getComputePricing();
    const shape = computePricing.find(
      (c) => c.shapeFamily?.toLowerCase() === input.compute?.shape.toLowerCase()
    ) as ComputeShapePricing | undefined;

    if (shape) {
      const hoursPerMonth = input.compute.hoursPerMonth || HOURS_PER_MONTH;

      // OCPU cost
      const ocpuCost = shape.ocpuPrice * input.compute.ocpus * hoursPerMonth;
      breakdown.push({
        category: 'Compute',
        item: `${shape.shapeFamily} - OCPUs`,
        quantity: input.compute.ocpus,
        unit: 'OCPU',
        unitPrice: shape.ocpuPrice,
        monthlyTotal: ocpuCost,
      });
      totalMonthly += ocpuCost;

      // Memory cost
      const memoryCost = shape.memoryPricePerGB * input.compute.memoryGB * hoursPerMonth;
      breakdown.push({
        category: 'Compute',
        item: `${shape.shapeFamily} - Memory`,
        quantity: input.compute.memoryGB,
        unit: 'GB',
        unitPrice: shape.memoryPricePerGB,
        monthlyTotal: memoryCost,
      });
      totalMonthly += memoryCost;

      // Check memory-to-OCPU ratio
      const ratio = input.compute.memoryGB / input.compute.ocpus;
      if (shape.memoryPerOCPURatio && ratio > shape.memoryPerOCPURatio) {
        notes.push(
          `Warning: Memory-to-OCPU ratio (${ratio}) exceeds maximum (${shape.memoryPerOCPURatio}). Configuration may not be valid.`
        );
      }

      if (hoursPerMonth < HOURS_PER_MONTH) {
        notes.push(`Compute calculated for ${hoursPerMonth} hours/month (not 24/7).`);
      }
    } else {
      notes.push(`Warning: Compute shape "${input.compute.shape}" not found. Compute costs not calculated.`);
    }
  }

  // Calculate storage costs
  if (input.storage) {
    const storagePricing = getStoragePricing();

    // Block Volume
    if (input.storage.blockVolumeGB) {
      const blockPrice = storagePricing.find((s) => s.type === 'block-storage-balanced');
      if (blockPrice) {
        const cost = blockPrice.pricePerUnit * input.storage.blockVolumeGB;
        breakdown.push({
          category: 'Storage',
          item: 'Block Volume (Balanced)',
          quantity: input.storage.blockVolumeGB,
          unit: 'GB',
          unitPrice: blockPrice.pricePerUnit,
          monthlyTotal: cost,
        });
        totalMonthly += cost;
      }
    }

    // Object Storage
    if (input.storage.objectStorageGB) {
      const objectPrice = storagePricing.find((s) => s.type === 'object-storage');
      if (objectPrice) {
        const cost = objectPrice.pricePerUnit * input.storage.objectStorageGB;
        breakdown.push({
          category: 'Storage',
          item: 'Object Storage (Standard)',
          quantity: input.storage.objectStorageGB,
          unit: 'GB',
          unitPrice: objectPrice.pricePerUnit,
          monthlyTotal: cost,
        });
        totalMonthly += cost;
      }
    }

    // Archive Storage
    if (input.storage.archiveStorageGB) {
      const archivePrice = storagePricing.find((s) => s.type === 'object-storage-archive');
      if (archivePrice) {
        const cost = archivePrice.pricePerUnit * input.storage.archiveStorageGB;
        breakdown.push({
          category: 'Storage',
          item: 'Object Storage (Archive)',
          quantity: input.storage.archiveStorageGB,
          unit: 'GB',
          unitPrice: archivePrice.pricePerUnit,
          monthlyTotal: cost,
        });
        totalMonthly += cost;
      }
    }

    // File Storage
    if (input.storage.fileStorageGB) {
      const filePrice = storagePricing.find((s) => s.type === 'file-storage');
      if (filePrice) {
        const cost = filePrice.pricePerUnit * input.storage.fileStorageGB;
        breakdown.push({
          category: 'Storage',
          item: 'File Storage',
          quantity: input.storage.fileStorageGB,
          unit: 'GB',
          unitPrice: filePrice.pricePerUnit,
          monthlyTotal: cost,
        });
        totalMonthly += cost;
      }
    }
  }

  // Calculate database costs
  if (input.database) {
    const dbPricing = getDatabasePricing();
    const licenseType = input.database.licenseIncluded !== false ? '' : '-byol';
    const dbTypeKey = `autonomous-db-${input.database.type.split('-').pop()}${licenseType}`;

    const dbPrice = dbPricing.find(
      (d) =>
        d.type.toLowerCase().includes(input.database?.type.toLowerCase() || '') ||
        d.databaseType === input.database?.type
    );

    if (dbPrice && input.database.ecpus) {
      // ECPU cost
      const ecpuPrice = (dbPrice as { ecpuPrice?: number }).ecpuPrice || dbPrice.pricePerUnit;
      const ecpuCost = ecpuPrice * input.database.ecpus * HOURS_PER_MONTH;
      breakdown.push({
        category: 'Database',
        item: `${dbPrice.description} - Compute`,
        quantity: input.database.ecpus,
        unit: 'ECPU',
        unitPrice: ecpuPrice,
        monthlyTotal: ecpuCost,
      });
      totalMonthly += ecpuCost;

      // Storage cost
      if (input.database.storageGB) {
        const storagePrice = (dbPrice as { storagePrice?: number }).storagePrice || 0.0255;
        const storageCost = storagePrice * input.database.storageGB;
        breakdown.push({
          category: 'Database',
          item: `${dbPrice.description} - Storage`,
          quantity: input.database.storageGB,
          unit: 'GB',
          unitPrice: storagePrice,
          monthlyTotal: storageCost,
        });
        totalMonthly += storageCost;
      }

      if (input.database.licenseIncluded === false) {
        notes.push('Database costs calculated with BYOL (Bring Your Own License).');
      }
    } else {
      notes.push(`Warning: Database type "${input.database.type}" not found or ECPUs not specified.`);
    }
  }

  // Calculate networking costs
  if (input.networking) {
    const netPricing = getNetworkingPricing();

    // Load Balancer
    if (input.networking.loadBalancerBandwidthMbps) {
      const lbPrice = netPricing.find((n) => n.type === 'flexible-load-balancer');
      const bwPrice = netPricing.find((n) => n.type === 'flexible-load-balancer-bandwidth');

      if (lbPrice && bwPrice) {
        // Base LB cost
        const lbCost = lbPrice.pricePerUnit * HOURS_PER_MONTH;
        breakdown.push({
          category: 'Networking',
          item: 'Flexible Load Balancer',
          quantity: 1,
          unit: 'instance',
          unitPrice: lbPrice.pricePerUnit,
          monthlyTotal: lbCost,
        });
        totalMonthly += lbCost;

        // Bandwidth cost
        const bwCost = bwPrice.pricePerUnit * input.networking.loadBalancerBandwidthMbps * HOURS_PER_MONTH;
        breakdown.push({
          category: 'Networking',
          item: 'Load Balancer Bandwidth',
          quantity: input.networking.loadBalancerBandwidthMbps,
          unit: 'Mbps',
          unitPrice: bwPrice.pricePerUnit,
          monthlyTotal: bwCost,
        });
        totalMonthly += bwCost;

        notes.push('First LB and 10 Mbps free for paid accounts (not reflected in estimate).');
      }
    }

    // Outbound Data Transfer
    if (input.networking.outboundDataGB) {
      const egressPrice = netPricing.find((n) => n.type === 'data-egress');
      if (egressPrice) {
        // First 10 TB (10,240 GB) is free
        const freeGB = (egressPrice as { includedDataGB?: number }).includedDataGB || 10240;
        const billableGB = Math.max(0, input.networking.outboundDataGB - freeGB);

        if (billableGB > 0) {
          const egressCost = egressPrice.pricePerUnit * billableGB;
          breakdown.push({
            category: 'Networking',
            item: 'Outbound Data Transfer',
            quantity: billableGB,
            unit: 'GB',
            unitPrice: egressPrice.pricePerUnit,
            monthlyTotal: egressCost,
          });
          totalMonthly += egressCost;
        }

        notes.push(
          `First ${freeGB / 1024} TB of outbound data is free per month. You specified ${input.networking.outboundDataGB} GB.`
        );
      }
    }
  }

  // Add free tier notes
  const freeTier = getFreeTier();
  if (freeTier) {
    notes.push(
      'OCI Always Free tier may reduce costs further (4 A1 OCPUs + 24GB RAM, 200GB block storage, etc.).'
    );
  }

  return {
    breakdown,
    totalMonthly: Math.round(totalMonthly * 100) / 100, // Round to 2 decimal places
    currency: 'USD',
    region: input.region || ('us-ashburn-1' as OCIRegion),
    notes,
  };
}

/**
 * Quick estimate for common configurations
 */
export interface QuickEstimateParams {
  preset:
    | 'small-web-app'
    | 'medium-api-server'
    | 'large-database'
    | 'ml-training'
    | 'kubernetes-cluster';
  region?: OCIRegion;
}

export function quickEstimate(params: QuickEstimateParams): CostEstimateResult {
  const presets: Record<QuickEstimateParams['preset'], CostEstimateInput> = {
    'small-web-app': {
      compute: {
        shape: 'VM.Standard.E4.Flex',
        ocpus: 1,
        memoryGB: 8,
      },
      storage: {
        blockVolumeGB: 100,
        objectStorageGB: 50,
      },
      networking: {
        loadBalancerBandwidthMbps: 10,
        outboundDataGB: 500,
      },
    },
    'medium-api-server': {
      compute: {
        shape: 'VM.Standard.E5.Flex',
        ocpus: 4,
        memoryGB: 32,
      },
      storage: {
        blockVolumeGB: 500,
        objectStorageGB: 200,
      },
      networking: {
        loadBalancerBandwidthMbps: 100,
        outboundDataGB: 2000,
      },
    },
    'large-database': {
      compute: {
        shape: 'VM.Standard.E5.Flex',
        ocpus: 8,
        memoryGB: 128,
      },
      storage: {
        blockVolumeGB: 2000,
      },
      database: {
        type: 'autonomous-transaction-processing',
        ecpus: 4,
        storageGB: 1000,
        licenseIncluded: true,
      },
    },
    'ml-training': {
      compute: {
        shape: 'BM.GPU.A100-v2.8',
        ocpus: 128,
        memoryGB: 2048,
        hoursPerMonth: 160, // Part-time usage
      },
      storage: {
        blockVolumeGB: 5000,
        objectStorageGB: 10000,
      },
    },
    'kubernetes-cluster': {
      compute: {
        shape: 'VM.Standard.E5.Flex',
        ocpus: 12, // 3 nodes x 4 OCPUs
        memoryGB: 96, // 3 nodes x 32 GB
      },
      storage: {
        blockVolumeGB: 300, // 3 nodes x 100 GB
        objectStorageGB: 500,
      },
      networking: {
        loadBalancerBandwidthMbps: 100,
        outboundDataGB: 5000,
      },
    },
  };

  const config = presets[params.preset];
  if (!config) {
    throw new Error(
      `Unknown preset: ${params.preset}. Valid presets: ${Object.keys(presets).join(', ')}`
    );
  }

  config.region = params.region;

  const result = calculateMonthlyCost(config);
  result.notes.unshift(`Preset: ${params.preset}`);

  return result;
}
