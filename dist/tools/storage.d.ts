/**
 * OCI Storage Pricing Tools
 */
export interface ListStorageOptionsParams {
    type?: 'block' | 'object' | 'file' | 'archive';
}
export interface StorageOptionInfo {
    name: string;
    type: string;
    description: string;
    pricePerGB: number;
    monthlyPer100GB: number;
    monthlyPerTB: number;
    performanceTier?: string;
    notes?: string;
}
/**
 * List available OCI storage options with pricing
 */
export declare function listStorageOptions(params?: ListStorageOptionsParams): {
    options: StorageOptionInfo[];
    totalCount: number;
    lastUpdated: string;
    freeTierNote: string;
    comparison: {
        cheapest: string;
        bestPerformance: string;
    };
    tips: string[];
};
/**
 * Calculate storage cost for a given configuration
 */
export interface CalculateStorageCostParams {
    blockVolumeGB?: number;
    blockPerformanceTier?: 'basic' | 'balanced' | 'high' | 'ultra';
    objectStorageGB?: number;
    objectStorageTier?: 'standard' | 'infrequent' | 'archive';
    fileStorageGB?: number;
}
export declare function calculateStorageCost(params: CalculateStorageCostParams): {
    breakdown: Array<{
        item: string;
        gb: number;
        pricePerGB: number;
        monthlyTotal: number;
    }>;
    totalMonthly: number;
    notes: string[];
};
/**
 * Compare storage tiers for a given size
 */
export declare function compareStorageTiers(sizeGB: number): {
    comparisons: Array<{
        tier: string;
        type: string;
        pricePerGB: number;
        monthlyTotal: number;
        useCase: string;
    }>;
    recommendation: string;
};
//# sourceMappingURL=storage.d.ts.map