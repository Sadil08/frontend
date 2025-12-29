import apiClient from '@/utils/apiClient';

export interface ImprovementSubmission {
    improvementText: string;
    issueDescription?: string;
}

export interface ImprovementDto {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    improvementText: string;
    issueDescription?: string;
    status: 'PENDING' | 'UNDER_REVIEW' | 'IMPLEMENTED' | 'REJECTED';
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export const improvementService = {
    /**
     * Submit an improvement suggestion
     */
    async submitImprovement(data: ImprovementSubmission): Promise<ImprovementDto> {
        const response = await apiClient.post<ImprovementDto>('/api/improvements', data);
        return response.data;
    },

    /**
     * Get user's own improvement suggestions
     */
    async getMyImprovements(): Promise<ImprovementDto[]> {
        const response = await apiClient.get<ImprovementDto[]>('/api/improvements/my');
        return response.data;
    },
};
