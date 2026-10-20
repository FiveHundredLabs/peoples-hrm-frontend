import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import {
  LeaveType,
  LeaveEntitlement,
  LeaveRequest,
  LeaveBalanceLedger,
  LeaveRequestStatus,
  DayPart,
} from '../types/leave';

export const leaveKeys = {
  all: ['leave'] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  entitlements: (params?: Record<string, any>) => [...leaveKeys.all, 'entitlements', params] as const,
  requests: (params?: Record<string, any>) => [...leaveKeys.all, 'requests', params] as const,
  ledger: (params?: Record<string, any>) => [...leaveKeys.all, 'ledger', params] as const,
};

// ==========================================
// 1. LEAVE TYPES
// ==========================================

export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: LeaveType[] }>('/leave/types');
      return data.data || [];
    },
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      name: string;
      category: string;
      paid?: boolean;
      statutory?: boolean;
      allowHalfDay?: boolean;
    }) => {
      const { data } = await apiClient.post<{ data: LeaveType }>('/leave/types', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types() });
    },
  });
}

// ==========================================
// 2. ENTITLEMENTS & BALANCES
// ==========================================

export function useEntitlements(params?: { employeeId?: string; leaveYear?: number; leaveTypeId?: string }) {
  return useQuery({
    queryKey: leaveKeys.entitlements(params),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: LeaveEntitlement[] }>('/leave/entitlements', { params });
      return data.data || [];
    },
  });
}

export function useAllocateEntitlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      leaveTypeId: string;
      leaveYear: number;
      allocated: number;
      openingBalance?: number;
    }) => {
      const { data } = await apiClient.post<{ data: LeaveEntitlement }>('/leave/entitlements/allocate', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.entitlements() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.ledger() });
    },
  });
}

// ==========================================
// 3. LEAVE REQUESTS & APPROVALS
// ==========================================

export function useLeaveRequests(params?: {
  page?: number;
  limit?: number;
  employeeId?: string;
  leaveTypeId?: string;
  status?: LeaveRequestStatus;
}) {
  return useQuery({
    queryKey: leaveKeys.requests(params),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: LeaveRequest[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/leave/requests', { params });
      return data;
    },
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      leaveTypeId: string;
      startsAt: string;
      endsAt: string;
      requestedQuantity: number;
      dayPart?: DayPart;
      reason?: string;
    }) => {
      const { data } = await apiClient.post<{ data: LeaveRequest }>('/leave/requests', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.entitlements() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.ledger() });
    },
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<{ data: LeaveRequest }>(`/leave/requests/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.entitlements() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.ledger() });
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await apiClient.post<{ data: LeaveRequest }>(`/leave/requests/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.entitlements() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.ledger() });
    },
  });
}

// ==========================================
// 4. BALANCE LEDGER
// ==========================================

export function useLeaveLedger(params?: { employeeId?: string }) {
  return useQuery({
    queryKey: leaveKeys.ledger(params),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: LeaveBalanceLedger[] }>('/leave/ledger', { params });
      return data.data || [];
    },
  });
}
