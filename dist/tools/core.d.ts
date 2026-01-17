/**
 * Core OCI Pricing Tools
 * get_pricing, list_services, compare_regions
 */
import type { OCIServiceCategory, PricingItem, RegionComparisonResult } from '../types.js';
/**
 * Get pricing for a specific OCI resource
 */
export interface GetPricingParams {
    service: 'compute' | 'storage' | 'database' | 'networking' | 'kubernetes';
    type?: string;
    region?: string;
}
export declare function getPricing(params: GetPricingParams): {
    items: PricingItem[];
    service: string;
    type?: string;
    region?: string;
    lastUpdated: string;
    note: string;
};
/**
 * List all OCI services with pricing categories
 */
export interface ListServicesParams {
    category?: OCIServiceCategory;
}
export declare function listServices(params?: ListServicesParams): {
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
};
/**
 * Compare pricing for a resource across regions
 * Note: OCI has consistent pricing across commercial regions
 */
export interface CompareRegionsParams {
    service: 'compute' | 'storage' | 'database' | 'networking' | 'kubernetes';
    type: string;
}
export declare function compareRegions(params: CompareRegionsParams): {
    result: RegionComparisonResult | null;
    regions: Array<{
        name: string;
        location: string;
        type: string;
    }>;
    note: string;
    lastUpdated: string;
};
/**
 * List all available OCI regions
 */
export declare function listRegions(): {
    regions: Array<{
        name: string;
        location: string;
        type: string;
    }>;
    commercialCount: number;
    totalCount: number;
};
//# sourceMappingURL=core.d.ts.map