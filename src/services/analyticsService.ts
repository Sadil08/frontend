import apiClient from '@/utils/apiClient';
import {
    AnalyticsOverview,
    UserAnalytics,
    GeographicalStats,
    DailyRevenue,
    ExtractionStats,
    BundlePerformance,
    DailyUserActivity,
    AnalyticsFilter
} from '@/types/analytics';

/**
 * Service for admin analytics API calls
 */
export const analyticsService = {
    /**
     * Get analytics overview for dashboard
     */
    getOverview: async (): Promise<AnalyticsOverview> => {
        const response = await apiClient.get<AnalyticsOverview>('/api/admin/analytics/overview');
        return response.data;
    },

    /**
     * Get detailed user analytics
     */
    async getUserAnalytics(params?: {
        page?: number;
        size?: number;
        country?: string;
        searchTerm?: string;
    }): Promise<any> {  // Return type is Spring Page<UserAnalytics>
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.set('page', params.page.toString());
        if (params?.size) queryParams.set('size', params.size.toString());
        if (params?.country) queryParams.set('country', params.country);
        if (params?.searchTerm) queryParams.set('searchTerm', params.searchTerm);

        const response = await apiClient.get(
            `/api/admin/analytics/users?${queryParams}`
        );
        return response.data;
    },

    /**
     * Get geographical statistics
     */
    getGeographicalStats: async (): Promise<GeographicalStats[]> => {
        const response = await apiClient.get<GeographicalStats[]>('/api/admin/analytics/geographical');
        return response.data;
    },

    /**
     * Get daily revenue for a date range
     */
    getDailyRevenue: async (startDate: string, endDate: string): Promise<DailyRevenue[]> => {
        const response = await apiClient.get<DailyRevenue[]>('/api/admin/analytics/revenue/daily', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    /**
     * Get extraction usage statistics
     */
    getExtractionStats: async (): Promise<ExtractionStats> => {
        const response = await apiClient.get<ExtractionStats>('/api/admin/analytics/extractions');
        return response.data;
    },

    /**
     * Get bundle performance statistics
     */
    getBundlePerformance: async (): Promise<BundlePerformance[]> => {
        const response = await apiClient.get<BundlePerformance[]>('/api/admin/analytics/bundles');
        return response.data;
    },

    /**
     * Get daily user activity for a date range
     */
    getDailyUserActivity: async (startDate: string, endDate: string): Promise<DailyUserActivity[]> => {
        const response = await apiClient.get<DailyUserActivity[]>('/api/admin/analytics/user-activity/daily', {
            params: { startDate, endDate }
        });
        return response.data;
    }
};

export default analyticsService;
