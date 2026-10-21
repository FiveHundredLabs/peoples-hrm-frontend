import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
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
      const response = await mockData.read<PaginatedResponse<LegalEntity>>('/organization/legal-entities', {
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
      const response = await mockData.read<ApiResponse<LegalEntity>>(`/organization/legal-entities/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateLegalEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LegalEntityFormValues) => {
      const response = await mockData.create<ApiResponse<LegalEntity>>('/organization/legal-entities', payload);
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
      const response = await mockData.update<ApiResponse<LegalEntity>>(`/organization/legal-entities/${id}`, payload);
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
      await mockData.remove(`/organization/legal-entities/${id}`);
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
      const response = await mockData.read<PaginatedResponse<Branch>>('/organization/branches', { params });
      return response.data;
    },
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BranchFormValues) => {
      const response = await mockData.create<ApiResponse<Branch>>('/organization/branches', payload);
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
      const response = await mockData.update<ApiResponse<Branch>>(`/organization/branches/${id}`, payload);
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
      await mockData.remove(`/organization/branches/${id}`);
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
      const response = await mockData.read<PaginatedResponse<Department>>('/organization/departments', { params });
      return response.data;
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DepartmentFormValues) => {
      const response = await mockData.create<ApiResponse<Department>>('/organization/departments', payload);
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
      const response = await mockData.update<ApiResponse<Department>>(`/organization/departments/${id}`, payload);
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
      await mockData.remove(`/organization/departments/${id}`);
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
      const response = await mockData.read<ApiResponse<Team[]>>('/organization/teams', {
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
      const response = await mockData.create<ApiResponse<Team>>('/organization/teams', payload);
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
      const response = await mockData.read<PaginatedResponse<Job>>('/organization/jobs', { params });
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
      const response = await mockData.read<PaginatedResponse<Position>>('/organization/positions', { params });
      return response.data;
    },
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PositionFormValues) => {
      const response = await mockData.create<ApiResponse<Position>>('/organization/positions', payload);
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
      const response = await mockData.update<ApiResponse<Position>>(`/organization/positions/${id}`, payload);
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
      await mockData.remove(`/organization/positions/${id}`);
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
      const response = await mockData.read<PaginatedResponse<WorkLocation>>('/organization/work-locations', {
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
      const response = await mockData.create<ApiResponse<WorkLocation>>('/organization/work-locations', payload);
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
      const response = await mockData.read<ApiResponse<HolidayCalendar[]>>('/organization/holiday-calendars');
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
      const response = await mockData.read<PaginatedResponse<Holiday>>('/organization/holidays', { params });
      return response.data;
    },
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HolidayFormValues) => {
      const response = await mockData.create<ApiResponse<Holiday>>('/organization/holidays', payload);
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
      await mockData.remove(`/organization/holidays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}
