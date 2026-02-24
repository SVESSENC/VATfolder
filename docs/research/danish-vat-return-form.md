# Danish VAT Return Form (Momsangivelse) - Field and Layout Documentation

Last updated: 24 February 2026
Scope: Practical and legal documentation of the Danish VAT return form as filed in TastSelv Erhverv.
Audience: Product, engineering, tax operations, and compliance teams designing or validating VAT submission flows.

## 1) What the Danish VAT form is and how it looks

The standard Danish VAT return (momsangivelse) is filed digitally in `TastSelv Erhverv`.
There is no generally used public blank paper form for ordinary business filing; the authoritative user interface is the online return flow.

In practice, the return is presented as grouped input fields/boxes:
- Output and input VAT amount fields (VAT amounts, DKK)
- Cross-border VAT amount fields for reverse-charge purchases
- Statistical/value boxes (`Rubrik A`, `Rubrik B`, `Rubrik C`) reported without VAT
- A calculated net payable/refundable outcome

Important: The exact UI labels and ordering can change over time. This documentation is a source-backed snapshot as of 24 February 2026.

## 2) Canonical field set (what you need to fill)

The field set below combines:
- operational labels from Skattestyrelsen guidance, and
- legal box definitions from `momsbekendtgorelsen` sections 76-79.

### 2.1 VAT amount fields (DKK VAT amounts)

1. `Salgsmoms` (output VAT)
- Meaning: Total VAT on taxable sales for the period.
- Legal basis: `momsbekendtgorelsen` section 76(1) requires accounting for output VAT (`udgaende afgift (salgsmoms)`).

2. `Kobsmoms` (input VAT)
- Meaning: Deductible VAT on purchases for the period (full or partial deduction depending on activity type).
- Legal basis: `momsbekendtgorelsen` section 76(2) requires accounting for input VAT (`indgaende afgift (kobsmoms)`).

3. `Moms af varekob i udlandet (bade EU og lande uden for EU)`
- Meaning: Self-assessed Danish VAT amount on qualifying goods purchases from abroad.
- Operational source: Skat guidance for purchases in EU and outside EU.
- Legal linkage: reverse-charge style purchase VAT accounting is part of required VAT accounts under sections 76-77.

4. `Moms af ydelseskob i udlandet med omvendt betalingspligt`
- Meaning: Self-assessed Danish VAT amount on qualifying service purchases from abroad where reverse charge applies.
- Operational source: Skat EU purchase guidance explicitly names this field.

### 2.2 Value/statistical boxes (amounts without VAT)

5. `Rubrik A - varer`
- Meaning: Value of qualifying EU goods purchases (without VAT).
- Source: Skat EU purchase guidance states this box is reported without VAT.
- Legal basis: `momsbekendtgorelsen` section 79(4), no. 1.

6. `Rubrik A - ydelser`
- Meaning: Value of qualifying EU service purchases (without VAT).
- Source: Skat EU purchase guidance states this box is reported without VAT.
- Legal basis: `momsbekendtgorelsen` section 79(4), no. 2.

7. `Rubrik B - varer`
- Meaning: Value of goods sold to VAT-registered businesses in other EU countries (without VAT), where conditions are met.
- Source: Skat EU sales guidance.
- Legal basis: `momsbekendtgorelsen` section 79(5), no. 1.

8. `Rubrik B - varer (triangular trade)`
- Meaning: Value of goods sold in triangular trade to VAT-registered businesses in other EU countries (without VAT).
- Source: Skat EU sales guidance.
- Legal basis: `momsbekendtgorelsen` section 79(5), no. 2.

9. `Rubrik B - ydelser`
- Meaning: Value of services sold (without VAT) where the place of supply is another EU country and buyer accounts for VAT there (reverse charge scenario).
- Source: Skat EU sales guidance.
- Legal basis: `momsbekendtgorelsen` section 79(5), no. 3.

10. `Rubrik C`
- Meaning: Value (without VAT) of VAT-exempt sales of goods/services to countries outside the EU.
- Source: Skat non-EU sales guidance says this is reported without VAT.
- Legal basis: `momsbekendtgorelsen` section 79(6).

## 3) Field dictionary (data type, sign, expected format)

Use this as an implementation profile for form modeling and API payload checks.

| Field | Type | Unit | VAT incl/excl | Sign convention | Notes |
|---|---|---|---|---|---|
| Salgsmoms | Decimal(18,2) | DKK | VAT amount | Non-negative in normal flow | Correction flow may include reductions |
| Kobsmoms | Decimal(18,2) | DKK | VAT amount | Non-negative in normal flow | Deductible share only |
| Moms af varekob i udlandet | Decimal(18,2) | DKK | VAT amount | Non-negative | Reverse-charge amount |
| Moms af ydelseskob i udlandet | Decimal(18,2) | DKK | VAT amount | Non-negative | Reverse-charge amount |
| Rubrik A varer | Decimal(18,2) | DKK | Excl. VAT | Normally non-negative | Value box |
| Rubrik A ydelser | Decimal(18,2) | DKK | Excl. VAT | Normally non-negative | Value box |
| Rubrik B varer | Decimal(18,2) | DKK | Excl. VAT | Normally non-negative | Value box |
| Rubrik B varer (triangular) | Decimal(18,2) | DKK | Excl. VAT | Normally non-negative | Value box |
| Rubrik B ydelser | Decimal(18,2) | DKK | Excl. VAT | Normally non-negative | Value box |
| Rubrik C | Decimal(18,2) | DKK | Excl. VAT | Normally non-negative | Value box |

Operational recommendation:
- Keep all fields numeric and period-bound.
- Separate VAT amount fields from value boxes in code and validation.
- Persist both user-entered values and calculated net VAT result with a filing timestamp.

## 4) Derived totals and reconciliation logic

Net VAT position (high level):
- `Net VAT due = Output VAT - deductible input VAT +/- reverse-charge and adjustment effects`

Because field-level calculation presentation can vary in TastSelv, treat the portal's final payable/refundable figure as authoritative at filing time.

Ledger reconciliation minimum:
1. Reconcile `Salgsmoms` to output VAT control accounts.
2. Reconcile `Kobsmoms` to deductible input VAT accounts.
3. Reconcile reverse-charge purchase VAT fields to purchase tax code ledgers.
4. Reconcile Rubrik A/B/C value boxes to transaction summaries excluding VAT.
5. Store reconciliation evidence with the period filing package.

## 5) Validation and control rules for a submission workflow

### 5.1 Structural validation
- All mandatory numeric fields must be parseable decimals.
- No text values in amount/value fields.
- Currency fixed to DKK.
- Period lock: each submission tied to one VAT period only.

### 5.2 Business validation
- Rubrik A/B/C must be values without VAT.
- `Moms af ydelseskob i udlandet med omvendt betalingspligt` should only be populated where reverse-charge purchase logic applies.
- Rubrik B fields should align with EU customer VAT-number evidence and invoice logic.
- Rubrik C should align with export/non-EU evidence.

### 5.3 Audit validation
- Every non-zero cross-border box must have drill-down transaction evidence.
- VAT number checks (EU B2B) and transport/export proof should be retained with filing evidence.
- Corrections must preserve both original and corrected values, with reason code.

## 6) Legal mapping table (engineering-facing)

| Return component | Legal reference | Requirement category |
|---|---|---|
| Output VAT account (`Salgsmoms` basis) | Momsbek. section 76(1) | Mandatory accounting basis |
| Input VAT account (`Kobsmoms` basis) | Momsbek. section 76(2) | Mandatory accounting basis |
| Separate accounts for EU purchase VAT and purchase VAT from outside EU | Momsbek. section 77(1-2) | Mandatory accounting granularity |
| Rubrik A goods/services values | Momsbek. section 79(4) | Mandatory return box reporting |
| Rubrik B goods/triangular/services values | Momsbek. section 79(5) | Mandatory return box reporting |
| Rubrik C non-EU exempt sales value | Momsbek. section 79(6) | Mandatory return box reporting |

## 7) UI/UX notes for a product team implementing a Danish VAT form

Recommended group layout (mirrors real filing mental model):
1. Domestic VAT amounts
- Salgsmoms
- Kobsmoms

2. Reverse-charge purchase VAT amounts
- Moms af varekob i udlandet
- Moms af ydelseskob i udlandet med omvendt betalingspligt

3. Cross-border value boxes (without VAT)
- Rubrik A varer
- Rubrik A ydelser
- Rubrik B varer
- Rubrik B varer (triangular)
- Rubrik B ydelser
- Rubrik C

4. Reconciliation and confirmation
- Net payable/refundable preview
- Warning list for missing evidence
- Sign-off and submission metadata

UX guardrails:
- Show explicit helper text: "Enter amount excluding VAT" for Rubrik A/B/C.
- For reverse-charge fields, show conditional helper text tied to supplier country and tax code.
- Block submission if required core fields are blank.

## 8) Known ambiguities and how to handle them

1. Live label drift in TastSelv
- Skat can update wording or ordering.
- Control: yearly label review and screenshot archive in project docs.

2. Correction-period behavior
- Older periods can require different correction path.
- Control: enforce correction workflow with period-age check.

3. Mixed taxable/exempt businesses
- Kobsmoms may be partial.
- Control: require a deduction method reference before final filing.

## 9) Minimum evidence package per filed period

- Filed values for all VAT amount fields and Rubrik A/B/C.
- Ledger-to-return reconciliation sheet.
- EU VAT-number validation evidence (where relevant).
- Export/transport evidence for no-DK-VAT cross-border sales.
- Reviewer/approver sign-off and filing timestamp.

## 10) Source index (used for this document)

Primary official sources:
- Skattestyrelsen, EU purchases (fields for reverse-charge amounts and Rubrik A):
  - https://skat.dk/erhverv/moms/moms-ved-handel-med-udlandet/moms-ved-handel-med-virksomheder/moms-ved-handel-med-lande-i-eu/moms-ved-koeb-af-varer-og-ydelser-i-eu
- Skattestyrelsen, EU sales (Rubrik B fields):
  - https://skat.dk/erhverv/moms/moms-ved-handel-med-udlandet/moms-ved-handel-med-virksomheder/moms-ved-handel-med-lande-i-eu/moms-ved-salg-af-varer-og-ydelser-i-eu
- Skattestyrelsen, non-EU sales (Rubrik C value reported without VAT):
  - https://skat.dk/erhverv/moms/moms-ved-handel-med-udlandet/moms-ved-handel-med-virksomheder/moms-ved-handel-med-lande-uden-for-eu/moms-ved-salg-af-varer-og-ydelser-i-lande-uden-for-eu
- Retsinformation, VAT Executive Order (`momsbekendtgorelsen`) consolidated print PDF:
  - https://www.retsinformation.dk/api/pdf/240229

Supporting legal context:
- Retsinformation, Danish VAT Act (`momsloven`) consolidated print PDF:
  - https://www.retsinformation.dk/api/pdf/241297

## 11) Snapshot disclaimer

This document is a practical compliance/implementation aid, not legal advice.
For production filing governance, revalidate:
- live TastSelv labels,
- latest consolidated law text, and
- current Skat guidance pages,
before each annual compliance cycle.
