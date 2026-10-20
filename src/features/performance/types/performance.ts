export interface RatingScale {
  id: string;
  code: string;
  name: string;
  minValue: number;
  maxValue: number;
  labels?: Record<string, string> | null;
}

export interface PerformanceCycle {
  id: string;
  code: string;
  name: string;
  startsOn: string;
  endsOn: string;
  selfReviewEnabled: boolean;
  peerReviewEnabled: boolean;
  managerReviewEnabled: boolean;
  calibrationEnabled: boolean;
  status: string;
  goals?: Goal[];
  reviews?: PerformanceReview[];
}

export interface GoalProgress {
  id: string;
  goalId: string;
  progressValue?: number | null;
  progressPercent?: number | null;
  comments?: string | null;
  recordedAt: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  performanceCycleId?: string | null;
  parentGoalId?: string | null;
  title: string;
  description?: string | null;
  goalType: string;
  weight?: number | null;
  targetValue?: number | null;
  unit?: string | null;
  startsOn?: string | null;
  dueOn?: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  employee?: { id: string; displayName: string; employeeNumber: string };
  performanceCycle?: PerformanceCycle;
  progressUpdates?: GoalProgress[];
}

export interface ReviewQuestion {
  id: string;
  reviewSectionId: string;
  prompt: string;
  responseType: string;
  weight?: number | null;
  required: boolean;
  sequence: number;
}

export interface ReviewSection {
  id: string;
  reviewTemplateId: string;
  title: string;
  weight?: number | null;
  sequence: number;
  questions?: ReviewQuestion[];
}

export interface ReviewTemplate {
  id: string;
  code: string;
  name: string;
  ratingScaleId?: string | null;
  active: boolean;
  ratingScale?: RatingScale;
  sections?: ReviewSection[];
}

export interface PerformanceReviewAnswer {
  id: string;
  performanceReviewRaterId: string;
  reviewQuestionId: string;
  numericAnswer?: number | null;
  textAnswer?: string | null;
  score?: number | null;
  question?: ReviewQuestion;
}

export interface PerformanceReviewRater {
  id: string;
  performanceReviewId: string;
  raterEmployeeId: string;
  raterType: string;
  submittedAt?: string | null;
  overallScore?: number | null;
  raterEmployee?: { id: string; displayName: string };
  answers?: PerformanceReviewAnswer[];
}

export interface PerformanceReview {
  id: string;
  performanceCycleId: string;
  employeeId: string;
  reviewTemplateId: string;
  managerEmployeeId?: string | null;
  status: 'draft' | 'open' | 'submitted' | 'calibrated' | 'finalized' | 'cancelled';
  overallScore?: number | null;
  calibratedScore?: number | null;
  finalRating?: string | null;
  openedAt?: string | null;
  submittedAt?: string | null;
  finalizedAt?: string | null;
  employee?: { id: string; displayName: string; employeeNumber: string };
  performanceCycle?: PerformanceCycle;
  reviewTemplate?: ReviewTemplate;
  raters?: PerformanceReviewRater[];
}
