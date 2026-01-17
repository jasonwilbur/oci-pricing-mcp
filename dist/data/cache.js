/**
 * In-memory cache for OCI pricing data
 */
export class PricingCache {
    cache = new Map();
    defaultTTL; // milliseconds
    constructor(defaultTTLMinutes = 60) {
        this.defaultTTL = defaultTTLMinutes * 60 * 1000;
    }
    /**
     * Get an item from the cache
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    /**
     * Set an item in the cache
     */
    set(key, data, ttlMinutes) {
        const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttl,
        });
    }
    /**
     * Check if a key exists and is not expired
     */
    has(key) {
        return this.get(key) !== null;
    }
    /**
     * Delete an item from the cache
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Clear all items from the cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    getStats() {
        // Clean expired entries first
        this.cleanExpired();
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
    /**
     * Clean expired entries
     */
    cleanExpired() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
}
// Singleton instance for the pricing data cache
export const pricingCache = new PricingCache(60); // 1 hour default TTL
// Cache keys
export const CACHE_KEYS = {
    PRICING_DATA: 'oci_pricing_data',
    COMPUTE_SHAPES: 'oci_compute_shapes',
    STORAGE_OPTIONS: 'oci_storage_options',
    DATABASE_OPTIONS: 'oci_database_options',
    NETWORKING_OPTIONS: 'oci_networking_options',
    KUBERNETES_OPTIONS: 'oci_kubernetes_options',
    SERVICES_CATALOG: 'oci_services_catalog',
};
//# sourceMappingURL=cache.js.map