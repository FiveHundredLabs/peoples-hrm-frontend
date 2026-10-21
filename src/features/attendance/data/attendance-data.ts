import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import {
  AttendanceDay,
  AttendanceDevice,
  ShiftTemplate,
  AttendanceException,
  AttendanceRegularizationRequest,
  AttendanceDayStatus,
} from '../types/attendance';

export const attendanceKeys = {
  all: ['attendance'] as const,
  daily: (params?: Record<string, any>) => [...attendanceKeys.all, 'daily', params] as const,
  devices: () => [...attendanceKeys.all, 'devices'] as const,
  shifts: () => [...attendanceKeys.all, 'shifts'] as const,
  exceptions: () => [...attendanceKeys.all, 'exceptions'] as const,
};

// ==========================================
// 1. DAILY ATTENDANCE
// ==========================================

export function useDailyAttendance(params?: {
  page?: number;
  limit?: number;
  employeeId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceDayStatus;
}) {
  return useQuery({
    queryKey: attendanceKeys.daily(params),
    queryFn: async () => {
      const { data } = await mockData.read<{
        data: AttendanceDay[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/attendance/daily-logs', { params });
      return data;
    },
  });
}

// ==========================================
// 2. BIOMETRIC DEVICES (HIKVISION)
// ==========================================

export function useDevices() {
  return useQuery({
    queryKey: attendanceKeys.devices(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: AttendanceDevice[] }>('/attendance/devices');
      return data.data || [];
    },
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      externalDeviceId: string;
      name: string;
      model?: string;
      serialNumber?: string;
      branchId?: string;
    }) => {
      const { data } = await mockData.create<{ data: AttendanceDevice }>('/attendance/devices', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

// ==========================================
// 3. SHIFT TEMPLATES
// ==========================================

export function useShifts() {
  return useQuery({
    queryKey: attendanceKeys.shifts(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: ShiftTemplate[] }>('/attendance/shifts');
      return data.data || [];
    },
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      name: string;
      startTime: string;
      endTime: string;
      graceInMinutes?: number;
      graceOutMinutes?: number;
    }) => {
      const { data } = await mockData.create<{ data: ShiftTemplate }>('/attendance/shifts', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

// ==========================================
// 4. EXCEPTIONS & REGULARIZATION
// ==========================================

export function useExceptions() {
  return useQuery({
    queryKey: attendanceKeys.exceptions(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: AttendanceException[] }>('/attendance/exceptions');
      return data.data || [];
    },
  });
}

export function useCreateRegularization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      attendanceDayId?: string;
      requestedIn?: string;
      requestedOut?: string;
      reason: string;
    }) => {
      const { data } = await mockData.create<{ data: AttendanceRegularizationRequest }>('/attendance/regularization', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

// ==========================================
// 5. SIMULATE BIOMETRIC INGESTION PUNCH
// ==========================================

export function useIngestBiometricPunch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      deviceId?: string;
      employeeNo?: string;
      eventTime?: string;
      direction?: string;
      verifyMode?: string;
    }) => {
      const { data } = await mockData.create<{
        data: { rawEvent: any; punch?: any; attendanceDay?: AttendanceDay };
      }>('/attendance/events/ingest', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}
