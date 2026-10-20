import { describe, it, expect } from 'vitest';
import { createEmployeeSchema, sriLankanNicRegex } from './employee.schema';

describe('Sri Lankan Employee Zod Validation', () => {
  it('validates correct Sri Lankan NIC regex for old and new formats', () => {
    expect(sriLankanNicRegex.test('852341234V')).toBe(true);
    expect(sriLankanNicRegex.test('852341234v')).toBe(true);
    expect(sriLankanNicRegex.test('925321234X')).toBe(true);
    expect(sriLankanNicRegex.test('199003201234')).toBe(true);
    expect(sriLankanNicRegex.test('200053201234')).toBe(true);

    expect(sriLankanNicRegex.test('12345')).toBe(false);
    expect(sriLankanNicRegex.test('852341234Z')).toBe(false);
    expect(sriLankanNicRegex.test('1990032012345')).toBe(false);
  });

  it('validates full employee creation schema with valid values', () => {
    const validData = {
      employeeNumber: 'EMP-00101',
      firstName: 'Kasun',
      lastName: 'Perera',
      hireDate: '2026-01-15',
      legalEntityId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      employmentType: 'permanent',
      nationalId: '199003201234',
      companyEmail: 'kasun.perera@ceylonholdings.lk',
      bankName: 'Commercial Bank of Ceylon',
    };

    const res = createEmployeeSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it('fails validation when mandatory fields are missing', () => {
    const invalidData = {
      firstName: 'Kasun',
    };

    const res = createEmployeeSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
    if (!res.success) {
      const errorFields = res.error.issues.map((i) => i.path[0]);
      expect(errorFields).toContain('employeeNumber');
      expect(errorFields).toContain('hireDate');
      expect(errorFields).toContain('legalEntityId');
    }
  });
});
