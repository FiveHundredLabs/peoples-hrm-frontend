export interface EpfFormCItem {
  memberNumber: string;
  nicNumber: string;
  fullName: string;
  contributoryEarnings: number;
  employeeContributionRate: string;
  employeeContributionAmount: number;
  employerContributionRate: string;
  employerContributionAmount: number;
  totalContributionRate: string;
  totalContributionAmount: number;
}

export interface EpfFormCReport {
  reportType: string;
  title: string;
  employerRegistrationNumber: string;
  periodMonth: string;
  payrollRunCode: string;
  currency: string;
  items: EpfFormCItem[];
  summary: {
    totalMembers: number;
    totalContributoryEarnings: number;
    totalEmployeeContribution: number;
    totalEmployerContribution: number;
    grandTotalRemittance: number;
  };
}

export interface EtfFormIIItem {
  memberNumber: string;
  nicNumber: string;
  fullName: string;
  contributoryEarnings: number;
  contributionRate: string;
  employerContributionAmount: number;
}

export interface EtfFormIIReport {
  reportType: string;
  title: string;
  employerRegistrationNumber: string;
  periodMonth: string;
  payrollRunCode: string;
  currency: string;
  items: EtfFormIIItem[];
  summary: {
    totalMembers: number;
    totalContributoryEarnings: number;
    totalEmployerEtfRemittance: number;
  };
}

export interface ApitScheduleItem {
  employeeNumber: string;
  fullName: string;
  grossEarnings: number;
  monthlyPersonalRelief: number;
  taxableBase: number;
  apitTaxWithheld: number;
  effectiveTaxRate: string;
}

export interface ApitScheduleReport {
  reportType: string;
  title: string;
  employerTaxFileNumber: string;
  periodMonth: string;
  payrollRunCode: string;
  currency: string;
  items: ApitScheduleItem[];
  summary: {
    totalTaxpayers: number;
    totalGrossRemuneration: number;
    totalApitWithheld: number;
  };
}

export interface GratuityValuationItem {
  employeeNumber: string;
  fullName: string;
  hireDate: string;
  completedYears: number;
  eligibleBasicSalary: number;
  isStatutorilyVested: boolean;
  statutoryGratuityLiability: number;
  unvestedAccrualProvision: number;
}

export interface GratuityValuationReport {
  reportType: string;
  title: string;
  valuationDate: string;
  currency: string;
  items: GratuityValuationItem[];
  summary: {
    totalHeadcount: number;
    vestedBeneficiariesCount: number;
    totalStatutoryVestedLiability: number;
    totalUnvestedAccrualProvision: number;
    totalWorkforceGratuityExposure: number;
  };
}

export interface WorkforceDemographics {
  totalHeadcount: number;
  activeEmployees: number;
  genderBreakdown: Record<string, number>;
  departmentBreakdown: Record<string, number>;
  averageTenureYears: number;
  turnoverRateMonthly: string;
}

export interface AttendanceAnalytics {
  totalPunchesRecorded: number;
  onTimeAttendanceRate: string;
  averageWorkHoursPerDay: number;
  lateInExceptionsCount: number;
  earlyOutExceptionsCount: number;
}

export interface LeaveAnalytics {
  totalLeaveRequests: number;
  approvedLeavesCount: number;
  averageDaysTakenPerEmployee: number;
  utilizationByLeaveType: Record<string, number>;
}

export interface WorkforceCost {
  periodMonth: string;
  currency: string;
  grossRemuneration: number;
  employerEpf12: number;
  employerEtf3: number;
  statutoryGratuityProvision: number;
  totalCostOfWorkforce: number;
}

export interface SavedReport {
  id: string;
  ownerUserId: string;
  name: string;
  entityType: string;
  selectedFields: string[];
  filters?: Record<string, any> | null;
  grouping?: string[] | null;
  sorting?: Record<string, 'ASC' | 'DESC'> | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  schedules?: ReportSchedule[];
}

export interface ReportSchedule {
  id: string;
  savedReportId: string;
  cronExpression: string;
  timezone: string;
  deliveryChannel: string;
  recipients: string[];
  outputFormat: string;
  active: boolean;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  savedReport?: SavedReport;
}

export interface AuditEvent {
  id: string;
  actorUserId?: string | null;
  actorType: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  decision?: string | null;
  reason?: string | null;
  beforeData?: Record<string, any> | null;
  afterData?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  occurredAt: string;
  actorUser?: {
    id: string;
    email: string;
  } | null;
}
