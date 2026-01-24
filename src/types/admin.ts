/**
 * Admin-specific TypeScript interfaces for EduApp Admin Management System
 * All DTOs align with backend API spec documented in admin_managment_api.md
 */

// ============================================================================
// System Statistics
// ============================================================================

/** Platform-wide statistics for admin dashboard */
export interface SystemStatsDto {
    totalBundles: number;
    totalPapers: number;
    totalQuestions: number;
    totalUsers: number;
    totalAttempts: number;
    totalRevenue: number;
}

// ============================================================================
// Bundle Management
// ============================================================================

/** Statistics for a specific bundle */
export interface BundleStatsDto {
    bundleId: number;
    bundleName: string;
    totalPapers: number;
    totalQuestions: number;
    totalStudentsWithAccess: number;
    totalAttempts: number;
}

/** Admin bundle DTO with nested statistics */
export interface AdminBundleDto {
    id: number;
    name: string;
    description: string;
    price: number;
    type: 'MCQ' | 'ESSAY' | 'MIXED';
    examTypeId: number;
    examTypeName: string;
    subjectId: number | null;
    lessonId: number | null;
    isPastPaper: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: number | null;
    stats: BundleStatsDto;
}

/** Bundle create/update request DTO */
export interface BundleCreateDto {
    name: string;
    description: string;
    price: number;
    type: 'MCQ' | 'ESSAY' | 'MIXED';
    examTypeId: number;
    isPastPaper: boolean;
    subjectId?: number;
    lessonId?: number;
}

// ============================================================================
// Paper Management
// ============================================================================

/** Admin paper DTO with attempt statistics */
export interface AdminPaperDto {
    id: number;
    name: string;
    description: string;
    type: 'MCQ' | 'ESSAY' | 'MIXED';
    bundleIds: number[]; // Changed from bundleId
    subjectId?: number | null;
    subjectName?: string | null;
    maxFreeAttempts: number;
    /** Total marks for the paper (used for weighted scoring) */
    totalMarks?: number;
    createdAt: string;
    updatedAt: string;
    createdBy: number | null;
    totalAttempts: number;
    averageScore: number;
    questions: AdminQuestionDto[];
}

/** Admin question DTO with correct answers and marks */
export interface AdminQuestionDto {
    id: number;
    paperId: number;
    text: string;
    type: 'MCQ' | 'ESSAY';
    correctAnswerText: string;
    imageUrl?: string;
    modelAnswerImageUrl?: string;
    lessonId?: number | null;
    lessonName?: string | null;
    requiresImageDisplay?: boolean;
    hideQuestionText?: boolean;
    allowImageAnswer?: boolean;
    answerTypeHint?: 'short' | 'essay' | 'diagram';
    marks: number;
    options: AdminQuestionOptionDto[];
}

/** Question option DTO for admin */
export interface AdminQuestionOptionDto {
    id?: number;
    text: string;
    isCorrect: boolean;
}

/** Paper create/update request DTO */
export interface PaperCreateDto {
    name: string;
    description: string;
    type: 'MCQ' | 'ESSAY' | 'MIXED';
    maxFreeAttempts: number;
    /** Total marks for the paper (used for weighted scoring) */
    totalMarks?: number;
    bundleIds?: number[];
    subjectId?: number;
}

/** Question create/update request DTO */
export interface QuestionCreateDto {
    text: string;
    type: 'MCQ' | 'ESSAY';
    correctAnswerText: string;
    imageUrl?: string;
    modelAnswerImageUrl?: string;
    extractedText?: string;
    lessonId?: number | null;
    requiresImageDisplay?: boolean;
    hideQuestionText?: boolean;
    allowImageAnswer?: boolean;
    answerTypeHint?: 'short' | 'essay' | 'diagram';
    marks: number;
    options: AdminQuestionOptionDto[];
}

// ============================================================================
// User Management
// ============================================================================

/** Admin user DTO with statistics */
export interface AdminUserDto {
    id: number;
    username: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
    createdAt: string;
    totalBundlesPurchased: number;
    totalAttempts: number;
}

/** User bundle access record with admin grant tracking */
export interface UserBundleAccessDto {
    accessId: number;
    bundleId: number;
    bundleName: string;
    purchasedAt: string;
    grantedByAdmin: boolean;
    grantedBy: number | null;
    grantReason: string | null;
}

/** User attempt information for a specific paper */
export interface UserAttemptInfoDto {
    userId: number;
    paperId: number;
    paperName: string;
    attemptsMade: number;
    maxFreeAttempts: number;
    remainingAttempts: number; // Calculated: max - made
}

/** Grant bundle access request DTO */
export interface GrantBundleAccessDto {
    userId: number;
    bundleId: number;
    reason: string;
}

/** Update attempt limit request DTO */
export interface UpdateAttemptLimitDto {
    userId: number;
    paperId: number;
    maxFreeAttempts: number;
}
