import { z } from 'zod';

export const createProbationReviewSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  employmentRecordId: z.string().min(1, 'Employment record is required'),
  reviewDueDate: z.string().min(1, 'Review due date is required'),
  rating: z.coerce.number().min(1).max(5).optional(),
  comments: z.string().optional(),
  extensionEndDate: z.string().optional(),
});

export type CreateProbationReviewFormValues = z.infer<typeof createProbationReviewSchema>;

export const submitProbationReviewSchema = z.object({
  outcome: z.enum(['confirmed', 'extended', 'terminated']),
  rating: z.coerce.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comments: z.string().min(3, 'Review assessment comments are required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  extensionEndDate: z.string().optional(),
});

export type SubmitProbationReviewFormValues = z.infer<typeof submitProbationReviewSchema>;

export const createMovementRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  movementType: z.enum([
    'promotion',
    'transfer',
    'demotion',
    'redesignation',
    'grade_change',
    'location_transfer',
  ]),
  requestedEffectiveDate: z.string().min(1, 'Effective date is required'),
  proposedTitle: z.string().optional(),
  proposedDepartmentId: z.string().optional(),
  proposedBranchId: z.string().optional(),
  proposedPositionId: z.string().optional(),
  proposedFte: z.coerce.number().min(0.1).max(1.0).default(1.0),
  reason: z.string().min(5, 'Reason for movement/promotion is required'),
});

export type CreateMovementRequestFormValues = z.infer<typeof createMovementRequestSchema>;

export const createContractSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  employmentRecordId: z.string().min(1, 'Employment record is required'),
  contractNumber: z.string().optional(),
  contractType: z.string().min(1, 'Contract type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
});

export type CreateContractFormValues = z.infer<typeof createContractSchema>;
