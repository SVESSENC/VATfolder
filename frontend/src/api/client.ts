import { randomUUID } from './uuid';

const BASE = import.meta.env.VITE_API_URL ?? '';

function getToken(): string | null {
  return localStorage.getItem('vat_token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Correlation-ID': randomUUID(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    const msg =
      data?.error?.message ??
      data?.message ??
      `Request failed: ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export async function devLogin(email: string, displayName: string) {
  return request<{ token: string; user: AuthUser }>('POST', '/api/v1/auth/dev-login', {
    email,
    displayName,
  });
}

export async function getMe() {
  return request<AuthUser>('GET', '/api/v1/auth/me');
}

// ── Organisations ─────────────────────────────────────

export interface Organisation {
  id: string;
  cvr: string;
  name: string | null;
  primaryAddress: unknown;
}

export async function lookupCvr(cvr: string) {
  return request<Organisation | null>('GET', `/api/v1/organisations?cvr=${cvr}`);
}

// ── Applications ──────────────────────────────────────

export type AppStatus =
  | 'draft'
  | 'validated'
  | 'queued'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'needs_info';

export interface Application {
  id: string;
  status: AppStatus;
  currentStep: string;
  applicationData: Record<string, unknown>;
  validationWarnings: unknown[];
  version: number;
  skatReference: string | null;
  createdAt: string;
  updatedAt: string;
  organisation: Organisation | null;
}

export async function listApplications(): Promise<Application[]> {
  return request<Application[]>('GET', '/api/v1/applications');
}

export async function getApplication(id: string): Promise<Application> {
  return request<Application>('GET', `/api/v1/applications/${id}`);
}

export async function createApplication(payload: {
  organisationId?: string;
  applicationData: Record<string, unknown>;
}): Promise<Application> {
  return request<Application>('POST', '/api/v1/applications', payload);
}

export async function updateApplication(
  id: string,
  applicationData: Record<string, unknown>,
): Promise<Application> {
  return request<Application>('PUT', `/api/v1/applications/${id}`, {
    applicationData,
  });
}

export async function assessObligation(
  id: string,
  assessmentData: Record<string, unknown>,
) {
  return request<unknown>('POST', `/api/v1/applications/${id}/assess`, {
    assessmentData,
  });
}

// ── Validation ────────────────────────────────────────

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  legalCitation?: string;
}

export interface ValidationResult {
  passed: boolean;
  rulesetVersion: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export async function validateApplication(id: string): Promise<ValidationResult> {
  return request<ValidationResult>('POST', `/api/v1/applications/${id}/validate`, {});
}

// ── Submissions ───────────────────────────────────────

export interface SubmissionResult {
  submissionId: string;
  status: string;
  queuedAt: string;
}

export async function submitApplication(
  id: string,
  idempotencyKey: string,
): Promise<SubmissionResult> {
  return request<SubmissionResult>(
    'POST',
    `/api/v1/applications/${id}/submit`,
    undefined,
    { 'X-Idempotency-Key': idempotencyKey },
  );
}

export async function getSubmissionStatus(submissionId: string) {
  return request<unknown>('GET', `/api/v1/submissions/${submissionId}/status`);
}
