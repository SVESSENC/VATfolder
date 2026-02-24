import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import {
  getApplication,
  validateApplication,
  submitApplication,
  type Application,
  type ValidationResult,
} from '../api/client';
import { randomUUID } from '../api/uuid';

function Row({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="detail-item">
      <label>{label}</label>
      <span>{String(value)}</span>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [validating, setValidating] = useState(false);
  const [valResult, setValResult] = useState<ValidationResult | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getApplication(id)
      .then(setApp)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function reValidate() {
    if (!id) return;
    setValidating(true);
    setValResult(null);
    try {
      const r = await validateApplication(id);
      setValResult(r);
      setApp((prev) =>
        prev
          ? { ...prev, status: r.passed ? 'validated' : 'draft' }
          : prev,
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  }

  async function handleSubmit() {
    if (!id) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const key = randomUUID();
      const result = await submitApplication(id, key);
      setSubmitMsg(`Queued — Submission ID: ${result.submissionId}`);
      setApp((prev) => (prev ? { ...prev, status: 'queued' } : prev));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
          <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
        </div>
      </Layout>
    );
  }

  if (error && !app) {
    return (
      <Layout>
        <div className="page">
          <div className="alert alert-error">{error}</div>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  if (!app) return null;

  const data = app.applicationData as Record<string, unknown>;
  const contact = data.contact as Record<string, string> | undefined;

  const canValidate = app.status === 'draft' || app.status === 'validated';
  const canSubmit = app.status === 'validated';

  return (
    <Layout>
      <div className="page">
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/dashboard')}
              style={{ marginBottom: 10 }}
            >
              ← Dashboard
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>
              {app.organisation?.name ?? app.organisation?.cvr ?? 'Application'}
            </h1>
          </div>
          <StatusBadge status={app.status} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {submitMsg && <div className="alert alert-success">{submitMsg}</div>}

        {/* Application data */}
        <div className="card">
          <div className="card-title">Application Details</div>
          <div className="detail-grid">
            <Row label="CVR" value={app.organisation?.cvr ?? data.cvr} />
            <Row label="Company" value={app.organisation?.name} />
            <Row label="Registration type" value={data.registrationType} />
            <Row label="Start date" value={data.registrationStartDate} />
            <Row label="Business type" value={String(data.businessType ?? '').replace(/_/g, ' ')} />
            <Row
              label="Annual turnover"
              value={
                data.annualTurnover != null
                  ? `DKK ${Number(data.annualTurnover).toLocaleString('da-DK')}`
                  : null
              }
            />
            <Row
              label="Schemes"
              value={
                Array.isArray(data.schemes) && data.schemes.length > 0
                  ? (data.schemes as string[]).join(', ')
                  : 'None'
              }
            />
            <Row label="Contact phone" value={contact?.phone} />
            <Row label="Contact email" value={contact?.email} />
            <Row label="Current step" value={app.currentStep.replace(/_/g, ' ')} />
            <Row label="Version" value={app.version} />
            {app.skatReference && (
              <Row label="SKAT reference" value={app.skatReference} />
            )}
          </div>
        </div>

        {/* Validation */}
        <div className="card mt-4">
          <div className="card-title">Validation</div>

          {canValidate && (
            <button
              className="btn btn-outline btn-sm"
              onClick={reValidate}
              disabled={validating}
              style={{ marginBottom: valResult ? 16 : 0 }}
            >
              {validating ? <span className="spinner spinner-dark" /> : null}
              {validating ? 'Validating…' : 'Run validation'}
            </button>
          )}

          {valResult && (
            <>
              <div
                className={`alert ${valResult.passed ? 'alert-success' : 'alert-error'}`}
                style={{ marginTop: 12 }}
              >
                {valResult.passed
                  ? '✓ Validation passed'
                  : `✗ ${valResult.errors.length} error(s) found`}
              </div>
              {valResult.errors.map((e, i) => (
                <div key={i} className="validation-item error">
                  <div className="validation-field">{e.field}</div>
                  <div>{e.message}</div>
                  {e.legalCitation && (
                    <div className="validation-cite">Ref: {e.legalCitation}</div>
                  )}
                </div>
              ))}
              {valResult.warnings.map((w, i) => (
                <div key={i} className="validation-item warning">
                  <div className="validation-field">{w.field}</div>
                  <div>{w.message}</div>
                </div>
              ))}
            </>
          )}

          {!canValidate && !valResult && (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Validation is only available for draft or validated applications.
            </p>
          )}
        </div>

        {/* Submit */}
        {(canSubmit || app.status === 'queued' || app.status === 'submitted') && (
          <div className="card mt-4">
            <div className="card-title">Submission</div>
            {app.status === 'queued' || app.status === 'submitted' ? (
              <div className="alert alert-info" style={{ marginBottom: 0 }}>
                Application has been submitted to SKAT and is being processed.
                {app.skatReference && (
                  <> SKAT reference: <strong>{app.skatReference}</strong></>
                )}
              </div>
            ) : (
              <>
                <p className="text-muted" style={{ marginBottom: 16, fontSize: 13 }}>
                  The application has passed validation and is ready to be
                  submitted to SKAT.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? <span className="spinner" /> : null}
                  {submitting ? 'Submitting…' : 'Submit to SKAT'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
