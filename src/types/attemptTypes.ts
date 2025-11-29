/**
 * Type definitions for View Past Attempts feature
 * Matches backend API response formats exactly
 */

/**
 * Summary data for attempt history list
 * Used in GET /api/student-paper-attempts/paper/{paperId}/history
 */
export interface AttemptHistoryItem {
    id: number;
    attemptNumber: number;
    status: string;
    completedAt: string;
    timeTakenMinutes: number;
    /** Final weighted score (scaled based on paper's totalMarks) */
    totalMarks: number;
    /** Paper's configured total marks (for percentage calculation) */
    paperTotalMarks?: number;
    overallFeedbackSummary: string;
}

/**
 * Individual answer within an attempt
 * Contains student answer, correct answer, marks, and AI feedback
 */
export interface AttemptAnswer {
    id: number;
    attemptId: number;
    questionId: number;
    questionText: string;
    answerText?: string;
    selectedOptionId?: number;
    marksAwarded: number;
    marksAvailable: number;
    aiFeedback: string;
    correctAnswerText?: string;
    correctOptionId?: number;
    correctOptionText?: string;
}

/**
 * Complete attempt details with all answers
 * Used in GET /api/papers/attempts/{attemptId}
 */
export interface AttemptDetails {
    id: number;
    studentId: number;
    paperId: number;
    attemptNumber: number;
    status: string;
    startedAt: string;
    completedAt: string;
    timeTakenMinutes: number;
    /** Final weighted score (scaled based on paper's totalMarks) */
    totalMarks: number;
    /** Paper's configured total marks (for percentage calculation) */
    paperTotalMarks?: number;
    overallFeedback: string;
    answers: AttemptAnswer[];
}

/**
 * Props interface for AttemptHistory component
 */
export interface AttemptHistoryProps {
    attempts: AttemptHistoryItem[];
    paperId: number;
    loading?: boolean;
    onAttemptSelect?: (attemptId: number) => void;
}

/**
 * Props interface for AttemptDetails page
 */
export interface AttemptDetailsProps {
    attempt: AttemptDetails;
    onBackClick?: () => void;
}

/**
 * Props interface for individual question cards
 */
export interface AttemptQuestionCardProps {
    answer: AttemptAnswer;
    questionNumber: number;
    showFeedback?: boolean;
}