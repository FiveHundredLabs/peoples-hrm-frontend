import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import {
  LoanType,
  EmployeeLoan,
  SalaryAdvance,
  ExpensePolicy,
  ExpenseClaim,
} from '../types/expenses-and-loans';

export const expensesLoansKeys = {
  all: ['expenses-loans'] as const,
  loanTypes: () => [...expensesLoansKeys.all, 'loanTypes'] as const,
  loans: (params?: Record<string, any>) => [...expensesLoansKeys.all, 'loans', params] as const,
  loanDetail: (id: string) => [...expensesLoansKeys.all, 'loanDetail', id] as const,
  advances: (employeeId?: string) => [...expensesLoansKeys.all, 'advances', employeeId] as const,
  expensePolicies: () => [...expensesLoansKeys.all, 'expensePolicies'] as const,
  expenseClaims: (params?: Record<string, any>) => [...expensesLoansKeys.all, 'expenseClaims', params] as const,
  expenseClaimDetail: (id: string) => [...expensesLoansKeys.all, 'expenseClaimDetail', id] as const,
};

// ==========================================
// 1. STAFF LOANS
// ==========================================

export function useLoanTypes() {
  return useQuery({
    queryKey: expensesLoansKeys.loanTypes(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: LoanType[] }>('/loans/types');
      return data.data || [];
    },
  });
}

export function useEmployeeLoans(params?: { status?: string; employeeId?: string }) {
  return useQuery({
    queryKey: expensesLoansKeys.loans(params),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: EmployeeLoan[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/loans', { params });
      return data;
    },
  });
}

export function useEmployeeLoanDetail(id: string) {
  return useQuery({
    queryKey: expensesLoansKeys.loanDetail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: EmployeeLoan }>(`/loans/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateLoanRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      loanTypeId: string;
      principalAmount: number;
      termMonths: number;
      startsOn?: string;
    }) => {
      const { data } = await apiClient.post<{ data: EmployeeLoan }>('/loans', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.loans() });
    },
  });
}

export function useApproveLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approvedAmount, startsOn }: { id: string; approvedAmount?: number; startsOn?: string }) => {
      const { data } = await apiClient.post<{ data: EmployeeLoan }>(`/loans/${id}/approve`, { approvedAmount, startsOn });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.loans() });
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.loanDetail(variables.id) });
    },
  });
}

export function useRejectLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: EmployeeLoan }>(`/loans/${id}/reject`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.loans() });
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.loanDetail(id) });
    },
  });
}

// ==========================================
// 2. SALARY ADVANCES
// ==========================================

export function useSalaryAdvances(employeeId?: string) {
  return useQuery({
    queryKey: expensesLoansKeys.advances(employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: SalaryAdvance[] }>('/loans/advances/all', {
        params: { employeeId },
      });
      return data.data || [];
    },
  });
}

export function useCreateSalaryAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      amount: number;
      requestedOn: string;
      deductionPayDate: string;
      reason?: string;
    }) => {
      const { data } = await apiClient.post<{ data: SalaryAdvance }>('/loans/advances', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.advances() });
    },
  });
}

export function useApproveSalaryAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: SalaryAdvance }>(`/loans/advances/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.advances() });
    },
  });
}

export function useRejectSalaryAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: SalaryAdvance }>(`/loans/advances/${id}/reject`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.advances() });
    },
  });
}

// ==========================================
// 3. EXPENSES & CLAIMS
// ==========================================

export function useExpensePolicies() {
  return useQuery({
    queryKey: expensesLoansKeys.expensePolicies(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ExpensePolicy[] }>('/expenses/policies');
      return data.data || [];
    },
  });
}

export function useExpenseClaims(params?: { status?: string; employeeId?: string }) {
  return useQuery({
    queryKey: expensesLoansKeys.expenseClaims(params),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: ExpenseClaim[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/expenses/claims', { params });
      return data;
    },
  });
}

export function useExpenseClaimDetail(id: string) {
  return useQuery({
    queryKey: expensesLoansKeys.expenseClaimDetail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ExpenseClaim }>(`/expenses/claims/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateExpenseClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      currency?: string;
      items: Array<{
        expenseDate: string;
        category: string;
        merchant?: string;
        description?: string;
        amount: number;
      }>;
    }) => {
      const { data } = await apiClient.post<{ data: ExpenseClaim }>('/expenses/claims', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.expenseClaims() });
    },
  });
}

export function useApproveExpenseClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approvedAmount }: { id: string; approvedAmount?: number }) => {
      const { data } = await apiClient.post<{ data: ExpenseClaim }>(`/expenses/claims/${id}/approve`, { approvedAmount });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.expenseClaims() });
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.expenseClaimDetail(variables.id) });
    },
  });
}

export function useRejectExpenseClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: ExpenseClaim }>(`/expenses/claims/${id}/reject`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.expenseClaims() });
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.expenseClaimDetail(id) });
    },
  });
}

export function useReimburseExpenseClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: ExpenseClaim }>(`/expenses/claims/${id}/reimburse`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.expenseClaims() });
      queryClient.invalidateQueries({ queryKey: expensesLoansKeys.expenseClaimDetail(id) });
    },
  });
}
