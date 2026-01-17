/**
 * OCI Database Pricing Tools
 */
import { getDatabasePricing, getLastUpdated, getFreeTier } from '../data/fetcher.js';
/**
 * List available OCI database options with pricing
 */
export function listDatabaseOptions(params = {}) {
    let databases = getDatabasePricing();
    // Filter by type
    if (params.type) {
        const typeFilter = params.type.toLowerCase();
        databases = databases.filter((d) => d.databaseType?.toLowerCase().includes(typeFilter) ||
            d.type?.toLowerCase().includes(typeFilter));
    }
    // Filter by license type
    if (params.licenseType) {
        if (params.licenseType === 'byol') {
            databases = databases.filter((d) => d.byol === true);
        }
        else {
            databases = databases.filter((d) => d.licenseIncluded === true && d.byol !== true);
        }
    }
    // Transform to user-friendly format
    const options = databases.map((d) => {
        const ecpuPrice = d.ecpuPrice;
        const storagePrice = d.storagePrice || 0.0255;
        const computePrice = ecpuPrice || d.pricePerUnit;
        const computeUnit = ecpuPrice ? 'ECPU/hour' : d.unit;
        // Calculate example monthly cost (2 ECPUs/OCPUs, 100 GB storage)
        const exampleCompute = computePrice * 2 * 730;
        const exampleStorage = storagePrice * 100;
        const exampleTotal = Math.round((exampleCompute + exampleStorage) * 100) / 100;
        return {
            name: d.type,
            type: d.databaseType || 'general',
            description: d.description,
            computePrice,
            computeUnit,
            storagePrice,
            licenseIncluded: d.licenseIncluded,
            monthlyExample: `~$${exampleTotal}/month for 2 ${ecpuPrice ? 'ECPU' : 'OCPU'}, 100 GB`,
            notes: d.notes,
        };
    });
    // Get free tier info
    const freeTier = getFreeTier();
    const freeTierNote = freeTier?.database
        ? `Always Free: ${freeTier.database.autonomous}`
        : 'Always Free includes 2 Autonomous Databases, 20 GB each';
    return {
        options,
        totalCount: options.length,
        lastUpdated: getLastUpdated(),
        freeTierNote,
        tips: [
            'Autonomous Database BYOL saves ~76% if you have existing Oracle licenses',
            'Autonomous JSON is cheapest for document workloads at $0.0807/ECPU/hr',
            'MySQL HeatWave provides real-time analytics at no extra cost on ML queries',
            'PostgreSQL is fully managed with HA options',
            'NoSQL has generous free tier: 200M reads, 50M writes, 25 GB storage',
            'ECPU pricing provides finer granularity than OCPU (1 ECPU increments)',
        ],
    };
}
export function calculateDatabaseCost(params) {
    const databases = getDatabasePricing();
    const breakdown = [];
    const notes = [];
    const hoursPerMonth = params.hoursPerMonth || 730;
    // Find the database pricing
    const licenseFilter = params.licenseType === 'byol' ? '-byol' : '';
    let db = databases.find((d) => d.databaseType === params.type ||
        d.type?.toLowerCase().includes(params.type.toLowerCase().replace(/-/g, '')));
    // If BYOL requested, try to find BYOL variant
    if (params.licenseType === 'byol') {
        const byolDb = databases.find((d) => (d.databaseType === params.type || d.type?.toLowerCase().includes(params.type.toLowerCase())) &&
            d.byol === true);
        if (byolDb)
            db = byolDb;
    }
    if (!db) {
        return {
            breakdown: [],
            totalMonthly: 0,
            notes: [`Database type "${params.type}" not found`],
        };
    }
    // Compute cost
    const ecpuPrice = db.ecpuPrice;
    const computePrice = ecpuPrice || db.pricePerUnit;
    const computeUnit = ecpuPrice ? 'ECPU' : 'OCPU';
    const computeCost = computePrice * params.computeUnits * hoursPerMonth;
    breakdown.push({
        item: `${db.description} - Compute`,
        quantity: params.computeUnits,
        unit: computeUnit,
        unitPrice: computePrice,
        monthlyTotal: Math.round(computeCost * 100) / 100,
    });
    // Storage cost
    const storagePrice = db.storagePrice || 0.0255;
    const storageCost = storagePrice * params.storageGB;
    breakdown.push({
        item: `${db.description} - Storage`,
        quantity: params.storageGB,
        unit: 'GB',
        unitPrice: storagePrice,
        monthlyTotal: Math.round(storageCost * 100) / 100,
    });
    const totalMonthly = Math.round((computeCost + storageCost) * 100) / 100;
    // Calculate BYOL savings if applicable
    let savings;
    if (params.type.startsWith('autonomous') && params.licenseType !== 'byol') {
        // Find BYOL variant to show potential savings
        const byolDb = databases.find((d) => d.databaseType === params.type && d.byol === true);
        if (byolDb) {
            const byolEcpuPrice = byolDb.ecpuPrice || byolDb.pricePerUnit;
            const byolComputeCost = byolEcpuPrice * params.computeUnits * hoursPerMonth;
            const byolTotal = byolComputeCost + storageCost;
            const savedAmount = totalMonthly - byolTotal;
            const percentSaved = Math.round((savedAmount / totalMonthly) * 100);
            savings = {
                byolSavings: Math.round(savedAmount * 100) / 100,
                percentSaved,
            };
            notes.push(`BYOL option available: Save $${savings.byolSavings}/month (${percentSaved}%) with existing Oracle licenses`);
        }
    }
    if (db.byol) {
        notes.push('Price reflects BYOL (Bring Your Own License) - infrastructure only');
    }
    if (hoursPerMonth < 730) {
        notes.push(`Calculated for ${hoursPerMonth} hours/month (not 24/7 usage)`);
    }
    if (params.type === 'autonomous-transaction-processing' || params.type === 'autonomous-data-warehouse') {
        notes.push('Auto-scaling can increase compute beyond configured ECPUs - set limits to control costs');
    }
    return {
        breakdown,
        totalMonthly,
        savings,
        notes,
    };
}
/**
 * Compare database options for a given workload
 */
export function compareDatabaseOptions(workloadType) {
    const databases = getDatabasePricing();
    // Filter relevant options based on workload
    const workloadMap = {
        oltp: ['autonomous-transaction-processing', 'mysql-heatwave', 'postgresql', 'base-database-vm'],
        analytics: ['autonomous-data-warehouse', 'mysql-heatwave'],
        document: ['autonomous-json', 'nosql'],
        general: [
            'autonomous-transaction-processing',
            'mysql-heatwave',
            'postgresql',
            'nosql',
        ],
    };
    const relevantTypes = workloadMap[workloadType] || workloadMap.general;
    const relevantDbs = databases.filter((d) => relevantTypes.some((t) => d.databaseType === t || d.type?.toLowerCase().includes(t.replace(/-/g, ''))) && d.byol !== true // Exclude BYOL variants for comparison
    );
    const comparison = relevantDbs.map((d) => {
        const ecpuPrice = d.ecpuPrice;
        const computePrice = ecpuPrice || d.pricePerUnit;
        const storagePrice = d.storagePrice || 0.0255;
        const monthly = computePrice * 2 * 730 + storagePrice * 100;
        return {
            name: d.type,
            monthlyFor2Units100GB: Math.round(monthly * 100) / 100,
            bestFor: getDatabaseUseCase(d.databaseType || d.type),
        };
    });
    // Sort by price
    comparison.sort((a, b) => a.monthlyFor2Units100GB - b.monthlyFor2Units100GB);
    return {
        recommended: relevantDbs.map((d) => ({
            name: d.type,
            type: d.databaseType || 'general',
            description: d.description,
            computePrice: d.ecpuPrice || d.pricePerUnit,
            computeUnit: d.ecpuPrice ? 'ECPU/hour' : d.unit,
            storagePrice: d.storagePrice || 0.0255,
            licenseIncluded: d.licenseIncluded,
            monthlyExample: '',
            notes: d.notes,
        })),
        comparison,
        notes: [
            `For ${workloadType} workloads, cheapest option: ${comparison[0]?.name} at $${comparison[0]?.monthlyFor2Units100GB}/month`,
            'Always Free tier includes 2 Autonomous Databases (20 GB each)',
        ],
    };
}
function getDatabaseUseCase(type) {
    const useCases = {
        'autonomous-transaction-processing': 'High-performance OLTP, mixed workloads',
        'autonomous-data-warehouse': 'Analytics, BI, data warehousing',
        'autonomous-json': 'Document databases, JSON workloads',
        'mysql-heatwave': 'MySQL apps, real-time analytics',
        'postgresql': 'PostgreSQL apps, open source preference',
        'nosql': 'Key-value, serverless apps, IoT',
        'base-database-vm': 'Traditional Oracle Database workloads',
        'exadata-cloud': 'Mission-critical, highest performance',
    };
    return useCases[type] || 'General database workloads';
}
//# sourceMappingURL=database.js.map