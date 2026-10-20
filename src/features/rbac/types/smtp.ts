export interface SmtpConfig {
  isConfigured: boolean;
  host: string;
  port: number;
  secure: boolean;
  username?: string;
  hasPassword: boolean;
  maskedPassword?: string;
  fromName: string;
  fromEmail: string;
  requireAuth: boolean;
  enabled: boolean;
  updatedAt?: string;
}

export interface UpdateSmtpConfigPayload {
  host: string;
  port: number;
  secure: boolean;
  username?: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  requireAuth: boolean;
  enabled: boolean;
}

export interface TestSmtpPayload {
  recipientEmail?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  fromName?: string;
  fromEmail?: string;
  requireAuth?: boolean;
}

export interface SmtpTestResult {
  success: boolean;
  message: string;
  responseTimeMs?: number;
  testEmailSent?: boolean;
  recipientEmail?: string;
}
