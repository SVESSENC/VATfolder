# Danish VAT System (Moms) - Working Documentation Draft

Last updated: 24 February 2026
Scope: Operational guide for how Danish VAT works for businesses. This is a practical documentation draft, not legal advice.

## 1) Legal and administrative framework
- Primary Danish law: `Momsloven` (Danish VAT Act), consolidated as LBK no. 209 of 27 February 2024 (still listed as current in Retsinformation printout accessed 24 Feb 2026). [RETS-MOMSLOVEN]
- Core rate rule in law: VAT is 25% of the taxable amount (`Momsloven`, section 33). [RETS-MOMSLOVEN]
- EU framework: Denmark applies EU VAT law framework (VAT Directive), but local administration and practical reporting are run by the Danish Tax Agency (`Skattestyrelsen`) through `skat.dk` and E-tax for businesses (`TastSelv Erhverv`).
 
As-of control (Section 1): Legal consolidation references should be revalidated against current Retsinformation before production use.

## 2) Who must register for VAT in Denmark
- Mandatory registration threshold: register when taxable sales exceed DKK 50,000 in a rolling 12-month period. [SKAT-REGISTER]
- Optional registration: possible below DKK 50,000.
- Registration is done via `virk.dk` (change business registration status). [SKAT-REGISTER]

As-of control (Section 2): Threshold and registration process should be rechecked if this document is reused in later periods.

## 3) VAT rate structure in Denmark
- Standard VAT rate: 25%.
- Denmark generally operates with a single standard rate model in practice (no broad reduced-rate system like many other EU states).
- Some supplies are exempt (momsfritaget) rather than reduced-rated.

## 4) Taxable, exempt, and zero-rated concepts (operationally)
- Taxable supplies: ordinary domestic sales of goods/services generally charged at 25%.
- Exempt supplies: specific activities (e.g., many healthcare, teaching, some cultural/charitable/real-estate situations) are exempt under the VAT framework.
- Zero-rate style treatment in cross-border trade: e.g., many exports and intra-EU B2B supplies are made without charging Danish VAT, but only when strict conditions/documentation are met.

## 5) Reporting frequency and deadlines
### 5.1 Settlement periods
- Half-yearly: generally if VAT-taxable turnover is under DKK 5 million and reporting/payment history is compliant. [SKAT-DEADLINES]
- Quarterly: typically for newly registered businesses, businesses that request quarterly settlement, or where turnover is DKK 5-50 million. [SKAT-DEADLINES]
- Monthly: typically where turnover exceeds DKK 50 million or business requests monthly settlement. [SKAT-DEADLINES]

### 5.2 Deadline mechanics
- Deadlines vary by settlement period and are published by Skat in a yearly schedule. [SKAT-DEADLINES]
- Late filing may trigger a provisional assessment fee of DKK 1,400 per missed period (amount increased from DKK 800 effective 1 February 2025), plus interest, when estimate conditions are met. [SKAT-ESTIMATES]
- Zero declaration requirement: if VAT-registered, a return is still required even for periods with no taxable activity. [SKAT-DEADLINES]

Note: Always check current live deadline tables because dates and calendars change year-to-year.
As-of control (Section 5): Filing deadlines and fee amounts are time-sensitive and must be validated for each reporting year.

## 6) How VAT payable is calculated
- Output VAT: VAT charged on sales.
- Input VAT: VAT paid on purchases used for VATable business activity.
- Net VAT payable = Output VAT - deductible Input VAT.
- If input VAT exceeds output VAT, the business generally receives a refund/negative settlement for the period.

## 7) Input VAT deduction rules (high-level)
- General rule: VAT-registered businesses can deduct VAT on purchases used for taxable business operations/resale.
- Mixed-use or exempt-activity situations may reduce deduction rights (partial deduction/pro-rata logic).
- Exempt output activities typically restrict recovery of related input VAT.

## 8) Domestic compliance process (practical flow)
1. Register for VAT (if threshold met or voluntary registration desired).
2. Keep VAT accounts continuously (sales VAT, purchase VAT, exempt turnover, cross-border boxes).
3. File VAT return in E-tax for businesses by the assigned deadline.
4. Pay VAT (or receive refund) via the Tax Account (`Skattekontoen`).
5. If errors are found later, submit corrections/amended reporting.

## 9) Cross-border VAT - EU (B2B)
### 9.1 Sales to EU businesses
- Danish supplier will often not charge Danish VAT for qualifying B2B supplies where legal conditions are met. [SKAT-EU-SALES]
- Supplier generally reports as `EU sales exclusive of VAT` and, where the listing obligation applies, submits by the 25th of the month. [SKAT-EU-SALES]
- Buyer accounts for VAT in buyer's Member State (reverse charge principle).

### 9.2 Conditions/documentation
- Verify buyer VAT number.
- Invoice must include required VAT details (incl. buyer VAT number).
- For services under reverse charge, invoice should state reverse charge applies.
- For goods, business must document dispatch/transport to another EU country.

### 9.3 Purchases from EU businesses
- Danish business generally self-accounts Danish VAT via reverse charge on eligible EU purchases where place-of-supply rules trigger Danish reporting. [SKAT-EU-PURCHASES]
- These amounts are reported in dedicated VAT return fields and often mirrored by input VAT deduction (subject to deduction rights).

## 10) Cross-border VAT - non-EU (third countries)
### 10.1 Exports (sales out of EU)
- Goods exported out of EU are generally sold without Danish VAT, provided export conditions and documentation are met. [SKAT-NON-EU-SALES]
- Businesses exporting goods typically need exporter setup and EORI registration where customs processes require it. [SKAT-NON-EU-SALES]
- Sales exempt from VAT to non-EU countries are reported in VAT return fields such as Box C where that field mapping applies to the transaction type in TastSelv. [SKAT-NON-EU-SALES]

### 10.2 Imports and services bought from non-EU suppliers
- Danish import VAT generally applies on import of goods and many services from non-EU countries. [SKAT-NON-EU-PURCHASES]
- Business should be registered as importer where acting as importer of record. [SKAT-NON-EU-PURCHASES]
- VAT reporting uses specific fields for foreign goods/services purchases and reverse charge, with deduction generally available where purchases support taxable business activity.

## 11) One Stop Shop (OSS) and SME schemes
### 11.1 OSS (sales to EU consumers)
- Optional EU simplification scheme for B2C cross-border supplies. [SKAT-OSS-OVERVIEW]
- Primarily relevant when EU B2C turnover exceeds EUR 10,000 (as highlighted by Skat), subject to scheme scope rules. [SKAT-OSS-OVERVIEW]
- Denmark administers OSS reporting/payment via E-tax for businesses. [SKAT-OSS-DECLARE]
- Within OSS, nil/zero declarations may still be required for registered periods where no reportable sales occurred. [SKAT-OSS-DECLARE]

### 11.2 SME VAT exemption in EU
- Skat describes an EU SME VAT exemption track for qualifying businesses. [SKAT-SME]
- Referenced EU-level cap in Skat guidance: annual EU turnover of max DKK 744,750 for scheme access (plus national threshold conditions by country). [SKAT-SME]

As-of control (Section 11): OSS/SME conditions and thresholds are scheme-based and may change; confirm current guidance before use.

## 12) Invoicing, bookkeeping, and record retention
- VAT documentation and bookkeeping must support transaction trail and control trail.
- Danish Bookkeeping Act (`Bogforingsloven`, LOV no. 700 of 24 May 2022) requires secure storage of accounting records for 5 years from end of the relevant financial year (section 12), with safeguards against destruction/alteration/misuse (section 13). [RETS-BOGFORINGSLOVEN]
- Practical implication: preserve invoices, export/import evidence, VAT number checks, contracts, and calculation working papers.

## 13) Risk, controls, and penalties
- Key financial risk points:
  - missed filing/payment deadlines (fees + interest),
  - missing cross-border documentation (can convert 0%/exempt treatment into Danish VAT liability),
  - incorrect deduction claims,
  - fraud exposure (e.g., carousel fraud chains).
- Control priorities:
  - master-data controls (customer VAT IDs, country codes),
  - tax code governance in ERP/accounting,
  - documented monthly VAT close,
  - evidence archive linked to each VAT return period.

## 14) Suggested documentation structure for this project (next iterations)
- `01-vat-overview.md` - concepts, authorities, legal map
- `02-registration-thresholds.md` - registration decision tree
- `03-rates-exemptions.md` - taxable vs exempt catalog
- `04-filing-payment-calendar.md` - operational filing calendar and ownership
- `05-input-vat-deductions.md` - deduction matrix and blocked/partial cases
- `06-eu-trade.md` - B2B/B2C EU flows, OSS, ESL reporting
- `07-non-eu-trade.md` - import/export VAT and customs touchpoints
- `08-controls-audit-readiness.md` - evidence standards, reconciliations, remediation playbooks

## 15) Open items to deepen in next pass
- Build a full exemption matrix directly mapped to `Momsloven` section 13 categories with plain-English explanations.
- Add a field-by-field VAT return guide (each box/field in TastSelv Erhverv).
- Add invoice content requirements from the detailed legal guide sections.
- Add sector-specific rules (real estate, financial services, passenger transport, digital services/platform economy).
- Add correction workflows, interest computation examples, and penalty scenarios.

## Sources (primary/official)
- [SKAT-REGISTER] Danish VAT registration threshold and process (Skat):
  - https://skat.dk/en-us/businesses/vat/vat-what-to-do/how-to-register-your-business
- [SKAT-GET-STARTED] VAT getting-started overview (Skat):
  - https://skat.dk/en-us/businesses/vat/get-started-on-vat
- [SKAT-DEADLINES] VAT deadlines, settlement periods, penalties (Skat):
  - https://skat.dk/en-us/businesses/vat/deadlines-filing-vat-returns-and-paying-vat
- [SKAT-ESTIMATES] Estimates/provisional assessments and DKK 1,400 fee update (Skat):
  - https://skat.dk/en-us/businesses/payment-and-the-tax-account-skattekontoen/estimates
- [SKAT-DEDUCTIONS] VAT deductions overview (Skat):
  - https://skat.dk/en-us/businesses/vat/vat-deductions/getting-your-vat-deductions
- [SKAT-EXEMPT-SERVICES] Exempt services reporting (Skat):
  - https://skat.dk/en-us/erhverv/moms/moms-saadan-goer-du/momsfrie-ydelser-saadan-indberetter-du
- [SKAT-EU-SALES] EU B2B sales rules and documentation requirements (Skat):
  - https://skat.dk/en-us/businesses/vat/vat-on-international-trade/vat-on-sales-to-businesses/trading-with-eu-countries/sale-of-goods-and-services-in-the-eu
- [SKAT-EU-PURCHASES] EU purchases and reverse charge overview (Skat):
  - https://skat.dk/en-us/businesses/vat/vat-on-international-trade/vat-on-sales-to-businesses/trading-with-eu-countries/purchases-of-goods-and-services-in-the-eu
- [SKAT-NON-EU-SALES] Non-EU sales (exports/services) (Skat):
  - https://skat.dk/en-us/businesses/vat/vat-on-international-trade/vat-on-sales-to-businesses/trading-with-non-eu-countries/selling-goods-and-services
- [SKAT-NON-EU-PURCHASES] Non-EU purchases/import VAT (Skat):
  - https://skat.dk/en-us/businesses/vat/vat-on-international-trade/vat-on-sales-to-businesses/trading-with-non-eu-countries/buying-goods-and-services-in-countries-outside-the-eu
- [SKAT-OSS-DECLARE] VAT One Stop Shop reporting (Skat):
  - https://skat.dk/en-us/businesses/vat/vat-on-international-trade/vat-on-sales-to-private-individuals/sales-to-private-consumers-in-the-eu/vat-one-stop-shop/declaring-and-paying-via-the-one-stop-shop-scheme
- [SKAT-OSS-OVERVIEW] VAT One Stop Shop overview incl. EUR 10,000 relevance (Skat):
  - https://skat.dk/en-us/businesses/vat/vat-on-international-trade/vat-on-sales-to-private-individuals/sales-to-private-consumers-in-the-eu/vat-one-stop-shop
- [SKAT-SME] EU SME VAT exemption scheme page (Skat):
  - https://skat.dk/en-us/businesses/vat/vat-on-international-trade/vat-on-sales-to-private-individuals/sales-to-private-consumers-in-the-eu/vat-exemption-for-small-and-medium-sized-enterprises-sme-in-the-eu
- [RETS-MOMSLOVEN] Danish VAT Act (Retsinformation PDF print):
  - https://www.retsinformation.dk/api/pdf/241297
- [RETS-BOGFORINGSLOVEN] Danish Bookkeeping Act (Retsinformation PDF print):
  - https://www.retsinformation.dk/api/pdf/231197
- [EU-VAT-RATES] EU VAT rates framework (European Commission):
  - https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en
