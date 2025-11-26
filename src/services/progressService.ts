import apiClient from '@/utils/apiClient';
import { ProgressDto } from '@/types';

export const progressService = {
  getProgress: async (userId: number): Promise<ProgressDto[]> => {
    const response = await apiClient.get<ProgressDto[]>('/api/progress', { params: { userId } });
    return response.data;
  }
};