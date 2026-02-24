# VAT Submission, Validation & Audit Flows (Steps 47)

This document describes three scenarios for the VAT registration and post-registration lifecycle:
1. **Happy Flow**  smooth submission, validation passes, SKAT approves immediately
2. **Rainy Flow**  validation warnings, missing documents, SKAT requests info, user corrects
3. **Bad Flow**  validation errors, SKAT rejection, audit triggered, compliance issues

---

## Overview: Steps 47

| Step | Activity | Owner | Key Outcomes |
|------|----------|-------|--------------|
| **4** | Validate data | System | Errors/warnings returned to user |
| **5** | Submit application | System + SKAT | Submission queued or sent; SKAT_reference stored |
| **6** | Track submission & handle responses | System + SKAT | Status updates, follow-up requests, registration number |
| **7** | Post-registration | System | Compliance checklist, VAT return reminders, bookkeeping hints |

---

## Happy Flow Diagram

User completes draft  full validation passes  submits  SKAT accepts  registration confirmed.

\\\mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend API
    participant Validation Engine
    participant SKAT Adapter
    participant SKAT/Virk
    participant Event Bus
    participant DB
    participant Email/e-Boks

    Note over User,Email/e-Boks: STEP 4: VALIDATE

    User->>Frontend: Click "Validate"
    Frontend->>Backend API: POST /api/v1/applications/{id}/validate

    Backend API->>Validation Engine: Run legal ruleset
    Validation Engine->>DB: Load application data + ruleset
    Validation Engine-->>Backend API:  All validations pass (no errors, no warnings)

    Backend API->>DB: Update status to "validated"
    Backend API-->>Frontend: ValidationResult { valid: true }
    Frontend-->>User:  "Application ready to submit"

    Note over User,Email/e-Boks: STEP 5: SUBMIT

    User->>Frontend: Click "Submit to SKAT"
    Frontend->>Backend API: POST /api/v1/applications/{id}/submit (X-Idempotency-Key)

    Backend API->>DB: Create Submission record (status: "queued")
    Backend API->>Event Bus: Publish FilingSubmitted event
    Backend API-->>Frontend: 202 Accepted { submissionId, status: "queued" }
    Frontend-->>User:  "Submission in progress..."

    rect rgb(200, 220, 220)
      Note over Backend API,SKAT/Virk: Async: Orchestrator processes
      Event Bus->>Backend API: Pick up FilingSubmitted event
      Backend API->>SKAT Adapter: Convert application to SKAT payload
      SKAT Adapter->>SKAT/Virk: POST /submit (signed payload + cert)
      SKAT/Virk-->>SKAT Adapter: 200 OK { ref: "SKAT-ABC-123", status: "RECEIVED" }
      SKAT Adapter->>DB: Update Submission (status: "sent")
      SKAT Adapter->>Event Bus: Publish SubmissionSent event
    end

    Note over User,Email/e-Boks: STEP 6: POST-SUBMISSION (SKAT processes)

    rect rgb(200, 230, 200)
      Note over Backend API,Email/e-Boks: After hours: SKAT webhook callback
      SKAT/Virk->>Backend API: POST /api/v1/integrations/skats/callback (X-SKAT-Signature)
      Backend API->>Backend API: Validate signature + timestamp
      Backend API->>DB: Update Submission + VATApplication (status: "accepted", skat_reference: "SKAT-ABC-123")
      Backend API->>Event Bus: Publish ApplicationApproved event
      Backend API-->>SKAT/Virk: 200 OK
    end

    Backend API->>Email/e-Boks: Send registration confirmation
    Email/e-Boks-->>User:  "Registration confirmed! CVR: 12345678"

    Note over User,Email/e-Boks: STEP 7: POST-REGISTRATION

    Backend API->>Backend API: Generate compliance checklist
    Backend API->>Backend API: Schedule VAT return reminders (for Q1, Q2, etc.)
    Backend API->>DB: Create post-reg tasks + audit trail
    Backend API->>Email/e-Boks: Send compliance checklist + first filing date

    Frontend->>Backend API: GET /api/v1/applications/{id}
    Backend API-->>Frontend: { status: "accepted", skatReference: "SKAT-ABC-123", ... }

    User->>Frontend: View dashboard
    Frontend-->>User:  "Registered! CVR 12345678. Next VAT filing: Q2 2026"
\\\

### Happy Flow Outcomes
-  Application status: \ccepted\
-  SKAT reference stored
-  User receives confirmation + compliance checklist
-  Return reminders scheduled
-  Audit trail complete

