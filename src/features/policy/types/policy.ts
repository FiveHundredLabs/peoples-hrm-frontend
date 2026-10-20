export interface PolicyDocument {
  id: string;
  code: string;
  title: string;
  category?: string | null;
  audienceRule?: Record<string, any> | null;
  currentVersion: number;
  active: boolean;
  versions?: PolicyVersion[];
}

export interface PolicyVersion {
  id: string;
  policyDocumentId: string;
  versionNo: number;
  fileId?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  acknowledgementRequired: boolean;
  publishedByUserId?: string | null;
  publishedAt?: string | null;
  policyDocument?: PolicyDocument;
  acknowledgements?: PolicyAcknowledgement[];
}

export interface PolicyAcknowledgement {
  id: string;
  policyVersionId: string;
  employeeId: string;
  acknowledgedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  employee?: { id: string; displayName: string; employeeNumber: string };
  policyVersion?: PolicyVersion;
}

export interface HrHelpdeskTicket {
  id: string;
  ticketNumber: string;
  employeeId: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  assignedToUserId?: string | null;
  dueAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  employee?: { id: string; displayName: string; employeeNumber: string };
  assignedToUser?: { id: string; email: string } | null;
  messages?: HrHelpdeskMessage[];
}

export interface HrHelpdeskMessage {
  id: string;
  ticketId: string;
  authorUserId: string;
  body: string;
  internalNote: boolean;
  fileId?: string | null;
  createdAt: string;
  authorUser?: { id: string; email: string };
}
