import apiClient from '@/utils/apiClient';
import {
    SystemStatsDto,
    AdminBundleDto,
    BundleStatsDto,
    BundleCreateDto,
    AdminPaperDto,
    PaperCreateDto,
    QuestionCreateDto,
    AdminUserDto,
    UserBundleAccessDto,
    UserAttemptInfoDto,
    GrantBundleAccessDto,
    UpdateAttemptLimitDto
} from '@/types/admin';
import { SubjectDto, LessonDto } from '@/types';

/**
 * Admin Service
 * Handles all admin management operations including system statistics,
 * bundle/paper/user CRUD, and advanced features like access grants and attempt limits
 * 
 * All endpoints require ADMIN role authentication
 */
export const adminService = {
    // ============================================================================
    // System Statistics (1 endpoint)
    // ============================================================================

    /**
     * Get platform-wide statistics for admin dashboard
     * GET /api/admin/bundles/stats
     */
    getSystemStats: async (): Promise<SystemStatsDto> => {
        const response = await apiClient.get<SystemStatsDto>('/api/admin/bundles/stats');
        return response.data;
    },

    // ============================================================================
    // Bundle Management (8 endpoints)
    // ============================================================================

    /**
     * Get all bundles with statistics
     * GET /api/admin/bundles
     */
    getBundles: async (): Promise<AdminBundleDto[]> => {
        const response = await apiClient.get<AdminBundleDto[]>('/api/admin/bundles');
        return response.data;
    },

    /**
     * Get statistics for a specific bundle
     * GET /api/admin/bundles/{id}
     */
    getBundleStats: async (id: number): Promise<BundleStatsDto> => {
        const response = await apiClient.get<BundleStatsDto>(`/api/admin/bundles/${id}`);
        return response.data;
    },

    /**
     * Create a new bundle
     * POST /api/admin/bundles
     */
    createBundle: async (data: BundleCreateDto): Promise<AdminBundleDto> => {
        const response = await apiClient.post<AdminBundleDto>('/api/admin/bundles', data);
        return response.data;
    },

    /**
     * Update an existing bundle
     * PUT /api/admin/bundles/{id}
     */
    updateBundle: async (id: number, data: BundleCreateDto): Promise<AdminBundleDto> => {
        const response = await apiClient.put<AdminBundleDto>(`/api/admin/bundles/${id}`, data);
        return response.data;
    },

    /**
     * Delete a bundle
     * DELETE /api/admin/bundles/{id}
     */
    deleteBundle: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/admin/bundles/${id}`);
    },

    /**
     * Add a paper to a bundle
     * POST /api/admin/bundles/{bundleId}/papers/{paperId}
     */
    addPaperToBundle: async (bundleId: number, paperId: number): Promise<void> => {
        await apiClient.post(`/api/admin/bundles/${bundleId}/papers/${paperId}`);
    },

    /**
     * Remove a paper from a bundle
     * DELETE /api/admin/bundles/{bundleId}/papers/{paperId}
     */
    removePaperFromBundle: async (bundleId: number, paperId: number): Promise<void> => {
        await apiClient.delete(`/api/admin/bundles/${bundleId}/papers/${paperId}`);
    },

    // ============================================================================
    // Paper Management (8 endpoints)
    // ============================================================================

    /**
     * Get all papers with statistics
     * GET /api/admin/papers
     */
    getPapers: async (): Promise<AdminPaperDto[]> => {
        const response = await apiClient.get<AdminPaperDto[]>('/api/admin/papers');
        return response.data;
    },

    /**
     * Get a specific paper with full question details
     * GET /api/admin/papers/{id}
     */
    getPaper: async (id: number): Promise<AdminPaperDto> => {
        const response = await apiClient.get<AdminPaperDto>(`/api/admin/papers/${id}`);
        return response.data;
    },

    /**
     * Create a new paper
     * POST /api/admin/papers
     */
    createPaper: async (data: PaperCreateDto): Promise<AdminPaperDto> => {
        const response = await apiClient.post<AdminPaperDto>('/api/admin/papers', data);
        return response.data;
    },

    /**
     * Update an existing paper
     * PUT /api/admin/papers/{id}
     */
    updatePaper: async (id: number, data: PaperCreateDto): Promise<AdminPaperDto> => {
        const response = await apiClient.put<AdminPaperDto>(`/api/admin/papers/${id}`, data);
        return response.data;
    },

    /**
     * Delete a paper (cascades to delete all questions)
     * DELETE /api/admin/papers/{id}
     */
    deletePaper: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/admin/papers/${id}`);
    },

    /**
     * Add a question to a paper
     * POST /api/admin/papers/{paperId}/questions
     */
    addQuestion: async (paperId: number, data: QuestionCreateDto): Promise<any> => {
        const response = await apiClient.post(`/api/admin/papers/${paperId}/questions`, data);
        return response.data;
    },

    /**
     * Update a question
     * PUT /api/admin/papers/{paperId}/questions/{questionId}
     */
    updateQuestion: async (paperId: number, questionId: number, data: QuestionCreateDto): Promise<any> => {
        const response = await apiClient.put(`/api/admin/papers/${paperId}/questions/${questionId}`, data);
        return response.data;
    },

    /**
     * Delete a question
     * DELETE /api/admin/papers/{paperId}/questions/{questionId}
     */
    deleteQuestion: async (paperId: number, questionId: number): Promise<void> => {
        await apiClient.delete(`/api/admin/papers/${paperId}/questions/${questionId}`);
    },

    // ============================================================================
    // User Management (7 endpoints)
    // ============================================================================

    /**
     * Get all users with statistics
     * GET /api/admin/users
     */
    getUsers: async (search?: string, page = 0, size = 10): Promise<{ content: AdminUserDto[], totalElements: number }> => {
        const response = await apiClient.get<any>('/api/admin/users', {
            params: { search, page, size }
        });
        // Handle both Page structure and legacy List structure gracefully (though backend now returns Page)
        if (Array.isArray(response.data)) {
            return { content: response.data, totalElements: response.data.length };
        }
        return response.data;
    },

    /**
     * Get a specific user's details
     * GET /api/admin/users/{id}
     */
    getUser: async (id: number): Promise<AdminUserDto> => {
        const response = await apiClient.get<AdminUserDto>(`/api/admin/users/${id}`);
        return response.data;
    },

    /**
     * Get all bundles a user has access to
     * GET /api/admin/users/{userId}/bundles
     */
    getUserBundles: async (userId: number): Promise<UserBundleAccessDto[]> => {
        const response = await apiClient.get<UserBundleAccessDto[]>(`/api/admin/users/${userId}/bundles`);
        return response.data;
    },

    /**
     * Grant bundle access to a user
     * POST /api/admin/users/{userId}/bundles
     */
    grantBundleAccess: async (userId: number, data: GrantBundleAccessDto): Promise<UserBundleAccessDto> => {
        const response = await apiClient.post<UserBundleAccessDto>(`/api/admin/users/${userId}/bundles`, data);
        return response.data;
    },

    /**
     * Revoke bundle access from a user
     * DELETE /api/admin/users/{userId}/bundles/{bundleId}
     */
    revokeBundleAccess: async (userId: number, bundleId: number): Promise<void> => {
        await apiClient.delete(`/api/admin/users/${userId}/bundles/${bundleId}`);
    },

    /**
     * Get user's paper attempt information
     * GET /api/admin/users/{userId}/attempts
     */
    getUserAttempts: async (userId: number): Promise<UserAttemptInfoDto[]> => {
        const response = await apiClient.get<UserAttemptInfoDto[]>(`/api/admin/users/${userId}/attempts`);
        return response.data;
    },

    /**
     * Update attempt limit for a user on a specific paper
     * PUT /api/admin/users/{userId}/papers/{paperId}/attempts
     * Note: Currently updates global limit for all users on this paper
     */
    updateAttemptLimit: async (userId: number, paperId: number, data: UpdateAttemptLimitDto): Promise<void> => {
        await apiClient.put(`/api/admin/users/${userId}/papers/${paperId}/attempts`, data);
    },

    // ============================================================================
    // Subject & Lesson Management (Legacy endpoints, kept for backward compatibility)
    // ============================================================================

    /**
     * Get all subjects
     * GET /api/subjects
     */
    getSubjects: async (): Promise<SubjectDto[]> => {
        const response = await apiClient.get<SubjectDto[]>('/api/subjects');
        return response.data;
    },

    /**
     * Create a new subject
     * POST /api/subjects
     */
    createSubject: async (data: any): Promise<SubjectDto> => {
        const response = await apiClient.post<SubjectDto>('/api/subjects', data);
        return response.data;
    },

    /**
     * Update a subject
     * PUT /api/subjects/{id}
     */
    updateSubject: async (id: number, data: any): Promise<SubjectDto> => {
        const response = await apiClient.put<SubjectDto>(`/api/subjects/${id}`, data);
        return response.data;
    },

    /**
     * Delete a subject
     * DELETE /api/subjects/{id}
     */
    deleteSubject: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/subjects/${id}`);
    },

    /**
     * Get all lessons
     * GET /api/lessons
     */
    getLessons: async (): Promise<LessonDto[]> => {
        const response = await apiClient.get<LessonDto[]>('/api/lessons');
        return response.data;
    },

    /**
     * Create a new lesson
     * POST /api/lessons
     */
    createLesson: async (data: any): Promise<LessonDto> => {
        const response = await apiClient.post<LessonDto>('/api/lessons', data);
        return response.data;
    },

    /**
     * Update a lesson
     * PUT /api/lessons/{id}
     */
    updateLesson: async (id: number, data: any): Promise<LessonDto> => {
        const response = await apiClient.put<LessonDto>(`/api/lessons/${id}`, data);
        return response.data;
    },

    /**
     * Delete a lesson
     * DELETE /api/lessons/{id}
     */
    deleteLesson: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/lessons/${id}`);
    },

    // ============================================================================
    // Exam Type Management
    // ============================================================================

    /**
     * Get all exam types
     */
    getExamTypes: async (): Promise<any[]> => {
        const response = await apiClient.get<any[]>('/api/exam-types');
        return response.data;
    },

    /**
     * Create exam type
     */
    createExamType: async (data: any): Promise<any> => {
        const response = await apiClient.post<any>('/api/exam-types', data);
        return response.data;
    },

    /**
     * Update exam type
     */
    updateExamType: async (id: number, data: any): Promise<any> => {
        const response = await apiClient.put<any>(`/api/exam-types/${id}`, data);
        return response.data;
    },

    /**
     * Delete exam type
     */
    deleteExamType: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/exam-types/${id}`);
    },

    // ============================================================================
    // PDF Import (1 endpoint)
    // ============================================================================

    /**
     * Import questions from PDF files using AI extraction
     * POST /api/questions/import-from-pdf
     * Returns parsed questions for admin review (does NOT save)
     */
    importFromPdf: async (data: {
        questionPaper: File;
        answerPaper?: File;
        subject?: string;
        lesson?: string;
        paperType?: string;
        defaultMarks?: number;
    }): Promise<{
        questions: Array<{
            questionNumber: number;
            text: string;
            type: 'MCQ' | 'ESSAY';
            marks: number | null;
            options: Array<{ text: string; isCorrect: boolean }> | null;
            modelAnswer: string | null;
            startPage: number | null;
            endPage: number | null;
        }>;
        totalQuestions: number;
        paperTitle: string | null;
        questionImages: string[] | null;  // Supabase URLs, one per question (stitched)
    }> => {
        const formData = new FormData();
        formData.append('questionPaper', data.questionPaper);
        if (data.answerPaper) {
            formData.append('answerPaper', data.answerPaper);
        }
        if (data.subject) formData.append('subject', data.subject);
        if (data.lesson) formData.append('lesson', data.lesson);
        if (data.paperType) formData.append('paperType', data.paperType);
        if (data.defaultMarks) formData.append('defaultMarks', data.defaultMarks.toString());

        const token = localStorage.getItem('token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const response = await fetch(`${API_URL}/api/questions/import-from-pdf`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'PDF import failed');
        }

        return response.json();
    }
};
