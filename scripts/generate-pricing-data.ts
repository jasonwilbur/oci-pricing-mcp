#!/usr/bin/env node
/**
 * Refresh the OCI pricing snapshot in src/data/pricing-data.json.
 *
 * Fetches Oracle's live pricing API and rewrites the API-derived `products`
 * array plus the `metadata` timestamps/counts. The curated, hand-structured
 * category keys (compute, storage, aiMl, etc.) are PRESERVED as-is — this script
 * only refreshes the raw-product snapshot the bundled data is built on, it does
 * not regenerate the curation.
 *
 * Run: npm run generate-data
 *
 * Copyright 2026 Jason Wilbur. Licensed under the Apache License, Version 2.0.
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OCI_PRICING_API = 'https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/';
const DATA_PATH = join(__dirname, '../src/data/pricing-data.json');

interface ApiItem {
  partNumber: string;
  displayName: string;
  metricName: string;
  serviceCategory: string;
  currencyCodeLocalizations?: Array<{
    currencyCode: string;
    prices: Array<{ model: string; value: number }>;
  }>;
}

interface BundledProduct {
  partNumber: string;
  displayName: string;
  metricName: string;
  serviceCategory: string;
  priceUSD: number;
}

function payAsYouGoUSD(item: ApiItem): number {
  const usd = (item.currencyCodeLocalizations || []).find((c) => c.currencyCode === 'USD');
  if (!usd) return 0;
  const payg = usd.prices.find((p) => p.model === 'PAY_AS_YOU_GO');
  return payg ? payg.value : usd.prices[0]?.value ?? 0;
}

async function main(): Promise<void> {
  console.log(`Fetching live OCI pricing from ${OCI_PRICING_API} ...`);
  const response = await fetch(OCI_PRICING_API);
  if (!response.ok) {
    throw new Error(`OCI pricing API request failed: ${response.status} ${response.statusText}`);
  }

  const api = (await response.json()) as { lastUpdated: string; items: ApiItem[] };
  if (!Array.isArray(api.items) || api.items.length === 0) {
    throw new Error('OCI pricing API returned no items — refusing to overwrite bundled data.');
  }

  const products: BundledProduct[] = api.items.map((item) => ({
    partNumber: item.partNumber,
    displayName: item.displayName,
    metricName: item.metricName,
    serviceCategory: item.serviceCategory,
    priceUSD: payAsYouGoUSD(item),
  }));

  const totalCategories = new Set(products.map((p) => p.serviceCategory)).size;

  // Load the existing bundled file and preserve everything except the
  // API-derived `products` array and the metadata snapshot fields.
  const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8')) as Record<string, unknown>;
  const prevCount = Array.isArray(existing.products) ? (existing.products as unknown[]).length : 0;

  const metadata = {
    ...(existing.metadata as Record<string, unknown>),
    apiLastUpdated: api.lastUpdated,
    bundledDataGenerated: new Date().toISOString(),
    totalProducts: products.length,
    totalCategories,
    currency: 'USD',
    pricingModel: 'PAY_AS_YOU_GO',
  };

  const updated = { ...existing, metadata, products };
  writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2) + '\n');

  console.log('=== OCI pricing refresh complete ===');
  console.log(`  API lastUpdated:   ${api.lastUpdated}`);
  console.log(`  Raw products:      ${prevCount} -> ${products.length}`);
  console.log(`  Service categories: ${totalCategories}`);
  console.log('  Curated category structures were preserved unchanged.');
}

main().catch((err) => {
  console.error('Failed to refresh OCI pricing data:', err);
  process.exit(1);
});
