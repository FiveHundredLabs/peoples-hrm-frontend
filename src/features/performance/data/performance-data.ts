import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import {
  RatingScale,
  PerformanceCycle,
  Goal,
  GoalProgress,
  ReviewTemplate,
  PerformanceReview,
  PerformanceReviewRater,
} from '../types/performance';

export const performanceKeys = {
  all: ['performance'] as const,
  cycles: () => [...performanceKeys.all, 'cycles'] as const,
  ratingScales: () => [...performanceKeys.all, 'rating-scales'] as const,
  goals: (empId?: string, cycleId?: string) => [...performanceKeys.all, 'goals', empId, cycleId] as const,
  templates: () => [...performanceKeys.all, 'templates'] as const,
  reviews: (cycleId?: string) => [...performanceKeys.all, 'reviews', cycleId] as const,
};

// 1. Cycles & Scales
export function usePerformanceCycles() {
  return useQuery({
    queryKey: performanceKeys.cycles(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: PerformanceCycle[] }>('/performance/cycles');
      return data.data || [];
    },
  });
}

export function useCreatePerformanceCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      name: string;
      startsOn: string;
      endsOn: string;
      selfReviewEnabled?: boolean;
      peerReviewEnabled?: boolean;
      managerReviewEnabled?: boolean;
      calibrationEnabled?: boolean;
    }) => {
      const { data } = await mockData.create<{ data: PerformanceCycle }>('/performance/cycles', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
}

export function useRatingScales() {
  return useQuery({
    queryKey: performanceKeys.ratingScales(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: RatingScale[] }>('/performance/rating-scales');
      return data.data || [];
    },
  });
}

// 2. Goals & Progress
export function useGoals(employeeId?: string, cycleId?: string) {
  return useQuery({
    queryKey: performanceKeys.goals(employeeId, cycleId),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: Goal[] }>('/performance/goals', {
        params: { employeeId, cycleId },
      });
      return data.data || [];
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      performanceCycleId?: string;
      title: string;
      description?: string;
      goalType?: string;
      weight?: number;
      targetValue?: number;
      unit?: string;
      startsOn?: string;
      dueOn?: string;
    }) => {
      const { data } = await mockData.create<{ data: Goal }>('/performance/goals', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
}

export function useLogGoalProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      progressValue,
      progressPercent,
      comments,
    }: {
      goalId: string;
      progressValue?: number;
      progressPercent: number;
      comments?: string;
    }) => {
      const { data } = await mockData.create<{ data: GoalProgress }>(`/performance/goals/${goalId}/progress`, {
        progressValue,
        progressPercent,
        comments,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
}

// 3. Review Templates
export function useReviewTemplates() {
  return useQuery({
    queryKey: performanceKeys.templates(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: ReviewTemplate[] }>('/performance/templates');
      return data.data || [];
    },
  });
}

export function useCreateReviewTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      name: string;
      ratingScaleId?: string;
      sections?: Array<{
        title: string;
        weight: number;
        sequence: number;
        questions?: Array<{
          prompt: string;
          responseType: string;
          weight: number;
          sequence: number;
        }>;
      }>;
    }) => {
      const { data } = await mockData.create<{ data: ReviewTemplate }>('/performance/templates', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
}

// 4. Performance Reviews & Evaluations
export function usePerformanceReviews(cycleId?: string) {
  return useQuery({
    queryKey: performanceKeys.reviews(cycleId),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: PerformanceReview[] }>('/performance/reviews', {
        params: { cycleId },
      });
      return data.data || [];
    },
  });
}

export function useSubmitRaterReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      performanceReviewId: string;
      raterEmployeeId: string;
      raterType: string;
      answers: Array<{ reviewQuestionId: string; score: number; textAnswer?: string }>;
    }) => {
      const { data } = await mockData.create<{ data: PerformanceReviewRater }>('/performance/reviews/submit-rater', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
}

export function useCalibrateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewId,
      calibratedScore,
      finalRating,
    }: {
      reviewId: string;
      calibratedScore: number;
      finalRating: string;
    }) => {
      const { data } = await mockData.create<{ data: PerformanceReview }>(`/performance/reviews/${reviewId}/calibrate`, {
        calibratedScore,
        finalRating,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
}
