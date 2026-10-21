import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import {
  PrivacyConsent,
  DataRetentionPolicy,
  DataSubjectRequest,
  LegalHold,
  DataSubjectRequestStatus,
  DataSubjectRequestType,
} from '../types/privacy';

export const privacyKeys = {
  all: ['privacy'] as const,
  consents: (empId?: string, candId?: string, purpose?: string) =>
    [...privacyKeys.all, 'consents', empId, candId, purpose] as const,
  retention: () => [...privacyKeys.all, 'retention'] as const,
  dsar: (status?: DataSubjectRequestStatus, type?: DataSubjectRequestType) =>
    [...privacyKeys.all, 'dsar', status, type] as const,
  dsarDetail: (id: string) => [...privacyKeys.all, 'dsar', id] as const,
  legalHolds: () => [...privacyKeys.all, 'legalHolds'] as const,
};

// 1. Consents
export function usePrivacyConsents(empId?: string, candId?: string, purpose?: string) {
  return useQuery({
    queryKey: privacyKeys.consents(empId, candId, purpose),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: PrivacyConsent[] }>('/privacy/consents', {
        params: { employeeId: empId, candidateId: candId, purposeCode: purpose },
      });
      return data.data || [];
    },
  });
}

export function useRecordConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId?: string;
      candidateId?: string;
      purposeCode: string;
      consentVersion: string;
      granted: boolean;
      source?: string;
    }) => {
      const { data } = await mockData.create<{ data: PrivacyConsent }>('/privacy/consents', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacyKeys.all });
    },
  });
}

// 2. Retention Policies
export function useRetentionPolicies() {
  return useQuery({
    queryKey: privacyKeys.retention(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: DataRetentionPolicy[] }>('/privacy/retention-policies');
      return data.data || [];
    },
  });
}

export function useCreateRetentionPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      dataCategory: string;
      entityType: string;
      retentionDays: number;
      triggerEvent: string;
      deletionStrategy: string;
      legalBasis?: string;
    }) => {
      const { data } = await mockData.create<{ data: DataRetentionPolicy }>('/privacy/retention-policies', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacyKeys.all });
    },
  });
}

// 3. Data Subject Requests (DSAR)
export function useDataSubjectRequests(status?: DataSubjectRequestStatus, type?: DataSubjectRequestType) {
  return useQuery({
    queryKey: privacyKeys.dsar(status, type),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: DataSubjectRequest[] }>('/privacy/dsar', {
        params: { status, requestType: type },
      });
      return data.data || [];
    },
  });
}

export function useCreateDataSubjectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      requestNumber: string;
      employeeId?: string;
      candidateId?: string;
      requestType: DataSubjectRequestType;
      dueAt?: string;
      resolutionNotes?: string;
    }) => {
      const { data } = await mockData.create<{ data: DataSubjectRequest }>('/privacy/dsar', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacyKeys.all });
    },
  });
}

export function useUpdateDataSubjectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; status: DataSubjectRequestStatus; assignedToUserId?: string; resolutionNotes?: string }) => {
      const { data } = await mockData.update<{ data: DataSubjectRequest }>(`/privacy/dsar/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacyKeys.all });
    },
  });
}

// 4. Legal Holds
export function useLegalHolds() {
  return useQuery({
    queryKey: privacyKeys.legalHolds(),
    queryFn: async () => {
      const { data } = await mockData.read<{ data: LegalHold[] }>('/privacy/legal-holds');
      return data.data || [];
    },
  });
}

export function useCreateLegalHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      reason: string;
      entityType?: string;
      startsAt: string;
      endsAt?: string;
    }) => {
      const { data } = await mockData.create<{ data: LegalHold }>('/privacy/legal-holds', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacyKeys.all });
    },
  });
}

export function useReleaseLegalHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mockData.update<{ data: LegalHold }>(`/privacy/legal-holds/${id}/release`, {});
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacyKeys.all });
    },
  });
}
