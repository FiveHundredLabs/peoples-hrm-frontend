import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import { Course, TrainingSession, LearningAssignment } from '../types/learning';

export const learningKeys = {
  all: ['learning'] as const,
  courses: (category?: string, mandatory?: boolean) => [...learningKeys.all, 'courses', category, mandatory] as const,
  sessions: (courseId?: string) => [...learningKeys.all, 'sessions', courseId] as const,
  assignments: (empId?: string, courseId?: string, status?: string) =>
    [...learningKeys.all, 'assignments', empId, courseId, status] as const,
};

// 1. Courses
export function useCourses(category?: string, mandatory?: boolean) {
  return useQuery({
    queryKey: learningKeys.courses(category, mandatory),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: Course[] }>('/learning/courses', {
        params: { category, mandatory },
      });
      return data.data || [];
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      title: string;
      description?: string;
      provider?: string;
      category?: string;
      mandatory?: boolean;
      validityMonths?: number;
    }) => {
      const { data } = await mockData.create<{ data: Course }>('/learning/courses', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
    },
  });
}

// 2. Training Sessions
export function useTrainingSessions(courseId?: string) {
  return useQuery({
    queryKey: learningKeys.sessions(courseId),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: TrainingSession[] }>('/learning/sessions', {
        params: { courseId },
      });
      return data.data || [];
    },
  });
}

export function useCreateTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      courseId: string;
      startsAt: string;
      endsAt: string;
      locationOrLink?: string;
      trainerName?: string;
      capacity?: number;
      cost?: number;
      currency?: string;
    }) => {
      const { data } = await mockData.create<{ data: TrainingSession }>('/learning/sessions', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
    },
  });
}

// 3. Learning Assignments
export function useLearningAssignments(employeeId?: string, courseId?: string, status?: string) {
  return useQuery({
    queryKey: learningKeys.assignments(employeeId, courseId, status),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: LearningAssignment[] }>('/learning/assignments', {
        params: { employeeId, courseId, status },
      });
      return data.data || [];
    },
  });
}

export function useAssignCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      courseId: string;
      trainingSessionId?: string;
      assignedOn?: string;
      dueOn?: string;
    }) => {
      const { data } = await mockData.create<{ data: LearningAssignment }>('/learning/assignments', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
    },
  });
}

export function useCompleteLearningAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      completionDate,
      score,
      expiresOn,
    }: {
      id: string;
      completionDate?: string;
      score?: number;
      expiresOn?: string;
    }) => {
      const { data } = await mockData.create<{ data: LearningAssignment }>(`/learning/assignments/${id}/complete`, {
        completionDate,
        score,
        expiresOn,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
    },
  });
}
