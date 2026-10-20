export interface HelpdeskTicket {
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
  employee?: {
    id: string;
    displayName: string;
    employeeNumber: string;
    workEmail?: string;
  };
  assignedToUser?: {
    id: string;
    email: string;
  } | null;
  messages?: HelpdeskMessage[];
}

export interface HelpdeskMessage {
  id: string;
  ticketId: string;
  authorUserId: string;
  body: string;
  internalNote: boolean;
  fileId?: string | null;
  createdAt: string;
  authorUser?: {
    id: string;
    email: string;
  };
}
