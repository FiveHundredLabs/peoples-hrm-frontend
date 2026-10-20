import { Employee } from '../../employee/types/employee';

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
export type OffboardingStatus = 'initiated' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';

export interface GratuityCalculation {
  id: string;
  employeeId: string;
  finalSettlementId?: string | null;
  completedYears: number;
  totalServiceDays?: number;
  isEligible?: boolean;
  eligibleSalaryBase: number;
  factor: number;
  gratuityAmount: number;
  details: {
    joiningDate: string;
    lastWorkingDate: string;
    statutoryMinimumYears: number;
    statutoryAct: string;
    formula: string;
    remarks: string;
  };
  calculatedAt: string;
}

export interface OffboardingTask {
  id: string;
  offboardingCaseId: string;
  templateTaskId?: string | null;
  title: string;
  assignedUserId?: string | null;
  dueDate?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'waived';
  completedAt?: string | null;
  notes?: string | null;
}

export interface ExitInterview {
  id: string;
  offboardingCaseId: string;
  conductedAt?: string | null;
  reasonCategory?: string | null;
  rehireEligible?: boolean | null;
  feedback?: string | null;
}

export interface OffboardingCase {
  id: string;
  employeeId: string;
  templateId?: string | null;
  separationType: string;
  resignationReceivedAt?: string | null;
  lastWorkingDate: string;
  reason?: string | null;
  status: OffboardingStatus;
  completedAt?: string | null;
  employee?: Employee;
  tasks?: OffboardingTask[];
  exitInterviews?: ExitInterview[];
}

export interface FinalSettlement {
  id: string;
  employeeId: string;
  offboardingCaseId?: string | null;
  payrollRunId?: string | null;
  lastWorkingDate: string;
  salaryDue: number;
  overtimeDue: number;
  leaveEncashment: number;
  gratuityAmount: number;
  deductions: number;
  taxAmount: number;
  netSettlement: number;
  calculationSnapshot: {
    baseSalary: number;
    unpaidDays: number;
    otHours: number;
    annualLeaveDays: number;
    salaryDue: number;
    overtimeDue: number;
    leaveEncashment: number;
    gratuity: {
      completedYears: number;
      isEligible: boolean;
      factor: number;
      gratuityAmount: number;
      details: {
        formula: string;
        remarks: string;
      };
    };
    deductionsBreakdown: {
      outstandingLoans: number;
      salaryAdvances: number;
      otherDeductions: number;
    };
    grossDues: number;
    totalDeductions: number;
    netSettlement: number;
    notes?: string;
  };
  status: ApprovalStatus;
  finalizedAt?: string | null;
  employee?: Employee;
  gratuityCalculations?: GratuityCalculation[];
  offboardingCase?: OffboardingCase;
}
