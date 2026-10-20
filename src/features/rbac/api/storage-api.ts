import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import { ApiResponse } from '../../../types/api';
import {
  StorageConfig,
  UpdateStorageConfigPayload,
  TestStoragePayload,
  StorageTestResult,
} from '../types/storage';

export const storageKeys = {
  all: ['storage'] as const,
  config: () => [...storageKeys.all, 'config'] as const,
};

export function useStorageConfig() {
  return useQuery({
    queryKey: storageKeys.config(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<StorageConfig>>('/settings/storage');
      return response.data.data;
    },
  });
}

export function useUpdateStorageConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateStorageConfigPayload) => {
      const response = await apiClient.put<ApiResponse<StorageConfig>>('/settings/storage', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageKeys.config() });
    },
  });
}

export function useTestStorageConnection() {
  return useMutation({
    mutationFn: async (payload: TestStoragePayload) => {
      const response = await apiClient.post<ApiResponse<StorageTestResult>>('/settings/storage/test', payload);
      return response.data.data;
    },
  });
}
