/**
 * OCI Pricing Data Fetcher
 * Loads pricing data from bundled JSON or real-time Oracle API
 */
import type { OCIPricingData } from '../types.js';
export interface RealTimePriceItem {
    partNumber: string;
    displayName: string;
    metricName: string;
    serviceCategory: string;
    unitPrice: number;
    currency: string;
}
export interface RealTimePricingResponse {
    lastUpdated: string;
    totalProducts: number;
    items: RealTimePriceItem[];
}
/**
 * Get OCI pricing data
 * Uses cache if available, otherwise loads from bundled data
 */
export declare function getPricingData(): OCIPricingData;
/**
 * Get compute pricing data
 */
export declare function getComputePricing(): import("../types.js").ComputeShapePricing[];
/**
 * Get storage pricing data
 */
export declare function getStoragePricing(): import("../types.js").StoragePricing[];
/**
 * Get database pricing data
 */
export declare function getDatabasePricing(): import("../types.js").DatabasePricing[];
/**
 * Get networking pricing data
 */
export declare function getNetworkingPricing(): import("../types.js").NetworkingPricing[];
/**
 * Get Kubernetes pricing data
 */
export declare function getKubernetesPricing(): import("../types.js").KubernetesPricing[];
/**
 * Get services catalog
 */
export declare function getServicesCatalog(): import("../types.js").ServiceCatalogEntry[];
/**
 * Get available regions
 */
export declare function getRegions(): {
    name: string;
    location: string;
    type: string;
}[];
/**
 * Get free tier information
 */
export declare function getFreeTier(): object | null;
/**
 * Get data last updated timestamp
 */
export declare function getLastUpdated(): string;
/**
 * Force refresh of cached data
 */
export declare function refreshCache(): void;
/**
 * Fetch real-time pricing from Oracle's public API
 * This provides 600+ products with current prices
 */
export declare function fetchRealTimePricing(options?: {
    currency?: string;
    category?: string;
    search?: string;
}): Promise<RealTimePricingResponse>;
/**
 * Get available service categories from real-time API
 */
export declare function getRealTimeCategories(): Promise<string[]>;
//# sourceMappingURL=fetcher.d.ts.map