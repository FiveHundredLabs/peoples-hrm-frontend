import { z } from 'zod';

export const legalEntitySchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(40, 'Code cannot exceed 40 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),
  legalName: z.string().min(2, 'Legal name is required').max(200),
  displayName: z.string().min(2, 'Display name is required').max(160),
  registrationNumber: z.string().optional(),
  taxIdentificationNumber: z.string().optional(),
  epfEmployerNumber: z.string().optional(),
  etfEmployerNumber: z.string().optional(),
  countryCode: z.string().length(2).default('LK'),
  currency: z.string().length(3).default('LKR'),
  timezone: z.string().default('Asia/Colombo'),
  active: z.boolean().default(true),
});

export type LegalEntityFormValues = z.infer<typeof legalEntitySchema>;

export const branchSchema = z.object({
  legalEntityId: z.string().uuid('Please select a legal entity'),
  parentBranchId: z.string().uuid().optional().nullable(),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),
  name: z.string().min(2, 'Branch name is required').max(160),
  branchType: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  active: z.boolean().default(true),
});

export type BranchFormValues = z.infer<typeof branchSchema>;

export const departmentSchema = z.object({
  legalEntityId: z.string().uuid('Please select a legal entity'),
  branchId: z.string().uuid().optional().nullable(),
  parentDepartmentId: z.string().uuid().optional().nullable(),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),
  name: z.string().min(2, 'Department name is required').max(160),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const teamSchema = z.object({
  departmentId: z.string().uuid('Please select a department'),
  code: z.string().min(2).max(40),
  name: z.string().min(2).max(160),
  active: z.boolean().default(true),
});

export type TeamFormValues = z.infer<typeof teamSchema>;

export const positionSchema = z.object({
  legalEntityId: z.string().uuid('Please select a legal entity'),
  branchId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  jobId: z.string().uuid().optional().nullable(),
  code: z.string().min(2, 'Position code is required').max(50),
  titleOverride: z.string().min(2, 'Position title is required').max(160),
  headcountLimit: z.number().min(1, 'Headcount must be at least 1').default(1),
  fte: z.number().min(0.1).max(1.0).default(1.0),
  effectiveFrom: z.string().min(10, 'Effective start date is required'),
  effectiveTo: z.string().optional(),
  active: z.boolean().default(true),
});

export type PositionFormValues = z.infer<typeof positionSchema>;

export const workLocationSchema = z.object({
  legalEntityId: z.string().uuid('Please select a legal entity'),
  branchId: z.string().uuid().optional().nullable(),
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(160),
  locationType: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  geofenceRadiusM: z.number().optional(),
  timezone: z.string().default('Asia/Colombo'),
  active: z.boolean().default(true),
});

export type WorkLocationFormValues = z.infer<typeof workLocationSchema>;

export const holidaySchema = z.object({
  calendarId: z.string().uuid('Please select a calendar'),
  holidayDate: z.string().min(10, 'Date is required (YYYY-MM-DD)'),
  name: z.string().min(2, 'Holiday name is required').max(200),
  holidayType: z.string().min(1, 'Type is required'),
  isPoya: z.boolean().default(false),
  isPublicHoliday: z.boolean().default(true),
  isMercantileHoliday: z.boolean().default(true),
  isCompanyHoliday: z.boolean().default(false),
  notes: z.string().optional(),
});

export type HolidayFormValues = z.infer<typeof holidaySchema>;
