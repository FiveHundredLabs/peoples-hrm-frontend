import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../../../types/api';
import {
  LegalEntity,
  Branch,
  Department,
  Team,
  Job,
  Position,
  WorkLocation,
  HolidayCalendar,
  Holiday,
} from '../types/organization';
import {
  LegalEntityFormValues,
  BranchFormValues,
  DepartmentFormValues,
  TeamFormValues,
  PositionFormValues,
  WorkLocationFormValues,
  HolidayFormValues,
} from '../schemas/organization.schema';

// ==========================================
// LEGAL ENTITIES
// ==========================================

export interface LegalEntityQueryParams extends PaginationParams {
  active?: boolean;
}

export function useLegalEntities(params: LegalEntityQueryParams = {}) {
  return useQuery({
    queryKey: ['legal-entities', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<LegalEntity>>('/organization/legal-entities', {
        params,
      });
      return response.data;
    },
  });
}

export function useLegalEntity(id?: string) {
  return useQuery({
    queryKey: ['legal-entities', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get<ApiResponse<LegalEntity>>(`/organization/legal-entities/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateLegalEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LegalEntityFormValues) => {
      const response = await apiClient.post<ApiResponse<LegalEntity>>('/organization/legal-entities', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-entities'] });
    },
  });
}

export function useUpdateLegalEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<LegalEntityFormValues> }) => {
      const response = await apiClient.patch<ApiResponse<LegalEntity>>(`/organization/legal-entities/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-entities'] });
    },
  });
}

export function useDeleteLegalEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/organization/legal-entities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-entities'] });
    },
  });
}

// ==========================================
// BRANCHES
// ==========================================

export interface BranchQueryParams extends PaginationParams {
  legalEntityId?: string;
  active?: boolean;
}

export function useBranches(params: BranchQueryParams = {}) {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Branch>>('/organization/branches', { params });
      return response.data;
    },
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BranchFormValues) => {
      const response = await apiClient.post<ApiResponse<Branch>>('/organization/branches', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<BranchFormValues> }) => {
      const response = await apiClient.patch<ApiResponse<Branch>>(`/organization/branches/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/organization/branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

// ==========================================
// DEPARTMENTS & TEAMS
// ==========================================

export interface DepartmentQueryParams extends PaginationParams {
  legalEntityId?: string;
  branchId?: string;
  active?: boolean;
}

export function useDepartments(params: DepartmentQueryParams = {}) {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Department>>('/organization/departments', { params });
      return response.data;
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DepartmentFormValues) => {
      const response = await apiClient.post<ApiResponse<Department>>('/organization/departments', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<DepartmentFormValues> }) => {
      const response = await apiClient.patch<ApiResponse<Department>>(`/organization/departments/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/organization/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useTeams(departmentId?: string) {
  return useQuery({
    queryKey: ['teams', departmentId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Team[]>>('/organization/teams', {
        params: { departmentId },
      });
      return response.data.data;
    },
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TeamFormValues) => {
      const response = await apiClient.post<ApiResponse<Team>>('/organization/teams', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

// ==========================================
// JOBS & POSITIONS
// ==========================================

export function useJobs(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Job>>('/organization/jobs', { params });
      return response.data;
    },
  });
}

export interface PositionQueryParams extends PaginationParams {
  legalEntityId?: string;
  departmentId?: string;
  active?: boolean;
}

export function usePositions(params: PositionQueryParams = {}) {
  return useQuery({
    queryKey: ['positions', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Position>>('/organization/positions', { params });
      return response.data;
    },
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PositionFormValues) => {
      const response = await apiClient.post<ApiResponse<Position>>('/organization/positions', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<PositionFormValues> }) => {
      const response = await apiClient.patch<ApiResponse<Position>>(`/organization/positions/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/organization/positions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}

// ==========================================
// WORK LOCATIONS
// ==========================================

export function useWorkLocations(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['work-locations', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<WorkLocation>>('/organization/work-locations', {
        params,
      });
      return response.data;
    },
  });
}

export function useCreateWorkLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WorkLocationFormValues) => {
      const response = await apiClient.post<ApiResponse<WorkLocation>>('/organization/work-locations', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-locations'] });
    },
  });
}

// ==========================================
// HOLIDAYS
// ==========================================

export function useHolidayCalendars() {
  return useQuery({
    queryKey: ['holiday-calendars'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<HolidayCalendar[]>>('/organization/holiday-calendars');
      return response.data.data;
    },
  });
}

export interface HolidayQueryParams extends PaginationParams {
  calendarId?: string;
  year?: number;
  isPoya?: boolean;
  isMercantileHoliday?: boolean;
}

export function useHolidays(params: HolidayQueryParams = {}) {
  return useQuery({
    queryKey: ['holidays', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Holiday>>('/organization/holidays', { params });
      return response.data;
    },
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HolidayFormValues) => {
      const response = await apiClient.post<ApiResponse<Holiday>>('/organization/holidays', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holiday-calendars'] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/organization/holidays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}
