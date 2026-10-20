import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import {
  ProbationReview,
  EmployeeMovementRequest,
  EmploymentContract,
  Skill,
  EmployeeSkill,
  EmployeeQualification,
  ApprovalStatus,
} from '../types/lifecycle';
import {
  CreateProbationReviewFormValues,
  SubmitProbationReviewFormValues,
  CreateMovementRequestFormValues,
  CreateContractFormValues,
} from '../schemas/lifecycle.schema';

export const lifecycleKeys = {
  all: ['lifecycle'] as const,
  probations: () => [...lifecycleKeys.all, 'probations'] as const,
  probationList: (params?: Record<string, any>) => [...lifecycleKeys.probations(), params] as const,
  movements: () => [...lifecycleKeys.all, 'movements'] as const,
  movementList: (params?: Record<string, any>) => [...lifecycleKeys.movements(), params] as const,
  contracts: () => [...lifecycleKeys.all, 'contracts'] as const,
  contractList: (params?: Record<string, any>) => [...lifecycleKeys.contracts(), params] as const,
  skills: () => [...lifecycleKeys.all, 'skills'] as const,
};

// ==========================================
// 1. PROBATION REVIEWS
// ==========================================

export function useProbationReviews(params?: { page?: number; limit?: number; employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: lifecycleKeys.probationList(params),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: ProbationReview[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/lifecycle/probation-reviews', { params });
      return data;
    },
  });
}

export function useCreateProbationReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProbationReviewFormValues) => {
      const { data } = await apiClient.post<{ data: ProbationReview }>('/lifecycle/probation-reviews', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lifecycleKeys.probations() });
    },
  });
}

export function useSubmitProbationReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: payload }: { id: string; data: SubmitProbationReviewFormValues }) => {
      const { data } = await apiClient.post<{ data: ProbationReview }>(`/lifecycle/probation-reviews/${id}/submit`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lifecycleKeys.probations() });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// ==========================================
// 2. CAREER MOVEMENTS & PROMOTIONS
// ==========================================

export function useMovements(params?: { page?: number; limit?: number; employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: lifecycleKeys.movementList(params),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: EmployeeMovementRequest[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/lifecycle/movements', { params });
      return data;
    },
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMovementRequestFormValues) => {
      const { data } = await apiClient.post<{ data: EmployeeMovementRequest }>('/lifecycle/movements', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lifecycleKeys.movements() });
    },
  });
}

export function useApproveMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ApprovalStatus; notes?: string }) => {
      const { data } = await apiClient.post<{ data: EmployeeMovementRequest }>(`/lifecycle/movements/${id}/approve`, {
        status,
        notes,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lifecycleKeys.movements() });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// ==========================================
// 3. EMPLOYMENT CONTRACTS
// ==========================================

export function useContracts(params?: { page?: number; limit?: number; employeeId?: string }) {
  return useQuery({
    queryKey: lifecycleKeys.contractList(params),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: EmploymentContract[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/lifecycle/contracts', { params });
      return data;
    },
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateContractFormValues) => {
      const { data } = await apiClient.post<{ data: EmploymentContract }>('/lifecycle/contracts', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lifecycleKeys.contracts() });
    },
  });
}

// ==========================================
// 4. SKILLS & QUALIFICATIONS
// ==========================================

export function useSkills() {
  return useQuery({
    queryKey: lifecycleKeys.skills(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Skill[] }>('/lifecycle/skills');
      return data.data || [];
    },
  });
}

export function useAddSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { employeeId: string; skillId: string; proficiencyLevel?: number; yearsExperience?: number }) => {
      const { data } = await apiClient.post<{ data: EmployeeSkill }>('/lifecycle/skills', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useAddQualification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      qualificationName: string;
      institution?: string;
      fieldOfStudy?: string;
      grade?: string;
    }) => {
      const { data } = await apiClient.post<{ data: EmployeeQualification }>('/lifecycle/qualifications', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
