import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  createUserSchema,
  createRoleSchema,
} from './auth.schema';

describe('Auth & RBAC Zod Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct email and password', () => {
      const result = loginSchema.safeParse({
        email: 'admin@ceylonholdings.lk',
        password: 'Admin@2026!Secure',
        rememberMe: true,
      });

      expect(result.success).toBe(true);
    });

    it('rejects short passwords and invalid emails', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'short',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('createRoleSchema', () => {
    it('validates uppercase role code format', () => {
      const result = createRoleSchema.safeParse({
        code: 'PAYROLL_ADMIN',
        name: 'Payroll Administrator',
      });

      expect(result.success).toBe(true);
    });

    it('rejects lowercase or special char role code', () => {
      const result = createRoleSchema.safeParse({
        code: 'payroll admin!',
        name: 'Payroll Administrator',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('validates user creation with Sri Lanka defaults', () => {
      const result = createUserSchema.safeParse({
        email: 'officer@ceylonholdings.lk',
        password: 'Password@2026',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.locale).toBe('en-LK');
        expect(result.data.timezone).toBe('Asia/Colombo');
        expect(result.data.scopeType).toBe('organization');
      }
    });
  });
});
