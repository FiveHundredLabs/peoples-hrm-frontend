import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import { HelpdeskTicket, HelpdeskMessage } from '../types/helpdesk';

export const helpdeskKeys = {
  all: ['helpdesk'] as const,
  tickets: (employeeId?: string, status?: string, category?: string) =>
    [...helpdeskKeys.all, 'tickets', employeeId, status, category] as const,
  ticketDetail: (id: string) => [...helpdeskKeys.all, 'ticket', id] as const,
};

export function useHelpdeskTickets(employeeId?: string, status?: string, category?: string) {
  return useQuery({
    queryKey: helpdeskKeys.tickets(employeeId, status, category),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: HelpdeskTicket[] }>('/helpdesk/tickets', {
        params: { employeeId, status, category },
      });
      return data.data || [];
    },
  });
}

export function useHelpdeskTicketDetail(id: string) {
  return useQuery({
    queryKey: helpdeskKeys.ticketDetail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: HelpdeskTicket }>(`/helpdesk/tickets/${id}`);
      return data.data;
    },
    enabled: !!id,
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
      const { data } = await apiClient.post<{ data: HelpdeskTicket }>('/helpdesk/tickets', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.all });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, assignedToUserId }: { id: string; status: string; assignedToUserId?: string }) => {
      const { data } = await apiClient.patch<{ data: HelpdeskTicket }>(`/helpdesk/tickets/${id}/status`, {
        status,
        assignedToUserId,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.all });
    },
  });
}

export function useAddHelpdeskMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { ticketId: string; body: string; internalNote?: boolean }) => {
      const { data } = await apiClient.post<{ data: HelpdeskMessage }>('/helpdesk/messages', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.all });
    },
  });
}
