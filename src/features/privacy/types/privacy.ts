export type DataSubjectRequestType =
  | 'access'
  | 'correction'
  | 'deletion'
  | 'restriction'
  | 'objection'
  | 'portability';

export type DataSubjectRequestStatus =
  | 'received'
  | 'verified'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface PrivacyConsent {
  id: string;
  employeeId?: string | null;
  candidateId?: string | null;
  purposeCode: string;
  consentVersion: string;
  granted: boolean;
  grantedAt?: string | null;
  withdrawnAt?: string | null;
  source?: string | null;
  evidence?: Record<string, any> | null;
  employee?: { id: string; displayName: string; employeeNumber: string } | null;
  candidate?: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface DataRetentionPolicy {
  id: string;
  dataCategory: string;
  entityType: string;
  retentionDays: number;
  triggerEvent: string;
  deletionStrategy: string;
  legalBasis?: string | null;
  active: boolean;
}

export interface DataSubjectRequest {
  id: string;
  requestNumber: string;
  employeeId?: string | null;
  candidateId?: string | null;
  requestType: DataSubjectRequestType;
  status: DataSubjectRequestStatus;
  requestedAt: string;
  verifiedAt?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  assignedToUserId?: string | null;
  resolutionNotes?: string | null;
  employee?: { id: string; displayName: string; employeeNumber: string } | null;
  candidate?: { id: string; firstName: string; lastName: string; email: string } | null;
  assignedToUser?: { id: string; email: string } | null;
}

export interface LegalHold {
  id: string;
  name: string;
  reason: string;
  entityType?: string | null;
  entityId?: string | null;
  startsAt: string;
  endsAt?: string | null;
  createdByUserId: string;
  releasedByUserId?: string | null;
  releasedAt?: string | null;
  createdByUser?: { id: string; email: string };
  releasedByUser?: { id: string; email: string } | null;
}
