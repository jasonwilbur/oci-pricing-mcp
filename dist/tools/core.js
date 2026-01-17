/**
 * Core OCI Pricing Tools
 * get_pricing, list_services, compare_regions
 */
import { getServicesCatalog, getComputePricing, getStoragePricing, getDatabasePricing, getNetworkingPricing, getKubernetesPricing, getRegions, getLastUpdated, } from '../data/fetcher.js';
export function getPricing(params) {
    const { service, type, region } = params;
    let items = [];
    switch (service) {
        case 'compute':
            items = getComputePricing();
            break;
        case 'storage':
            items = getStoragePricing();
            break;
        case 'database':
            items = getDatabasePricing();
            break;
        case 'networking':
            items = getNetworkingPricing();
            break;
        case 'kubernetes':
            items = getKubernetesPricing();
            break;
        default:
            throw new Error(`Unknown service: ${service}. Valid services: compute, storage, database, networking, kubernetes`);
    }
    // Filter by type if specified
    if (type) {
        const typeFilter = type.toLowerCase();
        items = items.filter((item) => item.type.toLowerCase().includes(typeFilter) ||
            item.description.toLowerCase().includes(typeFilter) ||
            ('shapeFamily' in item && String(item.shapeFamily).toLowerCase().includes(typeFilter)) ||
            ('storageType' in item && String(item.storageType).toLowerCase().includes(typeFilter)) ||
            ('databaseType' in item && String(item.databaseType).toLowerCase().includes(typeFilter)) ||
            ('networkingType' in item && String(item.networkingType).toLowerCase().includes(typeFilter)));
    }
    return {
        items,
        service,
        type,
        region: region || 'all (OCI has consistent global pricing)',
        lastUpdated: getLastUpdated(),
        note: 'OCI pricing is consistent across all commercial regions. Government and sovereign regions may vary.',
    };
}
export function listServices(params = {}) {
    const { category } = params;
    let services = getServicesCatalog();
    // Filter by category if specified
    if (category) {
        services = services.filter((s) => s.category === category);
    }
    // Get unique categories
    const allServices = getServicesCatalog();
    const categories = [...new Set(allServices.map((s) => s.category))];
    return {
        services,
        categories,
        totalCount: services.length,
        lastUpdated: getLastUpdated(),
    };
}
export function compareRegions(params) {
    const { service, type } = params;
    const regions = getRegions();
    // Get the pricing item
    const pricingResult = getPricing({ service, type });
    if (pricingResult.items.length === 0) {
        return {
            result: null,
            regions,
            note: `No pricing found for ${service}/${type}`,
            lastUpdated: getLastUpdated(),
        };
    }
    const item = pricingResult.items[0];
    // Since OCI has consistent pricing, all regions have the same price
    const regionPricing = regions
        .filter((r) => r.type === 'commercial')
        .map((r) => ({
        region: r.name,
        pricePerUnit: item.pricePerUnit,
        unit: item.unit,
    }));
    const result = {
        service: item.service,
        type: item.type,
        regions: regionPricing,
        cheapestRegion: regionPricing[0]?.region,
        mostExpensiveRegion: regionPricing[0]?.region,
        priceDifferencePercent: 0,
    };
    return {
        result,
        regions,
        note: 'OCI maintains consistent pricing across all commercial regions. This is different from AWS/Azure/GCP where prices vary by region.',
        lastUpdated: getLastUpdated(),
    };
}
/**
 * List all available OCI regions
 */
export function listRegions() {
    const regions = getRegions();
    const commercial = regions.filter((r) => r.type === 'commercial');
    return {
        regions,
        commercialCount: commercial.length,
        totalCount: regions.length,
    };
}
//# sourceMappingURL=core.js.map