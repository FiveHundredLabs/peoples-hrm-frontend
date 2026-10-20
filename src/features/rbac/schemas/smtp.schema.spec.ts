import { describe, it, expect } from 'vitest';
import { smtpSchema } from './smtp.schema';

describe('smtpSchema', () => {
  it('validates correct SMTP configuration', () => {
    const result = smtpSchema.safeParse({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      username: 'user@company.com',
      password: 'app-password',
      fromName: "People's HR",
      fromEmail: 'no-reply@company.com',
      requireAuth: true,
      enabled: true,
    });

    expect(result.success).toBe(true);
  });

  it('fails if host is missing or too short', () => {
    const result = smtpSchema.safeParse({
      host: '',
      port: 587,
      fromName: "People's HR",
      fromEmail: 'no-reply@company.com',
    });

    expect(result.success).toBe(false);
  });

  it('fails if sender email is invalid', () => {
    const result = smtpSchema.safeParse({
      host: 'smtp.office365.com',
      port: 587,
      fromName: "People's HR",
      fromEmail: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });
});
