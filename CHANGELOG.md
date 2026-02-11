# Changelog

All notable changes to the OCI Pricing MCP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.4] - 2026-02-11

### Added
- **BYOL Detection**: Automatically detects and flags "BYOL" (Bring Your Own License) SKUs
  - New `isBYOL: boolean` field on all pricing items
  - New `licenseModel: 'standard' | 'byol'` field for easy filtering
- **Enhanced Summary Statistics**: Real-time pricing responses now include:
  - `summary.totalSKUs` - Total number of SKUs returned
  - `summary.standardPricing` - Count of standard pricing SKUs
  - `summary.byolPricing` - Count of BYOL pricing SKUs
  - `summary.uniqueCategories` - Number of unique service categories
- **API Coverage Notes**: Automatic documentation of what's included/excluded:
  - Clarifies that public API returns PAY_AS_YOU_GO pricing only
  - Notes that BYOL variants are included as separate SKUs
  - Explains that Reserved/Committed pricing requires Oracle sales contact
  - Documents Universal Credits and Monthly Flex exclusions
  - Highlights that government cloud pricing may differ

### Changed
- Updated `fetch_realtime_pricing` tool description to reflect accurate SKU counts (592 total: 562 standard + 30 BYOL)
- Enhanced filtering to maintain accurate summary statistics when category/search filters are applied

### Technical Details
- Oracle's public API contains 592 SKUs across 104 unique service categories
- All SKUs use PAY_AS_YOU_GO pricing model
- BYOL variants are identified by "BYOL" or "Bring Your Own License" in display name
- Database category breakdown: 78 standard + 19 BYOL = 97 total SKUs

## [1.3.3] - 2026-01-05

### Added
- Initial support for multicloud databases (Database@Azure, Database@AWS, Database@Google Cloud)
- Exadata Cloud pricing
- Cache with Redis pricing
- Full Stack Disaster Recovery pricing
- 100+ additional service SKUs

### Changed
- Updated pricing data from Oracle's real-time API
- Improved service categorization

## [1.3.0] - 2025-12-15

### Added
- Real-time pricing fetch from Oracle's public API
- Support for multiple currencies (USD, EUR, GBP, JPY, AUD, CAD)
- Enhanced service coverage (AI/ML, Observability, Integration, Security, etc.)

## [1.0.0] - 2025-11-01

### Added
- Initial release
- Core pricing tools for compute, storage, database, networking, kubernetes
- Cost calculator and quick estimates
- Free tier information
- Region comparison tools
