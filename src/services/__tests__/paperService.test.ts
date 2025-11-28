import { paperService } from '../paperService';
import apiClient from '@/utils/apiClient';

// Mock the apiClient
jest.mock('@/utils/apiClient');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('PaperService - Attempt Methods', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAttemptHistory', () => {
        it('should fetch attempt history successfully', async () => {
            // Arrange
            const paperId = 9;
            const mockResponse = [
                {
                    id: 53,
                    attemptNumber: 6,
                    status: 'SUBMITTED',
                    completedAt: '2025-11-28T07:39:02.743675',
                    timeTakenMinutes: 1,
                    totalMarks: 3,
                    overallFeedbackSummary: 'Excellent start! The first question...'
                }
            ];
            mockApiClient.get.mockResolvedValue({ data: mockResponse });

            // Act
            const result = await paperService.getAttemptHistory(paperId);

            // Assert
            expect(mockApiClient.get).toHaveBeenCalledWith(
                `/api/student-paper-attempts/paper/${paperId}/history`
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle API errors', async () => {
            // Arrange
            const paperId = 9;
            mockApiClient.get.mockRejectedValue(new Error('Network error'));

            // Act & Assert
            await expect(paperService.getAttemptHistory(paperId))
                .rejects.toThrow('Network error');
        });
    });

    describe('getAttemptDetails', () => {
        it('should fetch attempt details successfully', async () => {
            // Arrange
            const attemptId = 53;
            const mockResponse = {
                id: 53,
                studentId: 2,
                paperId: 9,
                attemptNumber: 6,
                status: 'SUBMITTED',
                overallFeedback: 'Excellent work!',
                answers: []
            };
            mockApiClient.get.mockResolvedValue({ data: mockResponse });

            // Act
            const result = await paperService.getAttemptDetails(attemptId);

            // Assert
            expect(mockApiClient.get).toHaveBeenCalledWith(
                `/api/papers/attempts/${attemptId}`
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle 403 Forbidden error', async () => {
            // Arrange
            const attemptId = 53;
            const error = {
                response: { status: 403, data: { message: 'Forbidden' } }
            };
            mockApiClient.get.mockRejectedValue(error);

            // Act & Assert
            await expect(paperService.getAttemptDetails(attemptId))
                .rejects.toThrow('You do not have permission to view this attempt');
        });

        it('should handle 404 Not Found error', async () => {
            // Arrange
            const attemptId = 53;
            const error = {
                response: { status: 404, data: { message: 'Not Found' } }
            };
            mockApiClient.get.mockRejectedValue(error);

            // Act & Assert
            await expect(paperService.getAttemptDetails(attemptId))
                .rejects.toThrow('Attempt not found');
        });

        it('should handle 401 Unauthorized error', async () => {
            // Arrange
            const attemptId = 53;
            const error = {
                response: { status: 401, data: { message: 'Unauthorized' } }
            };
            mockApiClient.get.mockRejectedValue(error);

            // Act & Assert
            await expect(paperService.getAttemptDetails(attemptId))
                .rejects.toThrow('Authentication required');
        });
    });

    describe('getAttemptResults', () => {
        it('should fetch attempt results successfully', async () => {
            // Arrange
            const attemptId = 53;
            const mockResponse = {
                id: 53,
                studentId: 2,
                paperId: 9,
                attemptNumber: 6,
                status: 'SUBMITTED',
                overallFeedback: 'Excellent work!',
                answers: []
            };
            mockApiClient.get.mockResolvedValue({ data: mockResponse });

            // Act
            const result = await paperService.getAttemptResults(attemptId);

            // Assert
            expect(mockApiClient.get).toHaveBeenCalledWith(
                `/api/papers/attempts/${attemptId}`
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle API errors', async () => {
            // Arrange
            const attemptId = 53;
            mockApiClient.get.mockRejectedValue(new Error('Network error'));

            // Act & Assert
            await expect(paperService.getAttemptResults(attemptId))
                .rejects.toThrow('Network error');
        });
    });
});