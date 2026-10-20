export type EmploymentStatus =
  | 'planned'
  | 'active'
  | 'probation'
  | 'confirmed'
  | 'suspended'
  | 'notice_period'
  | 'terminated'
  | 'retired';

export type EmploymentType =
  | 'permanent'
  | 'probationary'
  | 'fixed_term'
  | 'casual'
  | 'trainee'
  | 'intern'
  | 'contractor'
  | 'consultant';

export type AssignmentType = 'primary' | 'secondary' | 'acting' | 'concurrent' | 'project';

export type DocumentVisibility = 'employee' | 'manager' | 'hr' | 'payroll_admin' | 'admin_only';

export interface EmployeePersonalDetails {
  id: string;
  employeeId: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  maritalStatus?: string | null;
  bloodGroup?: string | null;
  preferredLanguage?: string | null;
  passportExpiryDate?: string | null;
  nationalIdLast4?: string | null;
}

export interface EmployeeAddress {
  id: string;
  employeeId: string;
  addressType: string;
  line1: string;
  line2?: string | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  countryCode: string;
  isPrimary: boolean;
}

export interface EmployeeEmergencyContact {
  id: string;
  employeeId: string;
  name: string;
  relationship?: string | null;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  isPrimary: boolean;
}

export interface EmployeeBankAccount {
  id: string;
  employeeId: string;
  bankCode?: string | null;
  bankName: string;
  branchCode?: string | null;
  branchName?: string | null;
  accountHolderName: string;
  accountNumberLast4?: string | null;
  accountType?: string | null;
  currency: string;
  allocationPercentage: number;
  isPrimary: boolean;
  effectiveFrom: string;
}

export interface EmployeeStatutoryProfile {
  id: string;
  employeeId: string;
  legalEntityId: string;
  epfMemberNumber?: string | null;
  etfMemberReference?: string | null;
  tinLast4?: string | null;
  taxResidency: string;
  employmentTaxType: string;
  apitEnabled: boolean;
  epfEligible: boolean;
  etfEligible: boolean;
  gratuityEligible: boolean;
  legalEntity?: {
    id: string;
    legalName: string;
    displayName: string;
  };
}

export interface EmploymentRecord {
  id: string;
  employeeId: string;
  legalEntityId: string;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  hireDate: string;
  confirmationDate?: string | null;
  contractEndDate?: string | null;
  legalEntity?: {
    id: string;
    legalName: string;
    displayName: string;
  };
}

export interface EmployeeAssignment {
  id: string;
  employeeId: string;
  employmentRecordId: string;
  assignmentType: AssignmentType;
  positionId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  teamId?: string | null;
  title?: string | null;
  fte: number;
  effectiveFrom: string;
  position?: {
    id: string;
    code: string;
    titleOverride?: string | null;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

export interface EmployeeDocumentVersion {
  id: string;
  employeeDocumentId: string;
  versionNo: number;
  fileId: string;
  notes?: string | null;
  createdAt: string;
  file?: {
    id: string;
    originalName: string;
    mimeType?: string | null;
    sizeBytes?: number | null;
  };
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: string;
  title: string;
  visibility: DocumentVisibility;
  currentVersion: number;
  expiresOn?: string | null;
  createdAt: string;
  versions?: EmployeeDocumentVersion[];
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  preferredName?: string | null;
  displayName: string;
  companyEmail?: string | null;
  personalEmail?: string | null;
  companyPhone?: string | null;
  personalPhone?: string | null;
  profileFileId?: string | null;
  lifecycleStatus: EmploymentStatus;
  hireDate?: string | null;
  terminationDate?: string | null;
  createdAt: string;
  updatedAt: string;
  personalDetails?: EmployeePersonalDetails;
  addresses?: EmployeeAddress[];
  emergencyContacts?: EmployeeEmergencyContact[];
  bankAccounts?: EmployeeBankAccount[];
  statutoryProfiles?: EmployeeStatutoryProfile[];
  employmentRecords?: EmploymentRecord[];
  assignments?: EmployeeAssignment[];
  documents?: EmployeeDocument[];
}

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  legalEntityId?: string;
  departmentId?: string;
  status?: EmploymentStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
