import apiClient from '@/utils/apiClient';
import {
    PaperDto,
    PaperAttemptDto,
    PaperSubmissionDto,
    StudentPaperAttemptDto
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
     * @returns Paper attempt data with questions
     */
    attemptPaper: async (paperId: number): Promise<PaperAttemptDto> => {
        const response = await apiClient.get<PaperAttemptDto>(`/api/papers/${paperId}/attempt`);
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
     * Get results for a specific attempt
     * Includes AI feedback if analysis is complete
     * @param attemptId - Attempt ID
     * @returns Complete attempt with answers and AI feedback
     */
    getAttemptResults: async (attemptId: number): Promise<StudentPaperAttemptDto> => {
        const response = await apiClient.get<StudentPaperAttemptDto>(`/api/papers/attempts/${attemptId}`);
        return response.data;
    }
};

