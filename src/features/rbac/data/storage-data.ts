import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
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
      const response = await mockData.read<ApiResponse<StorageConfig>>('/settings/storage');
      return response.data.data;
    },
  });
}

export function useUpdateStorageConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateStorageConfigPayload) => {
      const response = await mockData.update<ApiResponse<StorageConfig>>('/settings/storage', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageKeys.all });
    },
  });
}

export function useTestStorageConnection() {
  return useMutation({
    mutationFn: async (payload: TestStoragePayload) => {
      const response = await mockData.create<ApiResponse<StorageTestResult>>('/settings/storage/test', payload);
      return response.data.data;
    },
  });
}
