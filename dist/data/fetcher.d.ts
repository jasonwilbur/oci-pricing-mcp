/**
 * OCI Pricing Data Fetcher
 * Loads pricing data from bundled JSON or real-time Oracle API
 */
import type { OCIPricingData, MulticloudData, MulticloudProvider, MulticloudDatabaseType, MulticloudDatabaseAvailability, MulticloudDatabasePricing, AIMLPricing, ObservabilityPricing, IntegrationPricing, SecurityPricing, AnalyticsPricing, DeveloperPricing, MediaPricing, VMwarePricing, EdgePricing, GovernancePricing, ExadataPricing, CachePricing, DisasterRecoveryPricing, AdditionalServicePricing } from '../types.js';
export interface RealTimePriceItem {
    partNumber: string;
    displayName: string;
    metricName: string;
    serviceCategory: string;
    unitPrice: number;
    currency: string;
    isBYOL: boolean;
    licenseModel: 'standard' | 'byol';
}
export interface RealTimePricingResponse {
    lastUpdated: string;
    totalProducts: number;
    items: RealTimePriceItem[];
    summary: {
        totalSKUs: number;
        standardPricing: number;
        byolPricing: number;
        uniqueCategories: number;
    };
    apiNotes: string[];
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
export declare function getRegions(): import("../types.js").RegionInfo[];
/**
 * Get free tier information
 */
export declare function getFreeTier(): Record<string, unknown>;
/**
 * Get pricing metadata
 */
export declare function getPricingMetadata(): import("../types.js").PricingMetadata;
/**
 * Get data last updated timestamp
 */
export declare function getLastUpdated(): string;
/**
 * Get all products from bundled data
 */
export declare function getAllProducts(): import("../types.js").APIProduct[];
/**
 * Get all categories from bundled data
 */
export declare function getCategories(): string[];
/**
 * Search products by category or search term
 */
export declare function searchProducts(options?: {
    category?: string;
    search?: string;
}): import("../types.js").APIProduct[];
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
/**
 * Get multicloud data
 */
export declare function getMulticloudData(): MulticloudData | null;
/**
 * Get multicloud availability matrix
 */
export declare function getMulticloudAvailability(): MulticloudDatabaseAvailability[];
/**
 * Get multicloud pricing data with optional filters
 */
export declare function getMulticloudPricing(options?: {
    provider?: MulticloudProvider;
    databaseType?: MulticloudDatabaseType;
}): MulticloudDatabasePricing[];
/**
 * Get AI/ML pricing data
 */
export declare function getAIMLPricing(type?: string): AIMLPricing[];
/**
 * Get Observability pricing data
 */
export declare function getObservabilityPricing(type?: string): ObservabilityPricing[];
/**
 * Get Integration pricing data
 */
export declare function getIntegrationPricing(type?: string): IntegrationPricing[];
/**
 * Get Security pricing data
 */
export declare function getSecurityPricing(type?: string): SecurityPricing[];
/**
 * Get Analytics pricing data
 */
export declare function getAnalyticsPricing(type?: string): AnalyticsPricing[];
/**
 * Get Developer services pricing data
 */
export declare function getDeveloperPricing(type?: string): DeveloperPricing[];
/**
 * Get Media services pricing data
 */
export declare function getMediaPricing(type?: string): MediaPricing[];
/**
 * Get VMware pricing data
 */
export declare function getVMwarePricing(): VMwarePricing[];
/**
 * Get Edge services pricing data
 */
export declare function getEdgePricing(type?: string): EdgePricing[];
/**
 * Get Governance pricing data
 */
export declare function getGovernancePricing(type?: string): GovernancePricing[];
/**
 * Get Exadata pricing data
 */
export declare function getExadataPricing(type?: string): ExadataPricing[];
/**
 * Get Cache (Redis) pricing data
 */
export declare function getCachePricing(): CachePricing[];
/**
 * Get Disaster Recovery pricing data
 */
export declare function getDisasterRecoveryPricing(): DisasterRecoveryPricing[];
/**
 * Get Additional Services pricing data
 */
export declare function getAdditionalServicesPricing(type?: string): AdditionalServicePricing[];
/**
 * Get all service categories with counts
 */
export declare function getServiceCategoryCounts(): Record<string, number>;
//# sourceMappingURL=fetcher.d.ts.map