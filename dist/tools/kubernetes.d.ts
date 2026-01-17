/**
 * OCI Kubernetes (OKE) Pricing Tools
 */
export interface ListKubernetesOptionsParams {
    clusterType?: 'basic' | 'enhanced' | 'virtual-nodes';
}
export interface KubernetesOptionInfo {
    name: string;
    type: string;
    description: string;
    managementFee: number;
    unit: string;
    monthlyExample: string;
    features: string[];
    notes?: string;
}
/**
 * List available OKE (Kubernetes) options with pricing
 */
export declare function listKubernetesOptions(params?: ListKubernetesOptionsParams): {
    options: KubernetesOptionInfo[];
    totalCount: number;
    lastUpdated: string;
    keyPoints: string[];
    tips: string[];
};
/**
 * Calculate OKE cluster cost for a given configuration
 */
export interface CalculateKubernetesCostParams {
    clusterType: 'basic' | 'enhanced';
    nodeCount: number;
    nodeShape: string;
    nodeOcpus: number;
    nodeMemoryGB: number;
    virtualNodes?: {
        podOcpus: number;
        podMemoryGB: number;
        hoursPerMonth: number;
    };
}
export declare function calculateKubernetesCost(params: CalculateKubernetesCostParams): {
    breakdown: Array<{
        item: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        monthlyTotal: number;
    }>;
    totalMonthly: number;
    perNodeCost: number;
    notes: string[];
};
/**
 * Compare OKE pricing with EKS/AKS/GKE
 */
export declare function compareKubernetesProviders(nodeCount: number, nodeOcpus: number, nodeMemoryGB: number): {
    ociBasic: number;
    ociEnhanced: number;
    awsEks: number;
    azureAks: number;
    gcpGke: number;
    notes: string[];
};
//# sourceMappingURL=kubernetes.d.ts.map