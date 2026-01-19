/**
 * Multicloud Database Tools
 * Tools for Oracle's multicloud database offerings (Database@Azure, Database@AWS, Database@Google Cloud)
 */
import type { MulticloudProvider, MulticloudDatabaseType, MulticloudDatabasePricing } from '../types.js';
export interface ListMulticloudDatabasesParams {
    provider?: MulticloudProvider;
    databaseType?: 'autonomous' | 'exadata' | 'base-db';
}
export interface CalculateMulticloudDatabaseCostParams {
    provider: MulticloudProvider;
    databaseType: MulticloudDatabaseType;
    computeUnits: number;
    storageGB: number;
    licenseType?: 'included' | 'byol';
}
export interface CompareMulticloudVsOCIParams {
    databaseType: MulticloudDatabaseType;
    computeUnits: number;
    storageGB: number;
}
/**
 * List Oracle database services available on Azure, AWS, and Google Cloud
 */
export declare function listMulticloudDatabases(params?: ListMulticloudDatabasesParams): {
    databases: {
        databaseType: MulticloudDatabaseType;
        displayName: string;
        availability: {
            azure: boolean;
            aws: boolean;
            gcp: boolean;
        };
        notes?: string;
        pricing?: MulticloudDatabasePricing[];
    }[];
    totalCount: number;
    lastUpdated: string;
    filters: {
        provider: string;
        databaseType: string;
    };
    notes: string[];
    tips: string[];
};
/**
 * Get the full availability matrix showing which Oracle database products are available on which cloud providers
 */
export declare function getMulticloudAvailabilityMatrix(): {
    matrix: {
        product: string;
        databaseType: MulticloudDatabaseType;
        azure: string;
        aws: string;
        gcp: string;
        notes: string | undefined;
    }[];
    summary: {
        azure: string;
        aws: string;
        gcp: string;
    };
    lastUpdated: string;
    notes: string[];
    legend: {
        '\u2713': string;
        '\u2717': string;
    };
    multicloudBrands: {
        azure: string;
        aws: string;
        gcp: string;
    };
};
/**
 * Calculate estimated monthly cost for running Oracle database on Azure, AWS, or Google Cloud
 */
export declare function calculateMulticloudDatabaseCost(params: CalculateMulticloudDatabaseCostParams): {
    error: string;
    available: boolean;
    suggestion: string;
    billingNote?: undefined;
    provider?: undefined;
    multicloudBrand?: undefined;
    databaseType?: undefined;
    configuration?: undefined;
    breakdown?: undefined;
    totalMonthly?: undefined;
    currency?: undefined;
    pricingModel?: undefined;
    marketplaceUrl?: undefined;
    notes?: undefined;
    lastUpdated?: undefined;
} | {
    error: string;
    available: boolean;
    billingNote: string;
    suggestion: string;
    provider?: undefined;
    multicloudBrand?: undefined;
    databaseType?: undefined;
    configuration?: undefined;
    breakdown?: undefined;
    totalMonthly?: undefined;
    currency?: undefined;
    pricingModel?: undefined;
    marketplaceUrl?: undefined;
    notes?: undefined;
    lastUpdated?: undefined;
} | {
    provider: string;
    multicloudBrand: string;
    databaseType: MulticloudDatabaseType;
    configuration: {
        computeUnits: number;
        storageGB: number;
        licenseType: string;
    };
    breakdown: ({
        item: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        hoursPerMonth: number;
        monthlyTotal: number;
    } | {
        item: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        monthlyTotal: number;
        hoursPerMonth?: undefined;
    })[];
    totalMonthly: number;
    currency: string;
    pricingModel: "marketplace" | "private-offer" | "price-parity-estimate";
    billingNote: string;
    marketplaceUrl: string | undefined;
    notes: string[];
    lastUpdated: string;
    error?: undefined;
    available?: undefined;
    suggestion?: undefined;
};
/**
 * Compare costs of running Oracle database on OCI vs Azure/AWS/GCP
 */
export declare function compareMulticloudVsOCI(params: CompareMulticloudVsOCIParams): {
    databaseType: MulticloudDatabaseType;
    configuration: {
        computeUnits: number;
        storageGB: number;
        hoursPerMonth: number;
        licenseType: string;
    };
    comparison: {
        provider: string;
        brand: string;
        available: boolean;
        pricingModel: string;
        computePrice: number;
        storagePrice: number;
        monthlyEstimate: number;
        vsOCI: string;
        billingNote: string;
        marketplaceUrl?: string;
    }[];
    summary: {
        ociMonthly: number;
        priceParity: string;
        recommendation: string;
    };
    keyDifferences: {
        aspect: string;
        oci: string;
        azure: string;
        aws: string;
        gcp: string;
    }[];
    lastUpdated: string;
    notes: string[];
};
//# sourceMappingURL=multicloud.d.ts.map