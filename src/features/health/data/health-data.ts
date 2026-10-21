import { useQuery } from '@tanstack/react-query';
import { mockData } from '../../../mocks/store';
import { ApiResponse } from '../../../types/api';

export interface HealthData {
  status: string;
  service: string;
  uptime: number;
  timestamp: string;
}

export interface DetailedHealthData {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: {
    status: 'connected' | 'disconnected' | 'not_configured';
    responseTimeMs?: number;
  };
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await mockData.read<ApiResponse<HealthData>>('/health');
      return response.data.data;
    },
    refetchInterval: 30000,
  });
}

export function useDetailedHealth() {
  return useQuery({
    queryKey: ['health', 'detailed'],
    queryFn: async () => {
      const response = await mockData.read<ApiResponse<DetailedHealthData>>('/health/detailed');
      return response.data.data;
    },
    refetchInterval: 15000,
  });
}
