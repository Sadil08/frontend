/**
 * User authentication and profile types
 */

/** Authenticated user information */
export interface User {
  id: number;
  role: 'STUDENT' | 'ADMIN';
  email: string;
}

/** JWT authentication response */
export interface JwtResponse {
  token: string;
}

/** User registration/profile response */
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

/**
 * Bundle and Paper types
 */

/** Summary DTO for public bundle listings */
export interface PaperBundleSummaryDto {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'MCQ' | 'ESSAY' | 'MIXED';
  examType: string;
  subjectId?: number;
  lessonId?: number;
  isPastPaper: boolean;
}

/** Complete bundle details */
export interface PaperBundleDto {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'MCQ' | 'ESSAY' | 'MIXED';
  examType: string;
  subjectId?: number;
  lessonId?: number;
  isPastPaper: boolean;
}

/** Bundle details with nested papers array */
export interface PaperBundleDetailDto {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'MCQ' | 'ESSAY' | 'MIXED';
  examType: string;
  isPastPaper: boolean;
  papers: PaperDto[];
}

/** Paper information */
export interface PaperDto {
  id: number;
  name: string;
  description: string;
  bundleId: number;
  type: 'MCQ' | 'ESSAY' | 'MIXED';
  maxFreeAttempts: number;
  /** Total marks for the paper (used for weighted scoring) */
  totalMarks?: number;
}

/**
 * Question and Option types for paper attempts
 */

/** Option for MCQ questions (without correct answer flag) */
export interface OptionAttemptDto {
  id: number;
  text: string;
}

/** Question for paper attempt (without correct answers) */
export interface QuestionAttemptDto {
  id: number;
  paperId: number;
  text: string;
  type: 'MCQ' | 'ESSAY';
  marks: number;
  options: OptionAttemptDto[];
}

/** Paper attempt response with questions */
export interface PaperAttemptDto {
  id: number;
  bundleId: number;
  name: string;
  description: string;
  type: string;
  maxFreeAttempts: number;
  /** Total marks for the paper (used for weighted scoring) */
  totalMarks?: number;
  questions: QuestionAttemptDto[];
  // Attempt limit tracking
  attemptsMade?: number;
  maxAttempts?: number;
  remainingAttempts?: number;
  canAttempt?: boolean;
}

/**
 * Paper submission types
 */

/** Individual answer in submission */
export interface AnswerSubmissionDto {
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
}

/** Complete paper submission payload */
export interface PaperSubmissionDto {
  timeTakenMinutes: number;
  answers: AnswerSubmissionDto[];
}

/**
 * Student attempt and answer types with AI feedback
 */

/** Student answer with AI feedback */
export interface StudentAnswerDto {
  id: number;
  attemptId: number;
  questionId: number;
  questionText: string;
  answerText?: string;
  selectedOptionId?: number;
  submittedAt: string;
  marksAwarded: number | null;
  marksAvailable: number;
  aiFeedback: string | null;
  // Correct answer fields (only available after submission)
  correctAnswerText?: string | null;
  correctOptionId?: number | null;
  correctOptionText?: string | null;
}

/** Student paper attempt with nested answers and overall feedback */
export interface StudentPaperAttemptDto {
  id: number;
  studentId: number;
  paperId: number;
  attemptNumber: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  timeTakenMinutes?: number;
  overallFeedback: string | null;
  /** Final weighted score (calculated by backend based on paper's totalMarks) */
  totalMarks: number | null;
  /** Total marks configured for the paper (for percentage calculation) */
  paperTotalMarks?: number;
  answers: StudentAnswerDto[];
}

/**
 * Legacy types (kept for backward compatibility)
 */

/** Question with correct answer (admin use) */
export interface QuestionDto {
  id: number;
  text: string;
  type: 'MCQ' | 'ESSAY';
  correctAnswerText?: string;
  paperId: number;
}

/** Question option with correct flag (admin use) */
export interface QuestionOptionDto {
  id: number;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
  questionId: number;
}

/** Individual AI analysis (legacy) */
export interface AIAnalysisDto {
  id: number;
  answerId: number;
  feedback: string;
  marks: number;
  lessonsToReview: string;
  createdAt: string;
}

/** Overall paper analysis (legacy) */
export interface OverallPaperAnalysis {
  id: number;
  attemptId: number;
  totalMarks: number;
  overallFeedback: string;
  lessonsLacking: string;
  createdAt: string;
}

/**
 * Progress and Leaderboard types
 */

/** User progress tracking */
export interface ProgressDto {
  id: number;
  userId: number;
  bundleId: number;
  paperId: number;
  status: string;
  completionPercentage: number;
  timeSpentMinutes: number;
  updatedAt: string;
}

/** Leaderboard entry */
export interface LeaderboardEntryDto {
  studentName: string;
  marks: number;
  paperTotalMarks?: number;
  percentage?: number;
  timeTaken: number;
  isAnonymous?: boolean;
  userId?: number;
}

/** Leaderboard opt-in request */
export interface LeaderboardOptInDto {
  attemptId: number;
}

/**
 * Student bundle access types
 */

/** Student bundle access record - matches backend flat structure */
export interface StudentBundleAccess {
  accessId: number;
  bundleId: number;
  bundleName: string;
  bundleDescription: string;
  price: number;
  type: string;
  examType: string;
  isPastPaper: boolean;
  subjectName?: string;
  lessonName?: string;
  purchasedAt: string;
  paperCount: number;
}

/**
 * Cart and checkout types
 */

/** Shopping cart */
export interface Cart {
  id: number;
  userId: number;
  bundleIds: string; // JSON array
}

/**
 * Subject and Lesson types
 */

/** Subject information */
export interface SubjectDto {
  id: number;
  name: string;
  description: string;
}

/** Lesson information */
export interface LessonDto {
  id: number;
  name: string;
  description: string;
  subjectId: number;
}

/**
 * Admin user management types
 */

/** Detailed user profile for admin view */
export interface UserDetailDto {
  id: number;
  username: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  accessedBundles: PaperBundleDto[];
  attemptedPapers: StudentPaperAttemptDto[];
  progress: ProgressDto[];
  scores: LeaderboardEntryDto[];
  aiFeedbackSummaries: AIAnalysisDto[];
}

// View Past Attempts feature types
export * from './attemptTypes';