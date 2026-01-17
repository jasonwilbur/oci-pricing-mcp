/**
 * OCI Monthly Cost Calculator
 */
import type { CostEstimateInput, CostEstimateResult, OCIRegion } from '../types.js';
/**
 * Calculate monthly cost for a given configuration
 */
export declare function calculateMonthlyCost(input: CostEstimateInput): CostEstimateResult;
/**
 * Quick estimate for common configurations
 */
export interface QuickEstimateParams {
    preset: 'small-web-app' | 'medium-api-server' | 'large-database' | 'ml-training' | 'kubernetes-cluster';
    region?: OCIRegion;
}
export declare function quickEstimate(params: QuickEstimateParams): CostEstimateResult;
//# sourceMappingURL=calculator.d.ts.map