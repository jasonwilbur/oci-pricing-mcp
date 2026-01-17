/**
 * OCI Networking Pricing Tools
 */
import { getNetworkingPricing, getLastUpdated, getFreeTier } from '../data/fetcher.js';
/**
 * List available OCI networking options with pricing
 */
export function listNetworkingOptions(params = {}) {
    let networking = getNetworkingPricing();
    // Filter by type
    if (params.type) {
        const typeFilter = params.type.toLowerCase();
        networking = networking.filter((n) => n.networkingType?.toLowerCase().includes(typeFilter) ||
            n.type?.toLowerCase().includes(typeFilter));
    }
    // Transform to user-friendly format
    const options = networking.map((n) => {
        const isFree = n.pricePerUnit === 0;
        // Calculate monthly example based on service type
        let monthlyExample = '';
        if (isFree) {
            monthlyExample = 'FREE';
        }
        else if (n.type === 'flexible-load-balancer') {
            monthlyExample = `~$${Math.round(n.pricePerUnit * 730 * 100) / 100}/month base`;
        }
        else if (n.type === 'flexible-load-balancer-bandwidth') {
            monthlyExample = `$${Math.round(n.pricePerUnit * 100 * 730 * 100) / 100}/month for 100 Mbps`;
        }
        else if (n.type === 'data-egress') {
            monthlyExample = `First 10 TB FREE, then $${n.pricePerUnit}/GB`;
        }
        else if (n.type?.includes('fastconnect')) {
            monthlyExample = `$${Math.round(n.pricePerUnit * 730 * 100) / 100}/month`;
        }
        else {
            monthlyExample = `$${Math.round(n.pricePerUnit * 730 * 100) / 100}/month`;
        }
        return {
            name: n.type,
            type: n.networkingType || 'general',
            description: n.description,
            pricePerUnit: n.pricePerUnit,
            unit: n.unit,
            monthlyExample,
            isFree,
            notes: n.notes,
        };
    });
    // Get free services
    const freeServices = options.filter((o) => o.isFree).map((o) => o.name);
    // Get free tier info
    const freeTier = getFreeTier();
    const freeTierNote = freeTier?.networking
        ? `Free: ${freeTier.networking.loadBalancer}, ${freeTier.networking.dataEgress}`
        : 'VCN, Network LB free. First LB + 10 Mbps free. 10 TB egress free.';
    return {
        options,
        freeServices,
        totalCount: options.length,
        lastUpdated: getLastUpdated(),
        freeTierNote,
        tips: [
            'Network Load Balancer (L4) is completely FREE - no hourly or data charges',
            'VCN, subnets, route tables, security lists are all FREE',
            'First Flexible LB and 10 Mbps bandwidth free for paid accounts',
            '10 TB/month outbound data transfer FREE - lowest in industry',
            'FastConnect is port-only pricing; partner fees are separate',
            'Service Gateway provides FREE private access to OCI services',
        ],
    };
}
export function calculateNetworkingCost(params) {
    const networking = getNetworkingPricing();
    const breakdown = [];
    const notes = [];
    let freeCredits = 0;
    // Flexible Load Balancers
    if (params.flexibleLoadBalancers && params.flexibleLoadBalancers > 0) {
        const lbPrice = networking.find((n) => n.type === 'flexible-load-balancer');
        if (lbPrice) {
            const lbCost = lbPrice.pricePerUnit * params.flexibleLoadBalancers * 730;
            // First LB is free for paid accounts
            if (params.flexibleLoadBalancers >= 1) {
                freeCredits += lbPrice.pricePerUnit * 730;
                notes.push('First Flexible Load Balancer is free for paid accounts');
            }
            breakdown.push({
                item: 'Flexible Load Balancer (base)',
                quantity: params.flexibleLoadBalancers,
                unit: 'instance',
                unitPrice: lbPrice.pricePerUnit,
                monthlyTotal: Math.round(lbCost * 100) / 100,
                note: params.flexibleLoadBalancers === 1 ? 'First one free' : undefined,
            });
        }
    }
    // Load Balancer Bandwidth
    if (params.loadBalancerBandwidthMbps && params.loadBalancerBandwidthMbps > 0) {
        const bwPrice = networking.find((n) => n.type === 'flexible-load-balancer-bandwidth');
        if (bwPrice) {
            const bwCost = bwPrice.pricePerUnit * params.loadBalancerBandwidthMbps * 730;
            // First 10 Mbps is free
            if (params.loadBalancerBandwidthMbps <= 10) {
                freeCredits += bwCost;
                notes.push('First 10 Mbps bandwidth is free for paid accounts');
            }
            else {
                freeCredits += bwPrice.pricePerUnit * 10 * 730;
            }
            breakdown.push({
                item: 'Load Balancer Bandwidth',
                quantity: params.loadBalancerBandwidthMbps,
                unit: 'Mbps',
                unitPrice: bwPrice.pricePerUnit,
                monthlyTotal: Math.round(bwCost * 100) / 100,
                note: 'First 10 Mbps free',
            });
        }
    }
    // Network Load Balancers (FREE)
    if (params.networkLoadBalancers && params.networkLoadBalancers > 0) {
        breakdown.push({
            item: 'Network Load Balancer (L4)',
            quantity: params.networkLoadBalancers,
            unit: 'instance',
            unitPrice: 0,
            monthlyTotal: 0,
            note: 'FREE - no charge',
        });
        notes.push('Network Load Balancers are completely free');
    }
    // Outbound Data Transfer
    if (params.outboundDataGB && params.outboundDataGB > 0) {
        const egressPrice = networking.find((n) => n.type === 'data-egress');
        if (egressPrice) {
            const freeGB = 10240; // 10 TB free
            const billableGB = Math.max(0, params.outboundDataGB - freeGB);
            const egressCost = egressPrice.pricePerUnit * billableGB;
            if (params.outboundDataGB <= freeGB) {
                freeCredits += egressPrice.pricePerUnit * params.outboundDataGB;
                notes.push(`All ${params.outboundDataGB} GB outbound transfer covered by free tier`);
            }
            else {
                freeCredits += egressPrice.pricePerUnit * freeGB;
                notes.push(`First 10 TB (${freeGB} GB) outbound is free. Charging for ${billableGB} GB.`);
            }
            breakdown.push({
                item: 'Outbound Data Transfer',
                quantity: params.outboundDataGB,
                unit: 'GB',
                unitPrice: egressPrice.pricePerUnit,
                monthlyTotal: Math.round(egressCost * 100) / 100,
                note: `First 10 TB free (${billableGB} GB billable)`,
            });
        }
    }
    // FastConnect
    if (params.fastConnectGbps) {
        const fcType = `fastconnect-${params.fastConnectGbps}g`;
        const fcPrice = networking.find((n) => n.type === fcType);
        if (fcPrice) {
            const fcCost = fcPrice.pricePerUnit * 730;
            breakdown.push({
                item: `FastConnect ${params.fastConnectGbps} Gbps`,
                quantity: 1,
                unit: 'port',
                unitPrice: fcPrice.pricePerUnit,
                monthlyTotal: Math.round(fcCost * 100) / 100,
                note: 'Port fee only; partner fees separate',
            });
        }
    }
    // VPN Connections
    if (params.vpnConnections && params.vpnConnections > 0) {
        const vpnPrice = networking.find((n) => n.type === 'site-to-site-vpn');
        if (vpnPrice) {
            const vpnCost = vpnPrice.pricePerUnit * params.vpnConnections * 730;
            breakdown.push({
                item: 'Site-to-Site VPN',
                quantity: params.vpnConnections,
                unit: 'connection',
                unitPrice: vpnPrice.pricePerUnit,
                monthlyTotal: Math.round(vpnCost * 100) / 100,
            });
        }
    }
    // NAT Gateways
    if (params.natGateways && params.natGateways > 0) {
        const natPrice = networking.find((n) => n.type === 'nat-gateway');
        if (natPrice) {
            const natCost = natPrice.pricePerUnit * params.natGateways * 730;
            breakdown.push({
                item: 'NAT Gateway',
                quantity: params.natGateways,
                unit: 'gateway',
                unitPrice: natPrice.pricePerUnit,
                monthlyTotal: Math.round(natCost * 100) / 100,
            });
        }
    }
    const totalMonthly = breakdown.reduce((sum, item) => sum + item.monthlyTotal, 0);
    const netCost = Math.max(0, Math.round((totalMonthly - freeCredits) * 100) / 100);
    return {
        breakdown,
        totalMonthly: Math.round(totalMonthly * 100) / 100,
        freeCredits: Math.round(freeCredits * 100) / 100,
        netCost,
        notes,
    };
}
/**
 * Compare data egress pricing with other clouds
 */
export function compareDataEgress(monthlyGB) {
    const networking = getNetworkingPricing();
    const egressPrice = networking.find((n) => n.type === 'data-egress');
    if (!egressPrice) {
        return {
            ociCost: 0,
            comparison: 'Unable to calculate',
            savings: '',
            notes: [],
        };
    }
    // OCI: First 10 TB free, then $0.0085/GB
    const ociFreeGB = 10240;
    const ociBillableGB = Math.max(0, monthlyGB - ociFreeGB);
    const ociCost = ociBillableGB * egressPrice.pricePerUnit;
    // Rough comparisons (AWS/Azure typically ~$0.09/GB after 10 GB free)
    const awsRate = 0.09;
    const awsFreeGB = 100; // AWS has ~100 GB free tier
    const awsCost = (monthlyGB - awsFreeGB) * awsRate;
    const savings = awsCost - ociCost;
    const savingsPercent = awsCost > 0 ? Math.round((savings / awsCost) * 100) : 0;
    return {
        ociCost: Math.round(ociCost * 100) / 100,
        comparison: `OCI: $${Math.round(ociCost * 100) / 100} vs AWS/Azure: ~$${Math.round(awsCost * 100) / 100}`,
        savings: savings > 0 ? `Save ~$${Math.round(savings * 100) / 100}/month (${savingsPercent}%) with OCI` : 'No savings at this volume',
        notes: [
            `OCI: 10 TB free, then $${egressPrice.pricePerUnit}/GB`,
            'AWS/Azure: ~100 GB free, then ~$0.09/GB (varies by region/tier)',
            'GCP: Similar to AWS at scale',
            'OCI consistently offers the lowest egress pricing',
        ],
    };
}
//# sourceMappingURL=networking.js.map