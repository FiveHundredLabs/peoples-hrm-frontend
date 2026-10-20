import { Employee } from '../../employee/types/employee';

export type PayrollItemType =
  | 'earning'
  | 'deduction'
  | 'employer_contribution'
  | 'information';

export type ComponentValueType =
  | 'fixed'
  | 'percentage'
  | 'formula'
  | 'quantity_rate';

export type BenefitCategory =
  | 'health_insurance'
  | 'life_insurance'
  | 'wellness'
  | 'retirement'
  | 'other';

export interface CompensationComponent {
  id: string;
  code: string;
  name: string;
  itemType: PayrollItemType;
  valueType: ComponentValueType;
  taxable: boolean;
  epfApplicable: boolean;
  etfApplicable: boolean;
  overtimeBase: boolean;
  gratuityBase: boolean;
  recurring: boolean;
  proratable: boolean;
  formulaExpression?: string | null;
  active: boolean;
  createdAt: string;
}

export interface CompensationPlanComponent {
  id: string;
  compensationPlanId: string;
  componentId: string;
  defaultAmount?: number | null;
  defaultPercentage?: number | null;
  sequence: number;
  component?: CompensationComponent;
}

export interface CompensationPlan {
  id: string;
  code: string;
  name: string;
  currency: string;
  frequency: string;
  active: boolean;
  components?: CompensationPlanComponent[];
}

export interface EmployeeCompensationAssignment {
  id: string;
  employeeId: string;
  compensationPlanId: string;
  currency: string;
  baseSalary: number;
  payFrequency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  reason?: string | null;
  createdAt: string;
  employee?: Employee;
  compensationPlan?: CompensationPlan;
}

export interface CompensationChangeRequest {
  id: string;
  employeeId: string;
  currentCompensation: Record<string, any>;
  proposedCompensation: Record<string, any>;
  effectiveDate: string;
  reason?: string | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedByUserId: string;
  approvedByUserId?: string | null;
  createdAt: string;
  employee?: Employee;
}

export interface BenefitPlan {
  id: string;
  code: string;
  name: string;
  category: string;
  providerName?: string | null;
  employerContribution?: number | null;
  employeeContribution?: number | null;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  active: boolean;
}

export interface EmployeeBenefitEnrollment {
  id: string;
  employeeId: string;
  benefitPlanId: string;
  policyNumber?: string | null;
  coverageAmount?: number | null;
  employeeContribution?: number | null;
  employerContribution?: number | null;
  startsOn: string;
  endsOn?: string | null;
  status: string;
  employee?: Employee;
  benefitPlan?: BenefitPlan;
}
