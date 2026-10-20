import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import { ApiError, ApiResponse, PaginatedResponse, PaginationParams } from '../../../types/api';
import { useAuthStore } from '../../../stores/auth-store';
import {
  AuthResponse,
  User,
  Role,
  Permission,
  UserRoleAssignment,
  UserSession,
} from '../types/auth';
import {
  LoginFormValues,
  CreateUserFormValues,
  CreateRoleFormValues,
  AssignUserRoleFormValues,
} from '../schemas/auth.schema';

// ==========================================
// AUTHENTICATION
// ==========================================

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        roles: data.roles,
        permissions: data.permissions,
        scopes: data.scopes,
      });
      queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch {
        // Ignore logout network errors and clear client session regardless
      }
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>('/auth/me');
      return response.data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useSyncPermissions() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<{ message: string; created: string[]; alreadyExisted: string[] }>, ApiError, void>({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/sync-permissions');
      return response.data;
    },
    onSuccess: () => {
      alert('Permissions synchronized successfully.');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      alert(error.message || 'Failed to sync permissions');
    },
  });
}

export function useSeedAdmin() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<{ message: string; user?: any }>>('/auth/seed-admin');
      return response.data.data;
    },
  });
}

// ==========================================
// ROLES & PERMISSIONS
// ==========================================

export function useRoles() {
  return useQuery({
    queryKey: ['rbac', 'roles'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Role[]>>('/rbac/roles');
      return response.data.data;
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRoleFormValues) => {
      const response = await apiClient.post<ApiResponse<Role>>('/rbac/roles', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
    },
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ['rbac', 'permissions'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Permission[]>>('/rbac/permissions');
      return response.data.data;
    },
  });
}

export function useAssignPermissions(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permissionIds: string[]) => {
      await apiClient.post(`/rbac/roles/${roleId}/permissions`, { permissionIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
    },
  });
}

// ==========================================
// USERS & ASSIGNMENTS
// ==========================================

export interface UserQueryParams extends PaginationParams {
  status?: string;
}

export function useUsers(params: UserQueryParams = {}) {
  return useQuery({
    queryKey: ['rbac', 'users', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<User>>('/rbac/users', { params });
      return response.data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUserFormValues) => {
      const response = await apiClient.post<ApiResponse<User>>('/rbac/users', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'users'] });
    },
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AssignUserRoleFormValues) => {
      const response = await apiClient.post<ApiResponse<UserRoleAssignment>>('/rbac/user-role-assignments', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'users'] });
    },
  });
}

export function useRevokeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiClient.delete(`/rbac/user-role-assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'users'] });
    },
  });
}

// ==========================================
// SESSIONS
// ==========================================

export function useActiveSessions(userId?: string) {
  return useQuery({
    queryKey: ['rbac', 'sessions', userId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserSession[]>>('/rbac/sessions', {
        params: { userId },
      });
      return response.data.data;
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.delete(`/rbac/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'sessions'] });
    },
  });
}



