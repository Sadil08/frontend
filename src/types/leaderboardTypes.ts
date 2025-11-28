/**
 * Type definitions for View Leaderboard feature
 * Matches backend API response formats exactly
 */

/**
 * Individual leaderboard entry with ranking information
 * Used in GET /api/leaderboard/paper/{paperId}
 */
export interface LeaderboardEntry {
    rank: number;
    studentName: string;
    marks: number;
    timeTaken: number;
    userId: number;
    isCurrentUser?: boolean;
}

/**
 * Summary statistics for leaderboard
 */
export interface LeaderboardStats {
    totalParticipants: number;
    topScore: number;
    averageScore: number;
    fastestTime?: number;
}

/**
 * Props interface for LeaderboardTable component
 */
export interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
    currentUserId?: number;
    loading?: boolean;
    stats?: LeaderboardStats;
}

/**
 * Props interface for PaperLeaderboardPage
 */
export interface PaperLeaderboardPageProps {
    paperId: number;
    currentUserId?: number;
}
