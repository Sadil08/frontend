import apiClient from '@/utils/apiClient';
import { LeaderboardEntryDto, LeaderboardOptInDto } from '@/types';

/**
 * Service for managing leaderboard functionality
 * Handles leaderboard retrieval and opt-in
 */
export const leaderboardService = {
  /**
   * Get leaderboard entries for a specific paper
   * @param paperId - Paper ID
   * @returns Array of leaderboard entries with student names, marks, and time
   */
  getPaperLeaderboard: async (paperId: number): Promise<LeaderboardEntryDto[]> => {
    const response = await apiClient.get<LeaderboardEntryDto[]>(`/api/leaderboard/paper/${paperId}`);
    return response.data;
  },

  /**
   * Opt-in to show attempt results on leaderboard
   * @param attemptId - Attempt ID to make public
   */
  optInToLeaderboard: async (attemptId: number): Promise<void> => {
    const payload: LeaderboardOptInDto = { attemptId };
    await apiClient.post('/api/leaderboard/opt-in', payload);
  },

  /**
   * Legacy method - kept for backward compatibility
   * Returns empty array as general leaderboard endpoint not available
   * @deprecated Use getPaperLeaderboard instead
   */
  getLeaderboard: async (): Promise<LeaderboardEntryDto[]> => {
    // Return empty array or fetch from a general endpoint if available
    return [];
  }
};

// Export individual functions for backward compatibility
export const getLeaderboard = leaderboardService.getLeaderboard;
export const createLeaderboardEntry = async (data: Partial<LeaderboardEntryDto>): Promise<LeaderboardEntryDto> => {
  // Legacy method - no longer supported
  throw new Error('createLeaderboardEntry is deprecated. Use optInToLeaderboard instead.');
};