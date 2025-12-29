import apiClient from '@/utils/apiClient';

export interface ReviewSubmission {
    rating: number;
    reviewText: string;
}

export interface ReviewDto {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    rating: number;
    reviewText: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    reviewedAt?: string;
}

export interface PublicReviewDto {
    userName: string;
    rating: number;
    reviewText: string;
    createdAt: string;
}

export const reviewService = {
    /**
     * Submit a new review
     */
    async submitReview(data: ReviewSubmission): Promise<ReviewDto> {
        const response = await apiClient.post<ReviewDto>('/api/reviews', data);
        return response.data;
    },

    /**
     * Get user's own reviews
     */
    async getMyReviews(): Promise<ReviewDto[]> {
        const response = await apiClient.get<ReviewDto[]>('/api/reviews/my');
        return response.data;
    },

    /**
     * Get approved reviews for public display
     */
    async getPublicReviews(limit: number = 15): Promise<PublicReviewDto[]> {
        const response = await apiClient.get<PublicReviewDto[]>(`/api/reviews/public?limit=${limit}`);
        return response.data;
    },
};
