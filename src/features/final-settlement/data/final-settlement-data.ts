import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import {
  FinalSettlement,
  OffboardingCase,
  GratuityCalculation,
} from '../types/final-settlement';

export const settlementKeys = {
  all: ['settlements'] as const,
  list: (params?: Record<string, any>) => [...settlementKeys.all, 'list', params] as const,
  detail: (id: string) => [...settlementKeys.all, 'detail', id] as const,
  offboarding: () => [...settlementKeys.all, 'offboarding'] as const,
};

// 1. Settlements
export function useFinalSettlements(params?: { status?: string; employeeId?: string }) {
  return useQuery({
    queryKey: settlementKeys.list(params),
    queryFn: async () => {
      const { data } = await mockData.read<{
        data: FinalSettlement[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/settlements', { params });
      return data;
    },
  });
}

export function useFinalSettlementDetail(id: string) {
  return useQuery({
    queryKey: settlementKeys.detail(id),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: FinalSettlement }>(`/settlements/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateFinalSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      lastWorkingDate: string;
      unpaidDaysWorked?: number;
      unpaidOvertimeHours?: number;
      otherDeductions?: number;
      notes?: string;
    }) => {
      const { data } = await mockData.create<{ data: FinalSettlement }>('/settlements', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
    },
  });
}

export function useApproveFinalSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mockData.create<{ data: FinalSettlement }>(`/settlements/${id}/approve`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
      queryClient.invalidateQueries({ queryKey: settlementKeys.detail(id) });
    },
  });
}

export function useFinalizeFinalSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mockData.create<{ data: FinalSettlement }>(`/settlements/${id}/finalize`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
      queryClient.invalidateQueries({ queryKey: settlementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
    },
  });
}

export function useCalculateGratuity() {
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      lastWorkingDate?: string;
      overrideBasicSalary?: number;
    }) => {
      const { data } = await mockData.create<{
        data: GratuityCalculation;
      }>('/settlements/calculate-gratuity', payload);
      return data.data;
    },
  });
}

// 2. Offboarding Cases
export function useOffboardingCases() {
  return useQuery({
    queryKey: settlementKeys.offboarding(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: OffboardingCase[] }>('/offboarding/cases');
      return data.data || [];
    },
  });
}

export function useCreateOffboardingCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      separationType: string;
      resignationReceivedAt?: string;
      lastWorkingDate: string;
      reason?: string;
    }) => {
      const { data } = await mockData.create<{ data: OffboardingCase }>('/offboarding/cases', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
    },
  });
}

export function useUpdateOffboardingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status, notes }: { taskId: string; status: string; notes?: string }) => {
      const { data } = await mockData.create<{ data: any }>(`/offboarding/tasks/${taskId}`, { status, notes });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
    },
  });
}
