import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  lookupCvr,
  createApplication,
  updateApplication,
  assessObligation,
  validateApplication,
  submitApplication,
  type Organisation,
  type Application,
  type ValidationResult,
} from '../api/client';
import { randomUUID } from '../api/uuid';

// ── Step definitions ──────────────────────────────────

const STEPS = [
  { label: 'Company' },
  { label: 'Obligation' },
  { label: 'VAT Details' },
  { label: 'Validate' },
  { label: 'Submit' },
];

// ── Sub-forms ─────────────────────────────────────────

function StepCompany({
  onNext,
}: {
  onNext: (org: Organisation | null, cvr: string) => void;
}) {
  const [cvr, setCvr] = useState('');
  const [org, setOrg] = useState<Organisation | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    if (!/^\d{8}$/.test(cvr)) {
      setError('CVR must be exactly 8 digits');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await lookupCvr(cvr);
      setOrg(result);
    } catch {
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="card-title">Step 1 — Company CVR</h2>
      <p className="text-muted" style={{ marginBottom: 20 }}>
        Enter the 8-digit Danish CVR number for the company you want to
        register.
      </p>

      <div className="form-group">
        <label htmlFor="cvr">CVR number</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            id="cvr"
            type="text"
            maxLength={8}
            pattern="\d{8}"
            placeholder="12345678"
            value={cvr}
            onChange={(e) => {
              setCvr(e.target.value.replace(/\D/g, ''));
              setOrg(undefined);
            }}
          />
          <button
            className="btn btn-outline"
            onClick={lookup}
            disabled={loading || cvr.length !== 8}
            style={{ whiteSpace: 'nowrap' }}
          >
            {loading ? <span className="spinner spinner-dark" /> : 'Look up'}
          </button>
        </div>
        {error && <p className="form-error-msg">{error}</p>}
      </div>

      {org !== undefined && (
        <div
          className={`alert ${org ? 'alert-success' : 'alert-info'}`}
          style={{ marginTop: 8 }}
        >
          {org ? (
            <>
              <strong>Found:</strong> {org.name ?? 'Unknown name'} (CVR{' '}
              {org.cvr})
            </>
          ) : (
            <>
              No existing record for CVR <strong>{cvr}</strong>. A new
              organisation will be created.
            </>
          )}
        </div>
      )}

      <div className="flex-end" style={{ marginTop: 24 }}>
        <button
          className="btn btn-primary"
          disabled={cvr.length !== 8 || org === undefined}
          onClick={() => onNext(org ?? null, cvr)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function StepObligation({
  onNext,
  onBack,
}: {
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
}) {
  const [turnover, setTurnover] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!turnover || !businessType || !startDate) {
      setError('All fields are required');
      return;
    }
    setError(null);
    onNext({
      annualTurnover: Number(turnover),
      businessType,
      registrationStartDate: startDate,
    });
  }

  return (
    <div>
      <h2 className="card-title">Step 2 — Obligation Assessment</h2>
      <p className="text-muted" style={{ marginBottom: 20 }}>
        We use this information to determine if VAT registration is required.
        The threshold in Denmark is DKK 50,000 annual turnover.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="turnover">Estimated annual turnover (DKK)</label>
        <input
          id="turnover"
          type="number"
          min={0}
          placeholder="e.g. 500000"
          value={turnover}
          onChange={(e) => setTurnover(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="bizType">Business type</label>
        <select
          id="bizType"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
        >
          <option value="">Select…</option>
          <option value="goods_trading">Goods trading</option>
          <option value="services">Services</option>
          <option value="digital_services">Digital / online services</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="construction">Construction</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="startDate">Expected VAT registration start date</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="flex-end" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={submit}>
          Next →
        </button>
      </div>
    </div>
  );
}

function StepVatDetails({
  initialData,
  onNext,
  onBack,
}: {
  initialData: Record<string, unknown>;
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
}) {
  const [regType, setRegType] = useState(
    (initialData.registrationType as string) || 'standard',
  );
  const [startDate, setStartDate] = useState(
    (initialData.registrationStartDate as string) || '',
  );
  const [schemes, setSchemes] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  function toggleScheme(scheme: string) {
    setSchemes((prev) =>
      prev.includes(scheme) ? prev.filter((s) => s !== scheme) : [...prev, scheme],
    );
  }

  function submit() {
    if (!startDate || !contactEmail) {
      setError('Registration start date and contact email are required');
      return;
    }
    setError(null);
    onNext({
      ...initialData,
      registrationType: regType,
      registrationStartDate: startDate,
      schemes,
      contact: { phone, email: contactEmail },
    });
  }

  return (
    <div>
      <h2 className="card-title">Step 3 — VAT Registration Details</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="regType">Registration type</label>
        <select
          id="regType"
          value={regType}
          onChange={(e) => setRegType(e.target.value)}
        >
          <option value="standard">Standard registration</option>
          <option value="reverse_charge">Reverse charge</option>
          <option value="non_resident">Non-resident</option>
        </select>
        <p className="form-hint">
          Standard applies to most Danish businesses. Choose Reverse Charge for
          B2B cross-border transactions.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="vatStart">VAT registration start date</label>
        <input
          id="vatStart"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>VAT schemes (optional)</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={schemes.includes('oss')}
              onChange={() => toggleScheme('oss')}
            />
            One-Stop-Shop (OSS) — for EU cross-border B2C digital/goods
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={schemes.includes('reverse_charge')}
              onChange={() => toggleScheme('reverse_charge')}
            />
            Reverse charge scheme
          </label>
        </div>
      </div>

      <hr className="divider" />
      <p style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Contact details</p>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            placeholder="+45 12 34 56 78"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cemail">Email *</label>
          <input
            id="cemail"
            type="email"
            required
            placeholder="info@company.dk"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-end" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={submit}>
          Next →
        </button>
      </div>
    </div>
  );
}

function StepValidate({
  applicationId,
  onNext,
  onBack,
}: {
  applicationId: string;
  onNext: (result: ValidationResult) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runValidation() {
    setLoading(true);
    setError(null);
    try {
      const r = await validateApplication(applicationId);
      setResult(r);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="card-title">Step 4 — Validate Application</h2>
      <p className="text-muted" style={{ marginBottom: 20 }}>
        Click validate to check your application against the 2026 Danish VAT
        ruleset. All errors must be resolved before submission.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {!result && (
        <button
          className="btn btn-outline"
          onClick={runValidation}
          disabled={loading}
        >
          {loading ? <span className="spinner spinner-dark" /> : null}
          {loading ? 'Validating…' : 'Run validation'}
        </button>
      )}

      {result && (
        <>
          <div
            className={`alert ${result.passed ? 'alert-success' : 'alert-error'}`}
          >
            {result.passed
              ? '✓ Validation passed — no errors found.'
              : `✗ ${result.errors.length} error${result.errors.length !== 1 ? 's' : ''} found. Please fix them before submitting.`}
          </div>

          {result.errors.map((e, i) => (
            <div key={i} className="validation-item error">
              <div className="validation-field">{e.field}</div>
              <div>{e.message}</div>
              {e.legalCitation && (
                <div className="validation-cite">Ref: {e.legalCitation}</div>
              )}
            </div>
          ))}

          {result.warnings.map((w, i) => (
            <div key={i} className="validation-item warning">
              <div className="validation-field">{w.field}</div>
              <div>{w.message}</div>
              {w.legalCitation && (
                <div className="validation-cite">Ref: {w.legalCitation}</div>
              )}
            </div>
          ))}

          {!result.passed && (
            <button
              className="btn btn-ghost"
              style={{ marginTop: 12 }}
              onClick={() => setResult(null)}
            >
              Re-validate
            </button>
          )}
        </>
      )}

      <div className="flex-end" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          disabled={!result?.passed}
          onClick={() => result && onNext(result)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function StepSubmit({
  applicationId,
  applicationData,
  org,
  onDone,
  onBack,
}: {
  applicationId: string;
  applicationData: Record<string, unknown>;
  org: Organisation | null;
  onDone: (submissionId: string) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const key = randomUUID();
      const result = await submitApplication(applicationId, key);
      onDone(result.submissionId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  const data = applicationData;

  return (
    <div>
      <h2 className="card-title">Step 5 — Review &amp; Submit</h2>
      <p className="text-muted" style={{ marginBottom: 20 }}>
        Please review your application before sending it to SKAT.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div className="detail-grid">
          <div className="detail-item">
            <label>Company CVR</label>
            <span>{org?.cvr ?? '—'}</span>
          </div>
          <div className="detail-item">
            <label>Company name</label>
            <span>{org?.name ?? '—'}</span>
          </div>
          <div className="detail-item">
            <label>Registration type</label>
            <span>{String(data.registrationType ?? '—')}</span>
          </div>
          <div className="detail-item">
            <label>Start date</label>
            <span>{String(data.registrationStartDate ?? '—')}</span>
          </div>
          <div className="detail-item">
            <label>Annual turnover</label>
            <span>
              {data.annualTurnover != null
                ? `DKK ${Number(data.annualTurnover).toLocaleString('da-DK')}`
                : '—'}
            </span>
          </div>
          <div className="detail-item">
            <label>Business type</label>
            <span>{String(data.businessType ?? '—').replace(/_/g, ' ')}</span>
          </div>
          <div className="detail-item">
            <label>Schemes</label>
            <span>
              {Array.isArray(data.schemes) && data.schemes.length > 0
                ? (data.schemes as string[]).join(', ')
                : 'None'}
            </span>
          </div>
          <div className="detail-item">
            <label>Contact email</label>
            <span>
              {(data.contact as Record<string, string> | undefined)?.email ?? '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="alert alert-info" style={{ fontSize: 13 }}>
        By submitting, you confirm that all information is correct and authorise
        transmission to SKAT via the VAT registration system.
      </div>

      <div className="flex-end" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Submitting…' : 'Submit to SKAT'}
        </button>
      </div>
    </div>
  );
}

// ── Wizard container ──────────────────────────────────

export default function WizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Accumulated state
  const [org, setOrg] = useState<Organisation | null>(null);
  const [cvr, setCvr] = useState('');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<Record<string, unknown>>({});
  const [creatingApp, setCreatingApp] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // ── Step handlers ─────────────────────────────────────

  async function handleCompanyNext(resolvedOrg: Organisation | null, resolvedCvr: string) {
    setOrg(resolvedOrg);
    setCvr(resolvedCvr);
    setStep(1);
  }

  async function handleObligationNext(obligationData: Record<string, unknown>) {
    setCreateError(null);
    setCreatingApp(true);
    try {
      const app: Application = await createApplication({
        organisationId: org?.id,
        applicationData: { ...obligationData, cvr },
      });
      setApplicationId(app.id);
      await assessObligation(app.id, obligationData);
      setApplicationData({ ...obligationData });
      setStep(2);
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create application');
    } finally {
      setCreatingApp(false);
    }
  }

  async function handleVatDetailsNext(vatData: Record<string, unknown>) {
    if (!applicationId) return;
    try {
      await updateApplication(applicationId, vatData);
      setApplicationData(vatData);
      setStep(3);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to save details');
    }
  }

  function handleValidationNext() {
    setStep(4);
  }

  function handleSubmitDone(sid: string) {
    setSubmissionId(sid);
    setStep(5);
  }

  // ── Submitted state ───────────────────────────────────

  if (step === 5 && submissionId) {
    return (
      <Layout>
        <div className="page">
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
              Application submitted!
            </h2>
            <p className="text-muted" style={{ marginBottom: 24 }}>
              Your VAT registration has been queued for processing.
              <br />
              Submission ID: <strong>{submissionId}</strong>
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
              {applicationId && (
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/applications/${applicationId}`)}
                >
                  View application
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
          New VAT Registration
        </h1>

        {/* Step indicator */}
        <div className="wizard-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="step-item">
              <div
                className={`step-circle ${
                  i < step ? 'done' : i === step ? 'active' : ''
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className={`step-label ${
                  i < step ? 'done' : i === step ? 'active' : ''
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`step-connector ${i < step ? 'done' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {createError && <div className="alert alert-error">{createError}</div>}
        {creatingApp && (
          <div className="alert alert-info">
            <span className="spinner spinner-dark" style={{ marginRight: 8 }} />
            Creating application…
          </div>
        )}

        <div className="card">
          {step === 0 && <StepCompany onNext={handleCompanyNext} />}
          {step === 1 && (
            <StepObligation
              onNext={handleObligationNext}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && applicationId && (
            <StepVatDetails
              initialData={applicationData}
              onNext={handleVatDetailsNext}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && applicationId && (
            <StepValidate
              applicationId={applicationId}
              onNext={handleValidationNext}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && applicationId && (
            <StepSubmit
              applicationId={applicationId}
              applicationData={applicationData}
              org={org}
              onDone={handleSubmitDone}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
