export interface ApiResponseMeta {
  requestId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiResponseMeta;
}

export interface PaginationMeta extends ApiResponseMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorDetail {
  field?: string;
  code?: string;
  message: string;
}

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  requestId?: string;
  timestamp?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
