import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import { ApiResponse } from '../../../types/api';
import { SmtpConfig, UpdateSmtpConfigPayload, TestSmtpPayload, SmtpTestResult } from '../types/smtp';

export const smtpKeys = {
  all: ['smtp'] as const,
  config: () => [...smtpKeys.all, 'config'] as const,
};

export function useSmtpConfig() {
  return useQuery({
    queryKey: smtpKeys.config(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SmtpConfig>>('/settings/smtp');
      return response.data.data;
    },
  });
}

export function useUpdateSmtpConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateSmtpConfigPayload) => {
      const response = await apiClient.put<ApiResponse<SmtpConfig>>('/settings/smtp', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smtpKeys.config() });
    },
  });
}

export function useTestSmtpConnection() {
  return useMutation({
    mutationFn: async (payload: TestSmtpPayload) => {
      const response = await apiClient.post<ApiResponse<SmtpTestResult>>('/settings/smtp/test', payload);
      return response.data.data;
    },
  });
}
