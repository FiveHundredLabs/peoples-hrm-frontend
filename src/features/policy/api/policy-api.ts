import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import {
  PolicyDocument,
  PolicyVersion,
  PolicyAcknowledgement,
  HrHelpdeskTicket,
} from '../types/policy';

export const policyKeys = {
  all: ['policies'] as const,
  list: () => [...policyKeys.all, 'list'] as const,
  detail: (id: string) => [...policyKeys.all, 'detail', id] as const,
  acknowledgements: (versionId?: string, employeeId?: string) =>
    [...policyKeys.all, 'acknowledgements', versionId, employeeId] as const,
  tickets: (employeeId?: string, status?: string) =>
    [...policyKeys.all, 'tickets', employeeId, status] as const,
  ticketDetail: (id: string) => [...policyKeys.all, 'ticket', id] as const,
};

// 1. Policy Documents & Versions
export function usePolicyDocuments() {
  return useQuery({
    queryKey: policyKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PolicyDocument[] }>('/policies');
      return data.data || [];
    },
  });
}

export function usePolicyDocumentDetail(id: string) {
  return useQuery({
    queryKey: policyKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PolicyDocument }>(`/policies/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreatePolicyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; title: string; category?: string }) => {
      const { data } = await apiClient.post<{ data: PolicyDocument }>('/policies', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.all });
    },
  });
}

export function usePublishPolicyVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      policyDocumentId: string;
      versionNo: number;
      effectiveFrom: string;
      effectiveTo?: string;
      acknowledgementRequired?: boolean;
    }) => {
      const { data } = await apiClient.post<{ data: PolicyVersion }>('/policies/versions', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.all });
    },
  });
}

// 2. Digital Acknowledgements
export function usePolicyAcknowledgements(versionId?: string, employeeId?: string) {
  return useQuery({
    queryKey: policyKeys.acknowledgements(versionId, employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PolicyAcknowledgement[] }>('/policies/acknowledgements/list', {
        params: { policyVersionId: versionId, employeeId },
      });
      return data.data || [];
    },
  });
}

export function useAcknowledgePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { policyVersionId: string; employeeId: string }) => {
      const { data } = await apiClient.post<{ data: PolicyAcknowledgement }>('/policies/acknowledge', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.all });
    },
  });
}

// 3. HR Helpdesk
export function useHelpdeskTickets(employeeId?: string, status?: string) {
  return useQuery({
    queryKey: policyKeys.tickets(employeeId, status),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: HrHelpdeskTicket[] }>('/policies/helpdesk/tickets', {
        params: { employeeId, status },
      });
      return data.data || [];
    },
  });
}

export function useCreateHelpdeskTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      ticketNumber: string;
      category: string;
      subject: string;
      description: string;
      priority?: string;
    }) => {
      const { data } = await apiClient.post<{ data: HrHelpdeskTicket }>('/policies/helpdesk/tickets', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.all });
    },
  });
}

export function useAddHelpdeskMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { ticketId: string; body: string; internalNote?: boolean }) => {
      const { data } = await apiClient.post('/policies/helpdesk/messages', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.all });
    },
  });
}
