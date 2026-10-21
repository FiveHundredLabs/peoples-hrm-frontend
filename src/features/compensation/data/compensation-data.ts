import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import {
  CompensationComponent,
  CompensationPlan,
  EmployeeCompensationAssignment,
  CompensationChangeRequest,
  BenefitPlan,
  EmployeeBenefitEnrollment,
} from '../types/compensation';

export const compensationKeys = {
  all: ['compensation'] as const,
  components: () => [...compensationKeys.all, 'components'] as const,
  plans: () => [...compensationKeys.all, 'plans'] as const,
  assignments: (params?: Record<string, any>) => [...compensationKeys.all, 'assignments', params] as const,
  changeRequests: (params?: Record<string, any>) => [...compensationKeys.all, 'changeRequests', params] as const,
  benefits: () => [...compensationKeys.all, 'benefits'] as const,
  enrollments: (params?: Record<string, any>) => [...compensationKeys.all, 'enrollments', params] as const,
};

// ==========================================
// 1. COMPONENTS
// ==========================================

export function useCompensationComponents() {
  return useQuery({
    queryKey: compensationKeys.components(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: CompensationComponent[] }>('/compensation/components');
      return data.data || [];
    },
  });
}

export function useCreateCompensationComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CompensationComponent>) => {
      const { data } = await mockData.create<{ data: CompensationComponent }>('/compensation/components', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
    },
  });
}

// ==========================================
// 2. PLANS
// ==========================================

export function useCompensationPlans() {
  return useQuery({
    queryKey: compensationKeys.plans(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: CompensationPlan[] }>('/compensation/plans');
      return data.data || [];
    },
  });
}

export function useCreateCompensationPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      name: string;
      currency?: string;
      frequency?: string;
      components?: Array<{ componentId: string; defaultAmount?: number; defaultPercentage?: number; sequence?: number }>;
    }) => {
      const { data } = await mockData.create<{ data: CompensationPlan }>('/compensation/plans', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
    },
  });
}

// ==========================================
// 3. EMPLOYEE ASSIGNMENTS
// ==========================================

export function useCompensationAssignments(params?: { employeeId?: string }) {
  return useQuery({
    queryKey: compensationKeys.assignments(params),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: EmployeeCompensationAssignment[] }>('/compensation/assignments', { params });
      return data.data || [];
    },
  });
}

export function useAssignCompensation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      compensationPlanId: string;
      baseSalary: number;
      currency?: string;
      payFrequency?: string;
      effectiveFrom: string;
      reason?: string;
    }) => {
      const { data } = await mockData.create<{ data: EmployeeCompensationAssignment }>('/compensation/assignments', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
    },
  });
}

// ==========================================
// 4. SALARY CHANGE REQUESTS & INCREMENTS
// ==========================================

export function useCompensationChangeRequests(params?: { employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: compensationKeys.changeRequests(params),
    queryFn: async () => {
      const { data } = await mockData.read<{
        data: CompensationChangeRequest[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/compensation/change-requests', { params });
      return data;
    },
  });
}

export function useCreateCompensationChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      proposedSalary: number;
      effectiveDate: string;
      reason: string;
    }) => {
      const { data } = await mockData.create<{ data: CompensationChangeRequest }>('/compensation/change-requests', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
    },
  });
}

export function useApproveCompensationChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mockData.create<{ data: CompensationChangeRequest }>(`/compensation/change-requests/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
    },
  });
}

// ==========================================
// 5. BENEFITS
// ==========================================

export function useBenefitPlans() {
  return useQuery({
    queryKey: compensationKeys.benefits(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: BenefitPlan[] }>('/compensation/benefits');
      return data.data || [];
    },
  });
}

export function useCreateBenefitPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BenefitPlan>) => {
      const { data } = await mockData.create<{ data: BenefitPlan }>('/compensation/benefits', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
    },
  });
}

export function useBenefitEnrollments(params?: { employeeId?: string }) {
  return useQuery({
    queryKey: compensationKeys.enrollments(params),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: EmployeeBenefitEnrollment[] }>('/compensation/benefits/enrollments', { params });
      return data.data || [];
    },
  });
}

export function useEnrollBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      benefitPlanId: string;
      policyNumber?: string;
      coverageAmount?: number;
      startsOn: string;
    }) => {
      const { data } = await mockData.create<{ data: EmployeeBenefitEnrollment }>('/compensation/benefits/enrollments', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all });
    },
  });
}
