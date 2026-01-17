/**
 * OCI Pricing Data Fetcher
 * Loads pricing data from bundled JSON with optional future API support
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pricingCache, CACHE_KEYS } from './cache.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Load bundled pricing data from JSON file
 */
function loadBundledPricingData() {
    const dataPath = join(__dirname, 'pricing-data.json');
    const rawData = readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
}
/**
 * Get OCI pricing data
 * Uses cache if available, otherwise loads from bundled data
 */
export function getPricingData() {
    // Check cache first
    const cached = pricingCache.get(CACHE_KEYS.PRICING_DATA);
    if (cached) {
        return cached;
    }
    // Load bundled data
    const data = loadBundledPricingData();
    // Cache for 24 hours (bundled data doesn't change frequently)
    pricingCache.set(CACHE_KEYS.PRICING_DATA, data, 60 * 24);
    return data;
}
/**
 * Get compute pricing data
 */
export function getComputePricing() {
    const data = getPricingData();
    return data.compute;
}
/**
 * Get storage pricing data
 */
export function getStoragePricing() {
    const data = getPricingData();
    return data.storage;
}
/**
 * Get database pricing data
 */
export function getDatabasePricing() {
    const data = getPricingData();
    return data.database;
}
/**
 * Get networking pricing data
 */
export function getNetworkingPricing() {
    const data = getPricingData();
    return data.networking;
}
/**
 * Get Kubernetes pricing data
 */
export function getKubernetesPricing() {
    const data = getPricingData();
    return data.kubernetes;
}
/**
 * Get services catalog
 */
export function getServicesCatalog() {
    const data = getPricingData();
    return data.services;
}
/**
 * Get available regions
 */
export function getRegions() {
    const data = getPricingData();
    return data.regions || [];
}
/**
 * Get free tier information
 */
export function getFreeTier() {
    const data = getPricingData();
    return data.freeTier || null;
}
/**
 * Get data last updated timestamp
 */
export function getLastUpdated() {
    const data = getPricingData();
    return data.lastUpdated;
}
/**
 * Force refresh of cached data
 */
export function refreshCache() {
    pricingCache.delete(CACHE_KEYS.PRICING_DATA);
    getPricingData(); // Reload
}
//# sourceMappingURL=fetcher.js.map