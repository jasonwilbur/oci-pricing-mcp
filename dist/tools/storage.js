/**
 * OCI Storage Pricing Tools
 */
import { getStoragePricing, getLastUpdated, getFreeTier } from '../data/fetcher.js';
/**
 * List available OCI storage options with pricing
 */
export function listStorageOptions(params = {}) {
    let storage = getStoragePricing();
    // Filter by type
    if (params.type) {
        const typeFilter = params.type.toLowerCase();
        storage = storage.filter((s) => s.storageType?.toLowerCase().includes(typeFilter) ||
            s.type?.toLowerCase().includes(typeFilter));
    }
    // Transform to user-friendly format
    const options = storage.map((s) => ({
        name: s.type,
        type: s.storageType || 'general',
        description: s.description,
        pricePerGB: s.pricePerUnit,
        monthlyPer100GB: Math.round(s.pricePerUnit * 100 * 100) / 100,
        monthlyPerTB: Math.round(s.pricePerUnit * 1024 * 100) / 100,
        performanceTier: s.performanceTier,
        notes: s.notes,
    }));
    // Get free tier info
    const freeTier = getFreeTier();
    const freeTierNote = freeTier?.storage
        ? `Always Free: ${freeTier.storage.blockVolume} block, ${freeTier.storage.objectStorage} object, ${freeTier.storage.archive} archive`
        : 'Always Free tier available';
    // Find cheapest and best performance
    const sortedByPrice = [...options].sort((a, b) => a.pricePerGB - b.pricePerGB);
    const cheapest = sortedByPrice[0];
    const blockOptions = options.filter((o) => o.type.includes('block'));
    const bestPerf = blockOptions.find((o) => o.performanceTier?.includes('Ultra'));
    return {
        options,
        totalCount: options.length,
        lastUpdated: getLastUpdated(),
        freeTierNote,
        comparison: {
            cheapest: cheapest
                ? `${cheapest.name} at $${cheapest.pricePerGB}/GB/month ($${cheapest.monthlyPerTB}/TB)`
                : 'N/A',
            bestPerformance: bestPerf
                ? `${bestPerf.name} at $${bestPerf.pricePerGB}/GB/month (up to 225K IOPS)`
                : 'Block Volume Ultra High Performance',
        },
        tips: [
            'Archive storage is 10x cheaper than standard object storage for long-term data',
            'Block Volume Balanced (10 VPU) is included at base price - no extra performance charge',
            'First 10 GB of Object Storage is free',
            'Consider Infrequent Access tier for data accessed less than monthly',
            'File Storage pricing is higher but provides NFS compatibility',
        ],
    };
}
export function calculateStorageCost(params) {
    const storage = getStoragePricing();
    const breakdown = [];
    const notes = [];
    // Block Volume
    if (params.blockVolumeGB) {
        let blockType = 'block-storage-balanced'; // Default
        let tierName = 'Balanced';
        switch (params.blockPerformanceTier) {
            case 'basic':
                blockType = 'block-storage-basic';
                tierName = 'Lower Cost';
                break;
            case 'high':
                blockType = 'block-storage-high-performance';
                tierName = 'Higher Performance';
                break;
            case 'ultra':
                blockType = 'block-storage-ultra-high';
                tierName = 'Ultra High Performance';
                break;
        }
        const blockPrice = storage.find((s) => s.type === blockType);
        if (blockPrice) {
            breakdown.push({
                item: `Block Volume (${tierName})`,
                gb: params.blockVolumeGB,
                pricePerGB: blockPrice.pricePerUnit,
                monthlyTotal: Math.round(blockPrice.pricePerUnit * params.blockVolumeGB * 100) / 100,
            });
        }
    }
    // Object Storage
    if (params.objectStorageGB) {
        let objectType = 'object-storage'; // Default standard
        let tierName = 'Standard';
        switch (params.objectStorageTier) {
            case 'infrequent':
                objectType = 'object-storage-ia';
                tierName = 'Infrequent Access';
                break;
            case 'archive':
                objectType = 'object-storage-archive';
                tierName = 'Archive';
                break;
        }
        const objectPrice = storage.find((s) => s.type === objectType);
        if (objectPrice) {
            breakdown.push({
                item: `Object Storage (${tierName})`,
                gb: params.objectStorageGB,
                pricePerGB: objectPrice.pricePerUnit,
                monthlyTotal: Math.round(objectPrice.pricePerUnit * params.objectStorageGB * 100) / 100,
            });
        }
        if (params.objectStorageTier === 'archive') {
            notes.push('Archive storage has 90-day minimum retention and ~1 hour restore time');
        }
        else if (params.objectStorageTier === 'infrequent') {
            notes.push('Infrequent Access has 31-day minimum retention');
        }
    }
    // File Storage
    if (params.fileStorageGB) {
        const filePrice = storage.find((s) => s.type === 'file-storage');
        if (filePrice) {
            breakdown.push({
                item: 'File Storage',
                gb: params.fileStorageGB,
                pricePerGB: filePrice.pricePerUnit,
                monthlyTotal: Math.round(filePrice.pricePerUnit * params.fileStorageGB * 100) / 100,
            });
        }
    }
    const totalMonthly = breakdown.reduce((sum, item) => sum + item.monthlyTotal, 0);
    // Add free tier note
    notes.push('First 200 GB block + 10 GB object + 10 GB archive included in Always Free tier');
    return {
        breakdown,
        totalMonthly: Math.round(totalMonthly * 100) / 100,
        notes,
    };
}
/**
 * Compare storage tiers for a given size
 */
export function compareStorageTiers(sizeGB) {
    const storage = getStoragePricing();
    const comparisons = storage.map((s) => ({
        tier: s.type,
        type: s.storageType || 'general',
        pricePerGB: s.pricePerUnit,
        monthlyTotal: Math.round(s.pricePerUnit * sizeGB * 100) / 100,
        useCase: getStorageUseCase(s.type),
    }));
    // Sort by price
    comparisons.sort((a, b) => a.monthlyTotal - b.monthlyTotal);
    return {
        comparisons,
        recommendation: `For ${sizeGB} GB: Archive ($${comparisons[0]?.monthlyTotal}/mo) for cold data, Object Storage Standard for frequent access, Block Volume for VM storage`,
    };
}
function getStorageUseCase(type) {
    const useCases = {
        'block-storage-basic': 'Dev/test environments, non-critical workloads',
        'block-storage-balanced': 'General purpose VM storage (default)',
        'block-storage-high-performance': 'Databases, transaction-heavy applications',
        'block-storage-ultra-high': 'High-performance databases, real-time analytics',
        'object-storage': 'Frequently accessed unstructured data, backups',
        'object-storage-ia': 'Infrequently accessed data (< 1x/month)',
        'object-storage-archive': 'Long-term retention, compliance archives',
        'file-storage': 'Shared NFS storage, legacy application migration',
        'boot-volume': 'VM operating system disks',
    };
    return useCases[type] || 'General storage';
}
//# sourceMappingURL=storage.js.map