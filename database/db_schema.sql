-- Initial PostgreSQL schema for VAT registration system
-- Notes:
--  - PII-containing columns should be encrypted at application layer or use PG column
--  - Use appropriate roles and row-level security in production

CREATE TYPE application_status AS ENUM ('draft','validated','queued','submitted','accepted','rejected','needs_info');

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

CREATE TABLE vat_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  application_data JSONB NOT NULL, -- form payload (structured)
  validation_warnings JSONB DEFAULT '[]'::jsonb,
  status application_status DEFAULT 'draft',
  skat_reference TEXT, -- SKAT/Virk registration id or response
  submission_payload BYTEA, -- optional signed payload backup
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vat_app_status ON vat_applications(status);
CREATE INDEX idx_vat_app_org ON vat_applications(organisation_id);

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
CREATE TRIGGER vat_applications_updated_at BEFORE UPDATE ON vat_applications FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Example constraints and policies to review with `researcher` and security team
--  - Validate schema of application_data against JSON Schema in application code
--  - Enforce encryption for personal id numbers (CPR) at application layer

-- End of initial schema
