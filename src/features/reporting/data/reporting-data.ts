import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import {
  EpfFormCReport,
  EtfFormIIReport,
  ApitScheduleReport,
  GratuityValuationReport,
  WorkforceDemographics,
  AttendanceAnalytics,
  LeaveAnalytics,
  WorkforceCost,
  SavedReport,
  ReportSchedule,
  AuditEvent,
} from '../types/reporting';

export const reportingKeys = {
  all: ['reports'] as const,
  statutory: (type: string, runId?: string) => [...reportingKeys.all, 'statutory', type, runId] as const,
  analytics: (type: string) => [...reportingKeys.all, 'analytics', type] as const,
  saved: () => [...reportingKeys.all, 'saved'] as const,
  schedules: () => [...reportingKeys.all, 'schedules'] as const,
  audit: (params?: Record<string, any>) => [...reportingKeys.all, 'audit', params] as const,
};

// 1. Statutory Reports
export function useEpfFormC(payrollRunId?: string) {
  return useQuery({
    queryKey: reportingKeys.statutory('epf', payrollRunId),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: EpfFormCReport }>('/reports/statutory/epf-form-c', {
        params: { payrollRunId },
      });
      return data.data;
    },
  });
}

export function useEtfFormII(payrollRunId?: string) {
  return useQuery({
    queryKey: reportingKeys.statutory('etf', payrollRunId),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: EtfFormIIReport }>('/reports/statutory/etf-form-ii', {
        params: { payrollRunId },
      });
      return data.data;
    },
  });
}

export function useApitSchedule(payrollRunId?: string) {
  return useQuery({
    queryKey: reportingKeys.statutory('apit', payrollRunId),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: ApitScheduleReport }>('/reports/statutory/apit-schedule', {
        params: { payrollRunId },
      });
      return data.data;
    },
  });
}

export function useGratuityValuation() {
  return useQuery({
    queryKey: reportingKeys.statutory('gratuity'),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: GratuityValuationReport }>('/reports/statutory/gratuity-valuation');
      return data.data;
    },
  });
}

// 2. Workforce Analytics
export function useWorkforceDemographics() {
  return useQuery({
    queryKey: reportingKeys.analytics('demographics'),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: WorkforceDemographics }>('/reports/analytics/demographics');
      return data.data;
    },
  });
}

export function useAttendanceAnalytics() {
  return useQuery({
    queryKey: reportingKeys.analytics('attendance'),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: AttendanceAnalytics }>('/reports/analytics/attendance');
      return data.data;
    },
  });
}

export function useLeaveAnalytics() {
  return useQuery({
    queryKey: reportingKeys.analytics('leaves'),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: LeaveAnalytics }>('/reports/analytics/leaves');
      return data.data;
    },
  });
}

export function useWorkforceCost() {
  return useQuery({
    queryKey: reportingKeys.analytics('cost'),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: WorkforceCost }>('/reports/analytics/workforce-cost');
      return data.data;
    },
  });
}

// 3. Saved Reports & Schedules
export function useSavedReports() {
  return useQuery({
    queryKey: reportingKeys.saved(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: SavedReport[] }>('/reports/saved');
      return data.data || [];
    },
  });
}

export function useCreateSavedReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      entityType: string;
      selectedFields: string[];
      filters?: Record<string, any>;
      grouping?: string[];
      visibility?: string;
    }) => {
      const { data } = await mockData.create<{ data: SavedReport }>('/reports/saved', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
    },
  });
}

export function useDeleteSavedReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await mockData.remove(`/reports/saved/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
    },
  });
}

export function useReportSchedules() {
  return useQuery({
    queryKey: reportingKeys.schedules(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: ReportSchedule[] }>('/reports/schedules');
      return data.data || [];
    },
  });
}

export function useCreateReportSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      savedReportId: string;
      cronExpression: string;
      recipients: string[];
      outputFormat?: string;
    }) => {
      const { data } = await mockData.create<{ data: ReportSchedule }>('/reports/schedules', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
    },
  });
}

// 4. Compliance Audit Events
export function useAuditEvents(params?: { entityType?: string; action?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: reportingKeys.audit(params),
    queryFn: async () => {
      const { data } = await mockData.read<{
        data: AuditEvent[];
        meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
      }>('/reports/audit-events', { params });
      return data;
    },
  });
}

// 5. CSV Export Helper
export function downloadCsv(headers: string[], rows: Record<string, any>[], filename: string) {
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of rows) {
    const values = headers.map((header) => {
      const val = row[header] !== undefined ? row[header] : '';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
