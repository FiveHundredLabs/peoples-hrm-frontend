export interface LegalEntity {
  id: string;
  code: string;
  legalName: string;
  displayName: string;
  registrationNumber?: string | null;
  taxIdentificationNumber?: string | null;
  epfEmployerNumber?: string | null;
  etfEmployerNumber?: string | null;
  countryCode: string;
  currency: string;
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  legalEntityId: string;
  parentBranchId?: string | null;
  code: string;
  name: string;
  branchType?: string | null;
  timezone: string;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  legalEntity?: LegalEntity;
}

export interface Department {
  id: string;
  legalEntityId: string;
  branchId?: string | null;
  parentDepartmentId?: string | null;
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  legalEntity?: LegalEntity;
  branch?: Branch | null;
  teams?: Team[];
}

export interface Team {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  department?: Department;
}

export interface Job {
  id: string;
  jobFamilyId?: string | null;
  code: string;
  title: string;
  description?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  active: boolean;
}

export interface Position {
  id: string;
  legalEntityId: string;
  branchId?: string | null;
  departmentId?: string | null;
  teamId?: string | null;
  costCenterId?: string | null;
  jobId: string;
  gradeId?: string | null;
  parentPositionId?: string | null;
  code: string;
  titleOverride?: string | null;
  headcountLimit: number;
  fte: string;
  active: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  createdAt: string;
  legalEntity?: LegalEntity;
  department?: Department | null;
  job?: Job;
}

export interface WorkLocation {
  id: string;
  legalEntityId: string;
  branchId?: string | null;
  code: string;
  name: string;
  locationType?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusM?: number | null;
  timezone: string;
  active: boolean;
  legalEntity?: LegalEntity;
}

export interface HolidayCalendar {
  id: string;
  legalEntityId?: string | null;
  code: string;
  name: string;
  year: number;
  status: string;
  publishedAt?: string | null;
  holidays?: Holiday[];
}

export interface Holiday {
  id: string;
  calendarId: string;
  holidayDate: string;
  name: string;
  holidayType: string;
  isPoya: boolean;
  isPublicHoliday: boolean;
  isMercantileHoliday: boolean;
  isCompanyHoliday: boolean;
  notes?: string | null;
}
