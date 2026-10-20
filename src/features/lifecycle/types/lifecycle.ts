import { Employee, EmploymentRecord } from '../../employee/types/employee';

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export type MovementType =
  | 'promotion'
  | 'transfer'
  | 'demotion'
  | 'redesignation'
  | 'grade_change'
  | 'location_transfer';

export type ProbationOutcome = 'confirmed' | 'extended' | 'terminated' | 'under_review';

export interface ProbationReview {
  id: string;
  employeeId: string;
  employmentRecordId: string;
  reviewDueDate: string;
  reviewedAt?: string | null;
  reviewerEmployeeId?: string | null;
  outcome?: ProbationOutcome | null;
  extensionEndDate?: string | null;
  rating?: number | null;
  comments?: string | null;
  status: ApprovalStatus;
  createdAt: string;
  employee?: Employee;
  employmentRecord?: EmploymentRecord;
  reviewerEmployee?: Employee | null;
}

export interface EmployeeMovementRequest {
  id: string;
  employeeId: string;
  movementType: MovementType;
  requestedEffectiveDate: string;
  currentSnapshot: {
    title?: string;
    departmentId?: string;
    departmentName?: string;
    positionId?: string;
    branchId?: string;
    fte?: number;
  };
  proposedSnapshot: {
    title?: string;
    departmentId?: string;
    departmentName?: string;
    positionId?: string;
    branchId?: string;
    fte?: number;
  };
  reason?: string | null;
  status: ApprovalStatus;
  requestedByUserId: string;
  approvedByUserId?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  employee?: Employee;
  requestedByUser?: { id: string; email: string };
  approvedByUser?: { id: string; email: string } | null;
}

export interface EmploymentContract {
  id: string;
  employeeId: string;
  employmentRecordId: string;
  contractNumber?: string | null;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  signedAt?: string | null;
  fileId?: string | null;
  status: string;
  createdAt: string;
  employee?: Employee;
}

export interface Skill {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  active: boolean;
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  skillId: string;
  proficiencyLevel?: number | null;
  yearsExperience?: number | null;
  assessedAt?: string | null;
  skill?: Skill;
}

export interface EmployeeQualification {
  id: string;
  employeeId: string;
  qualificationName: string;
  institution?: string | null;
  fieldOfStudy?: string | null;
  grade?: string | null;
  startedOn?: string | null;
  completedOn?: string | null;
  verifiedAt?: string | null;
}
