import { Employee } from '../../employee/types/employee';

export type PayrollRunStatus =
  | 'draft'
  | 'inputs_pending'
  | 'calculated'
  | 'validation_failed'
  | 'validated'
  | 'hr_reviewed'
  | 'finance_approved'
  | 'finalized'
  | 'paid'
  | 'locked'
  | 'reopened';

export interface StatutoryRuleVersion {
  id: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  rules: {
    epfEmployeeRate: number;
    epfEmployerRate: number;
    etfEmployerRate: number;
  };
  sourceReference?: string | null;
}

export interface StatutoryRuleSet {
  id: string;
  countryCode: string;
  code: string;
  name: string;
  authority?: string | null;
  versions?: StatutoryRuleVersion[];
}

export interface TaxBracket {
  id: string;
  sequence: number;
  lowerBound?: number | null;
  upperBound?: number | null;
  rate: number;
  fixedDeduction: number;
}

export interface TaxTable {
  id: string;
  countryCode: string;
  code: string;
  name: string;
  taxYear: string;
  personalReliefMonthly: number;
  sourceReference?: string | null;
  brackets?: TaxBracket[];
}

export interface PayrollItem {
  id: string;
  itemCode: string;
  itemName: string;
  itemType: 'earning' | 'deduction' | 'employer_contribution' | 'information';
  amount: number;
  taxable: boolean;
  epfApplicable: boolean;
  etfApplicable: boolean;
  sequence: number;
}

export interface StatutoryCalculationResult {
  id: string;
  calculationType: string;
  eligibleBase?: number | null;
  employeeAmount: number;
  employerAmount: number;
  calculationDetails: Record<string, any>;
}

export interface PayrollRunEmployee {
  id: string;
  payrollRunId: string;
  employeeId: string;
  status: string;
  baseSalary: number;
  grossPay: number;
  taxablePay: number;
  epfEligiblePay: number;
  etfEligiblePay: number;
  totalEarnings: number;
  totalDeductions: number;
  totalEmployerContributions: number;
  netPay: number;
  employerCost: number;
  calculatedAt?: string | null;
  employee?: Employee;
  payrollRun?: PayrollRun;
  items?: PayrollItem[];
  statutoryResults?: StatutoryCalculationResult[];
}

export interface PayrollRun {
  id: string;
  legalEntityId: string;
  payGroupId: string;
  runNumber: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: PayrollRunStatus;
  currency: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalEmployerCost: number;
  calculatedAt?: string | null;
  hrReviewedAt?: string | null;
  financeApprovedAt?: string | null;
  finalizedAt?: string | null;
  lockedAt?: string | null;
  createdAt: string;
  employees?: PayrollRunEmployee[];
  legalEntity?: { displayName: string };
  payGroup?: { name: string };
}

export interface Payslip {
  id: string;
  payrollRunEmployeeId: string;
  version: number;
  publishedAt?: string | null;
  viewedAt?: string | null;
  generatedAt: string;
  checksum?: string | null;
  payrollRunEmployee?: PayrollRunEmployee;
}

export interface PayrollBankBatchItem {
  id: string;
  bankBatchId: string;
  payrollRunEmployeeId: string;
  amount: number;
  paymentReference?: string | null;
  paymentStatus: string;
  employeeBankAccount?: {
    bankName: string;
    accountHolderName: string;
    accountNumberLast4: string;
  };
}

export interface PayrollBankBatch {
  id: string;
  payrollRunId: string;
  bankCode?: string | null;
  formatCode: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  generatedAt: string;
  reconciliationReference?: string | null;
  payrollRun?: PayrollRun;
  items?: PayrollBankBatchItem[];
}
