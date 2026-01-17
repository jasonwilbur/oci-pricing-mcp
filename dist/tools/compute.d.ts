/**
 * OCI Compute Pricing Tools
 */
export interface ListComputeShapesParams {
    family?: string;
    type?: string;
    maxOcpuPrice?: number;
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
export declare function listComputeShapes(params?: ListComputeShapesParams): {
    shapes: ComputeShapeInfo[];
    totalCount: number;
    lastUpdated: string;
    freeTierNote: string;
    tips: string[];
};
/**
 * Get details for a specific compute shape
 */
export declare function getComputeShapeDetails(shapeFamily: string): {
    shape: ComputeShapeInfo | null;
    monthlyEstimates: Array<{
        config: string;
        monthlyUSD: number;
    }>;
    recommendations: string[];
};
/**
 * Compare compute shapes
 */
export declare function compareComputeShapes(shapes: string[]): {
    comparison: Array<{
        shapeFamily: string;
        ocpuPrice: number;
        memoryPricePerGB: number;
        monthly4ocpu32gb: number;
        maxOCPU: number | null;
        maxMemoryGB: number | null;
    }>;
    recommendation: string;
};
//# sourceMappingURL=compute.d.ts.map