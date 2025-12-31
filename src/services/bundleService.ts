import apiClient from '@/utils/apiClient';
import { PaperBundleDetailDto, PaperBundleSummaryDto, StudentBundleAccess, SubjectDto, LessonDto } from '@/types';

/**
 * Filter parameters for bundle queries
 */
export interface BundleFilterParams {
  type?: 'MCQ' | 'ESSAY' | 'MIXED';
  examTypeId?: number;
  subjectId?: number;
  lessonId?: number;
  isPastPaper?: boolean;
  minPrice?: number;
  maxPrice?: number;
  name?: string;
}

/**
 * Service for managing paper bundles
 * Handles bundle retrieval, purchase, and student access
 */
export const bundleService = {
  /**
   * Filter bundles by multiple criteria using the new filter endpoint
   * @param filters - Optional filter parameters
   * @returns Array of bundle summaries matching the filters
   */
  filterBundles: async (filters?: BundleFilterParams): Promise<PaperBundleSummaryDto[]> => {
    const response = await apiClient.get<PaperBundleSummaryDto[]>('/api/paper-bundles/filter', { params: filters });
    return response.data;
  },

  /**
   * Search bundles by name using case-insensitive partial matching
   * @param name - Search term
   * @returns Array of bundle summaries matching the search term
   */
  searchBundles: async (name: string): Promise<PaperBundleSummaryDto[]> => {
    const response = await apiClient.get<PaperBundleSummaryDto[]>('/api/paper-bundles/search', {
      params: { name }
    });
    return response.data;
  },

  /**
   * Get all public bundles with optional filters (uses filter endpoint)
   * @param filters - Optional query parameters for filtering
   * @returns Array of bundle summaries
   */
  getBundles: async (filters?: BundleFilterParams): Promise<PaperBundleSummaryDto[]> => {
    const response = await apiClient.get<PaperBundleSummaryDto[]>('/api/paper-bundles/filter', { params: filters });
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
  },

  /**
   * Get all subjects
   * @returns Array of subjects
   */
  getSubjects: async (): Promise<SubjectDto[]> => {
    const response = await apiClient.get<SubjectDto[]>('/api/subjects');
    return response.data;
  },

  /**
   * Get all lessons
   * @returns Array of lessons
   */
  getLessons: async (): Promise<LessonDto[]> => {
    const response = await apiClient.get<LessonDto[]>('/api/lessons');
    return response.data;
  },

  /**
   * Get all exam types
   * @returns Array of exam types
   */
  getExamTypes: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/api/exam-types');
    return response.data;
  }
};

// Named exports for backward compatibility
export const filterBundles = bundleService.filterBundles;
export const searchBundles = bundleService.searchBundles;
export const getBundles = bundleService.getBundles;
export const getBundle = bundleService.getBundle;
export const getMyBundles = bundleService.getMyBundles;
export const purchaseBundle = bundleService.purchaseBundle;
export const getSubjects = bundleService.getSubjects;
export const getLessons = bundleService.getLessons;
export const getExamTypes = bundleService.getExamTypes;