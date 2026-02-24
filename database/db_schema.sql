-- Initial PostgreSQL schema for VAT registration system
-- Notes:
--  - PII-containing columns should be encrypted at application layer or use PG column
--  - Use appropriate roles and row-level security in production

CREATE TYPE application_status AS ENUM ('draft','validated','queued','submitted','accepted','rejected','needs_info');
CREATE TYPE workflow_step AS ENUM ('assessment','identity_and_org','draft_application','validation','submission','post_submission','post_registration');
CREATE TYPE obligation_assessment_status AS ENUM ('pending','completed','inconclusive');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitid_sub TEXT UNIQUE, -- MitID subject identifier
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cvr VARCHAR(8) UNIQUE, -- Danish CVR number
  name TEXT,
  primary_address JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE obligation_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  assessment_data JSONB NOT NULL, -- obligation engine result
  status obligation_assessment_status DEFAULT 'pending',
  obligation_required BOOLEAN, -- null=inconclusive, true=yes, false=no
  legal_citations JSONB DEFAULT '[]'::jsonb, -- references to legal rules
  reasoning TEXT, -- human-readable explanation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_obligation_org ON obligation_assessments(organisation_id);

CREATE TABLE vat_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  obligation_assessment_id UUID REFERENCES obligation_assessments(id) ON DELETE SET NULL,
  application_data JSONB NOT NULL, -- form payload (structured)
  validation_warnings JSONB DEFAULT '[]'::jsonb,
  status application_status DEFAULT 'draft',
  current_step workflow_step DEFAULT 'assessment',
  version INT DEFAULT 1,
  skat_reference TEXT, -- SKAT/Virk registration id or response
  submission_payload BYTEA, -- optional signed payload backup
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vat_app_status ON vat_applications(status);
CREATE INDEX idx_vat_app_org ON vat_applications(organisation_id);
CREATE INDEX idx_vat_app_step ON vat_applications(current_step);
CREATE INDEX idx_vat_app_assessment ON vat_applications(obligation_assessment_id);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_application UUID REFERENCES vat_applications(id) ON DELETE CASCADE,
  filename TEXT,
  content_type TEXT,
  storage_path TEXT, -- blob store key
  checksum TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_events (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  object_type TEXT,
  object_id UUID,
  action TEXT,
  payload JSONB,
  payload_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Simple RBAC roles for internal users
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  description TEXT
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Example materialized view for queued submissions (fast reads)
CREATE MATERIALIZED VIEW mv_queued_submissions AS
SELECT id, applicant_id, organisation_id, created_at
FROM vat_applications
WHERE status = 'queued';

-- Triggers to keep updated_at in sync
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER organisations_updated_at BEFORE UPDATE ON organisations FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER obligation_assessments_updated_at BEFORE UPDATE ON obligation_assessments FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER vat_applications_updated_at BEFORE UPDATE ON vat_applications FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Optimistic concurrency: increment version on update
CREATE OR REPLACE FUNCTION increment_vat_application_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = COALESCE(OLD.version, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vat_applications_version_inc BEFORE UPDATE ON vat_applications FOR EACH ROW EXECUTE FUNCTION increment_vat_application_version();

-- Idempotency keys: track client-provided idempotency for async/mutable operations
CREATE TABLE idempotency_keys (
  id BIGSERIAL PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  route TEXT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  request_hash TEXT,
  response_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (idempotency_key, route)
);

-- Event log / outbox for reliable eventing and audit streaming
CREATE TABLE event_log (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  aggregate_type TEXT,
  aggregate_id UUID,
  correlation_id UUID,
  causation_id UUID,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_event_log_aggregate ON event_log(aggregate_type, aggregate_id);
CREATE INDEX idx_event_log_processed ON event_log(processed) WHERE processed = false;

-- Submissions table (queued deliveries to SKAT/Virk)
CREATE TYPE submission_status AS ENUM ('queued','processing','sent','failed','completed');

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES vat_applications(id) ON DELETE SET NULL,
  payload JSONB,
  status submission_status DEFAULT 'queued',
  attempts INT DEFAULT 0,
  external_reference TEXT,
  last_error TEXT,
  queued_at TIMESTAMPTZ DEFAULT now(),
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_submissions_status ON submissions(status);

-- Filings, amendments, and claims storage for VAT return lifecycle
CREATE TYPE filing_status AS ENUM ('pending','validated','assessed','amendable','audited','closed');

CREATE TABLE filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taxpayer_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  period TEXT NOT NULL,
  payload JSONB NOT NULL,
  status filing_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID REFERENCES filings(id) ON DELETE CASCADE,
  amendment_data JSONB,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID REFERENCES filings(id) ON DELETE SET NULL,
  taxpayer_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  reason TEXT,
  status TEXT,
  external_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow instances for orchestrator durable state
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type TEXT NOT NULL,
  state JSONB,
  status TEXT,
  correlation_id UUID,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflow_correlation ON workflow_instances(correlation_id);

-- Example constraints and policies to review with `researcher` and security team
--  - Validate schema of application_data against JSON Schema in application code
--  - Enforce encryption for personal id numbers (CPR) at application layer

-- End of initial schema
