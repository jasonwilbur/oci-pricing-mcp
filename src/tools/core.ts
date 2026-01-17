/**
 * Core OCI Pricing Tools
 * get_pricing, list_services, compare_regions
 */

import {
  getPricingData,
  getServicesCatalog,
  getComputePricing,
  getStoragePricing,
  getDatabasePricing,
  getNetworkingPricing,
  getKubernetesPricing,
  getRegions,
  getLastUpdated,
} from '../data/fetcher.js';
import type { OCIServiceCategory, PricingItem, RegionComparisonResult } from '../types.js';

/**
 * Get pricing for a specific OCI resource
 */
export interface GetPricingParams {
  service: 'compute' | 'storage' | 'database' | 'networking' | 'kubernetes';
  type?: string;
  region?: string;
}

export function getPricing(params: GetPricingParams): {
  items: PricingItem[];
  service: string;
  type?: string;
  region?: string;
  lastUpdated: string;
  note: string;
} {
  const { service, type, region } = params;

  let items: PricingItem[] = [];

  switch (service) {
    case 'compute':
      items = getComputePricing() as unknown as PricingItem[];
      break;
    case 'storage':
      items = getStoragePricing() as unknown as PricingItem[];
      break;
    case 'database':
      items = getDatabasePricing() as unknown as PricingItem[];
      break;
    case 'networking':
      items = getNetworkingPricing() as unknown as PricingItem[];
      break;
    case 'kubernetes':
      items = getKubernetesPricing() as unknown as PricingItem[];
      break;
    default:
      throw new Error(`Unknown service: ${service}. Valid services: compute, storage, database, networking, kubernetes`);
  }

  // Filter by type if specified
  if (type) {
    const typeFilter = type.toLowerCase();
    items = items.filter(
      (item) =>
        item.type.toLowerCase().includes(typeFilter) ||
        item.description.toLowerCase().includes(typeFilter) ||
        ('shapeFamily' in item && String((item as { shapeFamily: string }).shapeFamily).toLowerCase().includes(typeFilter)) ||
        ('storageType' in item && String((item as { storageType: string }).storageType).toLowerCase().includes(typeFilter)) ||
        ('databaseType' in item && String((item as { databaseType: string }).databaseType).toLowerCase().includes(typeFilter)) ||
        ('networkingType' in item && String((item as { networkingType: string }).networkingType).toLowerCase().includes(typeFilter))
    );
  }

  return {
    items,
    service,
    type,
    region: region || 'all (OCI has consistent global pricing)',
    lastUpdated: getLastUpdated(),
    note: 'OCI pricing is consistent across all commercial regions. Government and sovereign regions may vary.',
  };
}

/**
 * List all OCI services with pricing categories
 */
export interface ListServicesParams {
  category?: OCIServiceCategory;
}

export function listServices(params: ListServicesParams = {}): {
  services: Array<{
    name: string;
    category: string;
    description: string;
    pricingTypes: string[];
    documentationUrl: string;
  }>;
  categories: string[];
  totalCount: number;
  lastUpdated: string;
} {
  const { category } = params;
  let services = getServicesCatalog();

  // Filter by category if specified
  if (category) {
    services = services.filter((s) => s.category === category);
  }

  // Get unique categories
  const allServices = getServicesCatalog();
  const categories = [...new Set(allServices.map((s) => s.category))];

  return {
    services,
    categories,
    totalCount: services.length,
    lastUpdated: getLastUpdated(),
  };
}

/**
 * Compare pricing for a resource across regions
 * Note: OCI has consistent pricing across commercial regions
 */
export interface CompareRegionsParams {
  service: 'compute' | 'storage' | 'database' | 'networking' | 'kubernetes';
  type: string;
}

export function compareRegions(params: CompareRegionsParams): {
  result: RegionComparisonResult | null;
  regions: Array<{ name: string; location: string; type: string }>;
  note: string;
  lastUpdated: string;
} {
  const { service, type } = params;
  const regions = getRegions();

  // Get the pricing item
  const pricingResult = getPricing({ service, type });

  if (pricingResult.items.length === 0) {
    return {
      result: null,
      regions,
      note: `No pricing found for ${service}/${type}`,
      lastUpdated: getLastUpdated(),
    };
  }

  const item = pricingResult.items[0];

  // Since OCI has consistent pricing, all regions have the same price
  const regionPricing = regions
    .filter((r) => r.type === 'commercial')
    .map((r) => ({
      region: r.name as Parameters<typeof getPricing>[0]['region'] extends infer R ? NonNullable<R> : never,
      pricePerUnit: item.pricePerUnit,
      unit: item.unit,
    }));

  const result: RegionComparisonResult = {
    service: item.service,
    type: item.type,
    regions: regionPricing as RegionComparisonResult['regions'],
    cheapestRegion: regionPricing[0]?.region as RegionComparisonResult['cheapestRegion'],
    mostExpensiveRegion: regionPricing[0]?.region as RegionComparisonResult['mostExpensiveRegion'],
    priceDifferencePercent: 0,
  };

  return {
    result,
    regions,
    note: 'OCI maintains consistent pricing across all commercial regions. This is different from AWS/Azure/GCP where prices vary by region.',
    lastUpdated: getLastUpdated(),
  };
}

/**
 * List all available OCI regions
 */
export function listRegions(): {
  regions: Array<{ name: string; location: string; type: string }>;
  commercialCount: number;
  totalCount: number;
} {
  const regions = getRegions();
  const commercial = regions.filter((r) => r.type === 'commercial');

  return {
    regions,
    commercialCount: commercial.length,
    totalCount: regions.length,
  };
}
