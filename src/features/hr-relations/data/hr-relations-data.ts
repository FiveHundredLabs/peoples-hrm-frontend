import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import {
  HrCaseType,
  HrCase,
  DisciplinaryAction,
  SafetyIncident,
  CorrectiveAction,
} from '../types/hr-relations';

export const hrRelationsKeys = {
  all: ['hr-relations'] as const,
  types: () => [...hrRelationsKeys.all, 'types'] as const,
  cases: (status?: string, typeId?: string) => [...hrRelationsKeys.all, 'cases', status, typeId] as const,
  caseDetail: (id: string) => [...hrRelationsKeys.all, 'case', id] as const,
  disciplinary: (employeeId?: string) => [...hrRelationsKeys.all, 'disciplinary', employeeId] as const,
  safety: () => [...hrRelationsKeys.all, 'safety'] as const,
  corrective: () => [...hrRelationsKeys.all, 'corrective'] as const,
};

// 1. Case Types
export function useHrCaseTypes() {
  return useQuery({
    queryKey: hrRelationsKeys.types(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: HrCaseType[] }>('/hr-relations/types');
      return data.data || [];
    },
  });
}

export function useCreateHrCaseType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; name: string; sensitivity?: string }) => {
      const { data } = await mockData.create<{ data: HrCaseType }>('/hr-relations/types', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrRelationsKeys.all });
    },
  });
}

// 2. Cases
export function useHrCases(status?: string, typeId?: string) {
  return useQuery({
    queryKey: hrRelationsKeys.cases(status, typeId),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: HrCase[] }>('/hr-relations/cases', {
        params: { status, typeId },
      });
      return data.data || [];
    },
  });
}

export function useHrCaseDetail(id: string) {
  return useQuery({
    queryKey: hrRelationsKeys.caseDetail(id),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: HrCase }>(`/hr-relations/cases/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateHrCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      caseTypeId: string;
      caseNumber: string;
      subject: string;
      description?: string;
      priority?: string;
    }) => {
      const { data } = await mockData.create<{ data: HrCase }>('/hr-relations/cases', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrRelationsKeys.all });
    },
  });
}

export function useUpdateCaseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data } = await mockData.update<{ data: HrCase }>(`/hr-relations/cases/${id}/status`, {
        status,
        notes,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrRelationsKeys.all });
    },
  });
}

// 3. Disciplinary Actions
export function useDisciplinaryActions(employeeId?: string) {
  return useQuery({
    queryKey: hrRelationsKeys.disciplinary(employeeId),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: DisciplinaryAction[] }>('/hr-relations/disciplinary', {
        params: { employeeId },
      });
      return data.data || [];
    },
  });
}

export function useCreateDisciplinaryAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      hrCaseId?: string;
      employeeId: string;
      actionType: string;
      effectiveFrom?: string;
      effectiveTo?: string;
      reason: string;
      status?: string;
    }) => {
      const { data } = await mockData.create<{ data: DisciplinaryAction }>('/hr-relations/disciplinary', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrRelationsKeys.all });
    },
  });
}

// 4. Safety Incidents & CAPA
export function useSafetyIncidents() {
  return useQuery({
    queryKey: hrRelationsKeys.safety(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: SafetyIncident[] }>('/hr-relations/safety');
      return data.data || [];
    },
  });
}

export function useCreateSafetyIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      legalEntityId: string;
      incidentNumber: string;
      incidentType: string;
      occurredAt: string;
      locationText?: string;
      description: string;
      severity?: string;
      reportable?: boolean;
    }) => {
      const { data } = await mockData.create<{ data: SafetyIncident }>('/hr-relations/safety', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrRelationsKeys.all });
    },
  });
}

export function useCorrectiveActions() {
  return useQuery({
    queryKey: hrRelationsKeys.corrective(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: CorrectiveAction[] }>('/hr-relations/corrective');
      return data.data || [];
    },
  });
}

export function useCreateCorrectiveAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      safetyIncidentId?: string;
      hrCaseId?: string;
      title: string;
      description?: string;
      dueDate?: string;
    }) => {
      const { data } = await mockData.create<{ data: CorrectiveAction }>('/hr-relations/corrective', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrRelationsKeys.all });
    },
  });
}
