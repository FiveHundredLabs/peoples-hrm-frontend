import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import {
  Employee,
  EmployeeQueryParams,
  EmployeeBankAccount,
  EmployeeAssignment,
  EmployeeDocument,
} from '../types/employee';
import {
  CreateEmployeeFormValues,
  AddBankAccountFormValues,
  UpdateStatusFormValues,
} from '../schemas/employee.schema';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: EmployeeQueryParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

// 1. Query: List Employees
export function useEmployees(params: EmployeeQueryParams = {}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: async () => {
      const response = await mockData.read<PaginatedResult<Employee>>('/employees', {
        params,
      });
      return response.data;
    },
  });
}

// 2. Query: Employee Dossier Detail
export function useEmployee(id?: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Employee ID is required');
      const response = await mockData.read<{ data: Employee }>(`/employees/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// 3. Mutation: Create & Onboard Employee
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateEmployeeFormValues) => {
      const cleaned: Record<string, any> = {};
      for (const [k, v] of Object.entries(payload)) {
        if (typeof v === 'string') {
          const trimmed = v.trim();
          if (trimmed !== '') {
            cleaned[k] = trimmed;
          }
        } else if (v !== null && v !== undefined) {
          cleaned[k] = v;
        }
      }
      const response = await mockData.create<{ data: Employee }>('/employees', cleaned);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

// 4. Mutation: Update Employee Info
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateEmployeeFormValues> }) => {
      const response = await mockData.update<{ data: Employee }>(`/employees/${id}`, data);
      return response.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(updated.id) });
    },
  });
}

// 5. Mutation: Add Bank Account
export function useAddBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: string; data: AddBankAccountFormValues }) => {
      const response = await mockData.create<{ data: EmployeeBankAccount }>(
        `/employees/${employeeId}/bank-accounts`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

// 6. Mutation: Add Job Assignment
export function useAddAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: string; data: any }) => {
      const response = await mockData.create<{ data: EmployeeAssignment }>(
        `/employees/${employeeId}/assignments`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

// 7. Mutation: Upload Document
export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: string; data: any }) => {
      const response = await mockData.create<{ data: EmployeeDocument }>(
        `/employees/${employeeId}/documents`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

// 8. Mutation: Update Status
export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: string; data: UpdateStatusFormValues }) => {
      const response = await mockData.create<{ data: Employee }>(
        `/employees/${employeeId}/status`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

export interface UploadedFileResponse {
  id: string;
  originalName: string;
  mimeType?: string;
  sizeBytes?: number;
  storageProvider: string;
  sha256?: string;
  createdAt: string;
  viewUrl: string;
  downloadUrl: string;
}

// 9. Mutation: Upload File to Storage
export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await mockData.create<{ data: UploadedFileResponse }>('/storage/upload', formData);
      return response.data.data;
    },
  });
}

// 10. Mutation: Upload Employee Profile Photo
export function useUploadEmployeePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, fileId }: { employeeId: string; fileId: string }) => {
      const response = await mockData.create<{ data: Employee }>(`/employees/${employeeId}/photo`, { fileId });
      return response.data.data;
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

// 11. Query: List Employee Documents
export function useEmployeeDocuments(employeeId?: string) {
  return useQuery({
    queryKey: ['employees', employeeId, 'documents'],
    queryFn: async () => {
      if (!employeeId) return [];
      const response = await mockData.read<{ data: EmployeeDocument[] }>(`/employees/${employeeId}/documents`);
      return response.data.data;
    },
    enabled: !!employeeId,
  });
}

// 12. Mutation: Add Employee Document
export function useAddEmployeeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      data,
    }: {
      employeeId: string;
      data: {
        documentType: string;
        title: string;
        fileId: string;
        visibility?: 'hr' | 'manager' | 'employee';
        expiresOn?: string;
        notes?: string;
      };
    }) => {
      const response = await mockData.create<{ data: EmployeeDocument }>(`/employees/${employeeId}/documents`, data);
      return response.data.data;
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['employees', employeeId, 'documents'] });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

// 13. Mutation: Update Employee Document
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      documentId,
      data,
    }: {
      employeeId: string;
      documentId: string;
      data: {
        title?: string;
        visibility?: 'hr' | 'manager' | 'employee';
        expiresOn?: string;
      };
    }) => {
      const response = await mockData.update<{ data: EmployeeDocument }>(
        `/employees/${employeeId}/documents/${documentId}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['employees', employeeId, 'documents'] });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

// 14. Mutation: Delete Employee Document
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      documentId,
    }: {
      employeeId: string;
      documentId: string;
    }) => {
      await mockData.remove(`/employees/${employeeId}/documents/${documentId}`);
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['employees', employeeId, 'documents'] });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

// 15. Mutation: Update Bank Account
export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      accountId,
      data,
    }: {
      employeeId: string;
      accountId: string;
      data: {
        bankName?: string;
        branchName?: string;
        accountHolderName?: string;
        accountNumber?: string;
        isPrimary?: boolean;
      };
    }) => {
      const response = await mockData.update<{ data: EmployeeBankAccount }>(
        `/employees/${employeeId}/bank-accounts/${accountId}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

// 16. Mutation: Delete Bank Account
export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      accountId,
    }: {
      employeeId: string;
      accountId: string;
    }) => {
      await mockData.remove(`/employees/${employeeId}/bank-accounts/${accountId}`);
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
    },
  });
}

// 17. Mutation: Delete Employee (Soft-Delete)
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeeId: string) => {
      await mockData.remove(`/employees/${employeeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}


