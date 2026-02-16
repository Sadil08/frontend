import apiClient from '@/utils/apiClient';
import { StudentAnswerDto } from '@/types';

/**
 * Service for student answer operations including draft autosave
 */

/**
 * Save draft answers for an attempt (autosave)
 * @param attemptId The paper attempt ID
 * @param answers Array of draft answers to save
 */
export const saveDraftAnswers = async (
    attemptId: number,
    answers: Partial<StudentAnswerDto>[]
): Promise<{ success: boolean; saved: number; message: string }> => {
    const response = await apiClient.post(
        `/api/student-answers/attempts/${attemptId}/save-draft`,
        answers
    );
    return response.data;
};

/**
 * Load draft answers for an attempt
 * @param attemptId The paper attempt ID
 */
export const loadDraftAnswers = async (
    attemptId: number
): Promise<StudentAnswerDto[]> => {
    const response = await apiClient.get(
        `/api/student-answers/attempts/${attemptId}/draft-answers`
    );
    return response.data;
};

/**
 * Retry failed AI analysis for an attempt
 * @param attemptId The paper attempt ID
 */
export const retryAnalysis = async (
    attemptId: number
): Promise<{ success: boolean; message: string; attemptCount: number }> => {
    const response = await apiClient.post(
        `/api/student-answers/attempts/${attemptId}/retry-analysis`
    );
    return response.data;
};

export default {
    saveDraftAnswers,
    loadDraftAnswers,
    retryAnalysis,
};
