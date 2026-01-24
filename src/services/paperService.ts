import apiClient from '@/utils/apiClient';
import {
    PaperDto,
    PaperAttemptDto,
    PaperSubmissionDto,
    StudentPaperAttemptDto,
    AttemptHistoryItem,
    AttemptDetails,
    AttemptInfo
} from '@/types';

/**
 * Service for managing papers, attempts, and submissions
 * Handles paper retrieval, attempt initiation, answer submission, and results
 */
export const paperService = {
    /**
     * Get all papers in a specific bundle
     * @param bundleId - Bundle ID
     * @returns Array of papers
     */
    getBundlePapers: async (bundleId: number): Promise<PaperDto[]> => {
        const response = await apiClient.get<PaperDto[]>('/api/papers', {
            params: { bundleId }
        });
        return response.data;
    },

    /**
     * Get all available papers (for custom bundle selection)
     * @returns Array of all papers
     */
    getAllPapers: async (): Promise<PaperDto[]> => {
        const response = await apiClient.get<PaperDto[]>('/api/papers/available');
        return response.data;
    },

    /**
     * Get details for a specific paper
     * @param id - Paper ID
     * @returns Paper details
     */
    getPaper: async (id: number): Promise<PaperDto> => {
        const response = await apiClient.get<PaperDto>(`/api/papers/${id}`);
        return response.data;
    },

    /**
     * Attempt a paper - retrieves all questions without correct answers
     * @param paperId - Paper ID to attempt
     * @param forceNew - If true, abandons existing IN_PROGRESS attempt and starts fresh
     * @returns Paper attempt data with questions
     */
    /**
     * Attempt a paper - retrieves all questions without correct answers
     * @param paperId - Paper ID to attempt
     * @param bundleId - Bundle ID (optional if customBundleId provided)
     * @param customBundleId - Custom Bundle ID (optional)
     * @param forceNew - If true, abandons existing IN_PROGRESS attempt and starts fresh
     * @returns Paper attempt data with questions
     */
    attemptPaper: async (paperId: number, bundleId?: number, customBundleId?: number, forceNew = false): Promise<PaperAttemptDto> => {
        const params: any = { forceNew: forceNew ? 'true' : undefined };
        if (bundleId) params.bundleId = bundleId;
        if (customBundleId) params.customBundleId = customBundleId;

        const response = await apiClient.get<PaperAttemptDto>(
            `/api/papers/${paperId}/attempt`,
            { params }
        );
        return response.data;
    },

    /**
     * Submit a completed paper with all answers
     * Triggers async AI analysis on backend
     * @param paperId - Paper ID
     * @param submission - Complete submission with all answers
     * @returns Created attempt record (AI feedback will be null initially)
     */
    /**
     * Submit a completed paper with all answers
     * Triggers async AI analysis on backend
     * @param paperId - Paper ID
     * @param submission - Complete submission with all answers
     * @param bundleId - Bundle ID (optional)
     * @param customBundleId - Custom Bundle ID (optional)
     * @returns Created attempt record (AI feedback will be null initially)
     */
    submitPaper: async (paperId: number, submission: PaperSubmissionDto, bundleId?: number, customBundleId?: number): Promise<StudentPaperAttemptDto> => {
        const params: any = {};
        if (bundleId) params.bundleId = bundleId;
        if (customBundleId) params.customBundleId = customBundleId;

        const response = await apiClient.post<StudentPaperAttemptDto>(
            `/api/papers/${paperId}/submit`,
            submission,
            { params }
        );
        return response.data;
    },


    /**
     * Get attempt history for a specific paper (summary list only)
     * Returns lightweight summary of all attempts by the authenticated student for the paper
     * @param paperId - Paper ID
     * @param bundleId - Optional bundle ID for bundle-scoped filtering
     * @returns List of attempt summaries ordered by start time (newest first)
     */
    getAttemptHistory: async (paperId: number, bundleId?: number): Promise<AttemptHistoryItem[]> => {
        const params = bundleId ? `?bundleId=${bundleId}` : '';
        const response = await apiClient.get<AttemptHistoryItem[]>(`/api/student-paper-attempts/paper/${paperId}/history${params}`);
        return response.data;
    },

    /**
     * Get detailed attempt with all questions, answers, and AI feedback
     * @param attemptId - Attempt ID to get details for
     * @returns Complete attempt with all answers and feedback
     * @throws {403} - If attempt belongs to different user
     * @throws {404} - If attempt not found
     */
    getAttemptDetails: async (attemptId: number): Promise<AttemptDetails> => {
        try {
            const response = await apiClient.get<AttemptDetails>(
                `/api/papers/attempts/${attemptId}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('You do not have permission to view this attempt');
            } else if (error.response?.status === 404) {
                throw new Error('Attempt not found');
            } else if (error.response?.status === 401) {
                throw new Error('Authentication required');
            } else {
                throw new Error('Failed to load attempt details');
            }
        }
    },

    /**
     * Get attempt results (alias for backward compatibility)
     * @param attemptId - Attempt ID
     * @returns Complete attempt with answers and AI feedback
     */
    getAttemptResults: async (attemptId: number): Promise<AttemptDetails> => {
        const response = await apiClient.get<AttemptDetails>(
            `/api/papers/attempts/${attemptId}`
        );
        return response.data;
    },

    /**
     * Retry AI analysis for a failed/incomplete attempt
     * @param attemptId - Attempt ID to retry
     * @returns Success status and remaining retries
     */
    retryAnalysis: async (attemptId: number): Promise<{ success: boolean, message: string, attemptCount: number, remainingAttempts: number }> => {
        const response = await apiClient.post(
            `/api/student-answers/attempts/${attemptId}/retry-analysis`
        );
        return response.data;
    },

    /**
     * Get attempt info for multiple papers
     * @param paperIds - List of paper IDs
     * @param bundleId - Bundle context
     * @param customBundleId - Custom Bundle context
     */
    getAttemptInfo: async (paperIds: number[], bundleId?: number, customBundleId?: number): Promise<Record<string, AttemptInfo>> => {
        const params: any = { paperIds: paperIds.join(',') };
        if (bundleId) params.bundleId = bundleId;
        if (customBundleId) params.customBundleId = customBundleId;

        const response = await apiClient.get<Record<string, AttemptInfo>>('/api/papers/attempt-info', { params });
        return response.data;
    }
};

