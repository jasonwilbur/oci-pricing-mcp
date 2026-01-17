/**
 * In-memory cache for OCI pricing data
 */

import type { OCIPricingData } from '../types.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class PricingCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number; // milliseconds

  constructor(defaultTTLMinutes: number = 60) {
    this.defaultTTL = defaultTTLMinutes * 60 * 1000;
  }

  /**
   * Get an item from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set an item in the cache
   */
  set<T>(key: string, data: T, ttlMinutes?: number): void {
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
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete an item from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
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
  private cleanExpired(): void {
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
} as const;
