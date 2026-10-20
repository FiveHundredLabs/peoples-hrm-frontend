import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  roleId: z.string().uuid('Please select an initial role').optional().or(z.literal('')),
  scopeType: z.enum(['self', 'team', 'department', 'branch', 'legal_entity', 'organization', 'custom']).default('organization'),
  scopeId: z.string().uuid().optional().nullable(),
  locale: z.string().default('en-LK'),
  timezone: z.string().default('Asia/Colombo'),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const createRoleSchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(80)
    .regex(/^[A-Z0-9_-]+$/, 'Role code must be uppercase alphanumeric and underscores'),
  name: z.string().min(2, 'Role name is required').max(160),
  description: z.string().optional(),
  sensitivity: z.enum(['normal', 'sensitive', 'highly_sensitive', 'privileged']).default('normal'),
  active: z.boolean().default(true),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid('Please select a user'),
  roleId: z.string().uuid('Please select a role'),
  scopeType: z.enum(['self', 'team', 'department', 'branch', 'legal_entity', 'organization', 'custom']).default('organization'),
  scopeId: z.string().uuid().optional().nullable(),
  effectiveFrom: z.string().min(10, 'Effective start date is required'),
  effectiveTo: z.string().optional(),
  reason: z.string().optional(),
});

export type AssignUserRoleFormValues = z.infer<typeof assignUserRoleSchema>;
