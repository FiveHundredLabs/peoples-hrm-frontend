export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  provider?: string | null;
  category?: string | null;
  mandatory: boolean;
  validityMonths?: number | null;
  active: boolean;
  trainingSessions?: TrainingSession[];
  assignments?: LearningAssignment[];
}

export interface TrainingSession {
  id: string;
  courseId: string;
  startsAt: string;
  endsAt: string;
  locationOrLink?: string | null;
  trainerName?: string | null;
  capacity?: number | null;
  cost?: number | null;
  currency: string;
  status: string;
  course?: Course;
  assignments?: LearningAssignment[];
}

export interface LearningAssignment {
  id: string;
  employeeId: string;
  courseId: string;
  trainingSessionId?: string | null;
  assignedOn: string;
  dueOn?: string | null;
  status: 'assigned' | 'in_progress' | 'completed' | 'expired' | 'overdue';
  completionDate?: string | null;
  score?: number | null;
  certificateFileId?: string | null;
  expiresOn?: string | null;
  employee?: { id: string; displayName: string; employeeNumber: string };
  course?: Course;
  trainingSession?: TrainingSession;
}
