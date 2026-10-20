export interface SystemDiagnostics {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  nodeVersion: string;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  subsystems: {
    database: {
      status: string;
      latencyMs: number;
      engine: string;
    };
    redis: {
      status: string;
      latencyMs: number;
      role: string;
    };
    bullmq: {
      status: string;
      queue: string;
      backlog: number;
    };
  };
  entityStatistics: {
    employees: number;
    systemSettings: number;
    notificationTemplates: number;
    notificationsDispatched: number;
    webhooksActive: number;
  };
}

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  isSecret: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  code: string;
  channel: 'in_app' | 'email' | 'push' | 'sms' | 'whatsapp';
  locale: string;
  subjectTemplate?: string | null;
  bodyTemplate: string;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  employeeId?: string | null;
  type: string;
  title: string;
  body: string;
  entityType?: string | null;
  entityId?: string | null;
  priority: string;
  readAt?: string | null;
  createdAt: string;
  deliveries?: NotificationDelivery[];
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: string;
  destinationMasked?: string | null;
  status: string;
  provider?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secretReference?: string | null;
  subscribedEvents: string[];
  active: boolean;
  createdAt: string;
}
