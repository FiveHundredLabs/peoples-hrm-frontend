import { describe, it, expect } from 'vitest';
import {
  legalEntitySchema,
  branchSchema,
  departmentSchema,
  positionSchema,
  holidaySchema,
} from './organization.schema';

describe('Organization Zod Schemas', () => {
  describe('legalEntitySchema', () => {
    it('validates correct legal entity data with Sri Lankan defaults', () => {
      const result = legalEntitySchema.safeParse({
        code: 'LE-001',
        legalName: 'Ceylon Holdings (Pvt) Ltd',
        displayName: 'Ceylon Holdings',
        registrationNumber: 'PV 12345',
        taxIdentificationNumber: '123456789-7000',
        epfEmployerNumber: 'A/12345',
        etfEmployerNumber: 'ETF/98765',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.countryCode).toBe('LK');
        expect(result.data.currency).toBe('LKR');
        expect(result.data.timezone).toBe('Asia/Colombo');
      }
    });

    it('rejects invalid code format', () => {
      const result = legalEntitySchema.safeParse({
        code: 'LE 001!', // space and exclamation mark not allowed
        legalName: 'Ceylon Holdings',
        displayName: 'Ceylon',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('branchSchema', () => {
    it('validates branch with valid UUID for legalEntityId', () => {
      const result = branchSchema.safeParse({
        legalEntityId: '11111111-1111-1111-1111-111111111111',
        code: 'BR-COL-01',
        name: 'Colombo Office',
      });

      expect(result.success).toBe(true);
    });

    it('fails if legalEntityId is not a valid UUID', () => {
      const result = branchSchema.safeParse({
        legalEntityId: 'not-a-uuid',
        code: 'BR-COL-01',
        name: 'Colombo Office',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('departmentSchema', () => {
    it('validates department schema successfully', () => {
      const result = departmentSchema.safeParse({
        legalEntityId: '11111111-1111-1111-1111-111111111111',
        code: 'DEP-ENG',
        name: 'Engineering',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('positionSchema', () => {
    it('validates position without requiring jobId', () => {
      const result = positionSchema.safeParse({
        legalEntityId: '11111111-1111-1111-1111-111111111111',
        code: 'POS-ENG-001',
        titleOverride: 'Senior Software Engineer',
        effectiveFrom: '2026-01-01',
        headcountLimit: 2,
        fte: 1.0,
      });

      expect(result.success).toBe(true);
    });

    it('fails when position title is missing', () => {
      const result = positionSchema.safeParse({
        legalEntityId: '11111111-1111-1111-1111-111111111111',
        code: 'POS-ENG-001',
        titleOverride: '',
        effectiveFrom: '2026-01-01',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('holidaySchema', () => {
    it('validates Sri Lankan statutory holiday flags', () => {
      const result = holidaySchema.safeParse({
        calendarId: '11111111-1111-1111-1111-111111111111',
        holidayDate: '2026-05-01',
        name: 'May Day',
        holidayType: 'Public, Bank & Mercantile',
        isPoya: false,
        isPublicHoliday: true,
        isMercantileHoliday: true,
      });

      expect(result.success).toBe(true);
    });
  });
});
