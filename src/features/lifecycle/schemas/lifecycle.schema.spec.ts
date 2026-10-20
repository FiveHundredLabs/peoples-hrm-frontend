import { describe, it, expect } from 'vitest';
import {
  createProbationReviewSchema,
  submitProbationReviewSchema,
  createMovementRequestSchema,
  createContractSchema,
} from './lifecycle.schema';

describe('Lifecycle Zod Validation Schemas', () => {
  it('validates probation review scheduling schema', () => {
    const valid = {
      employeeId: 'emp-1',
      employmentRecordId: 'rec-1',
      reviewDueDate: '2026-06-30',
      rating: 4.5,
      comments: 'Scheduled review',
    };

    const res = createProbationReviewSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates probation review submission schema', () => {
    const valid = {
      outcome: 'confirmed',
      rating: 4.5,
      comments: 'Excellent performance and project leadership during 6-month probation.',
      effectiveDate: '2026-06-01',
    };

    const res = submitProbationReviewSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects invalid probation review ratings', () => {
    const invalid = {
      outcome: 'confirmed',
      rating: 6.5, // > 5
      comments: 'Ok',
      effectiveDate: '2026-06-01',
    };

    const res = submitProbationReviewSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('validates career movement request schema', () => {
    const validMovement = {
      employeeId: 'emp-uuid-1',
      movementType: 'promotion',
      requestedEffectiveDate: '2026-07-01',
      proposedTitle: 'Principal Engineer',
      reason: 'Promoted for outstanding architecture delivery.',
      proposedFte: 1.0,
    };

    const res = createMovementRequestSchema.safeParse(validMovement);
    expect(res.success).toBe(true);
  });

  it('validates employment contract schema', () => {
    const validContract = {
      employeeId: 'emp-uuid-1',
      employmentRecordId: 'rec-uuid-1',
      contractNumber: 'CONT-2026-001',
      contractType: 'fixed_term',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
    };

    const res = createContractSchema.safeParse(validContract);
    expect(res.success).toBe(true);
  });
});
