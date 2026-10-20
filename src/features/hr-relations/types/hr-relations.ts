export interface HrCaseType {
  id: string;
  code: string;
  name: string;
  sensitivity: 'normal' | 'sensitive' | 'highly_sensitive' | 'privileged';
  active: boolean;
}

export interface HrCaseParticipant {
  id: string;
  hrCaseId: string;
  employeeId?: string | null;
  participantRole: string;
  confidentialityLevel: string;
  employee?: { id: string; displayName: string; employeeNumber: string };
}

export interface HrCaseEvent {
  id: string;
  hrCaseId: string;
  eventType: string;
  description?: string | null;
  fileId?: string | null;
  createdByUserId: string;
  createdAt: string;
  createdByUser?: { id: string; email: string };
}

export interface HrCase {
  id: string;
  caseTypeId: string;
  caseNumber: string;
  subject: string;
  description?: string | null;
  status: 'open' | 'investigating' | 'pending_action' | 'resolved' | 'closed';
  priority: string;
  openedByUserId: string;
  assignedToUserId?: string | null;
  openedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  caseType?: HrCaseType;
  openedByUser?: { id: string; email: string };
  assignedToUser?: { id: string; email: string } | null;
  participants?: HrCaseParticipant[];
  events?: HrCaseEvent[];
  disciplinaryActions?: DisciplinaryAction[];
}

export interface DisciplinaryAction {
  id: string;
  hrCaseId?: string | null;
  employeeId: string;
  actionType: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  reason: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  workflowInstanceId?: string | null;
  letterFileId?: string | null;
  employee?: { id: string; displayName: string; employeeNumber: string };
  hrCase?: HrCase;
}

export interface SafetyIncident {
  id: string;
  legalEntityId: string;
  branchId?: string | null;
  incidentNumber: string;
  incidentType: string;
  occurredAt: string;
  locationText?: string | null;
  description: string;
  severity?: string | null;
  reportable: boolean;
  reportedToAuthorityAt?: string | null;
  status: string;
  reportedByUserId: string;
  reportedByUser?: { id: string; email: string };
  correctiveActions?: CorrectiveAction[];
}

export interface CorrectiveAction {
  id: string;
  safetyIncidentId?: string | null;
  hrCaseId?: string | null;
  title: string;
  description?: string | null;
  ownerUserId?: string | null;
  dueDate?: string | null;
  status: string;
  completedAt?: string | null;
  ownerUser?: { id: string; email: string } | null;
}
