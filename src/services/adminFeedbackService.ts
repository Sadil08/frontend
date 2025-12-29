import apiClient from '@/utils/apiClient';
import { ReviewDto } from './reviewService';
import { ImprovementDto } from './improvementService';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ImprovementStatus = 'PENDING' | 'UNDER_REVIEW' | 'IMPLEMENTED' | 'REJECTED';

export const adminFeedbackService = {
    /**
     * Get all reviews with optional status filter
     */
    async getAllReviews(status?: ReviewStatus): Promise<ReviewDto[]> {
        const url = status
            ? `/api/admin/feedback/reviews?status=${status}`
            : '/api/admin/feedback/reviews';

        const response = await apiClient.get<ReviewDto[]>(url);
        return response.data;
    },

    /**
     * Approve a review
     */
    async approveReview(id: number): Promise<ReviewDto> {
        const response = await apiClient.put<ReviewDto>(`/api/admin/feedback/reviews/${id}/approve`);
        return response.data;
    },

    /**
     * Reject a review
     */
    async rejectReview(id: number): Promise<ReviewDto> {
        const response = await apiClient.put<ReviewDto>(`/api/admin/feedback/reviews/${id}/reject`);
        return response.data;
    },

    /**
     * Get all improvements with optional status filter
     */
    async getAllImprovements(status?: ImprovementStatus): Promise<ImprovementDto[]> {
        const url = status
            ? `/api/admin/feedback/improvements?status=${status}`
            : '/api/admin/feedback/improvements';

        const response = await apiClient.get<ImprovementDto[]>(url);
        return response.data;
    },

    /**
     * Update improvement status with admin notes
     */
    async updateImprovementStatus(
        id: number,
        status: ImprovementStatus,
        adminNotes?: string
    ): Promise<ImprovementDto> {
        const response = await apiClient.put<ImprovementDto>(`/api/admin/feedback/improvements/${id}/status`, {
            status,
            adminNotes
        });
        return response.data;
    },

    /**
     * Delete an improvement
     */
    async deleteImprovement(id: number): Promise<void> {
        await apiClient.delete(`/api/admin/feedback/improvements/${id}`);
    },
};
