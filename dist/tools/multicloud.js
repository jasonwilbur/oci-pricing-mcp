/**
 * Multicloud Database Tools
 * Tools for Oracle's multicloud database offerings (Database@Azure, Database@AWS, Database@Google Cloud)
 */
import { getMulticloudAvailability, getMulticloudPricing, getMulticloudData, getLastUpdated, getDatabasePricing } from '../data/fetcher.js';
// Helper function to map simplified database type to internal types
function mapDatabaseTypeFilter(filter) {
    if (!filter)
        return [];
    switch (filter) {
        case 'autonomous':
            return ['autonomous-serverless', 'autonomous-dedicated'];
        case 'exadata':
            return ['exadata', 'exascale'];
        case 'base-db':
            return ['base-db'];
        default:
            return [];
    }
}
// Helper to get display name for provider
function getProviderDisplayName(provider) {
    switch (provider) {
        case 'azure': return 'Microsoft Azure';
        case 'aws': return 'Amazon Web Services';
        case 'gcp': return 'Google Cloud Platform';
    }
}
// Helper to get the brand name for multicloud offering
function getMulticloudBrandName(provider) {
    switch (provider) {
        case 'azure': return 'Oracle Database@Azure';
        case 'aws': return 'Oracle Database@AWS';
        case 'gcp': return 'Oracle Database@Google Cloud';
    }
}
/**
 * List Oracle database services available on Azure, AWS, and Google Cloud
 */
export function listMulticloudDatabases(params = {}) {
    const availability = getMulticloudAvailability();
    const allPricing = getMulticloudPricing();
    const multicloudData = getMulticloudData();
    let databases = [];
    // Filter by database type if specified
    const typeFilter = mapDatabaseTypeFilter(params.databaseType);
    for (const db of availability) {
        // Apply database type filter
        if (typeFilter.length > 0 && !typeFilter.includes(db.databaseType)) {
            continue;
        }
        // Apply provider filter - only include if available on that provider
        if (params.provider) {
            const isAvailable = params.provider === 'azure' ? db.azure :
                params.provider === 'aws' ? db.aws : db.gcp;
            if (!isAvailable)
                continue;
        }
        // Get pricing for this database type
        const pricing = allPricing.filter(p => p.databaseType === db.databaseType);
        // Apply provider filter to pricing
        const filteredPricing = params.provider
            ? pricing.filter(p => p.provider === params.provider)
            : pricing;
        databases.push({
            databaseType: db.databaseType,
            displayName: db.displayName,
            availability: {
                azure: db.azure,
                aws: db.aws,
                gcp: db.gcp,
            },
            notes: db.notes,
            pricing: filteredPricing.length > 0 ? filteredPricing : undefined,
        });
    }
    return {
        databases,
        totalCount: databases.length,
        lastUpdated: multicloudData?.lastUpdated || getLastUpdated(),
        filters: {
            provider: params.provider || 'all',
            databaseType: params.databaseType || 'all',
        },
        notes: [
            'Oracle maintains price parity across all cloud providers',
            params.provider === 'aws'
                ? 'AWS offerings are primarily through private offers - contact Oracle or AWS for quotes'
                : 'Azure and GCP offer public marketplace pricing with consolidated billing',
        ],
        tips: [
            'Use calculate_multicloud_database_cost for specific cost estimates',
            'Use compare_multicloud_vs_oci to compare costs across deployment options',
        ],
    };
}
/**
 * Get the full availability matrix showing which Oracle database products are available on which cloud providers
 */
export function getMulticloudAvailabilityMatrix() {
    const availability = getMulticloudAvailability();
    const multicloudData = getMulticloudData();
    // Build a formatted matrix
    const matrix = availability.map(db => ({
        product: db.displayName,
        databaseType: db.databaseType,
        azure: db.azure ? '✓' : '✗',
        aws: db.aws ? '✓' : '✗',
        gcp: db.gcp ? '✓' : '✗',
        notes: db.notes,
    }));
    // Summary counts
    const summary = {
        azure: availability.filter(db => db.azure).length,
        aws: availability.filter(db => db.aws).length,
        gcp: availability.filter(db => db.gcp).length,
        total: availability.length,
    };
    return {
        matrix,
        summary: {
            azure: `${summary.azure}/${summary.total} products available`,
            aws: `${summary.aws}/${summary.total} products available`,
            gcp: `${summary.gcp}/${summary.total} products available`,
        },
        lastUpdated: multicloudData?.lastUpdated || getLastUpdated(),
        notes: multicloudData?.notes || [],
        legend: {
            '✓': 'Available',
            '✗': 'Not available',
        },
        multicloudBrands: {
            azure: 'Oracle Database@Azure',
            aws: 'Oracle Database@AWS',
            gcp: 'Oracle Database@Google Cloud',
        },
    };
}
/**
 * Calculate estimated monthly cost for running Oracle database on Azure, AWS, or Google Cloud
 */
export function calculateMulticloudDatabaseCost(params) {
    const { provider, databaseType, computeUnits, storageGB, licenseType = 'included' } = params;
    // Get pricing for this specific database type and provider
    const pricing = getMulticloudPricing({ provider, databaseType });
    if (pricing.length === 0) {
        return {
            error: `No pricing available for ${databaseType} on ${getProviderDisplayName(provider)}`,
            available: false,
            suggestion: 'Use get_multicloud_availability to see which products are available on each provider',
        };
    }
    const dbPricing = pricing[0];
    // Check if the product is available
    if (!dbPricing.available) {
        return {
            error: `${databaseType} is not currently available on ${getProviderDisplayName(provider)}`,
            available: false,
            billingNote: dbPricing.billingNote,
            suggestion: 'This product may become available in the future or you can use OCI directly',
        };
    }
    // Calculate costs
    const hoursPerMonth = 730;
    const useBYOL = licenseType === 'byol' && dbPricing.byolAvailable;
    // Determine compute price (prefer ECPU, fall back to OCPU)
    const computePrice = useBYOL
        ? (dbPricing.byolPrice || dbPricing.ecpuPrice || dbPricing.ocpuPrice || 0)
        : (dbPricing.licenseIncludedPrice || dbPricing.ecpuPrice || dbPricing.ocpuPrice || 0);
    const storagePrice = dbPricing.storagePrice || 0;
    const computeCost = computeUnits * computePrice * hoursPerMonth;
    const storageCost = storageGB * storagePrice;
    const totalMonthly = computeCost + storageCost;
    const breakdown = [
        {
            item: `Compute (${dbPricing.ecpuPrice ? 'ECPU' : 'OCPU'})`,
            quantity: computeUnits,
            unit: `${dbPricing.ecpuPrice ? 'ECPU' : 'OCPU'}/hour`,
            unitPrice: computePrice,
            hoursPerMonth,
            monthlyTotal: Math.round(computeCost * 100) / 100,
        },
        {
            item: 'Storage',
            quantity: storageGB,
            unit: 'GB/month',
            unitPrice: storagePrice,
            monthlyTotal: Math.round(storageCost * 100) / 100,
        },
    ];
    return {
        provider: getProviderDisplayName(provider),
        multicloudBrand: getMulticloudBrandName(provider),
        databaseType,
        configuration: {
            computeUnits,
            storageGB,
            licenseType: useBYOL ? 'BYOL' : 'License Included',
        },
        breakdown,
        totalMonthly: Math.round(totalMonthly * 100) / 100,
        currency: 'USD',
        pricingModel: dbPricing.pricingModel,
        billingNote: dbPricing.billingNote,
        marketplaceUrl: dbPricing.marketplaceUrl,
        notes: [
            dbPricing.pricingModel === 'private-offer'
                ? 'Pricing shown is an estimate based on OCI price parity. Contact Oracle or the cloud provider for actual pricing.'
                : 'Pricing based on public marketplace rates',
            useBYOL ? 'BYOL pricing applied - you must have existing Oracle licenses' : 'License Included pricing applied',
            'Actual costs may vary based on usage patterns and any applicable discounts',
        ],
        lastUpdated: getLastUpdated(),
    };
}
/**
 * Compare costs of running Oracle database on OCI vs Azure/AWS/GCP
 */
export function compareMulticloudVsOCI(params) {
    const { databaseType, computeUnits, storageGB } = params;
    const hoursPerMonth = 730;
    // Get multicloud pricing for all providers
    const multicloudPricing = getMulticloudPricing({ databaseType });
    // Get OCI pricing for comparison
    const ociDatabasePricing = getDatabasePricing();
    // Map multicloud database type to OCI database type (bundled data uses different naming)
    let ociDbType;
    switch (databaseType) {
        case 'autonomous-serverless':
            ociDbType = 'autonomous-db-atp';
            break;
        case 'autonomous-dedicated':
            ociDbType = 'autonomous-db-atp';
            break;
        case 'exadata':
        case 'exascale':
            ociDbType = 'exadata-cloud';
            break;
        case 'base-db':
            ociDbType = 'base-database';
            break;
        default:
            ociDbType = databaseType;
    }
    // Find OCI pricing
    const ociPricing = ociDatabasePricing.find(p => p.databaseType === ociDbType || p.type === ociDbType);
    // Get multicloud pricing for an available provider to use as price parity reference
    const referenceMulticloudPricing = multicloudPricing.find(p => p.available);
    // Calculate OCI cost - use multicloud pricing as reference (price parity)
    let ociCost = 0;
    let ociComputePrice = 0;
    let ociStoragePrice = 0;
    // For price parity, use multicloud pricing if OCI bundled data is incomplete
    if (referenceMulticloudPricing) {
        ociComputePrice = referenceMulticloudPricing.licenseIncludedPrice ||
            referenceMulticloudPricing.ecpuPrice ||
            referenceMulticloudPricing.ocpuPrice ||
            ociPricing?.ecpuPrice ||
            ociPricing?.pricePerUnit ||
            0.1;
        ociStoragePrice = referenceMulticloudPricing.storagePrice ||
            ociPricing?.storagePrice ||
            0.0255;
    }
    else if (ociPricing) {
        ociComputePrice = ociPricing.ecpuPrice || ociPricing.pricePerUnit || 0.1;
        ociStoragePrice = ociPricing.storagePrice || 0.0255;
    }
    ociCost = (computeUnits * ociComputePrice * hoursPerMonth) + (storageGB * ociStoragePrice);
    // Build comparison table
    const comparison = [];
    // Add OCI first
    comparison.push({
        provider: 'OCI',
        brand: 'Oracle Cloud Infrastructure',
        available: true,
        pricingModel: 'direct',
        computePrice: ociComputePrice,
        storagePrice: ociStoragePrice,
        monthlyEstimate: Math.round(ociCost * 100) / 100,
        vsOCI: 'baseline',
        billingNote: 'Direct billing from Oracle',
    });
    // Add multicloud options
    const providers = ['azure', 'aws', 'gcp'];
    for (const provider of providers) {
        const pricing = multicloudPricing.find(p => p.provider === provider);
        if (pricing) {
            const computePrice = pricing.licenseIncludedPrice || pricing.ecpuPrice || pricing.ocpuPrice || 0;
            const storagePrice = pricing.storagePrice || 0;
            const monthlyEstimate = pricing.available
                ? (computeUnits * computePrice * hoursPerMonth) + (storageGB * storagePrice)
                : 0;
            const vsOCI = pricing.available && ociCost > 0
                ? monthlyEstimate === ociCost
                    ? 'same price (price parity)'
                    : monthlyEstimate > ociCost
                        ? `+$${Math.round((monthlyEstimate - ociCost) * 100) / 100}/mo`
                        : `-$${Math.round((ociCost - monthlyEstimate) * 100) / 100}/mo`
                : 'N/A';
            comparison.push({
                provider: getProviderDisplayName(provider),
                brand: getMulticloudBrandName(provider),
                available: pricing.available,
                pricingModel: pricing.pricingModel,
                computePrice: pricing.available ? computePrice : 0,
                storagePrice: pricing.available ? storagePrice : 0,
                monthlyEstimate: pricing.available ? Math.round(monthlyEstimate * 100) / 100 : 0,
                vsOCI,
                billingNote: pricing.billingNote,
                marketplaceUrl: pricing.marketplaceUrl,
            });
        }
    }
    return {
        databaseType,
        configuration: {
            computeUnits,
            storageGB,
            hoursPerMonth,
            licenseType: 'included',
        },
        comparison,
        summary: {
            ociMonthly: Math.round(ociCost * 100) / 100,
            priceParity: 'Oracle maintains price parity across all cloud providers',
            recommendation: 'Choose based on existing cloud investments, compliance requirements, and operational preferences',
        },
        keyDifferences: [
            {
                aspect: 'Billing',
                oci: 'Direct Oracle billing',
                azure: 'Azure Marketplace (consolidated with Azure services)',
                aws: 'Private offer (contact for quote)',
                gcp: 'Google Cloud Marketplace (consolidated with GCP services)',
            },
            {
                aspect: 'Support',
                oci: 'Oracle Support',
                azure: 'Joint Oracle + Microsoft support',
                aws: 'Oracle Support (via private offer terms)',
                gcp: 'Joint Oracle + Google support',
            },
            {
                aspect: 'Network Integration',
                oci: 'Native OCI networking',
                azure: 'Azure VNet integration',
                aws: 'AWS VPC integration',
                gcp: 'GCP VPC integration',
            },
        ],
        lastUpdated: getLastUpdated(),
        notes: [
            'Price parity means the same Oracle database costs the same regardless of cloud provider',
            'AWS pricing requires private offer - contact Oracle or AWS for specific quotes',
            'Marketplace billing allows consolidated invoicing with other cloud services',
        ],
    };
}
//# sourceMappingURL=multicloud.js.map