/**
 * OCI Database Pricing Tools
 */
export interface ListDatabaseOptionsParams {
    type?: 'autonomous' | 'mysql' | 'postgresql' | 'nosql' | 'base-db' | 'exadata';
    licenseType?: 'included' | 'byol';
}
export interface DatabaseOptionInfo {
    name: string;
    type: string;
    description: string;
    computePrice: number;
    computeUnit: string;
    storagePrice: number;
    licenseIncluded: boolean;
    monthlyExample: string;
    notes?: string;
}
/**
 * List available OCI database options with pricing
 */
export declare function listDatabaseOptions(params?: ListDatabaseOptionsParams): {
    options: DatabaseOptionInfo[];
    totalCount: number;
    lastUpdated: string;
    freeTierNote: string;
    tips: string[];
};
/**
 * Calculate database cost for a given configuration
 */
export interface CalculateDatabaseCostParams {
    type: 'autonomous-transaction-processing' | 'autonomous-data-warehouse' | 'autonomous-json' | 'mysql-heatwave' | 'postgresql' | 'nosql' | 'base-database-vm';
    computeUnits: number;
    storageGB: number;
    licenseType?: 'included' | 'byol';
    hoursPerMonth?: number;
}
export declare function calculateDatabaseCost(params: CalculateDatabaseCostParams): {
    breakdown: Array<{
        item: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        monthlyTotal: number;
    }>;
    totalMonthly: number;
    savings?: {
        byolSavings: number;
        percentSaved: number;
    };
    notes: string[];
};
/**
 * Compare database options for a given workload
 */
export declare function compareDatabaseOptions(workloadType: 'oltp' | 'analytics' | 'document' | 'general'): {
    recommended: DatabaseOptionInfo[];
    comparison: Array<{
        name: string;
        monthlyFor2Units100GB: number;
        bestFor: string;
    }>;
    notes: string[];
};
//# sourceMappingURL=database.d.ts.map