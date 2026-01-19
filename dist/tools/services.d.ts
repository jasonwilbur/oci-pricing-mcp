/**
 * OCI Services Tools
 * Tools for AI/ML, Observability, Integration, Security, Analytics, Developer, Media, VMware, Edge, and Governance services
 */
export interface ListAIMLParams {
    type?: string;
    model?: string;
}
export declare function listAIMLServices(params?: ListAIMLParams): {
    services: import("../types.js").AIMLPricing[];
    totalCount: number;
    byType: {
        type: string;
        count: number;
        items: import("../types.js").AIMLPricing[];
    }[];
    lastUpdated: string;
    availableTypes: import("../types.js").AIMLServiceType[];
    availableModels: (string | undefined)[];
    notes: string[];
};
export interface ListObservabilityParams {
    type?: string;
}
export declare function listObservabilityServices(params?: ListObservabilityParams): {
    services: import("../types.js").ObservabilityPricing[];
    totalCount: number;
    byType: {
        type: string;
        count: number;
        items: import("../types.js").ObservabilityPricing[];
    }[];
    lastUpdated: string;
    availableTypes: import("../types.js").ObservabilityServiceType[];
    freeAllowances: {
        service: string;
        allowance: string;
    }[];
    notes: string[];
};
export interface ListIntegrationParams {
    type?: string;
}
export declare function listIntegrationServices(params?: ListIntegrationParams): {
    services: import("../types.js").IntegrationPricing[];
    totalCount: number;
    byType: {
        type: string;
        count: number;
        items: import("../types.js").IntegrationPricing[];
    }[];
    lastUpdated: string;
    availableTypes: import("../types.js").IntegrationServiceType[];
    notes: string[];
};
export interface ListSecurityParams {
    type?: string;
}
export declare function listSecurityServices(params?: ListSecurityParams): {
    services: import("../types.js").SecurityPricing[];
    totalCount: number;
    byType: {
        type: string;
        count: number;
        items: import("../types.js").SecurityPricing[];
    }[];
    lastUpdated: string;
    availableTypes: import("../types.js").SecurityServiceType[];
    freeServices: string[];
    notes: string[];
};
export interface ListAnalyticsParams {
    type?: string;
}
export declare function listAnalyticsServices(params?: ListAnalyticsParams): {
    services: import("../types.js").AnalyticsPricing[];
    totalCount: number;
    byType: {
        type: string;
        count: number;
        items: import("../types.js").AnalyticsPricing[];
    }[];
    lastUpdated: string;
    availableTypes: import("../types.js").AnalyticsServiceType[];
    notes: string[];
};
export interface ListDeveloperParams {
    type?: string;
}
export declare function listDeveloperServices(params?: ListDeveloperParams): {
    services: import("../types.js").DeveloperPricing[];
    totalCount: number;
    byType: {
        type: string;
        count: number;
        items: import("../types.js").DeveloperPricing[];
    }[];
    lastUpdated: string;
    availableTypes: import("../types.js").DeveloperServiceType[];
    freeServices: string[];
    notes: string[];
};
export interface ListMediaParams {
    type?: string;
}
export declare function listMediaServices(params?: ListMediaParams): {
    services: import("../types.js").MediaPricing[];
    totalCount: number;
    byType: {
        type: string;
        count: number;
        sample: import("../types.js").MediaPricing[];
    }[];
    lastUpdated: string;
    availableTypes: import("../types.js").MediaServiceType[];
    notes: string[];
};
export declare function listVMwareServices(): {
    services: import("../types.js").VMwarePricing[];
    totalCount: number;
    lastUpdated: string;
    notes: string[];
};
export interface ListEdgeParams {
    type?: string;
}
export declare function listEdgeServices(params?: ListEdgeParams): {
    services: import("../types.js").EdgePricing[];
    totalCount: number;
    lastUpdated: string;
    availableTypes: import("../types.js").EdgeServiceType[];
    freeAllowances: {
        service: string;
        allowance: string;
    }[];
    notes: string[];
};
export interface ListGovernanceParams {
    type?: string;
}
export declare function listGovernanceServices(params?: ListGovernanceParams): {
    services: import("../types.js").GovernancePricing[];
    totalCount: number;
    lastUpdated: string;
    availableTypes: import("../types.js").GovernanceServiceType[];
    notes: string[];
};
export interface ListExadataParams {
    type?: string;
}
export declare function listExadataServices(params?: ListExadataParams): {
    services: import("../types.js").ExadataPricing[];
    totalCount: number;
    byType: {
        type: string;
        count: number;
        items: import("../types.js").ExadataPricing[];
    }[];
    lastUpdated: string;
    availableTypes: import("../types.js").ExadataServiceType[];
    notes: string[];
};
export declare function listCacheServices(): {
    services: import("../types.js").CachePricing[];
    totalCount: number;
    lastUpdated: string;
    pricingTiers: {
        tier: string;
        description: string;
        pricePerGBHour: number;
    }[];
    notes: string[];
};
export declare function listDisasterRecoveryServices(): {
    services: import("../types.js").DisasterRecoveryPricing[];
    totalCount: number;
    lastUpdated: string;
    notes: string[];
};
export interface ListAdditionalServicesParams {
    type?: string;
}
export declare function listAdditionalServices(params?: ListAdditionalServicesParams): {
    services: import("../types.js").AdditionalServicePricing[];
    totalCount: number;
    byType: {
        type: string;
        count: number;
        items: import("../types.js").AdditionalServicePricing[];
    }[];
    lastUpdated: string;
    availableTypes: import("../types.js").AdditionalServiceType[];
    serviceDescriptions: {
        opensearch: string;
        'secure-desktops': string;
        blockchain: string;
        timesten: string;
        batch: string;
        'recovery-service': string;
        'zfs-storage': string;
        'lustre-storage': string;
        'digital-assistant': string;
    };
    notes: string[];
};
export declare function getServicesSummary(): {
    categories: Record<string, number>;
    totalPricingItems: number;
    lastUpdated: string;
    coverage: {
        core: string[];
        aiMl: string[];
        operations: string[];
        platform: string[];
        enterprise: string[];
        infrastructure: string[];
        multicloud: string[];
    };
    notes: string[];
};
//# sourceMappingURL=services.d.ts.map