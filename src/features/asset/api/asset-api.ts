import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import { AssetCategory, Asset, AssetAssignment } from '../types/asset';

export const assetKeys = {
  all: ['assets'] as const,
  categories: () => [...assetKeys.all, 'categories'] as const,
  list: (categoryId?: string, status?: string, branchId?: string) =>
    [...assetKeys.all, 'list', categoryId, status, branchId] as const,
  assignments: (empId?: string, assetId?: string, activeOnly?: boolean) =>
    [...assetKeys.all, 'assignments', empId, assetId, activeOnly] as const,
};

// 1. Categories
export function useAssetCategories() {
  return useQuery({
    queryKey: assetKeys.categories(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: AssetCategory[] }>('/assets/categories');
      return data.data || [];
    },
  });
}

export function useCreateAssetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; name: string }) => {
      const { data } = await apiClient.post<{ data: AssetCategory }>('/assets/categories', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}

// 2. Assets Inventory
export function useAssets(categoryId?: string, status?: string, branchId?: string) {
  return useQuery({
    queryKey: assetKeys.list(categoryId, status, branchId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Asset[] }>('/assets', {
        params: { categoryId, status, branchId },
      });
      return data.data || [];
    },
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      assetCategoryId: string;
      assetTag: string;
      name: string;
      serialNumber?: string;
      make?: string;
      model?: string;
      purchaseDate?: string;
      purchaseCost?: number;
      currency?: string;
      branchId?: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.post<{ data: Asset }>('/assets', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}

export function useUpdateAssetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data } = await apiClient.patch<{ data: Asset }>(`/assets/${id}/status`, { status, notes });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}

// 3. Asset Assignment & Return
export function useAssetAssignments(employeeId?: string, assetId?: string, activeOnly?: boolean) {
  return useQuery({
    queryKey: assetKeys.assignments(employeeId, assetId, activeOnly),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: AssetAssignment[] }>('/assets/assignments/list', {
        params: { employeeId, assetId, activeOnly },
      });
      return data.data || [];
    },
  });
}

export function useIssueAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      assetId: string;
      employeeId: string;
      issuedOn?: string;
      expectedReturnOn?: string;
      issueCondition?: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.post<{ data: AssetAssignment }>('/assets/issue', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}

export function useReturnAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      returnedOn,
      returnCondition,
      newAssetStatus,
      notes,
    }: {
      assignmentId: string;
      returnedOn?: string;
      returnCondition?: string;
      newAssetStatus?: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.post<{ data: AssetAssignment }>(`/assets/assignments/${assignmentId}/return`, {
        returnedOn,
        returnCondition,
        newAssetStatus,
        notes,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}
