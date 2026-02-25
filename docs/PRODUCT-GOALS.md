# VAT Core — Product Goals

**Document type:** Product goal definition
**Status:** Draft
**Date:** 2026-02-25
**Scope:** Danish VAT system — VAT Core platform

---

## 1. Purpose

This document defines the goals, scope, and success criteria for the **VAT Core** — a Danish VAT administration platform.

The platform is built on the Danish regulatory framework: `Momsloven`, `Bogføringsloven`, SKAT guidance, and the EU VAT Directive.
The product direction is to match the reference-case level of rigor and completeness for VAT administration, but strictly for Danish VAT and without Lumenus-specific dependencies.

---

## 2. Vision

> A pre-production MVP Danish VAT compliance platform — where a business can complete the full VAT workflow in a single self-service journey using internal services only, with every rule traceable to Danish law.

---

## 3. Core Capabilities

The VAT Core is structured around eight capabilities that form the end-to-end VAT lifecycle. The flow between them is:

```
Registration → Obligation → Filing → Validation → Tax Rule & Assessment
                                ↑          ↓              ↓
                                └──────────┘          Amendment ⇄ Claim
                                                           ↓
                                                         Audit
```

All paths — including direct exits from Filing, Validation, Tax Rule & Assessment, Amendment, and Claim — can route to Audit.

---

### 3.1 Registration

**What it does:** Establishes the taxpayer's identity, business classification, and VAT registration status.

| Module                  | Description                                                             |
|-------------------------|-------------------------------------------------------------------------|
| Taxpayer registration   | DKK 50,000 rolling 12-month threshold check; voluntary registration path |
| CVR/SE lookup           | Business identity and classification via internal CVR adapter stub (target: `virk.dk`) |
| Self-service access     | Portal account creation and role assignment                             |

**Law:** `Momsloven` §47; SKAT registration guidance.

---

### 3.2 Obligation

**What it does:** Determines which VAT obligations apply to the registered taxpayer and sets up the filing schedule.

| Module                  | Description                                                                      |
|-------------------------|----------------------------------------------------------------------------------|
| Obligation assessment   | Determines applicable VAT obligations based on business type and activity        |
| Filing frequency        | Assigns period (half-yearly / quarterly / monthly) based on turnover and registration status |
| Revenue calendar        | Generates filing windows, due dates, and payment deadlines for all periods       |

**Rules:**
- Half-yearly: turnover < DKK 5M
- Quarterly: turnover DKK 5–50M, or newly registered (default regardless of expected turnover)
- Monthly: turnover > DKK 50M
- Annual: supported where policy profile enables annual cadence (legacy/transition profile)
- Cadence is stored as an effective-dated policy record, not a hard-coded constant — [SKAT-DEADLINES]

---

### 3.3 Filing

**What it does:** Enables taxpayers to prepare and submit a VAT return for a given period.

| Module              | Description                                                                    |
|---------------------|--------------------------------------------------------------------------------|
| Filing notice       | Notifies taxpayer when a filing window opens                                   |
| Return entry        | Taxpayer enters all 10 VAT return fields (see §3.4 Validation for field list)  |
| Zero-return         | Handles required nil submissions for periods with no taxable activity          |
| Submission          | Stores submission payload and acknowledgement envelope in internal submission ledger (no external dispatch in MVP) |
| Final return        | Handles the last VAT return on business closure                                |
| Filing type         | Classifies every filing as `regular`, `zero`, or `amendment`                  |

A filing can exit to **Validation** (normal path) or directly to **Audit** (e.g. force-submit after failed validation).

---

### 3.4 Validation

**What it does:** Runs structural and business-rule checks against the submitted return before it proceeds to assessment.

| Module                   | Description                                                                       |
|--------------------------|-----------------------------------------------------------------------------------|
| Eligibility checks       | Confirms taxpayer is registered and period is open                                |
| Structural validation    | All fields parseable, currency DKK, period-locked                                 |
| Field validation         | Validates all 10 VAT return fields: `Salgsmoms`, `Kobsmoms`, `Moms af varekob i udlandet`, `Moms af ydelseskob i udlandet` (reverse-charge amounts); `Rubrik A varer`, `Rubrik A ydelser`, `Rubrik B varer`, `Rubrik B varer (triangular)`, `Rubrik B ydelser`, `Rubrik C` (value boxes, excl. VAT) — see `docs/research/danish-vat-return-form.md` |
| Business rule validation | Cross-border boxes require supporting evidence; Rubrik A/B/C must be excl. VAT   |

Validation can route back to **Filing** (if errors are found and the taxpayer must correct), forward to **Tax Rule & Assessment**, or directly to **Audit**.

---

### 3.5 Tax Rule and Assessment

**What it does:** Applies Danish VAT rules to determine the correct tax liability for the period — rates, exemptions, place of supply, reverse charge, deduction entitlement.

| Module                        | Description                                                                  |
|-------------------------------|------------------------------------------------------------------------------|
| Rate application              | 25% standard rate (`Momsloven` §33); exempt treatment where applicable       |
| Exemption classification      | Maps transactions to `Momsloven` §13 exempt categories (healthcare, education, financial services, insurance, cultural, social welfare, and others) |
| Place of supply               | Determines where VAT is due for cross-border transactions                    |
| Reverse charge — EU/non-EU    | Self-assessment of VAT on qualifying EU and non-EU purchases (goods and services) |
| Reverse charge — domestic     | Domestic reverse-charge categories under `Momsloven` §46                     |
| Input VAT deduction           | Full deduction for fully taxable businesses; partial/pro-rata via effective-dated `TaxpayerDeductionPolicy` for mixed taxable/exempt activity |
| Adjustments                   | Period-level VAT adjustments (e.g. bad-debt relief, credit note effects) applied after net calculation |
| Net liability calculation     | Staged: gross output VAT → deductible input VAT → pre-adjustment net → net after adjustments → `payable` / `refund` / `zero` outcome |
| Rule versioning               | All rules are effective-dated — assessments evaluate by the law in force at the event date; `rule_version_id` is pinned to every calculation |

This capability can route to **Amendment** (if the assessment reveals a discrepancy the taxpayer must resolve), **Claim** (if a refund is due), or **Audit**.

---

### 3.6 Amendment

**What it does:** Handles taxpayer-initiated corrections to a previously submitted return or a return flagged during assessment.

| Module                  | Description                                                                   |
|-------------------------|-------------------------------------------------------------------------------|
| Correction submission   | Taxpayer submits amended return for a prior period via self-service portal    |
| Delta calculation       | Revised liability compared against original; additional payment or refund computed |
| Evidence attachment     | Supporting documents attached to explain the change                           |
| Period-age check        | Enforces correction path rules for older periods                              |

Amendment routes to **Claim** (if the correction results in a refund entitlement) or **Audit**.

---

### 3.7 Claim

**What it does:** Processes refund entitlements — whether from a negative net VAT position, an amendment, or an overpayment.

For every filing period, the system produces exactly one outcome: `payable` (taxpayer owes VAT), `refund` (taxpayer is owed VAT), or `zero` (no net amount). This outcome is packaged as a canonical claim payload recorded in the internal settlement ledger for MVP.

**Canonical claim payload:**
- `claim_id`, `taxpayer_id`, `period_start`, `period_end`
- `result_type` (`payable` / `refund` / `zero`)
- `amount`, `currency` (DKK)
- `filing_reference`, `rule_version_id`, `calculation_trace_id`
- `created_at`

| Module                  | Description                                                                         |
|-------------------------|-------------------------------------------------------------------------------------|
| Outcome determination   | Maps net VAT amount to `payable`, `refund`, or `zero`                               |
| Claim payload creation  | Assembles canonical claim with all traceability IDs                                 |
| Claim dispatch          | Records claim in internal settlement queue (external dispatch deferred post-MVP)      |
| Payout                  | Simulated payout state transitions in internal ledger                                 |
| Overpayment handling    | Credit carried forward in internal account model                                      |
| Open claims tracking    | Tracks outstanding claims to resolution                                             |

Claim routes to **Audit** for audit trail recording.

---

### 3.8 Audit

**What it does:** Maintains the immutable audit trail for all events across the lifecycle. Every path through the system terminates here.

The audit capability also enforces the **two-layer data model**: line-level facts (transaction classifications, reverse-charge determinations, deduction-right decisions) are stored separately from return-level aggregates, with explicit linkage keys (`filing_id`, `line_fact_id`, `calculation_trace_id`, `rule_version_id`) that make every return-level total reproducible from its source facts.

| Module                  | Description                                                                          |
|-------------------------|--------------------------------------------------------------------------------------|
| Event log               | Immutable, append-only record of every state change across all capabilities          |
| Line-level fact store   | Transaction/rule-fact lines (reverse charge, exemption class, deduction rights, place-of-supply) |
| Return-level aggregate  | Aggregated filing fields; reproducible from linked line-level facts                  |
| Period package          | Reconstructable evidence package per period (return, line facts, payments, evidence) |
| Audit case management   | Caseworker-facing case queue for flagged returns or discrepancies                    |
| Retention enforcement   | Records retained for minimum 5 years (`Bogføringsloven` §12)                        |

---

## 4. Supporting Capabilities

These capabilities are not primary flow nodes but are required for a complete platform.

| Capability  | Description                                                                                       |
|-------------|---------------------------------------------------------------------------------------------------|
| Payment     | Due date tracking, internal payment registration model, grace dates                               |
| Dunning     | Late filing notices, provisional assessments (DKK 1,400/period), interest, payment plans, hard debt escalation |
| Reporting   | Compliance dashboard — obligations, filing status, open claims, payment position                  |

---

## 5. Danish Law Anchors

| Rule                       | Source                                                                                                              |
|----------------------------|---------------------------------------------------------------------------------------------------------------------|
| Registration threshold     | `Momsloven` §47 + SKAT guidance (DKK 50,000 / rolling 12 months)                                                  |
| Standard VAT rate          | `Momsloven` §33 (25%)                                                                                              |
| Exemptions                 | `Momsloven` §13 (exempt categories)                                                                                |
| Domestic reverse charge    | `Momsloven` §46                                                                                                    |
| Filing periods             | Half-yearly (< DKK 5M), quarterly (DKK 5–50M or newly registered), monthly (> DKK 50M), annual (policy profile) — [SKAT-DEADLINES] |
| Late filing fee            | DKK 1,400 per missed period (effective 1 February 2025)                                                             |
| Bookkeeping retention      | `Bogføringsloven` §12 (5 years)                                                                                    |
| VAT return fields          | `Momsbekendtgørelsen` §§76–79                                                                                      |

---

## 6. Scope

### In scope

- All 8 core capabilities: Registration, Obligation, Filing, Validation, Tax Rule & Assessment, Amendment, Claim, Audit
- Danish VAT only (no non-Danish tax domains)
- No Lumenus-specific platform dependencies, naming, or integration contracts
- Supporting capabilities: Payment, Dunning, Reporting
- All four filing cadences: annual, half-yearly, quarterly, monthly (stored as effective-dated policy)
- EU cross-border flows: B2B reverse charge (sales and purchases), ESL / EU-sales obligation as a separate obligation stream (due by the 25th of the month following the period)
- Non-EU flows: export zero-rating, import VAT; non-EU import goods assessment with Customs/Told data model (integration deferred post-MVP)
- Domestic reverse charge under `Momsloven` §46
- Effective-dated rule versioning — temporal legal correctness; `rule_version_id` pinned to every assessment
- Two-layer data model: line-level facts + return-level aggregates with full linkage keys
- Three-outcome claim model: `payable`, `refund`, `zero` — canonical claim payload recorded in internal settlement ledger
- Business closure / final VAT return
- Transfer of business (overdragelse) edge handling
- Document and evidence retention (5-year minimum)

### Needs module (acknowledged, deferred to later release)

- Bad debt / credit note-driven VAT adjustments
- Capital goods long-horizon adjustment
- Bankruptcy estate VAT and deduction handling
- Brugtmoms (second-hand goods margin scheme)
- Momskompensation (charity VAT compensation pool)
- Annual deduction correction / årsregulering (schema pre-modelled; operational batch deferred)

### Out of scope

- ViDA eReport ingestion and pre-filling
- Automated risk scoring and ML-based assessment
- Real-time VAT balance
- Split payment / PSP integration
- Other tax types (corporate income tax, customs duties)
- External integrations in MVP (all run as internal stubs/adapters): MitID OIDC, SKAT TastSelv Erhverv, CVR/virk.dk, Skattekontoen, NemKonto, VIES, Customs/Told
- OSS (One Stop Shop) — B2C cross-border EU supplies above EUR 10,000; not in scope for this version
- EU SME VAT exemption scheme — businesses below ~DKK 744,750 EU turnover; not in scope for this version
- Audit-triggered reassessment and dispute litigation (case-management integration only; not automated determination)

---

## 7. Key Actors

| Actor                    | Role                                                                              |
|--------------------------|-----------------------------------------------------------------------------------|
| Taxpayer                 | Registers, files returns, submits amendments, receives refunds                    |
| Tax authority caseworker | Manages audit cases, processes corrections, raises provisional assessments        |
| System (automated)       | Sends filing notices, validates returns, applies tax rules, tracks deadlines      |

---

## 8. Integration Points (Post-MVP Target State)

MVP policy: no external integrations. The items below define the target-state adapter boundaries that remain stubbed in MVP.

| Integration           | Purpose                                                                  |
|-----------------------|--------------------------------------------------------------------------|
| SKAT TastSelv Erhverv | Submit VAT returns; receive SKAT acknowledgement                         |
| CVR / virk.dk         | Business registration lookup                                             |
| MitID OIDC            | Taxpayer identity and authentication                                     |
| Skattekontoen         | Payment settlement and claim dispatch                                    |
| NemKonto              | Refund payouts                                                           |
| VIES                  | EU VAT number validation for cross-border B2B                            |
| Customs / Told        | Import facts for non-EU goods; required for complete import VAT assessment |

---

## 9. Success Criteria

- A business can register, receive an obligation, file a return, have it validated and assessed, and receive internal payable/refund/zero outcome confirmation — end to end
- Every VAT rule applied is traceable to Danish law or SKAT guidance
- Filing deadlines and late-filing consequences are correctly modelled for all four settlement frequencies
- A zero-return can be filed for a period with no activity
- An amendment to a prior period return produces a correct delta and routes to audit
- A negative net VAT position generates a claim and simulated payout state
- An EU B2B sale is correctly zero-rated, reverse-charged, and produces the correct ESL reporting payload
- A complete period audit package can be reconstructed from stored data alone
- All data retained for minimum 5 years (`Bogføringsloven` §12)

---

## 10. Related Documents

| Reference                                 | Description                                   |
|-------------------------------------------|-----------------------------------------------|
| `docs/research/research-docs.md`          | Danish VAT system working documentation       |
| `docs/research/danish-vat-return-form.md` | VAT return field-by-field specification       |
| `docs/architecture/system-outline.md`     | Platform architecture and container runtime   |
| `docs/architecture/filing-api-contract.md`| Filing API specification                      |
| `docs/adr/README.md`                      | Architecture Decision Records index           |

---

*Document owner: product / architecture team.*
