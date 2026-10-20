import { z } from 'zod';

export const sriLankanNicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

export const createEmployeeSchema = z.object({
  employeeNumber: z
    .string()
    .min(2, 'Employee Number must be at least 2 characters')
    .max(60, 'Employee Number must not exceed 60 characters'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(120, 'First name must not exceed 120 characters'),
  middleName: z.string().max(120).optional().or(z.literal('')),
  lastName: z.string().max(120).optional().or(z.literal('')),
  preferredName: z.string().max(120).optional().or(z.literal('')),
  companyEmail: z.string().email('Invalid work email address').optional().or(z.literal('')),
  personalEmail: z.string().email('Invalid personal email address').optional().or(z.literal('')),
  companyPhone: z.string().optional().or(z.literal('')),
  personalPhone: z.string().optional().or(z.literal('')),
  hireDate: z.string().min(1, 'Hire date is required'),
  lifecycleStatus: z.enum([
    'planned',
    'active',
    'probation',
    'confirmed',
    'suspended',
    'notice_period',
    'terminated',
    'retired',
  ]).default('probation'),
  legalEntityId: z.string().uuid('Please select a valid legal entity'),
  employmentType: z.enum([
    'permanent',
    'probationary',
    'fixed_term',
    'casual',
    'trainee',
    'intern',
    'contractor',
    'consultant',
  ]).default('permanent'),
  branchId: z.string().uuid().optional().or(z.literal('')),
  departmentId: z.string().uuid().optional().or(z.literal('')),
  positionId: z.string().uuid().optional().or(z.literal('')),
  jobTitle: z.string().max(160).optional().or(z.literal('')),
  nationalId: z
    .string()
    .refine((val) => !val || sriLankanNicRegex.test(val.trim()), {
      message: 'Invalid Sri Lankan NIC (format: 9 digits + V/X or 12 digits)',
    })
    .optional()
    .or(z.literal('')),
  passportNumber: z.string().max(80).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  maritalStatus: z.string().optional().or(z.literal('')),
  nationality: z.string().default('Sri Lankan'),
  epfMemberNumber: z.string().max(100).optional().or(z.literal('')),
  etfMemberReference: z.string().max(100).optional().or(z.literal('')),
  tin: z.string().max(100).optional().or(z.literal('')),
  bankName: z.string().max(160).optional().or(z.literal('')),
  branchName: z.string().max(160).optional().or(z.literal('')),
  accountHolderName: z.string().max(200).optional().or(z.literal('')),
  accountNumber: z.string().max(80).optional().or(z.literal('')),
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;

export const addBankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required').max(160),
  bankCode: z.string().max(40).optional().or(z.literal('')),
  branchName: z.string().max(160).optional().or(z.literal('')),
  branchCode: z.string().max(40).optional().or(z.literal('')),
  accountHolderName: z.string().min(1, 'Account holder name is required').max(200),
  accountNumber: z.string().min(1, 'Account number is required').max(80),
  accountType: z.string().default('savings'),
  allocationPercentage: z.number().min(1).max(100).default(100),
  isPrimary: z.boolean().default(true),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
});

export type AddBankAccountFormValues = z.infer<typeof addBankAccountSchema>;

export const updateStatusSchema = z.object({
  newStatus: z.enum([
    'planned',
    'active',
    'probation',
    'confirmed',
    'suspended',
    'notice_period',
    'terminated',
    'retired',
  ]),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  reasonCode: z.string().max(80).optional().or(z.literal('')),
  reason: z.string().max(500).optional().or(z.literal('')),
});

export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;
