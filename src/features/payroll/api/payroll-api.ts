import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import {
  PayrollRun,
  Payslip,
  PayrollBankBatch,
  StatutoryRuleSet,
  TaxTable,
} from '../types/payroll';

export const payrollKeys = {
  all: ['payroll'] as const,
  runs: (params?: Record<string, any>) => [...payrollKeys.all, 'runs', params] as const,
  runDetail: (id: string) => [...payrollKeys.all, 'runDetail', id] as const,
  payslips: (employeeId?: string) => [...payrollKeys.all, 'payslips', employeeId] as const,
  bankBatches: () => [...payrollKeys.all, 'bankBatches'] as const,
  statutoryRules: () => [...payrollKeys.all, 'statutoryRules'] as const,
};

// 1. Runs
export function usePayrollRuns(params?: { status?: string; legalEntityId?: string }) {
  return useQuery({
    queryKey: payrollKeys.runs(params),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: PayrollRun[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/payroll/runs', { params });
      return data;
    },
  });
}

export function usePayrollRunDetail(id: string) {
  return useQuery({
    queryKey: payrollKeys.runDetail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PayrollRun }>(`/payroll/runs/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      legalEntityId: string;
      payGroupId: string;
      periodStart: string;
      periodEnd: string;
      payDate: string;
    }) => {
      const { data } = await apiClient.post<{ data: PayrollRun }>('/payroll/runs', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
    },
  });
}

export function useCalculatePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: PayrollRun }>(`/payroll/runs/${id}/calculate`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.runDetail(id) });
    },
  });
}

export function useApproveHrPayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: PayrollRun }>(`/payroll/runs/${id}/approve-hr`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.runDetail(id) });
    },
  });
}

export function useApproveFinancePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: PayrollRun }>(`/payroll/runs/${id}/approve-finance`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.runDetail(id) });
    },
  });
}

export function useFinalizePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: PayrollRun }>(`/payroll/runs/${id}/finalize`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.runDetail(id) });
      queryClient.invalidateQueries({ queryKey: payrollKeys.payslips() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.bankBatches() });
    },
  });
}

// 2. Payslips
export function usePayslips(employeeId?: string) {
  return useQuery({
    queryKey: payrollKeys.payslips(employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Payslip[] }>('/payroll/payslips', {
        params: { employeeId },
      });
      return data.data || [];
    },
  });
}

// 3. Bank Batches
export function usePayrollBankBatches() {
  return useQuery({
    queryKey: payrollKeys.bankBatches(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PayrollBankBatch[] }>('/payroll/bank-batches');
      return data.data || [];
    },
  });
}

// 4. Statutory Rules
export function useStatutoryRules() {
  return useQuery({
    queryKey: payrollKeys.statutoryRules(),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: { ruleSets: StatutoryRuleSet[]; taxTables: TaxTable[] };
      }>('/payroll/statutory-rules');
      return data.data;
    },
  });
}
