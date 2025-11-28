# View Past Attempts Feature - Implementation Tasks

## Task Overview
This document provides granular, step-by-step tasks for implementing the View Past Attempts feature. Each task includes specific code changes, file modifications, and testing steps.

## Development Environment Setup

### Pre-requisites Checklist
- [ ] Node.js 18+ installed
- [ ] Next.js 14.2.4 project running
- [ ] TypeScript configuration verified
- [ ] Tailwind CSS properly configured
- [ ] Ant Design components available
- [ ] Backend API endpoints available for testing

### Environment Verification
```bash
# Verify project setup
npm list next react typescript antd tailwindcss axios
# Expected versions should match spec: next@14.2.4, antd@5.22.4, tailwindcss@3.4.18, axios@1.7.9
```

---

## Phase 1: Core API Integration & Services (Foundation)

### Task 1.1: Create Attempt Type Definitions

**File**: `src/types/attemptTypes.ts`
**Duration**: 30 minutes
**Complexity**: Low

**Steps**:
1. [ ] Create new file `src/types/attemptTypes.ts`
2. [ ] Add TypeScript interfaces for attempt data structures
3. [ ] Ensure interfaces match API response formats
4. [ ] Export all types for use in components

**Implementation**:
```typescript
// src/types/attemptTypes.ts
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
    totalMarks: number;
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
    totalMarks: number;
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
```

**Verification**:
- [ ] File created at correct path
- [ ] All interfaces match API specification
- [ ] TypeScript compiles without errors
- [ ] Imports work correctly

### Task 1.2: Extend paperService with New Methods

**File**: `src/services/paperService.ts`
**Duration**: 45 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Open existing `src/services/paperService.ts`
2. [ ] Add new methods to the `paperService` object
3. [ ] Use existing `apiClient` for consistency
4. [ ] Implement proper error handling
5. [ ] Add TypeScript return types
6. [ ] Test methods with sample data

**Implementation**:
```typescript
// Add these methods to the existing paperService object in src/services/paperService.ts

/**
 * Get attempt history for a specific paper (summary list only)
 * @param paperId - Paper ID to get attempts for
 * @returns Array of attempt summaries ordered by start time (newest first)
 */
getAttemptHistory: async (paperId: number): Promise<AttemptHistoryItem[]> => {
    const response = await apiClient.get<AttemptHistoryItem[]>(
        `/api/student-paper-attempts/paper/${paperId}/history`
    );
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
    const response = await apiClient.get<AttemptDetails>(
        `/api/papers/attempts/${attemptId}`
    );
    return response.data;
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
}
```

**Add Required Import**:
```typescript
// Add to top of paperService.ts file
import { AttemptHistoryItem, AttemptDetails } from '@/types/attemptTypes';
```

**Error Handling Implementation**:
```typescript
// Enhanced error handling for getAttemptDetails
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
}
```

**Testing Steps**:
1. [ ] Import `AttemptHistoryItem` and `AttemptDetails` types
2. [ ] Add new methods to service object
3. [ ] Verify TypeScript compilation
4. [ ] Test with mock data (create sample responses)
5. [ ] Verify error handling works correctly

### Task 1.3: Create Service Tests

**File**: `src/services/__tests__/paperService.test.ts`
**Duration**: 30 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Create test directory if it doesn't exist
2. [ ] Create test file for paperService
3. [ ] Mock apiClient for testing
4. [ ] Test new methods with mock responses
5. [ ] Test error handling scenarios

**Implementation**:
```typescript
// src/services/__tests__/paperService.test.ts
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
    });
});
```

**Verification**:
- [ ] Test file created in correct location
- [ ] All new methods have test coverage
- [ ] Error scenarios are tested
- [ ] Mock setup is correct

### Task 1.4: Update Main Type Index

**File**: `src/types/index.ts`
**Duration**: 15 minutes
**Complexity**: Low

**Steps**:
1. [ ] Open existing `src/types/index.ts`
2. [ ] Add re-exports for new attempt types
3. [ ] Verify no naming conflicts
4. [ ] Test imports work from new location

**Implementation**:
```typescript
// Add to src/types/index.ts (at the end of the file)

// View Past Attempts feature types
export * from './attemptTypes';
```

**Verification**:
- [ ] Export added without conflicts
- [ ] Types can be imported from main index
- [ ] No TypeScript compilation errors

---

## Phase 2: Enhanced Attempt History Components (Core UI)

### Task 2.1: Create Enhanced AttemptHistory Component

**File**: `src/components/AttemptHistory.tsx` (Replace existing)
**Duration**: 60 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Backup existing `AttemptHistory.tsx` component
2. [ ] Replace with enhanced version
3. [ ] Update imports to use new types
4. [ ] Test component rendering
5. [ ] Verify styling matches design system

**Implementation**:
```typescript
// src/components/AttemptHistory.tsx
"use client";

import React from 'react';
import { Card, Tag, Empty, Button, Typography } from 'antd';
import { ClockCircleOutlined, TrophyOutlined, EyeOutlined } from '@ant-design/icons';
import { AttemptHistoryItem, AttemptHistoryProps } from '@/types/attemptTypes';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

/**
 * Enhanced Attempt History Component
 * Displays attempt summary cards with improved UX and visual hierarchy
 */
const AttemptHistory: React.FC<AttemptHistoryProps> = ({ 
    attempts, 
    paperId, 
    loading = false,
    onAttemptSelect 
}) => {
    const router = useRouter();

    const getStatusColor = (status: string): string => {
        switch (status.toUpperCase()) {
            case 'SUBMITTED':
                return 'green';
            case 'IN_PROGRESS':
                return 'blue';
            case 'ABANDONED':
                return 'red';
            default:
                return 'default';
        }
    };

    const getPerformanceColor = (percentage: number): string => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const calculatePercentage = (attempt: AttemptHistoryItem): number => {
        // Calculate based on total marks - this is a simplified calculation
        // In real implementation, you might need total possible marks from paper
        const totalPossible = 20; // Placeholder - should come from paper data
        return totalPossible > 0 ? (attempt.totalMarks / totalPossible) * 100 : 0;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAttemptClick = (attemptId: number) => {
        if (onAttemptSelect) {
            onAttemptSelect(attemptId);
        } else {
            // Default navigation behavior
            router.push(`/papers/${paperId}/attempts/${attemptId}`);
        }
    };

    const handleStartAttempt = () => {
        router.push(`/papers/${paperId}/attempt`);
    };

    // Loading State
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="skeleton h-32 w-full rounded-lg animate-pulse" />
                <div className="skeleton h-32 w-full rounded-lg animate-pulse" />
                <div className="skeleton h-32 w-full rounded-lg animate-pulse" />
            </div>
        );
    }

    // Empty State
    if (!attempts || attempts.length === 0) {
        return (
            <Card className="card-base text-center py-12">
                <Empty
                    description={
                        <div>
                            <Title level={4} className="text-gray-600 mb-2">
                                No attempts yet
                            </Title>
                            <Text type="secondary">
                                Start your first attempt to see your progress here
                            </Text>
                        </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<TrophyOutlined />}
                        onClick={handleStartAttempt}
                        className="mt-4"
                    >
                        Start Your First Attempt
                    </Button>
                </Empty>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Title level={3} className="mb-1">
                        Your Previous Attempts
                    </Title>
                    <Text type="secondary">
                        Click on any attempt to view detailed feedback and answers
                    </Text>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Total Attempts</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {attempts.length}
                    </div>
                </div>
            </div>

            {/* Attempt Cards */}
            <div className="space-y-4">
                {attempts.map((attempt, index) => {
                    const percentage = calculatePercentage(attempt);
                    
                    return (
                        <Card
                            key={attempt.id}
                            className="card-interactive hover:shadow-xl transition-all duration-300 cursor-pointer group"
                            onClick={() => handleAttemptClick(attempt.id)}
                            hoverable
                            bodyStyle={{ padding: '24px' }}
                        >
                            <div className="flex items-start justify-between">
                                {/* Left: Attempt Info */}
                                <div className="flex items-start gap-4 flex-1">
                                    {/* Attempt Number Badge */}
                                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                                        #{attempt.attemptNumber}
                                    </div>

                                    <div className="flex-1">
                                        {/* Header Row */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <Title level={4} className="mb-0">
                                                Attempt {attempt.attemptNumber}
                                            </Title>
                                            <Tag color={getStatusColor(attempt.status)}>
                                                {attempt.status}
                                            </Tag>
                                            {index === 0 && (
                                                <Tag color="blue" icon={<TrophyOutlined />}>
                                                    Latest
                                                </Tag>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-1">
                                                <ClockCircleOutlined />
                                                {formatDate(attempt.completedAt)}
                                            </div>
                                            <div>
                                                ⏱️ {attempt.timeTakenMinutes} min
                                            </div>
                                            <div>
                                                📊 {attempt.totalMarks} marks
                                            </div>
                                        </div>

                                        {/* Feedback Preview */}
                                        {attempt.overallFeedbackSummary && (
                                            <div className="bg-gray-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-blue-600 text-sm">💡</span>
                                                    <Text className="text-gray-700 text-sm line-clamp-2">
                                                        {attempt.overallFeedbackSummary}
                                                    </Text>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Performance Score */}
                                <div className="text-right ml-6">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-gray-900 mb-1">
                                            {attempt.totalMarks}
                                            <span className="text-xl text-gray-500">/20</span>
                                        </div>
                                        <div className={`text-lg font-bold ${getPerformanceColor(percentage)} mb-2`}>
                                            {percentage.toFixed(0)}%
                                        </div>
                                        <div className="w-20 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    percentage >= 80 ? 'bg-green-500' :
                                                    percentage >= 60 ? 'bg-blue-500' :
                                                    percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.min(100, percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* View Details Button */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <Button 
                                    type="link" 
                                    className="p-0 text-blue-600 hover:text-blue-800 group-hover:translate-x-1 transition-transform duration-200"
                                    icon={<EyeOutlined />}
                                >
                                    View Full Details
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default AttemptHistory;
```

**Verification Steps**:
1. [ ] Component renders without TypeScript errors
2. [ ] Loading state displays skeleton placeholders
3. [ ] Empty state shows call-to-action button
4. [ ] Attempt cards display all required information
5. [ ] Hover effects work correctly
6. [ ] Navigation on click works
7. [ ] Styling matches design system

### Task 2.2: Create AttemptCard Sub-Component (Optional)

**File**: `src/components/attempts/AttemptCard.tsx`
**Duration**: 30 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Create attempts subdirectory in components
2. [ ] Create AttemptCard component for reusability
3. [ ] Make it configurable for different use cases
4. [ ] Update AttemptHistory to use AttemptCard

**Implementation**:
```typescript
// src/components/attempts/AttemptCard.tsx
"use client";

import React from 'react';
import { Card, Tag, Button, Typography } from 'antd';
import { ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { AttemptHistoryItem } from '@/types/attemptTypes';

const { Text } = Typography;

interface AttemptCardProps {
    attempt: AttemptHistoryItem;
    index: number;
    paperId: number;
    onClick?: (attemptId: number) => void;
}

/**
 * Reusable Attempt Card Component
 * Displays individual attempt summary with consistent styling
 */
const AttemptCard: React.FC<AttemptCardProps> = ({ 
    attempt, 
    index, 
    paperId, 
    onClick 
}) => {
    const getStatusColor = (status: string): string => {
        switch (status.toUpperCase()) {
            case 'SUBMITTED': return 'green';
            case 'IN_PROGRESS': return 'blue';
            case 'ABANDONED': return 'red';
            default: return 'default';
        }
    };

    const getPerformanceColor = (percentage: number): string => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const calculatePercentage = (attempt: AttemptHistoryItem): number => {
        const totalPossible = 20; // Should be dynamic based on paper
        return totalPossible > 0 ? (attempt.totalMarks / totalPossible) * 100 : 0;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleClick = () => {
        if (onClick) {
            onClick(attempt.id);
        }
    };

    const percentage = calculatePercentage(attempt);

    return (
        <Card
            className="card-interactive hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={handleClick}
            hoverable
            bodyStyle={{ padding: '24px' }}
        >
            {/* Card content same as in AttemptHistory but extracted here */}
            {/* ... (reused from AttemptHistory component) */}
        </Card>
    );
};

export default AttemptCard;
```

### Task 2.3: Update Paper Details Page Integration

**File**: `src/app/papers/[id]/page.tsx`
**Duration**: 20 minutes
**Complexity**: Low

**Steps**:
1. [ ] Locate paper details page
2. [ ] Add "View Past Attempts" button to paper header
3. [ ] Update existing AttemptHistory usage if needed
4. [ ] Test navigation to new attempt pages

**Implementation**:
```typescript
// Add this button to the paper header section in src/app/papers/[id]/page.tsx
<div className="flex gap-4 mb-6">
    <button
        onClick={() => router.push(`/papers/${paperId}/attempt`)}
        className="btn-primary flex-1"
    >
        📝 Start New Attempt
    </button>
    <button
        onClick={() => {
            // Navigate to past attempts
            router.push(`/papers/${paperId}/past-attempts`);
        }}
        className="btn-outline-primary px-6"
    >
        📚 View Past Attempts
        {attempts.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {attempts.length}
            </span>
        )}
    </button>
    <button
        onClick={() => {
            fetchAttemptHistory();
            fetchLeaderboard();
        }}
        className="btn-secondary"
    >
        🔄 Refresh
    </button>
</div>
```

**Verification**:
- [ ] Button appears in paper header
- [ ] Shows attempt count badge when attempts exist
- [ ] Navigation works to attempt history
- [ ] Styling matches existing buttons

---

## Phase 3: Detailed Attempt View (Advanced UI)

### Task 3.1: Create AttemptDetails Page Structure

**File**: `src/app/papers/[paperId]/attempts/[attemptId]/page.tsx`
**Duration**: 90 minutes
**Complexity**: High

**Steps**:
1. [ ] Create directory structure for nested routes
2. [ ] Create main attempt details page component
3. [ ] Implement data fetching logic
4. [ ] Add error handling and loading states
5. [ ] Create basic layout structure

**Implementation**:
```typescript
// src/app/papers/[paperId]/attempts/[attemptId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Spin, message, Typography, Alert } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { paperService } from '@/services/paperService';
import { AttemptDetails } from '@/types/attemptTypes';

const { Title, Paragraph } = Typography;

/**
 * Attempt Details Page
 * Shows full breakdown of a specific attempt including all questions and answers
 */
export default function AttemptDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const paperId = parseInt(params.paperId as string);
    const attemptId = parseInt(params.attemptId as string);

    const [attempt, setAttempt] = useState<AttemptDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (paperId && attemptId) {
            fetchAttemptDetails();
        }
    }, [paperId, attemptId]);

    const fetchAttemptDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await paperService.getAttemptDetails(attemptId);
            setAttempt(data);
        } catch (err: any) {
            console.error('Error fetching attempt details:', err);
            
            if (err.message?.includes('permission')) {
                setError('You do not have permission to view this attempt');
            } else if (err.message?.includes('not found')) {
                setError('Attempt not found');
            } else if (err.message?.includes('Authentication')) {
                setError('Please log in to view this attempt');
            } else {
                setError('Failed to load attempt details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        router.push(`/papers/${paperId}`);
    };

    const handleRetryClick = () => {
        fetchAttemptDetails();
    };

    // Loading State
    if (loading) {
        return (
            <ProtectedRoute role="STUDENT">
                <div className="page-wrapper">
                    <Header />
                    <div className="page-content">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <Spin size="large" />
                                <div className="mt-4 text-gray-600">
                                    Loading attempt details...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Error State
    if (error || !attempt) {
        return (
            <ProtectedRoute role="STUDENT">
                <div className="page-wrapper">
                    <Header />
                    <div className="page-content max-w-2xl mx-auto">
                        <Card className="card-base text-center">
                            <div className="py-8">
                                <Title level={3} className="text-gray-800 mb-4">
                                    Unable to Load Attempt
                                </Title>
                                <Alert
                                    message={error || 'Attempt not found'}
                                    type="error"
                                    showIcon
                                    className="mb-6 text-left"
                                />
                                <div className="space-x-4">
                                    <Button type="primary" onClick={handleRetryClick}>
                                        Try Again
                                    </Button>
                                    <Button onClick={handleBackClick}>
                                        Back to Paper
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Success State - Render Attempt Details
    return (
        <ProtectedRoute role="STUDENT">
            <div className="page-wrapper">
                <Header />

                <div className="page-content max-w-6xl mx-auto">
                    {/* Breadcrumb Navigation */}
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8 animate-slide-up">
                        <Button 
                            type="link" 
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBackClick}
                            className="p-0 text-gray-600 hover:text-blue-600"
                        >
                            Back to Paper
                        </Button>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium">
                            Attempt #{attempt.attemptNumber} Details
                        </span>
                    </nav>

                    {/* Attempt Header Summary */}
                    <Card className="card-elevated mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                        <div className="text-center">
                            <Title level={2} className="mb-6 text-gray-800">
                                Attempt #{attempt.attemptNumber} - Detailed Review
                            </Title>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="stat-box bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">
                                        {attempt.totalMarks}
                                        <span className="text-lg text-gray-500">/20</span>
                                    </div>
                                    <div className="text-sm text-gray-600">Total Score</div>
                                </div>
                                
                                <div className="stat-box bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-center gap-2 text-gray-700 mb-1">
                                        <ClockCircleOutlined />
                                        <span className="text-xl font-semibold">
                                            {attempt.timeTakenMinutes}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">Minutes</div>
                                </div>
                                
                                <div className="stat-box bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-xl font-semibold text-gray-700 mb-1">
                                        {new Date(attempt.completedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Completed</div>
                                </div>
                                
                                <div className="stat-box bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-center gap-1 text-gray-700 mb-1">
                                        <TrophyOutlined />
                                        <span className="text-xl font-semibold">
                                            {attempt.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">Status</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Overall Feedback Section */}
                    {attempt.overallFeedback && (
                        <Card className="card-base mb-8">
                            <Title level={3} className="mb-4 flex items-center gap-2">
                                <span>💡</span>
                                Overall AI Feedback
                            </Title>
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                                <Paragraph className="text-gray-700 mb-0 text-base leading-relaxed">
                                    {attempt.overallFeedback}
                                </Paragraph>
                            </div>
                        </Card>
                    )}

                    {/* Questions & Answers Section */}
                    <div className="space-y-6">
                        <Title level={3} className="mb-6">
                            Questions & Answers Breakdown
                        </Title>
                        
                        {attempt.answers.map((answer, index) => (
                            <AttemptQuestionCard
                                key={answer.id}
                                answer={answer}
                                questionNumber={index + 1}
                            />
                        ))}
                    </div>

                    {/* Navigation Footer */}
                    <div className="mt-12 text-center">
                        <Card className="card-base">
                            <div className="space-y-4">
                                <Title level={4} className="text-gray-700">
                                    What would you like to do next?
                                </Title>
                                <div className="space-x-4">
                                    <Button 
                                        type="primary" 
                                        size="large"
                                        icon={<ArrowLeftOutlined />}
                                        onClick={handleBackClick}
                                    >
                                        Back to Attempt History
                                    </Button>
                                    <Button 
                                        size="large"
                                        onClick={() => router.push(`/papers/${paperId}/attempt`)}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
```

**Verification Steps**:
1. [ ] Page renders without errors when attempt data is available
2. [ ] Loading state shows during data fetch
3. [ ] Error handling works for 403, 404, and network errors
4. [ ] Navigation breadcrumbs work correctly
5. [ ] Stats grid displays attempt summary correctly
6. [ ] Overall feedback section appears when available

### Task 3.2: Enhance Existing QuestionReview Component

**File**: `src/components/QuestionReview.tsx` (Existing - Add enhancements)
**Duration**: 45 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Review existing QuestionReview.tsx component functionality
2. [ ] Verify compatibility with StudentAnswerDto interface
3. [ ] Add mobile responsiveness enhancements
4. [ ] Add animation improvements for smoother transitions
5. [ ] Test component with new attempt details data structure

**Implementation**:
```typescript
// src/components/attempts/AttemptQuestionCard.tsx
"use client";

import React from 'react';
import { Card, Typography, Tag, Button, Collapse } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, BulbOutlined } from '@ant-design/icons';
import { AttemptQuestionCardProps } from '@/types/attemptTypes';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * Individual Question Card Component
 * Displays question, student answer, correct answer, marks, and AI feedback
 */
const AttemptQuestionCard: React.FC<AttemptQuestionCardProps> = ({ 
    answer, 
    questionNumber,
    showFeedback = true 
}) => {
    const isCorrect = answer.marksAwarded === answer.marksAvailable;
    const isPartial = answer.marksAwarded > 0 && answer.marksAwarded < answer.marksAvailable;
    const isIncorrect = answer.marksAwarded === 0;

    const getStatusIcon = () => {
        if (isCorrect) return <CheckCircleOutlined className="text-green-500" />;
        if (isPartial) return <ExclamationCircleOutlined className="text-yellow-500" />;
        if (isIncorrect) return <CloseCircleOutlined className="text-red-500" />;
        return null;
    };

    const getStatusColor = (): string => {
        if (isCorrect) return 'success';
        if (isPartial) return 'warning';
        if (isIncorrect) return 'error';
        return 'default';
    };

    const getCardBorderColor = (): string => {
        if (isCorrect) return 'border-green-200';
        if (isPartial) return 'border-yellow-200';
        if (isIncorrect) return 'border-red-200';
        return 'border-gray-200';
    };

    const getCardBgColor = (): string => {
        if (isCorrect) return 'bg-green-50';
        if (isPartial) return 'bg-yellow-50';
        if (isIncorrect) return 'bg-red-50';
        return 'bg-gray-50';
    };

    return (
        <Card 
            className={`card-base border-2 ${getCardBorderColor()} ${getCardBgColor()} transition-all duration-200 hover:shadow-md`}
            bodyStyle={{ padding: '24px' }}
        >
            {/* Question Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-700 font-bold text-sm">
                        {questionNumber}
                    </div>
                    <div className="flex-1">
                        <Title level={4} className="mb-2 text-gray-800">
                            Question {questionNumber}
                        </Title>
                        <Paragraph className="text-gray-700 text-base mb-0 leading-relaxed">
                            {answer.questionText}
                        </Paragraph>
                    </div>
                </div>
                
                {/* Marks Display */}
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon()}
                        <span className="font-bold text-lg">
                            {answer.marksAwarded}
                            <span className="text-gray-500">/{answer.marksAvailable}</span>
                        </span>
                    </div>
                    <Tag color={getStatusColor()}>
                        {isCorrect ? 'Perfect' : isPartial ? 'Partial' : 'Incorrect'}
                    </Tag>
                </div>
            </div>

            {/* Answer Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Student Answer */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-orange-600 text-lg">👤</span>
                        <Title level={5} className="mb-0 text-gray-800">
                            Your Answer
                        </Title>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                        {answer.answerText ? (
                            <Text className="text-gray-700">
                                {answer.answerText}
                            </Text>
                        ) : answer.selectedOptionId ? (
                            <Text className="text-gray-700">
                                Selected Option ID: {answer.selectedOptionId}
                            </Text>
                        ) : (
                            <Text type="secondary" italic>
                                No answer provided
                            </Text>
                        )}
                    </div>
                </div>

                {/* Correct Answer */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-green-600 text-lg">✅</span>
                        <Title level={5} className="mb-0 text-gray-800">
                            Correct Answer
                        </Title>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        {answer.correctAnswerText ? (
                            <Text className="text-gray-700 font-medium">
                                {answer.correctAnswerText}
                            </Text>
                        ) : answer.correctOptionText ? (
                            <Text className="text-gray-700 font-medium">
                                {answer.correctOptionText}
                            </Text>
                        ) : (
                            <Text type="secondary" italic>
                                Correct answer not available
                            </Text>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Feedback Section */}
            {showFeedback && answer.aiFeedback && (
                <Collapse 
                    ghost 
                    size="small"
                    className="border border-gray-200 rounded-lg"
                >
                    <Panel 
                        header={
                            <div className="flex items-center gap-2">
                                <BulbOutlined className="text-blue-500" />
                                <span className="font-medium">AI Feedback & Analysis</span>
                            </div>
                        }
                        key="feedback"
                    >
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <Paragraph className="text-gray-700 mb-0 leading-relaxed">
                                {answer.aiFeedback}
                            </Paragraph>
                        </div>
                    </Panel>
                </Collapse>
            )}

            {/* Performance Summary for Partial/Incorrect */}
            {(isPartial || isIncorrect) && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                            {isPartial ? '📈' : '📚'}
                        </span>
                        <Text strong className="text-gray-800">
                            {isPartial ? 'Keep improving!' : 'Time to review!'}
                        </Text>
                    </div>
                    <Text className="text-gray-600">
                        {isPartial 
                            ? `You earned ${answer.marksAwarded} out of ${answer.marksAvailable} marks. Review the AI feedback to understand what you missed.`
                            : `This question is worth ${answer.marksAvailable} marks. Study the correct answer and AI feedback to improve your understanding.`
                        }
                    </Text>
                </div>
            )}
        </Card>
    );
};

export default AttemptQuestionCard;
```

**Verification Steps**:
1. [ ] Component renders question text correctly
2. [ ] Student answer displays in orange highlight
3. [ ] Correct answer displays in green highlight
4. [ ] Marks calculation shows correctly
5. [ ] AI feedback displays in collapsible section
6. [ ] Visual indicators work for correct/partial/incorrect
7. [ ] Responsive design works on mobile

### Task 3.3: Create Attempt Navigation Components

**File**: `src/components/attempts/index.ts`
**Duration**: 15 minutes
**Complexity**: Low

**Steps**:
1. [ ] Create barrel export file for attempts components
2. [ ] Export all attempt-related components
3. [ ] Verify imports work correctly

**Implementation**:
```typescript
// src/components/attempts/index.ts
export { default as AttemptHistory } from '../AttemptHistory';
export { default as AttemptQuestionCard } from './AttemptQuestionCard';
export { default as AttemptCard } from './AttemptCard';

// Re-export types
export * from '@/types/attemptTypes';
```

### Task 3.4: Update Routing Configuration

**File**: `src/app/layout.tsx` or Next.js routing config
**Duration**: 15 minutes
**Complexity**: Low

**Steps**:
1. [ ] Verify Next.js App Router handles nested routes correctly
2. [ ] Test navigation between pages
3. [ ] Ensure breadcrumb navigation works

**Verification**:
- [ ] Nested route structure works (`/papers/[id]/attempts/[id]`)
- [ ] Back navigation functions correctly
- [ ] Browser history works properly
- [ ] No routing conflicts with existing pages

---

## Phase 4: UI/UX Enhancements & Polish (Finalization)

### Task 4.1: Enhance CSS Animations and Transitions

**File**: `src/app/globals.css`
**Duration**: 30 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Add attempt-specific animations
2. [ ] Enhance hover effects and micro-interactions
3. [ ] Add page transition animations
4. [ ] Optimize for performance

**Implementation**:
```css
/* Add to src/app/globals.css */

/* Attempt Card Animations */
.attempt-card-enter {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}

.attempt-card-enter-active {
    opacity: 1;
    transform: translateY(0) scale(1);
    transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.attempt-card-hover {
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.attempt-card-hover:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

/* Question Card Animations */
.question-reveal {
    animation: slideInFromLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInFromLeft {
    from {
        opacity: 0;
        transform: translateX(-40px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Staggered animation for multiple questions */
.question-card:nth-child(1) { animation-delay: 0ms; }
.question-card:nth-child(2) { animation-delay: 100ms; }
.question-card:nth-child(3) { animation-delay: 200ms; }
.question-card:nth-child(4) { animation-delay: 300ms; }
.question-card:nth-child(5) { animation-delay: 400ms; }

/* Performance Indicators Animation */
.performance-bar {
    transition: width 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

.score-number {
    animation: countUp 1s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes countUp {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Loading State Enhancements */
.skeleton-pulse {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

/* Feedback Section Animations */
.feedback-expand {
    animation: expandHeight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandHeight {
    from {
        opacity: 0;
        max-height: 0;
    }
    to {
        opacity: 1;
        max-height: 200px;
    }
}

/* Mobile Optimizations */
@media (max-width: 768px) {
    .attempt-card-interactive:hover {
        transform: translateY(-2px); /* Reduced hover on mobile */
    }
    
    .question-reveal {
        animation-duration: 0.4s; /* Faster on mobile */
    }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
    .attempt-card-hover,
    .question-reveal,
    .performance-bar,
    .score-number {
        animation: none;
        transition: none;
    }
    
    .attempt-card-hover:hover {
        transform: none;
    }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
    .card-interactive {
        border: 2px solid;
    }
    
    .attempt-card-interactive:hover {
        border-width: 3px;
    }
}
```

### Task 4.2: Implement Accessibility Features

**File**: `src/components/attempts/AttemptQuestionCard.tsx` and others
**Duration**: 45 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Add ARIA labels and descriptions
2. [ ] Implement keyboard navigation
3. [ ] Ensure screen reader compatibility
4. [ ] Add focus indicators

**Implementation**:
```typescript
// Add to AttemptQuestionCard component
<div 
    className={`card-base border-2 ${getCardBorderColor()} ${getCardBgColor()}`}
    role="region"
    aria-labelledby={`question-${questionNumber}-header`}
    aria-describedby={`question-${questionNumber}-marks`}
    tabIndex={0}
    onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            // Handle keyboard interaction
            e.preventDefault();
        }
    }}
>
    <div 
        id={`question-${questionNumber}-header`}
        className="sr-only"
    >
        Question {questionNumber} with {answer.marksAwarded} out of {answer.marksAvailable} marks
    </div>
    
    {/* Interactive elements need proper ARIA labels */}
    <Button 
        aria-label={`View AI feedback for question ${questionNumber}`}
        icon={<BulbOutlined />}
    >
        AI Feedback
    </Button>
</div>

// Add screen reader only class
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

### Task 4.3: Mobile Responsiveness Optimization

**File**: Multiple component files
**Duration**: 60 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Test and optimize attempt history on mobile
2. [ ] Adjust attempt details layout for small screens
3. [ ] Optimize touch targets for mobile interaction
4. [ ] Test on various screen sizes

**Implementation**:
```typescript
// Add to AttemptHistory component - responsive improvements
<div className="space-y-4">
    {/* Mobile: Stack attempt info vertically */}
    {attempts.map((attempt, index) => (
        <Card
            key={attempt.id}
            className={`
                card-interactive transition-all duration-300 
                hover:shadow-xl cursor-pointer group
                ${/* Mobile optimizations */''}
                sm:hover:scale-[1.02] hover:scale-100
            `}
            bodyStyle={{ 
                padding: '16px',
                '@media (min-width: 768px)': {
                    padding: '24px'
                }
            }}
        >
            {/* Mobile-first responsive grid */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Attempt number - smaller on mobile */}
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg sm:text-xl mx-auto sm:mx-0">
                    #{attempt.attemptNumber}
                </div>
                
                {/* Content - full width on mobile */}
                <div className="flex-1 text-center sm:text-left">
                    {/* Mobile: Reduce font sizes */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-0">
                            Attempt {attempt.attemptNumber}
                        </h3>
                        {/* Stack tags on mobile */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            <Tag color={getStatusColor(attempt.status)}>
                                {attempt.status}
                            </Tag>
                            {index === 0 && (
                                <Tag color="blue">Latest</Tag>
                            )}
                        </div>
                    </div>
                    
                    {/* Mobile: Stack metadata */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                            <ClockCircleOutlined />
                            <span className="hidden sm:inline">Completed: </span>
                            {formatDate(attempt.completedAt)}
                        </div>
                        <div>
                            ⏱️ {attempt.timeTakenMinutes} min
                        </div>
                    </div>
                </div>
                
                {/* Score - below content on mobile */}
                <div className="text-center mt-4 sm:mt-0 sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {attempt.totalMarks}
                        <span className="text-base sm:text-lg text-gray-500">/20</span>
                    </div>
                    <div className={`text-sm font-semibold ${getPerformanceColor(percentage)}`}>
                        {percentage.toFixed(0)}%
                    </div>
                </div>
            </div>
        </Card>
    ))}
</div>
```

### Task 4.4: Performance Optimization

**File**: Multiple component files
**Duration**: 45 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Implement React.memo for expensive components
2. [ ] Add useMemo for expensive calculations
3. [ ] Implement lazy loading for attempt details
4. [ ] Optimize bundle size

**Implementation**:
```typescript
// AttemptQuestionCard with performance optimizations
import React, { memo, useMemo } from 'react';

const AttemptQuestionCard: React.FC<AttemptQuestionCardProps> = memo(({ 
    answer, 
    questionNumber, 
    showFeedback = true 
}) => {
    // Memoize expensive calculations
    const performanceData = useMemo(() => {
        const isCorrect = answer.marksAwarded === answer.marksAvailable;
        const isPartial = answer.marksAwarded > 0 && answer.marksAwarded < answer.marksAvailable;
        const isIncorrect = answer.marksAwarded === 0;
        
        return {
            isCorrect,
            isPartial,
            isIncorrect,
            getStatusColor: () => {
                if (isCorrect) return 'success';
                if (isPartial) return 'warning';
                if (isIncorrect) return 'error';
                return 'default';
            }
        };
    }, [answer.marksAwarded, answer.marksAvailable]);

    // Memoize conditional classes
    const cardClasses = useMemo(() => {
        const baseClasses = "card-base border-2 transition-all duration-200 hover:shadow-md";
        if (performanceData.isCorrect) {
            return `${baseClasses} border-green-200 bg-green-50`;
        }
        if (performanceData.isPartial) {
            return `${baseClasses} border-yellow-200 bg-yellow-50`;
        }
        if (performanceData.isIncorrect) {
            return `${baseClasses} border-red-200 bg-red-50`;
        }
        return `${baseClasses} border-gray-200 bg-gray-50`;
    }, [performanceData]);

    // Render component with memoized values
    return (
        <Card className={cardClasses}>
            {/* Component JSX */}
        </Card>
    );
});

AttemptQuestionCard.displayName = 'AttemptQuestionCard';
export default AttemptQuestionCard;

// Lazy load attempt details page
const AttemptDetailsPage = lazy(() => import('./AttemptDetailsPage'));
```

---

## Phase 5: Testing & Quality Assurance

### Task 5.1: Component Unit Tests

**File**: `src/components/attempts/__tests__/AttemptQuestionCard.test.tsx`
**Duration**: 60 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Set up testing environment
2. [ ] Create comprehensive test cases
3. [ ] Test all prop variations
4. [ ] Verify accessibility features

### Task 5.2: Integration Testing

**File**: `src/app/papers/[paperId]/attempts/__tests__/integration.test.tsx`
**Duration**: 45 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Test complete user flows
2. [ ] Verify API integration
3. [ ] Test error scenarios
4. [ ] Performance testing

### Task 5.3: Cross-Browser Testing

**Duration**: 30 minutes
**Complexity**: Low

**Steps**:
1. [ ] Test in Chrome, Firefox, Safari, Edge
2. [ ] Verify mobile browsers
3. [ ] Check feature compatibility
4. [ ] Document any browser-specific issues

### Task 5.4: Accessibility Testing

**Duration**: 30 minutes
**Complexity**: Medium

**Steps**:
1. [ ] Run axe-core accessibility tests
2. [ ] Test with screen readers
3. [ ] Verify keyboard navigation
4. [ ] Check color contrast ratios

---

## Final Verification Checklist

### Code Quality
- [ ] All TypeScript compilation passes without errors
- [ ] ESLint rules satisfied with no warnings
- [ ] Component documentation added with JSDoc
- [ ] Performance benchmarks achieved (< 2s load time)

### Functionality
- [ ] All user stories implemented and tested
- [ ] API integration works with real backend
- [ ] Error handling covers all edge cases
- [ ] Loading states and empty states work correctly

### UI/UX
- [ ] Design matches specification and existing design system
- [ ] Responsive design works across all device sizes
- [ ] Animations and interactions are smooth and performant
- [ ] Accessibility standards met (WCAG 2.1 AA)

### Testing
- [ ] Unit test coverage ≥ 80%
- [ ] Integration tests pass for all user flows
- [ ] Cross-browser compatibility verified
- [ ] Performance tests meet benchmarks

### Documentation
- [ ] Component props documented
- [ ] API usage examples provided
- [ ] Deployment instructions updated
- [ ] Troubleshooting guide created

This comprehensive task breakdown ensures systematic implementation of the View Past Attempts feature with high quality, maintainability, and excellent user experience.