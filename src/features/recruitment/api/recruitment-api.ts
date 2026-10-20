import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import {
  JobRequisition,
  Candidate,
  Application,
  Interview,
  InterviewScorecard,
  Offer,
  OnboardingCase,
  OnboardingTask,
} from '../types/recruitment';

export const recruitmentKeys = {
  all: ['recruitment'] as const,
  requisitions: () => [...recruitmentKeys.all, 'requisitions'] as const,
  candidates: () => [...recruitmentKeys.all, 'candidates'] as const,
  applications: (reqId?: string) => [...recruitmentKeys.all, 'applications', reqId] as const,
  interviews: () => [...recruitmentKeys.all, 'interviews'] as const,
  offers: () => [...recruitmentKeys.all, 'offers'] as const,
  onboardingCases: () => [...recruitmentKeys.all, 'onboarding-cases'] as const,
};

// 1. Requisitions
export function useJobRequisitions() {
  return useQuery({
    queryKey: recruitmentKeys.requisitions(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: JobRequisition[] }>('/recruitment/requisitions');
      return data.data || [];
    },
  });
}

export function useCreateJobRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      legalEntityId: string;
      jobId: string;
      departmentId?: string;
      openings?: number;
      minSalary?: number;
      maxSalary?: number;
      targetHireDate?: string;
    }) => {
      const { data } = await apiClient.post<{ data: JobRequisition }>('/recruitment/requisitions', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.requisitions() });
    },
  });
}

// 2. Candidates
export function useCandidates() {
  return useQuery({
    queryKey: recruitmentKeys.candidates(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Candidate[] }>('/recruitment/candidates');
      return data.data || [];
    },
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName?: string;
      email?: string;
      phone?: string;
      currentTitle?: string;
      currentCompany?: string;
      expectedSalary?: number;
      noticePeriodDays?: number;
      source?: string;
    }) => {
      const { data } = await apiClient.post<{ data: Candidate }>('/recruitment/candidates', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
    },
  });
}

// 3. Applications & Stage Pipeline
export function useApplications(requisitionId?: string) {
  return useQuery({
    queryKey: recruitmentKeys.applications(requisitionId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Application[] }>('/recruitment/applications', {
        params: { requisitionId },
      });
      return data.data || [];
    },
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { candidateId: string; requisitionId: string; currentStage?: string }) => {
      const { data } = await apiClient.post<{ data: Application }>('/recruitment/applications', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
    },
  });
}

export function useAdvanceApplicationStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      toStatus,
      stageName,
      notes,
    }: {
      id: string;
      toStatus: string;
      stageName?: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.patch<{ data: Application }>(`/recruitment/applications/${id}/stage`, {
        toStatus,
        stageName,
        notes,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
    },
  });
}

// 4. Interviews & Scorecards
export function useInterviews() {
  return useQuery({
    queryKey: recruitmentKeys.interviews(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Interview[] }>('/recruitment/interviews');
      return data.data || [];
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      applicationId: string;
      interviewType: string;
      scheduledStart: string;
      scheduledEnd: string;
      locationOrLink?: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.post<{ data: Interview }>('/recruitment/interviews', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.interviews() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
    },
  });
}

export function useSubmitScorecard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      interviewId,
      panelMemberId,
      recommendation,
      overallScore,
      comments,
    }: {
      interviewId: string;
      panelMemberId: string;
      recommendation: string;
      overallScore: number;
      comments?: string;
    }) => {
      const { data } = await apiClient.post<{ data: InterviewScorecard }>(
        `/recruitment/interviews/${interviewId}/scorecards`,
        {
          panelMemberId,
          recommendation,
          overallScore,
          comments,
        },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.interviews() });
    },
  });
}

// 5. Job Offers
export function useOffers() {
  return useQuery({
    queryKey: recruitmentKeys.offers(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Offer[] }>('/recruitment/offers');
      return data.data || [];
    },
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      applicationId: string;
      proposedJoinDate?: string;
      baseSalary: number;
      currency?: string;
      components?: Array<{ label: string; amount: number }>;
    }) => {
      const { data } = await apiClient.post<{ data: Offer }>('/recruitment/offers', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.offers() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ offerId, confirmedJoinDate }: { offerId: string; confirmedJoinDate?: string }) => {
      const { data } = await apiClient.post<{ data: { offer: Offer } }>(`/recruitment/offers/${offerId}/accept`, {
        confirmedJoinDate,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.offers() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.onboardingCases() });
    },
  });
}

// 6. Onboarding Cases
export function useOnboardingCases() {
  return useQuery({
    queryKey: recruitmentKeys.onboardingCases(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: OnboardingCase[] }>('/recruitment/onboarding/cases');
      return data.data || [];
    },
  });
}

export function useUpdateOnboardingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status, notes }: { taskId: string; status: string; notes?: string }) => {
      const { data } = await apiClient.patch<{ data: OnboardingTask }>(`/recruitment/onboarding/tasks/${taskId}`, {
        status,
        notes,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.onboardingCases() });
    },
  });
}
