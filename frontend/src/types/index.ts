// User types
export interface User {
  id: string;
  mitidSub?: string;
  email?: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

// Organisation types
export interface Organisation {
  id: string;
  cvr: string;
  name?: string;
  primaryAddress?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// VAT Application types
export enum ApplicationStatus {
  DRAFT = 'draft',
  VALIDATED = 'validated',
  QUEUED = 'queued',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  NEEDS_INFO = 'needs_info',
}

export interface VatApplication {
  id: string;
  applicantId?: string;
  organisationId?: string;
  applicationData: Record<string, any>;
  validationWarnings?: Array<{ rule: string; message: string }>;
  status: ApplicationStatus;
  skatReference?: string;
  createdAt: string;
  updatedAt: string;
}

// Document types
export interface Document {
  id: string;
  filename?: string;
  contentType?: string;
  storagePath?: string;
  checksum?: string;
  createdAt: string;
}
