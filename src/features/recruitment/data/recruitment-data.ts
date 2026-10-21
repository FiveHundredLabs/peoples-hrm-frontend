import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
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
      const { data } = await mockData.read<{ data: JobRequisition[] }>('/recruitment/requisitions');
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
      const { data } = await mockData.create<{ data: JobRequisition }>('/recruitment/requisitions', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

// 2. Candidates
export function useCandidates() {
  return useQuery({
    queryKey: recruitmentKeys.candidates(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: Candidate[] }>('/recruitment/candidates');
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
      const { data } = await mockData.create<{ data: Candidate }>('/recruitment/candidates', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

// 3. Applications & Stage Pipeline
export function useApplications(requisitionId?: string) {
  return useQuery({
    queryKey: recruitmentKeys.applications(requisitionId),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: Application[] }>('/recruitment/applications', {
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
      const { data } = await mockData.create<{ data: Application }>('/recruitment/applications', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
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
      const { data } = await mockData.update<{ data: Application }>(`/recruitment/applications/${id}/stage`, {
        toStatus,
        stageName,
        notes,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

// 4. Interviews & Scorecards
export function useInterviews() {
  return useQuery({
    queryKey: recruitmentKeys.interviews(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: Interview[] }>('/recruitment/interviews');
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
      const { data } = await mockData.create<{ data: Interview }>('/recruitment/interviews', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
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
      const { data } = await mockData.create<{ data: InterviewScorecard }>(
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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

// 5. Job Offers
export function useOffers() {
  return useQuery({
    queryKey: recruitmentKeys.offers(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: Offer[] }>('/recruitment/offers');
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
      const { data } = await mockData.create<{ data: Offer }>('/recruitment/offers', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ offerId, confirmedJoinDate }: { offerId: string; confirmedJoinDate?: string }) => {
      const { data } = await mockData.create<{ data: { offer: Offer } }>(`/recruitment/offers/${offerId}/accept`, {
        confirmedJoinDate,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

// 6. Onboarding Cases
export function useOnboardingCases() {
  return useQuery({
    queryKey: recruitmentKeys.onboardingCases(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: OnboardingCase[] }>('/recruitment/onboarding/cases');
      return data.data || [];
    },
  });
}

export function useUpdateOnboardingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status, notes }: { taskId: string; status: string; notes?: string }) => {
      const { data } = await mockData.update<{ data: OnboardingTask }>(`/recruitment/onboarding/tasks/${taskId}`, {
        status,
        notes,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}
