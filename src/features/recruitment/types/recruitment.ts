export interface JobRequisition {
  id: string;
  headcountRequestId?: string | null;
  legalEntityId: string;
  positionId?: string | null;
  jobId: string;
  departmentId?: string | null;
  branchId?: string | null;
  hiringManagerEmployeeId?: string | null;
  recruiterEmployeeId?: string | null;
  openings: number;
  targetHireDate?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency: string;
  status: 'draft' | 'open' | 'on_hold' | 'closed' | 'cancelled' | 'filled';
  approvedAt?: string | null;
  createdAt: string;
  job?: { id: string; title: string; code: string };
  department?: { id: string; name: string };
  branch?: { id: string; name: string };
  hiringManager?: { id: string; displayName: string };
  recruiter?: { id: string; displayName: string };
  applications?: Application[];
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  currentTitle?: string | null;
  currentCompany?: string | null;
  noticePeriodDays?: number | null;
  expectedSalary?: number | null;
  currency: string;
  source?: string | null;
  sourceDetail?: string | null;
  consentToProcess: boolean;
  consentedAt?: string | null;
  createdAt: string;
  applications?: Application[];
}

export interface Application {
  id: string;
  candidateId: string;
  requisitionId: string;
  jobPostingId?: string | null;
  status: 'applied' | 'screening' | 'shortlisted' | 'interview' | 'assessment' | 'reference_check' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  appliedAt: string;
  currentStage?: string | null;
  rejectionReason?: string | null;
  rating?: number | null;
  hiredEmployeeId?: string | null;
  candidate?: Candidate;
  requisition?: JobRequisition;
  interviews?: Interview[];
  offers?: Offer[];
}

export interface InterviewPanelMember {
  id: string;
  interviewId: string;
  employeeId?: string | null;
  externalName?: string | null;
  externalEmail?: string | null;
  role?: string | null;
  employee?: { id: string; displayName: string };
}

export interface InterviewScorecard {
  id: string;
  interviewId: string;
  panelMemberId: string;
  recommendation?: string | null;
  overallScore?: number | null;
  submittedAt?: string | null;
  comments?: string | null;
  entries?: Array<{
    id: string;
    criterion: string;
    weight?: number | null;
    score?: number | null;
    comments?: string | null;
  }>;
}

export interface Interview {
  id: string;
  applicationId: string;
  interviewType: string;
  scheduledStart: string;
  scheduledEnd: string;
  locationOrLink?: string | null;
  status: string;
  notes?: string | null;
  application?: Application;
  panelMembers?: InterviewPanelMember[];
  scorecards?: InterviewScorecard[];
}

export interface OfferComponent {
  id: string;
  offerId: string;
  label: string;
  amount?: number | null;
  percentage?: number | null;
}

export interface Offer {
  id: string;
  applicationId: string;
  proposedPositionId?: string | null;
  proposedGradeId?: string | null;
  proposedJoinDate?: string | null;
  baseSalary?: number | null;
  currency: string;
  status: 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'declined' | 'expired' | 'withdrawn';
  expiresAt?: string | null;
  sentAt?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  application?: Application;
  components?: OfferComponent[];
}

export interface OnboardingTask {
  id: string;
  onboardingCaseId: string;
  templateTaskId?: string | null;
  title: string;
  dueDate?: string | null;
  status: string;
  completedAt?: string | null;
  notes?: string | null;
}

export interface OnboardingCase {
  id: string;
  employeeId: string;
  templateId?: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  targetCompletionDate?: string | null;
  completedAt?: string | null;
  employee?: { id: string; displayName: string; employeeNumber: string };
  template?: { id: string; name: string };
  tasks?: OnboardingTask[];
}
