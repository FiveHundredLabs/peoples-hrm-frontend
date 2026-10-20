import { Employee } from '../../employee/types/employee';

export type LoanStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'active'
  | 'suspended'
  | 'settled'
  | 'written_off'
  | 'rejected'
  | 'cancelled';

export type ExpenseClaimStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'reimbursed'
  | 'cancelled';

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LoanType {
  id: string;
  code: string;
  name: string;
  interestMethod: string;
  defaultInterestRate?: number | null;
  maxAmount?: number | null;
  maxTermMonths?: number | null;
  payrollDeductible: boolean;
  active: boolean;
}

export interface LoanInstallment {
  id: string;
  employeeLoanId: string;
  installmentNo: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  paidAt?: string | null;
  status: string;
}

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  loanTypeId: string;
  loanNumber: string;
  principalAmount: number;
  interestRate?: number | null;
  termMonths: number;
  installmentAmount?: number | null;
  approvedAmount?: number | null;
  disbursedAmount?: number | null;
  outstandingPrincipal?: number | null;
  outstandingInterest?: number | null;
  startsOn?: string | null;
  endsOn?: string | null;
  status: LoanStatus;
  requestedAt: string;
  approvedAt?: string | null;
  settledAt?: string | null;
  employee?: Employee;
  loanType?: LoanType;
  installments?: LoanInstallment[];
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  amount: number;
  requestedOn: string;
  deductionPayDate: string;
  reason?: string | null;
  status: ApprovalStatus;
  employee?: Employee;
}

export interface ExpensePolicyCategory {
  category: string;
  maxPerClaim: number;
  receiptRequiredAbove: number;
}

export interface ExpensePolicy {
  id: string;
  code: string;
  name: string;
  categoryRules: {
    categories: ExpensePolicyCategory[];
  };
  effectiveFrom: string;
  effectiveTo?: string | null;
  active: boolean;
}

export interface ExpenseReceipt {
  id: string;
  expenseClaimItemId: string;
  fileId: string;
  duplicateHash?: string | null;
  verified: boolean;
}

export interface ExpenseClaimItem {
  id: string;
  expenseClaimId: string;
  expenseDate: string;
  category: string;
  merchant?: string | null;
  description?: string | null;
  amount: number;
  approvedAmount?: number | null;
  costCenterId?: string | null;
  projectCode?: string | null;
  receipts?: ExpenseReceipt[];
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  expensePolicyId?: string | null;
  claimNumber: string;
  currency: string;
  totalAmount: number;
  approvedAmount: number;
  status: ExpenseClaimStatus;
  submittedAt?: string | null;
  approvedAt?: string | null;
  reimbursedAt?: string | null;
  createdAt: string;
  employee?: Employee;
  expensePolicy?: ExpensePolicy;
  items?: ExpenseClaimItem[];
}
