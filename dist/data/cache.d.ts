/**
 * In-memory cache for OCI pricing data
 */
export declare class PricingCache {
    private cache;
    private defaultTTL;
    constructor(defaultTTLMinutes?: number);
    /**
     * Get an item from the cache
     */
    get<T>(key: string): T | null;
    /**
     * Set an item in the cache
     */
    set<T>(key: string, data: T, ttlMinutes?: number): void;
    /**
     * Check if a key exists and is not expired
     */
    has(key: string): boolean;
    /**
     * Delete an item from the cache
     */
    delete(key: string): boolean;
    /**
     * Clear all items from the cache
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        keys: string[];
    };
    /**
     * Clean expired entries
     */
    private cleanExpired;
}
export declare const pricingCache: PricingCache;
export declare const CACHE_KEYS: {
    readonly PRICING_DATA: "oci_pricing_data";
    readonly COMPUTE_SHAPES: "oci_compute_shapes";
    readonly STORAGE_OPTIONS: "oci_storage_options";
    readonly DATABASE_OPTIONS: "oci_database_options";
    readonly NETWORKING_OPTIONS: "oci_networking_options";
    readonly KUBERNETES_OPTIONS: "oci_kubernetes_options";
    readonly SERVICES_CATALOG: "oci_services_catalog";
};
//# sourceMappingURL=cache.d.ts.map