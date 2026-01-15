import apiClient from '@/utils/apiClient';
import {
    PaperDto,
    PaperAttemptDto,
    PaperSubmissionDto,
    StudentPaperAttemptDto,
    AttemptHistoryItem,
    AttemptDetails
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
    attemptPaper: async (paperId: number, forceNew = false): Promise<PaperAttemptDto> => {
        const response = await apiClient.get<PaperAttemptDto>(
            `/api/papers/${paperId}/attempt`,
            { params: forceNew ? { forceNew: 'true' } : undefined }
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
    submitPaper: async (paperId: number, submission: PaperSubmissionDto): Promise<StudentPaperAttemptDto> => {
        const response = await apiClient.post<StudentPaperAttemptDto>(
            `/api/papers/${paperId}/submit`,
            submission
        );
        return response.data;
    },


    /**
     * Get attempt history for a specific paper (summary list only)
     * Returns lightweight summary of all attempts by the authenticated student for the paper
     * @param paperId - Paper ID
     * @returns List of attempt summaries ordered by start time (newest first)
     */
    getAttemptHistory: async (paperId: number): Promise<AttemptHistoryItem[]> => {
        const response = await apiClient.get<AttemptHistoryItem[]>(`/api/student-paper-attempts/paper/${paperId}/history`);
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
    }
};

