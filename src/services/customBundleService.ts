import apiClient from '@/utils/apiClient';
import { PaperDto } from '@/types';

// Types
export interface CustomBundleDto {
    id: number;
    creatorId: number;
    creatorName: string;
    name: string;
    description?: string;
    status: 'CREATED' | 'PURCHASED' | 'APPROVED';
    paperIds: number[];
    papers: PaperDto[];
    totalPrice?: number;
    createdAt: string;
    purchasedAt?: string;
    approvedAt?: string;
    approvedById?: number;
    approvedByName?: string;
}

export interface CreateBundleRequest {
    name: string;
    description?: string;
}

export interface PriceResponse {
    pricePerPaper: number;
}

// Service
export const customBundleService = {
    /**
     * Get user's current draft bundle
     */
    getMyDraft: async (): Promise<CustomBundleDto | null> => {
        try {
            const response = await apiClient.get<CustomBundleDto>('/api/custom-bundles/my-draft');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 204) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Get a specific custom bundle by ID
     */
    getBundleById: async (bundleId: number): Promise<CustomBundleDto> => {
        const response = await apiClient.get<CustomBundleDto>(`/api/custom-bundles/${bundleId}`);
        return response.data;
    },

    /**
     * Get all bundles owned by the user
     */
    getMyBundles: async (): Promise<CustomBundleDto[]> => {
        const response = await apiClient.get<CustomBundleDto[]>('/api/custom-bundles/my-bundles');
        return response.data;
    },

    /**
     * Get all public/approved bundles
     */
    getPublicBundles: async (): Promise<CustomBundleDto[]> => {
        const response = await apiClient.get<CustomBundleDto[]>('/api/custom-bundles/public');
        return response.data;
    },

    /**
     * Create a new custom bundle
     */
    createBundle: async (request: CreateBundleRequest): Promise<CustomBundleDto> => {
        const response = await apiClient.post<CustomBundleDto>('/api/custom-bundles', request);
        return response.data;
    },

    /**
     * Add a paper to the bundle
     */
    addPaper: async (bundleId: number, paperId: number): Promise<CustomBundleDto> => {
        const response = await apiClient.post<CustomBundleDto>(
            `/api/custom-bundles/${bundleId}/papers/${paperId}`
        );
        return response.data;
    },

    /**
     * Remove a paper from the bundle
     */
    removePaper: async (bundleId: number, paperId: number): Promise<CustomBundleDto> => {
        const response = await apiClient.delete<CustomBundleDto>(
            `/api/custom-bundles/${bundleId}/papers/${paperId}`
        );
        return response.data;
    },

    /**
     * Delete the bundle
     */
    deleteBundle: async (bundleId: number): Promise<void> => {
        await apiClient.delete(`/api/custom-bundles/${bundleId}`);
    },

    /**
     * Purchase the bundle
     */
    /**
     * Purchase the bundle
     */
    purchaseBundle: async (bundleId: number, paymentReference: string): Promise<CustomBundleDto> => {
        const response = await apiClient.post<CustomBundleDto>(
            `/api/custom-bundles/${bundleId}/purchase`,
            { paymentReference }
        );
        return response.data;
    },

    /**
     * Get current price per paper
     */
    getPricePerPaper: async (): Promise<number> => {
        const response = await apiClient.get<PriceResponse>('/api/custom-bundles/price-per-paper');
        return response.data.pricePerPaper;
    },

    // Admin endpoints
    admin: {
        /**
         * Get all pending bundles
         */
        getPending: async (): Promise<CustomBundleDto[]> => {
            const response = await apiClient.get<CustomBundleDto[]>('/api/admin/custom-bundles/pending');
            return response.data;
        },

        /**
         * Get all approved bundles
         */
        getApproved: async (): Promise<CustomBundleDto[]> => {
            const response = await apiClient.get<CustomBundleDto[]>('/api/admin/custom-bundles/approved');
            return response.data;
        },

        /**
         * Approve a bundle
         */
        approveBundle: async (bundleId: number): Promise<CustomBundleDto> => {
            const response = await apiClient.post<CustomBundleDto>(
                `/api/admin/custom-bundles/${bundleId}/approve`
            );
            return response.data;
        },

        /**
         * Update price per paper
         */
        updatePrice: async (price: number): Promise<void> => {
            await apiClient.put('/api/admin/custom-bundles/price-per-paper', { price });
        },
    },
};
