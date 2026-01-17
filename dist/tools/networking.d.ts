/**
 * OCI Networking Pricing Tools
 */
export interface ListNetworkingOptionsParams {
    type?: 'load-balancer' | 'fastconnect' | 'vpn' | 'egress' | 'gateway';
}
export interface NetworkingOptionInfo {
    name: string;
    type: string;
    description: string;
    pricePerUnit: number;
    unit: string;
    monthlyExample: string;
    isFree: boolean;
    notes?: string;
}
/**
 * List available OCI networking options with pricing
 */
export declare function listNetworkingOptions(params?: ListNetworkingOptionsParams): {
    options: NetworkingOptionInfo[];
    freeServices: string[];
    totalCount: number;
    lastUpdated: string;
    freeTierNote: string;
    tips: string[];
};
/**
 * Calculate networking cost for a given configuration
 */
export interface CalculateNetworkingCostParams {
    flexibleLoadBalancers?: number;
    loadBalancerBandwidthMbps?: number;
    networkLoadBalancers?: number;
    outboundDataGB?: number;
    fastConnectGbps?: 1 | 10 | 100;
    vpnConnections?: number;
    natGateways?: number;
}
export declare function calculateNetworkingCost(params: CalculateNetworkingCostParams): {
    breakdown: Array<{
        item: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        monthlyTotal: number;
        note?: string;
    }>;
    totalMonthly: number;
    freeCredits: number;
    netCost: number;
    notes: string[];
};
/**
 * Compare data egress pricing with other clouds
 */
export declare function compareDataEgress(monthlyGB: number): {
    ociCost: number;
    comparison: string;
    savings: string;
    notes: string[];
};
//# sourceMappingURL=networking.d.ts.map