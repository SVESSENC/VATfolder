# VAT Registration UI Flow Wireframes (Step 1-3)

## Scope
- Step 1: Obligation questionnaire
- Step 2: Identity and organisation (MitID + CVR lookup)
- Step 3: Application draft
- Includes failure states, edge cases, and handoff-ready interaction rules.

## UX Goals
- Keep users in a guided 3-step flow with visible progress.
- Prevent data loss through autosave and recoverable errors.
- Make legal/compliance constraints understandable with plain language.

## Global Frame (All Steps)

Wireframe shell
```text
+--------------------------------------------------------------------------------+
| Header: VAT Registration                                                       |
| Progress: [1 Assessment] [2 Identity & Org] [3 Draft] [4 Validate] [5 Submit] |
+--------------------------------------------------------------------------------+
| Left: Context panel (what this step does, legal note, support link)           |
| Right: Step form area                                                          |
+--------------------------------------------------------------------------------+
| Footer actions: [Back] [Save draft] [Continue]                                |
+--------------------------------------------------------------------------------+
```

Global interaction rules
- `Save draft` is always available after first valid input.
- `Continue` is disabled until required fields pass client validation.
- On every successful save, show inline status: `Saved at HH:MM`.
- If session expires, preserve local unsent inputs and restore after login.

---

## Step 1 Wireframes: Obligation Questionnaire

### Screen 1.1: Start Assessment
```text
+-----------------------------------+
| Do you need VAT registration?     |
| Answer 5 quick questions.         |
| Estimated time: 2-3 minutes       |
|                                   |
| [Start assessment]                |
+-----------------------------------+
```

Fields/inputs
- Business activity type (single select)
- Estimated annual turnover in DKK (numeric)
- Sells to EU consumers? (yes/no)
- Sells digital services? (yes/no)
- Already VAT registered elsewhere? (yes/no)

### Screen 1.2: Questionnaire Form
```text
+---------------------------------------------------+
| Q2 of 5                                            |
| Estimated annual turnover (DKK) [___________]      |
| Hint: numbers only                                 |
|                                                     |
| [Back]                              [Next]          |
+---------------------------------------------------+
```

Behavior
- Progressive reveal for conditional questions (only show follow-ups when needed).
- Numeric masking/formatting for DKK field.
- Inline validation on blur; hard validation on Next.

### Screen 1.3: Assessment Result
```text
+---------------------------------------------------+
| Result: Registration likely required               |
| Why:                                               |
| - Annual turnover exceeds threshold                |
| - EU sales pattern indicates VAT obligation        |
|                                                     |
| Citations: [VAT_TURNOVER_01] [VAT_EU_SALES_02]    |
|                                                     |
| [Continue to Identity & Org]                       |
+---------------------------------------------------+
```

Result states
- Required
- Not required
- Inconclusive (requires manual review path)

---

## Step 2 Wireframes: MitID + CVR Lookup

### Screen 2.1: Identity Verification
```text
+---------------------------------------------------+
| Verify your identity                               |
| Use MitID to continue.                             |
|                                                     |
| [Continue with MitID]                              |
+---------------------------------------------------+
```

Behavior
- Button triggers `POST /api/v1/auth/oidc/initiate`.
- Return from callback resumes in-progress step with state restored.

### Screen 2.2: CVR Search
```text
+---------------------------------------------------+
| Find your organisation                             |
| CVR number [________] [Lookup]                     |
|                                                     |
| Lookup result card appears here                    |
+---------------------------------------------------+
```

Result card
```text
+-----------------------------------+
| ACME A/S                          |
| CVR: 12345678                     |
| Address: Examplevej 1, 2100 KBH   |
| [Use this organisation]           |
+-----------------------------------+
```

Behavior
- CVR accepts exactly 8 digits.
- On successful lookup, prefill organisation fields and lock authoritative fields by default.
- Allow editable supplemental fields (contact person, internal reference).

### Screen 2.3: Confirm Organisation Link
```text
+---------------------------------------------------+
| Confirm organisation                               |
| MitID user: Jane Jensen                            |
| Organisation: ACME A/S (CVR 12345678)             |
|                                                     |
| [Confirm and continue]                             |
+---------------------------------------------------+
```

---

## Step 3 Wireframes: Application Draft

### Screen 3.1: Draft Form (Core)
```text
+---------------------------------------------------+
| Registration type [standard v]                     |
| Start date        [YYYY-MM-DD]                     |
| Schemes           [ ] OSS  [ ] Reverse charge      |
| Contact phone     [______________]                 |
| Contact email     [______________]                 |
|                                                     |
| [Save draft]                        [Continue]      |
+---------------------------------------------------+
```

### Screen 3.2: Documents Panel (Optional in Step 3)
```text
+---------------------------------------------------+
| Supporting documents                               |
| [Upload file]                                      |
| - proof_of_activity.pdf   Uploaded 12:41           |
|                                                     |
| Allowed: PDF, JPG, PNG (max 10 MB each)            |
+---------------------------------------------------+
```

Behavior
- Autosave on section completion and every 20 seconds when dirty.
- Show non-blocking warnings (example: missing optional OSS context).
- Preserve server `version` for optimistic update handling.

---

## Error States and Edge Cases

### Step 1 (Assessment)
- Invalid turnover format:
  - Message: `Enter turnover as numbers only`.
  - UI: inline error under field; focus moves to field on submit.
- Inconclusive assessment response:
  - Message banner: `We cannot determine obligation automatically.`
  - Action: `Continue with manual review path` and capture extra facts.
- API timeout (`POST /api/v1/assess/obligation`):
  - Toast + inline retry module with `Retry` and `Save answers`.

### Step 2 (MitID + CVR)
- MitID cancel/deny:
  - Message: `Authentication was cancelled. Please try again.`
  - Action: `Retry MitID`, keep progress.
- Session expiry after callback:
  - Redirect to login and restore local draft after success.
- CVR not found:
  - Message: `No organisation found for this CVR.`
  - Action: retry input; link to support guidance.
- CVR service unavailable:
  - Fallback: allow temporary manual org entry flagged as `unverified`.

### Step 3 (Draft)
- Required field missing:
  - Inline errors + top summary list of missing fields.
- Invalid email format:
  - Message: `Enter a valid email address`.
- Stale version conflict on save (`409`):
  - Modal: `A newer draft exists.` options:
  - `Reload latest` (recommended), `Compare changes`.
- File upload failure:
  - Per-file error with retry; keep other uploaded files intact.

---

## Accessibility and UX Constraints
- WCAG 2.2 AA color contrast and focus visibility.
- Full keyboard navigation for all controls.
- Error summary announced to screen readers (`aria-live=assertive`).
- Labels and help text must be plain-language Danish-ready and localizable.

## Developer Handoff Notes
- Step identity values:
  - `assessment`
  - `identity_and_org`
  - `draft_application`
- Persist `currentStep`, `applicationId`, `obligationAssessmentId`, and `version`.
- Use API contracts from `api/openapi.yaml`:
  - `POST /api/v1/assess/obligation`
  - `GET /api/v1/organisations?cvr={cvr}`
  - `POST /api/v1/applications`
  - `PUT /api/v1/applications/{applicationId}`

## Acceptance Criteria (Step 1-3)
- User can complete Step 1-3 without losing entered data during normal navigation.
- All listed error states are represented in UI and recoverable by the user.
- CVR prefill is visible, reviewable, and confirmed before draft creation.
- Draft save and resume works after page refresh and auth round-trip.
