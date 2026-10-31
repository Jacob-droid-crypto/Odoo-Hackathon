import { apiClient } from './client';

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  database: {
    provider: string;
    orm: string;
    connected: boolean;
    mode: string;
  };
  timestamp: string;
}

export const systemApi = {
  health: async (): Promise<HealthStatus> => {
    const res = await apiClient.get<HealthStatus>('/health');
    return res.data;
  },

  catalog: async () => {
    const res = await apiClient.get('/ ');
    return res.data;
  },
};
