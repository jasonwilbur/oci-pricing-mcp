/**
 * OCI Compute Pricing Tools
 */

import { getComputePricing, getLastUpdated, getFreeTier } from '../data/fetcher.js';
import type { ComputeShapePricing } from '../types.js';

export interface ListComputeShapesParams {
  family?: string; // Filter by shape family (e.g., 'E4', 'E5', 'A1', 'GPU')
  type?: string; // Filter by type (e.g., 'flexible-vm', 'bare-metal', 'gpu')
  maxOcpuPrice?: number; // Filter by max OCPU price
}

export interface ComputeShapeInfo {
  shapeFamily: string;
  type: string;
  description: string;
  ocpuPrice: number;
  memoryPricePerGB: number;
  totalPriceExample: string;
  ocpuRange: string;
  memoryRange: string;
  gpuCount?: number;
  localStorageGB?: number;
  notes?: string;
}

/**
 * List available OCI compute shapes with pricing
 */
export function listComputeShapes(params: ListComputeShapesParams = {}): {
  shapes: ComputeShapeInfo[];
  totalCount: number;
  lastUpdated: string;
  freeTierNote: string;
  tips: string[];
} {
  let shapes = getComputePricing();

  // Filter by family
  if (params.family) {
    const familyFilter = params.family.toLowerCase();
    shapes = shapes.filter(
      (s) =>
        s.shapeFamily?.toLowerCase().includes(familyFilter) ||
        s.type?.toLowerCase().includes(familyFilter)
    );
  }

  // Filter by type
  if (params.type) {
    const typeFilter = params.type.toLowerCase();
    shapes = shapes.filter((s) => s.type?.toLowerCase().includes(typeFilter));
  }

  // Filter by max price
  if (params.maxOcpuPrice !== undefined) {
    shapes = shapes.filter((s) => s.ocpuPrice <= params.maxOcpuPrice!);
  }

  // Transform to user-friendly format
  const shapeInfos: ComputeShapeInfo[] = shapes.map((s) => {
    // Calculate example price (4 OCPU, 32 GB RAM for 730 hours)
    const exampleOcpus = Math.min(4, s.maxOCPU || 4);
    const exampleMemory = Math.min(32, s.maxMemoryGB || 32);
    const exampleMonthly =
      (s.ocpuPrice * exampleOcpus + s.memoryPricePerGB * exampleMemory) * 730;

    return {
      shapeFamily: s.shapeFamily || s.type,
      type: s.type,
      description: s.description,
      ocpuPrice: s.ocpuPrice,
      memoryPricePerGB: s.memoryPricePerGB,
      totalPriceExample: `~$${exampleMonthly.toFixed(2)}/month for ${exampleOcpus} OCPU, ${exampleMemory} GB RAM`,
      ocpuRange: s.minOCPU && s.maxOCPU ? `${s.minOCPU}-${s.maxOCPU} OCPUs` : 'N/A',
      memoryRange:
        s.minMemoryGB && s.maxMemoryGB ? `${s.minMemoryGB}-${s.maxMemoryGB} GB` : 'N/A',
      gpuCount: s.gpuCount,
      localStorageGB: s.localStorageGB,
      notes: s.notes,
    };
  });

  // Get free tier info
  const freeTier = getFreeTier() as { compute?: { arm?: string; amd?: string } } | null;
  const freeTierNote = freeTier?.compute
    ? `Always Free: ${freeTier.compute.arm}, ${freeTier.compute.amd}`
    : 'Always Free tier available';

  return {
    shapes: shapeInfos,
    totalCount: shapeInfos.length,
    lastUpdated: getLastUpdated(),
    freeTierNote,
    tips: [
      'VM.Standard.A1.Flex (Arm) offers best value at $0.01/OCPU/hr',
      'VM.Standard.E5.Flex is recommended for new x86 deployments (21% better perf vs E4)',
      '1 OCPU = 2 vCPUs for x86 architectures',
      'Preemptible instances are 50% cheaper for fault-tolerant workloads',
      'Memory pricing is separate from OCPU pricing for Flex shapes',
    ],
  };
}

/**
 * Get details for a specific compute shape
 */
export function getComputeShapeDetails(shapeFamily: string): {
  shape: ComputeShapeInfo | null;
  monthlyEstimates: Array<{ config: string; monthlyUSD: number }>;
  recommendations: string[];
} {
  const shapes = getComputePricing();
  const shape = shapes.find(
    (s) => s.shapeFamily?.toLowerCase() === shapeFamily.toLowerCase()
  );

  if (!shape) {
    return {
      shape: null,
      monthlyEstimates: [],
      recommendations: [`Shape "${shapeFamily}" not found. Use list_compute_shapes to see available shapes.`],
    };
  }

  const shapeInfo: ComputeShapeInfo = {
    shapeFamily: shape.shapeFamily || shape.type,
    type: shape.type,
    description: shape.description,
    ocpuPrice: shape.ocpuPrice,
    memoryPricePerGB: shape.memoryPricePerGB,
    totalPriceExample: '',
    ocpuRange: shape.minOCPU && shape.maxOCPU ? `${shape.minOCPU}-${shape.maxOCPU} OCPUs` : 'N/A',
    memoryRange:
      shape.minMemoryGB && shape.maxMemoryGB ? `${shape.minMemoryGB}-${shape.maxMemoryGB} GB` : 'N/A',
    gpuCount: shape.gpuCount,
    localStorageGB: shape.localStorageGB,
    notes: shape.notes,
  };

  // Calculate various monthly estimates
  const configs = [
    { ocpus: 1, memory: 8, name: '1 OCPU, 8 GB' },
    { ocpus: 2, memory: 16, name: '2 OCPU, 16 GB' },
    { ocpus: 4, memory: 32, name: '4 OCPU, 32 GB' },
    { ocpus: 8, memory: 64, name: '8 OCPU, 64 GB' },
    { ocpus: 16, memory: 128, name: '16 OCPU, 128 GB' },
  ];

  const monthlyEstimates = configs
    .filter(
      (c) =>
        (!shape.maxOCPU || c.ocpus <= shape.maxOCPU) &&
        (!shape.maxMemoryGB || c.memory <= shape.maxMemoryGB)
    )
    .map((c) => ({
      config: c.name,
      monthlyUSD:
        Math.round(
          (shape.ocpuPrice * c.ocpus + shape.memoryPricePerGB * c.memory) * 730 * 100
        ) / 100,
    }));

  // Generate recommendations
  const recommendations: string[] = [];

  if (shape.shapeFamily?.includes('A1')) {
    recommendations.push('Best value for Arm-compatible workloads (Linux, containers, etc.)');
    recommendations.push('Includes in Always Free tier (4 OCPUs + 24 GB)');
  } else if (shape.shapeFamily?.includes('E5')) {
    recommendations.push('Recommended for new x86 deployments');
    recommendations.push('21%+ better price-performance vs E4');
  } else if (shape.shapeFamily?.includes('E4')) {
    recommendations.push('Previous generation - consider E5 for new workloads');
    recommendations.push('Still widely supported and stable');
  } else if (shape.type?.includes('gpu')) {
    recommendations.push('For ML/AI training and inference workloads');
    recommendations.push('Consider preemptible instances for training (50% savings)');
  }

  return {
    shape: shapeInfo,
    monthlyEstimates,
    recommendations,
  };
}

/**
 * Compare compute shapes
 */
export function compareComputeShapes(shapes: string[]): {
  comparison: Array<{
    shapeFamily: string;
    ocpuPrice: number;
    memoryPricePerGB: number;
    monthly4ocpu32gb: number;
    maxOCPU: number | null;
    maxMemoryGB: number | null;
  }>;
  recommendation: string;
} {
  const allShapes = getComputePricing();

  const comparison = shapes
    .map((shapeFamily) => {
      const shape = allShapes.find(
        (s) => s.shapeFamily?.toLowerCase() === shapeFamily.toLowerCase()
      );
      if (!shape) return null;

      return {
        shapeFamily: shape.shapeFamily || shape.type,
        ocpuPrice: shape.ocpuPrice,
        memoryPricePerGB: shape.memoryPricePerGB,
        monthly4ocpu32gb:
          Math.round((shape.ocpuPrice * 4 + shape.memoryPricePerGB * 32) * 730 * 100) / 100,
        maxOCPU: shape.maxOCPU || null,
        maxMemoryGB: shape.maxMemoryGB || null,
      };
    })
    .filter(Boolean) as Array<{
      shapeFamily: string;
      ocpuPrice: number;
      memoryPricePerGB: number;
      monthly4ocpu32gb: number;
      maxOCPU: number | null;
      maxMemoryGB: number | null;
    }>;

  // Find cheapest
  const cheapest = comparison.reduce(
    (min, c) => (c.monthly4ocpu32gb < min.monthly4ocpu32gb ? c : min),
    comparison[0]
  );

  return {
    comparison,
    recommendation: cheapest
      ? `${cheapest.shapeFamily} is most cost-effective at $${cheapest.monthly4ocpu32gb}/month for 4 OCPU, 32 GB`
      : 'No shapes found for comparison',
  };
}
