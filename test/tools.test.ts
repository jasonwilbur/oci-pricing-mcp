import { describe, it, expect } from 'vitest';
import { calculateNetworkingCost, compareDataEgress } from '../src/tools/networking.js';
import { listComputeShapes } from '../src/tools/compute.js';
import {
  listServicesByCategory,
  listAIMLServices,
  listSecurityServices,
  SERVICE_CATEGORIES,
} from '../src/tools/services.js';

describe('calculateNetworkingCost', () => {
  it('gives the first flexible load balancer free for paid accounts', () => {
    const res = calculateNetworkingCost({ flexibleLoadBalancers: 1 });
    // First LB free => credits cover the base cost, net should be ~0.
    expect(res.freeCredits).toBeGreaterThan(0);
    expect(res.netCost).toBeGreaterThanOrEqual(0);
    expect(res.netCost).toBeLessThanOrEqual(res.totalMonthly);
    expect(res.notes.some((n) => /free/i.test(n))).toBe(true);
  });

  it('net cost never exceeds gross and is internally consistent', () => {
    const res = calculateNetworkingCost({ outboundDataGB: 50000, flexibleLoadBalancers: 2 });
    expect(res.netCost).toBeCloseTo(res.totalMonthly - res.freeCredits, 1);
  });
});

describe('compareDataEgress', () => {
  it('honors the OCI 10 TB free tier (no egress cost under 10 TB)', () => {
    const res = compareDataEgress(5000);
    expect(res.ociCost).toBe(0);
    // Competitor figures must be flagged as approximate/hardcoded.
    expect(res.notes.some((n) => /approximate|hardcoded/i.test(n))).toBe(true);
  });

  it('charges OCI egress only above 10 TB', () => {
    const res = compareDataEgress(20000);
    expect(res.ociCost).toBeGreaterThan(0);
  });
});

describe('listComputeShapes', () => {
  it('returns shapes with prices', () => {
    const res = listComputeShapes({});
    expect(res.shapes.length).toBeGreaterThan(0);
  });
});

describe('list_services_by_category consolidation', () => {
  it('exposes 14 categories', () => {
    expect(SERVICE_CATEGORIES).toHaveLength(14);
  });

  it('returns the same payload as the individual deprecated tools', () => {
    const viaNew = listServicesByCategory({ category: 'aiml' });
    const viaOld = listAIMLServices({});
    // The consolidated tool adds a `category` field but otherwise matches.
    const { category, ...rest } = viaNew as { category: string } & Record<string, unknown>;
    expect(category).toBe('aiml');
    expect(rest).toEqual(viaOld);

    const sec = listServicesByCategory({ category: 'security' }) as Record<string, unknown>;
    const { category: c2, ...secRest } = sec as { category: string } & Record<string, unknown>;
    expect(c2).toBe('security');
    expect(secRest).toEqual(listSecurityServices({}));
  });

  it('every advertised category dispatches without throwing', () => {
    for (const category of SERVICE_CATEGORIES) {
      expect(() => listServicesByCategory({ category })).not.toThrow();
    }
  });

  it('throws a helpful error on an unknown category', () => {
    // @ts-expect-error intentionally invalid category
    expect(() => listServicesByCategory({ category: 'nope' })).toThrow(/Unknown service category/);
  });
});
