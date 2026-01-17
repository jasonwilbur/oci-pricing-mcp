/**
 * OCI Pricing Data Fetcher
 * Loads pricing data from bundled JSON or real-time Oracle API
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pricingCache, CACHE_KEYS } from './cache.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Oracle's public pricing API endpoint (no authentication required)
const OCI_PRICING_API = 'https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/';
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
 * Get pricing metadata
 */
export function getPricingMetadata() {
    const data = getPricingData();
    return data.metadata;
}
/**
 * Get data last updated timestamp
 */
export function getLastUpdated() {
    const data = getPricingData();
    return data.metadata?.apiLastUpdated || data.metadata?.bundledDataGenerated || 'unknown';
}
/**
 * Get all products from bundled data
 */
export function getAllProducts() {
    const data = getPricingData();
    return data.products || [];
}
/**
 * Get all categories from bundled data
 */
export function getCategories() {
    const data = getPricingData();
    return data.categories || [];
}
/**
 * Search products by category or search term
 */
export function searchProducts(options) {
    let products = getAllProducts();
    if (options?.category) {
        const cat = options.category.toLowerCase();
        products = products.filter(p => p.serviceCategory.toLowerCase().includes(cat));
    }
    if (options?.search) {
        const search = options.search.toLowerCase();
        products = products.filter(p => p.displayName.toLowerCase().includes(search) ||
            p.partNumber.toLowerCase().includes(search) ||
            p.serviceCategory.toLowerCase().includes(search));
    }
    return products;
}
/**
 * Force refresh of cached data
 */
export function refreshCache() {
    pricingCache.delete(CACHE_KEYS.PRICING_DATA);
    getPricingData(); // Reload
}
/**
 * Fetch real-time pricing from Oracle's public API
 * This provides 600+ products with current prices
 */
export async function fetchRealTimePricing(options) {
    const currency = options?.currency || 'USD';
    const cacheKey = `realtime_${currency}`;
    // Check cache (5 minute TTL for real-time data)
    const cached = pricingCache.get(cacheKey);
    if (cached) {
        // Apply filters to cached data
        return filterRealTimeData(cached, options);
    }
    try {
        const response = await fetch(OCI_PRICING_API);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        const data = await response.json();
        // Transform to simpler format with selected currency
        const items = data.items.map(item => {
            let unitPrice = 0;
            for (const curr of item.currencyCodeLocalizations || []) {
                if (curr.currencyCode === currency) {
                    for (const p of curr.prices) {
                        if (p.model === 'PAY_AS_YOU_GO') {
                            unitPrice = p.value;
                            break;
                        }
                    }
                    break;
                }
            }
            return {
                partNumber: item.partNumber,
                displayName: item.displayName,
                metricName: item.metricName,
                serviceCategory: item.serviceCategory,
                unitPrice,
                currency,
            };
        });
        const result = {
            lastUpdated: data.lastUpdated,
            totalProducts: items.length,
            items,
        };
        // Cache for 5 minutes
        pricingCache.set(cacheKey, result, 5);
        return filterRealTimeData(result, options);
    }
    catch (error) {
        throw new Error(`Failed to fetch real-time pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Filter real-time pricing data by category or search term
 */
function filterRealTimeData(data, options) {
    let items = data.items;
    if (options?.category) {
        const cat = options.category.toLowerCase();
        items = items.filter(item => item.serviceCategory.toLowerCase().includes(cat));
    }
    if (options?.search) {
        const search = options.search.toLowerCase();
        items = items.filter(item => item.displayName.toLowerCase().includes(search) ||
            item.partNumber.toLowerCase().includes(search) ||
            item.serviceCategory.toLowerCase().includes(search));
    }
    return {
        ...data,
        items,
        totalProducts: items.length,
    };
}
/**
 * Get available service categories from real-time API
 */
export async function getRealTimeCategories() {
    const data = await fetchRealTimePricing();
    const categories = new Set();
    for (const item of data.items) {
        categories.add(item.serviceCategory);
    }
    return Array.from(categories).sort();
}
//# sourceMappingURL=fetcher.js.map