import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import {
  SystemDiagnostics,
  SystemSetting,
  NotificationTemplate,
  NotificationItem,
  WebhookEndpoint,
} from '../types/operations';

export const operationsKeys = {
  all: ['operations'] as const,
  diagnostics: () => [...operationsKeys.all, 'diagnostics'] as const,
  settings: () => [...operationsKeys.all, 'settings'] as const,
  templates: () => [...operationsKeys.all, 'templates'] as const,
  notifications: () => [...operationsKeys.all, 'notifications'] as const,
  webhooks: () => [...operationsKeys.all, 'webhooks'] as const,
};

// 1. Diagnostics
export function useSystemDiagnostics() {
  return useQuery({
    queryKey: operationsKeys.diagnostics(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: SystemDiagnostics }>('/operations/diagnostics');
      return data.data;
    },
    refetchInterval: 10000,
  });
}

// 2. Settings
export function useSystemSettings() {
  return useQuery({
    queryKey: operationsKeys.settings(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: SystemSetting[] }>('/operations/settings');
      return data.data || [];
    },
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { key: string; value: any; description?: string }) => {
      const { data } = await apiClient.put<{ data: SystemSetting }>('/operations/settings', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.settings() });
    },
  });
}

// 3. Notifications & Templates
export function useNotificationTemplates() {
  return useQuery({
    queryKey: operationsKeys.templates(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: NotificationTemplate[] }>('/operations/templates');
      return data.data || [];
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: operationsKeys.notifications(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: NotificationItem[] }>('/operations/notifications');
      return data.data || [];
    },
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      userId: string;
      employeeId?: string;
      type: string;
      title: string;
      body: string;
      channels?: string[];
    }) => {
      const { data } = await apiClient.post<{ data: NotificationItem }>('/operations/notifications', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.notifications() });
    },
  });
}

// 4. Webhooks
export function useWebhooks() {
  return useQuery({
    queryKey: operationsKeys.webhooks(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: WebhookEndpoint[] }>('/operations/webhooks');
      return data.data || [];
    },
  });
}

export function useRegisterWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      url: string;
      secretReference?: string;
      subscribedEvents: string[];
    }) => {
      const { data } = await apiClient.post<{ data: WebhookEndpoint }>('/operations/webhooks', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.webhooks() });
    },
  });
}

export function useToggleWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data } = await apiClient.patch<{ data: WebhookEndpoint }>(`/operations/webhooks/${id}/toggle`, {
        active,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.webhooks() });
    },
  });
}
