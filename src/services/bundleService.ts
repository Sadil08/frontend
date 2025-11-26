import apiClient from '@/utils/apiClient';
import { PaperBundleDetailDto, PaperBundleSummaryDto, StudentBundleAccess } from '@/types';

/**
 * Service for managing paper bundles
 * Handles bundle retrieval, purchase, and student access
 */
export const bundleService = {
  /**
   * Get all public bundles with optional filters
   * @param filters - Optional query parameters for filtering
   * @returns Array of bundle summaries
   */
  getBundles: async (filters?: Record<string, string | number>): Promise<PaperBundleSummaryDto[]> => {
    const response = await apiClient.get<PaperBundleSummaryDto[]>('/api/paper-bundles', { params: filters });
    return response.data;
  },

  /**
   * Get detailed information for a specific bundle
   * @param id - Bundle ID
   * @returns Complete bundle details
   */
  getBundle: async (id: number): Promise<PaperBundleDetailDto> => {
    const response = await apiClient.get<PaperBundleDetailDto>(`/api/paper-bundles/${id}`);
    return response.data;
  },

  /**
   * Get all bundles purchased by the current student
   * @returns Array of student bundle access records with nested bundle details
   */
  getMyBundles: async (): Promise<StudentBundleAccess[]> => {
    const response = await apiClient.get<StudentBundleAccess[]>('/api/student-bundle-accesses/my-bundles');
    return response.data;
  },

  /**
   * Purchase a bundle for the current student
   * @param id - Bundle ID to purchase
   * @returns Success response
   */
  purchaseBundle: async (id: number): Promise<void> => {
    await apiClient.post(`/api/paper-bundles/${id}/purchase`);
  }
};

// Named exports for backward compatibility
export const getBundles = bundleService.getBundles;
export const getBundle = bundleService.getBundle;
export const getMyBundles = bundleService.getMyBundles;
export const purchaseBundle = bundleService.purchaseBundle;