
## 18) Deepening chapter 15 - exemption matrix mapped to Momsloven section 13

Source baseline: `Momsloven` section 13(1), nos. 1-22. [RETS-MOMSLOVEN]

### 18.1 Section 13 matrix (working compliance version)

| Section 13 category | Typical transaction type | VAT outcome | Input VAT effect (high-level) | Control point |
|---|---|---|---|---|
| Nr. 1 Health services | Hospitals, doctor/dental treatment, qualifying healthcare | Exempt | Related input VAT generally blocked/partial by activity mix | Verify provider/service qualification |
| Nr. 2 Social care | Social assistance incl. certain institutions | Exempt (with specific carve-outs) | Related input VAT generally restricted | Confirm service is within social-care scope |
| Nr. 3 Education/training | School, higher education, vocational education (subject to limits) | Exempt for covered education; some course models taxable | Mixed-activity deduction often relevant | Distinguish exempt education vs taxable course business |
| Nr. 4 Member services by qualifying associations | Membership-based services in common interest | Exempt if conditions met | Related input VAT generally restricted | Test non-profit + non-distortion conditions |
| Nr. 5 Sport/non-profit | Services closely linked to sport/physical training by non-profit bodies | Exempt with statutory limits | Related input VAT generally restricted | Check non-profit status + event profile |
| Nr. 6 Cultural activities | Libraries, museums, zoos and similar | Exempt with exclusions | Related input VAT generally restricted | Confirm activity is in exempt cultural scope |
| Nr. 7 Artistic activity | Author/composer/other artistic activity | Exempt for covered activity | Input VAT treatment depends on taxable/exempt split | Separate exempt artistic fees from taxable sales |
| Nr. 8 Letting of immovable property | Real estate leasing | Exempt with explicit exceptions (hotel, short-term room, parking, etc.) | Often restricted input VAT unless voluntary registration routes apply | Classify each lease type before invoicing |
| Nr. 9 Supply of immovable property | Sale of real estate | Exempt except new buildings/building land | Input VAT depends on taxable vs exempt output | New-building/building-land test is critical |
| Nr. 10 Insurance | Insurance/reinsurance + related brokerage/intermediation | Exempt | Input VAT generally restricted | Check service is true exempt insurance supply |
| Nr. 11 Financial services | Loans, payments, securities etc. per sub-items | Exempt | Input VAT generally restricted/partial | Map each service to exact sub-item (a-f) |
| Nr. 12 Gambling/lottery | Betting and similar | Exempt | Input VAT generally restricted | Confirm activity falls in gambling scope |
| Nr. 13 Postal universal services | Covered postal services/goods | Exempt for universal-service scope | Input VAT generally restricted | Confirm no individually negotiated terms |
| Nr. 14 Stamps/value marks | Stamps at face value etc. | Exempt | Limited relevance; assess case-by-case | Confirm qualifying instrument |
| Nr. 15 Passenger transport | Passenger transport (with rule details) | Exempt with specific exceptions | Input VAT restriction with specific transport rule interactions | Separate exempt passenger transport from taxable transport lines |
| Nr. 16 Funeral-related services | Directly linked funeral services | Exempt | Input VAT generally restricted | Scope test on direct linkage |
| Nr. 17 Charity events (approved) | Supplies at approved charitable events | Exempt subject to prior application/conditions | Input VAT case-dependent | Ensure pre-approval and use-of-profit evidence |
| Nr. 18 Charity second-hand shops | Donated used goods sold by qualifying charity shop | Exempt under conditions | Input VAT generally limited | Confirm donation-only goods + volunteer labor conditions |
| Nr. 19 Independent groups | Cost-sharing services to members under strict conditions | Exempt subject to anti-distortion condition | Input VAT treatment depends on use | Maintain member-cost allocation evidence |
| Nr. 20 Investment gold | Investment gold supplies/intermediation | Exempt (with optional taxation routes) | Special deduction/registration interactions | Validate gold classification and chosen regime |
| Nr. 21 General-public-benefit associations | Supplies by qualifying charitable/public-benefit associations | Exempt under conditions | Input VAT generally restricted | Evidence of profit use + non-distortion |
| Nr. 22 Public broadcasting non-commercial | Non-commercial public radio/TV activity | Exempt | Input VAT generally restricted | Separate commercial from non-commercial activity |

Operational note:
- Exemption is not the same as 0% VAT rating. Exempt activities usually reduce input VAT recovery rights. [RETS-MOMSLOVEN]
- Mixed taxable/exempt operations require annual partial-deduction data reporting under section 38a. [RETS-MOMSLOVEN][SKAT-EXEMPT-ACT]

## 19) Deepening chapter 15 - field-by-field VAT return implementation guide (TastSelv)

As-of control: UI labels can change over time. Validate field labels in live `TastSelv Erhverv` each reporting year before production runbooks are finalized.

### 19.1 Core fields (domestic return)
- `Salgsmoms`: total output VAT for Danish-taxable sales.
- `Købsmoms`: total deductible input VAT (only deductible share if no full deduction right).

### 19.2 International trade fields highlighted by SKAT guidance
- `Moms af varekøb i udlandet` (EU + third countries): self-assessed VAT amount on qualifying foreign goods purchases. [SKAT-NON-EU-PURCHASES-DA]
- `Moms af ydelseskøb i udlandet med omvendt betalingspligt`: self-assessed VAT amount on qualifying foreign services purchases. [SKAT-EU-PURCHASES-DA][SKAT-NON-EU-PURCHASES-DA]
- `Rubrik A - varer`: value (without VAT) for relevant EU goods purchase reporting. [SKAT-EU-PURCHASES-DA]
- `Rubrik A - ydelser`: value (without VAT) for relevant EU services purchase reporting. [SKAT-EU-PURCHASES-DA]
- `Rubrik C` (box C): value of VAT-exempt sales of goods/services to countries outside the EU. [SKAT-NON-EU-SALES]

### 19.3 EU sales reporting interaction
- EU B2B sales without Danish VAT must generally be reported in two places in TastSelv workflows and by the 25th of each month for EU-sales listing obligations. [SKAT-EU-SALES-DA]

### 19.4 Practical controls per field
- Reconcile each field to ledger control accounts before submission.
- Lock source reports used for each filed amount.
- Retain transaction-level backup tied to filed period and correction version.

## 20) Deepening chapter 15 - invoice content requirements (legal checklist)

Legal base: `momsloven` section 52 and `momsbekendtgørelsen` chapter 12 (including section 58). [RETS-MOMSLOVEN][RETS-MOMSBEK]

### 20.1 Full invoice minimum content (section 58(1) working checklist)
A compliant full invoice should contain at least:
1. Issue date.
2. Sequential unique invoice number.
3. Seller VAT registration number.
4. Seller and buyer name/address.
5. Quantity/nature of goods or extent/nature of services.
6. Supply date (if different from invoice date).
7. Tax base, unit price excl. VAT, rebates/discounts not included in unit price.
8. Applicable VAT rate.
9. VAT amount payable.

### 20.2 Reverse-charge and EU specific additions
- Reverse-charge domestic/inbound scenarios: include clear reverse-charge wording and required identification fields. [RETS-MOMSBEK]
- EU supplies with reverse charge or VAT exemption: include required notation and buyer VAT number where applicable. [RETS-MOMSBEK]

### 20.3 Simplified invoice / receipt track
- Simplified invoice regime and amount thresholds are governed by `momsbekendtgørelsen` section 66.
- Businesses selling mainly to private consumers generally use simplified invoice logic unless exceptions require full invoice. [RETS-MOMSBEK]

### 20.4 Invoice governance controls
- Define template families: domestic VAT, exempt, EU reverse charge, export/no-DK-VAT, self-billing.
- Hard-stop ERP controls for missing VAT ID / VAT note / tax code mismatch.
- Credit-note linkage and immutable invoice archive with audit trail.

## 21) Deepening chapter 15 - sector-specific rule packs (first operational version)

### 21.1 Real estate
- Base rule: letting and sale of immovable property are generally exempt, with key carve-outs (e.g., new buildings/building land; specified lease types). [RETS-MOMSLOVEN]
- High-risk areas: classification errors, optional registration interactions, capital-good adjustments.
- Required evidence: property classification memo, contract set, construction/renovation status evidence.

### 21.2 Financial services and insurance
- Core financing/insurance categories are exempt under section 13 nos. 10-11. [RETS-MOMSLOVEN]
- High-risk areas: bundled services (taxable admin/IT vs exempt financial core), partial deduction apportionment.
- Required evidence: product taxonomy, fee schedule mapping, exemption rationale per fee type.

### 21.3 Passenger transport and related services
- Passenger transport exemption applies with statutory carve-outs in section 13 no. 15. [RETS-MOMSLOVEN]
- High-risk areas: domestic vs international treatment splits and mixed supplies.
- Required evidence: route data, ticketing basis, service classification by transport type.

### 21.4 Digital services and platform economy
- B2C EU digital/remote sales should be assessed for OSS usage, especially once EU B2C threshold context (EUR 10,000) is exceeded. [SKAT-OSS-OVERVIEW][SKAT-OSS-DECLARE]
- Platform models can trigger special VAT role analysis (including deemed-supplier style outcomes depending on transaction chain and legal setup).
- Required evidence: platform terms, contractual principal/agent analysis, country-by-country VAT logic.

## 22) Deepening chapter 15 - corrections, interest model, and penalty scenarios

### 22.1 Correction workflow
1. Detect and quantify error by original period.
2. Correct prior VAT return in TastSelv Erhverv where ordinary correction route is open. [SKAT-CORRECTIONS]
3. For returns older than 3 years: apply for reopening and document "special circumstances"; ordinary mistakes (e.g., forgotten deduction/misunderstanding) are not sufficient by default. [SKAT-CORRECTIONS]
4. Retain correction memo: root cause, entries changed, amount delta, control owner sign-off.

### 22.2 Interest and fee model (operational)
- Late/missed reporting may trigger provisional assessment fee of DKK 1,400 per period plus interest until paid. [SKAT-ESTIMATES]
- Working interest formula for internal estimation:
  - `Estimated interest = Amount outstanding x daily rate x number of days overdue`
- Control note: apply the current official Skattekonto interest parameters for the exact period; rates can change over time.

### 22.3 Penalty/financial exposure scenarios
- Scenario A: Missed return deadline -> provisional assessment fee + interest.
- Scenario B: Insufficient export/EU evidence -> exemption denied -> output VAT + possible interest/penalty exposure.
- Scenario C: Over-claimed input VAT in mixed activity -> reassessment + interest.
- Scenario D: Repeated OSS non-compliance -> risk of exclusion from OSS schemes (2-year exclusion risk described in guidance context). [SKAT-OSS-DECLARE][SKAT-OSS-PAY]

### 22.4 Minimum remediation package per error
- Corrected filing/payment evidence.
- Documented cause classification (process/system/master data/human).
- Preventive control added or strengthened.
- Re-test on next 2 periods.

## 23) Added sources for chapter 15 deepening
- [RETS-MOMSBEK] Danish VAT Executive Order (consolidated):
  - https://www.retsinformation.dk/api/pdf/240229
- [SKAT-EXEMPT-ACT] Exempt activities annual reporting + partial deduction data:
  - https://skat.dk/erhverv/moms/moms-saadan-goer-du/momsfrie-ydelser-saadan-indberetter-du
- [SKAT-EU-SALES-DA] EU sales reporting and timing:
  - https://skat.dk/erhverv/moms/moms-ved-handel-med-udlandet/moms-ved-handel-med-virksomheder/moms-ved-handel-med-lande-i-eu/moms-ved-salg-af-varer-og-ydelser-i-eu
- [SKAT-EU-PURCHASES-DA] EU purchases reporting fields and reverse charge context:
  - https://skat.dk/erhverv/moms/moms-ved-handel-med-udlandet/moms-ved-handel-med-virksomheder/moms-ved-handel-med-lande-i-eu/moms-ved-koeb-af-varer-og-ydelser-i-eu
- [SKAT-NON-EU-PURCHASES-DA] Non-EU purchases/import VAT guidance with field references:
  - https://skat.dk/erhverv/moms/moms-ved-handel-med-udlandet/moms-ved-handel-med-virksomheder/moms-ved-handel-med-lande-uden-for-eu/moms-ved-koeb-af-varer-og-ydelser-i-lande-uden-for-eu
- [SKAT-CORRECTIONS] VAT correction workflow and 3-year rule:
  - https://skat.dk/erhverv/moms/moms-saadan-goer-du/saadan-retter-du-din-momsindberetning-eller-betaling
- [SKAT-OSS-PAY] OSS payment/compliance consequences:
  - https://skat.dk/erhverv/moms/moms-ved-handel-med-udlandet/moms-ved-salg-til-private/salg-til-private-i-eu/moms-one-stop-shop/betal-via-moms-one-stop-shop
