# View Past Attempts Feature - Implementation Plan

## Overview
This plan breaks down the View Past Attempts feature implementation into logical phases, ensuring systematic development with working deliverables at each stage. Each phase builds upon the previous one and can be tested independently.

## Phase Structure

### Phase 1: Core API Integration & Services (Foundation)
**Duration**: 2-3 days  
**Goal**: Establish reliable API communication and data handling

#### Objectives
- [ ] Extend paperService with new attempt endpoints
- [ ] Create attempt-specific TypeScript types
- [ ] Implement error handling and loading states
- [ ] Establish authentication and security patterns

#### Deliverables
1. **Enhanced paperService.ts**
   - `getAttemptHistory(paperId: number)` method
   - `getAttemptDetails(attemptId: number)` method
   - Proper error handling and TypeScript types

2. **New attemptTypes.ts**
   - `AttemptHistoryItem` interface for summary list
   - `AttemptDetails` interface for full breakdown
   - Question and answer interfaces

3. **API Testing**
   - Verify JWT authentication works
   - Test error handling for 401, 403, 404
   - Confirm data format matches specifications

#### Implementation Snippets

**Enhanced paperService.ts**:
```typescript
// Add to existing paperService.ts
/**
 * Get attempt history for a specific paper (summary list)
 */
getAttemptHistory: async (paperId: number): Promise<AttemptHistoryItem[]> => {
    const response = await apiClient.get<AttemptHistoryItem[]>(
        `/api/student-paper-attempts/paper/${paperId}/history`
    );
    return response.data;
},

/**
 * Get detailed attempt with all answers and feedback
 */
getAttemptDetails: async (attemptId: number): Promise<AttemptDetails> => {
    const response = await apiClient.get<AttemptDetails>(
        `/api/papers/attempts/${attemptId}`
    );
    return response.data;
}
```

**New attemptTypes.ts**:
```typescript
// src/types/attemptTypes.ts
export interface AttemptHistoryItem {
    id: number;
    attemptNumber: number;
    status: string;
    completedAt: string;
    timeTakenMinutes: number;
    totalMarks: number;
    overallFeedbackSummary: string;
}

export interface AttemptAnswer {
    id: number;
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

export interface AttemptDetails {
    id: number;
    attemptNumber: number;
    status: string;
    startedAt: string;
    completedAt: string;
    timeTakenMinutes: number;
    totalMarks: number;
    overallFeedback: string;
    answers: AttemptAnswer[];
}
```

### Phase 2: Enhanced Attempt History Components (Core UI)
**Duration**: 3-4 days  
**Goal**: Replace existing basic attempt history with enhanced version

#### Objectives
- [ ] Create new AttemptHistory component with improved UX
- [ ] Enhance AttemptCard design and interactions
- [ ] Implement proper loading and empty states
- [ ] Add performance indicators and visual feedback

#### Deliverables
1. **Enhanced AttemptHistory.tsx**
   - Improved card layout with better information hierarchy
   - Performance percentage calculations
   - Time-based formatting
   - Enhanced hover effects

2. **New AttemptCard.tsx**
   - Reusable component for individual attempt cards
   - Consistent with design system
   - Accessibility compliance

3. **Navigation Integration**
   - Update paper details page to use new attempt history
   - Proper routing to attempt details

#### Implementation Snippets

**Enhanced AttemptHistory.tsx**:
```typescript
// src/components/AttemptHistory.tsx (Enhanced Version)
"use client";

import React from 'react';
import { Card, Tag, Empty, Button } from 'antd';
import { ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { AttemptHistoryItem } from '@/types/attemptTypes';
import { useRouter } from 'next/navigation';

interface AttemptHistoryProps {
    attempts: AttemptHistoryItem[];
    paperId: number;
    loading?: boolean;
}

const AttemptHistory: React.FC<AttemptHistoryProps> = ({ 
    attempts, 
    paperId, 
    loading = false 
}) => {
    const router = useRouter();

    const calculatePercentage = (attempt: AttemptHistoryItem) => {
        // This would need total possible marks - placeholder for now
        return Math.min(100, (attempt.totalMarks / 20) * 100); // Assume 20 max marks
    };

    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAttemptClick = (attemptId: number) => {
        router.push(`/papers/${paperId}/attempts/${attemptId}`);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton h-32 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (!attempts || attempts.length === 0) {
        return (
            <Card className="card-base text-center">
                <Empty
                    description="No attempts yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button 
                        type="primary" 
                        icon={<TrophyOutlined />}
                        onClick={() => router.push(`/papers/${paperId}/attempt`)}
                        className="mt-4"
                    >
                        Start Your First Attempt
                    </Button>
                </Empty>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {attempts.map((attempt, index) => {
                const percentage = calculatePercentage(attempt);
                
                return (
                    <Card
                        key={attempt.id}
                        className="card-interactive hover:shadow-xl transition-all duration-300"
                        onClick={() => handleAttemptClick(attempt.id)}
                        hoverable
                    >
                        <div className="flex items-center justify-between">
                            {/* Left: Attempt Info */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
                                    #{attempt.attemptNumber}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Attempt {attempt.attemptNumber}
                                        </h3>
                                        <Tag color={attempt.status === 'SUBMITTED' ? 'green' : 'blue'}>
                                            {attempt.status}
                                        </Tag>
                                        {index === 0 && (
                                            <Tag color="blue">Latest</Tag>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <ClockCircleOutlined />
                                            {formatDate(attempt.completedAt)}
                                        </div>
                                        <div>
                                            ⏱️ {attempt.timeTakenMinutes} min
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Performance */}
                            <div className="text-right">
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    {attempt.totalMarks}
                                    <span className="text-lg text-gray-500">/20</span>
                                </div>
                                <div className={`text-sm font-semibold ${getPerformanceColor(percentage)}`}>
                                    {percentage.toFixed(1)}% Score
                                </div>
                            </div>
                        </div>

                        {/* Overall Feedback Preview */}
                        {attempt.overallFeedbackSummary && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-700 line-clamp-2">
                                    💡 {attempt.overallFeedbackSummary}
                                </p>
                            </div>
                        )}

                        {/* View Details Button */}
                        <div className="mt-4">
                            <Button 
                                type="link" 
                                className="p-0 text-blue-600 hover:text-blue-800"
                                icon={<span>→</span>}
                            >
                                View Full Details
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default AttemptHistory;
```

### Phase 3: Detailed Attempt View (Advanced UI)
**Duration**: 3-4 days  
**Goal**: Create comprehensive attempt details page with question breakdown

#### Objectives
- [ ] Create attempt details page with full question review
- [ ] Implement question-by-question comparison (student vs correct)
- [ ] Add per-question marks and AI feedback display
- [ ] Ensure smooth navigation and user flow

#### Deliverables
1. **AttemptDetails Page** (`/papers/[paperId]/attempts/[attemptId]/page.tsx`)
   - Full attempt summary header
   - Overall AI feedback section
   - Question-by-question breakdown

2. **Reuse Existing QuestionReview Component**
   - Leverage existing `QuestionReview.tsx` component from `src/components/QuestionReview.tsx`
   - Provides question-by-question breakdown with student vs correct answer display
   - Handles marks, AI feedback, and visual correctness indicators (green/yellow/red)
   - Add minimal enhancements for better mobile layout and animation improvements
   - Compatible with `StudentAnswerDto` interface from backend API

3. **Navigation & Routing**
   - Proper routing configuration
   - Breadcrumb navigation
   - Back button functionality

#### Implementation Snippets

**AttemptDetails Page**:
```typescript
// src/app/papers/[paperId]/attempts/[attemptId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Spin, message, Typography } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { paperService } from '@/services/paperService';
import { AttemptDetails } from '@/types/attemptTypes';
import { QuestionReview } from '@/components/QuestionReview';

const { Title, Paragraph } = Typography;

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
            const data = await paperService.getAttemptDetails(attemptId);
            setAttempt(data);
        } catch (err: any) {
            console.error('Error fetching attempt details:', err);
            if (err.response?.status === 403) {
                setError('You do not have permission to view this attempt');
            } else if (err.response?.status === 404) {
                setError('Attempt not found');
            } else {
                setError('Failed to load attempt details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        router.push(`/papers/${paperId}`);
    };

    if (loading) {
        return (
            <ProtectedRoute role="STUDENT">
                <div className="page-wrapper">
                    <Header />
                    <div className="page-content">
                        <div className="flex items-center justify-center h-64">
                            <Spin size="large" />
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !attempt) {
        return (
            <ProtectedRoute role="STUDENT">
                <div className="page-wrapper">
                    <Header />
                    <div className="page-content">
                        <Card className="card-base text-center">
                            <Title level={3}>Error</Title>
                            <Paragraph>{error || 'Attempt not found'}</Paragraph>
                            <Button type="primary" onClick={handleBackClick}>
                                Back to Paper
                            </Button>
                        </Card>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute role="STUDENT">
            <div className="page-wrapper">
                <Header />

                <div className="page-content max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 animate-slide-up">
                        <Button 
                            type="link" 
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBackClick}
                            className="p-0 text-gray-600"
                        >
                            Back to Paper
                        </Button>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">
                            Attempt #{attempt.attemptNumber} Details
                        </span>
                    </nav>

                    {/* Attempt Header */}
                    <Card className="card-elevated mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                        <div className="text-center">
                            <Title level={2} className="mb-4">
                                Attempt #{attempt.attemptNumber} - Review
                            </Title>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="stat-box">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">
                                        {attempt.totalMarks}
                                        <span className="text-lg text-gray-500">/20</span>
                                    </div>
                                    <div className="text-sm text-gray-600">Total Score</div>
                                </div>
                                
                                <div className="stat-box">
                                    <div className="flex items-center justify-center gap-2 text-gray-700">
                                        <ClockCircleOutlined />
                                        <span className="text-lg font-semibold">
                                            {attempt.timeTakenMinutes} min
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Time Taken</div>
                                </div>
                                
                                <div className="stat-box">
                                    <div className="text-lg font-semibold text-gray-700">
                                        {new Date(attempt.completedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Completed</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Overall Feedback */}
                    {attempt.overallFeedback && (
                        <Card className="card-base mb-8">
                            <Title level={3} className="mb-4">Overall Feedback</Title>
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                                <Paragraph className="text-gray-700 mb-0">
                                    {attempt.overallFeedback}
                                </Paragraph>
                            </div>
                        </Card>
                    )}

                    {/* Questions & Answers */}
                    <div className="space-y-6">
                        <Title level={3}>Questions & Answers</Title>
                        {attempt.answers.map((answer, index) => (
                            <QuestionReview
                                key={answer.id}
                                answer={answer}
                                questionNumber={index + 1}
                            />
                        ))}
                    </div>

                    {/* Back Button */}
                    <div className="mt-8 text-center">
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBackClick}
                            className="px-8"
                        >
                            Back to Attempt History
                        </Button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
```

### Phase 4: UI/UX Enhancements & Polish (Finalization)
**Duration**: 2-3 days  
**Goal**: Perfect the user experience with animations, accessibility, and mobile optimization

#### Objectives
- [ ] Add smooth animations and micro-interactions
- [ ] Implement accessibility features (keyboard nav, ARIA labels)
- [ ] Optimize for mobile and tablet devices
- [ ] Performance optimization and testing

#### Deliverables
1. **Enhanced Animations**
   - Page transitions and loading animations
   - Hover effects and micro-interactions
   - Progressive content loading

2. **Accessibility Implementation**
   - ARIA labels and descriptions
   - Keyboard navigation support
   - Screen reader optimization

3. **Mobile Optimization**
   - Touch-friendly interface elements
   - Responsive layout adjustments
   - Performance optimization for mobile

#### Implementation Snippets

**Enhanced CSS Animations**:
```css
/* Add to globals.css */
.attempt-card-enter {
    opacity: 0;
    transform: translateY(20px);
}

.attempt-card-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: all 300ms ease-out;
}

.question-reveal {
    animation: slideInFromLeft 0.5s ease-out;
}

@keyframes slideInFromLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Enhanced hover effects */
.attempt-card-interactive {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.attempt-card-interactive:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

/* Mobile-first responsive design */
@media (max-width: 768px) {
    .attempt-header {
        flex-direction: column;
        gap: 1rem;
    }
    
    .attempt-stats {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
}
```

### Phase 5: Testing & Quality Assurance
**Duration**: 2-3 days  
**Goal**: Comprehensive testing and bug fixes

#### Objectives
- [ ] Unit testing for all components
- [ ] Integration testing for user flows
- [ ] Cross-browser and device testing
- [ ] Performance testing and optimization
- [ ] Accessibility testing

#### Testing Checklist
- [ ] API integration works with real backend
- [ ] Authentication and authorization handled correctly
- [ ] Loading states and error handling work properly
- [ ] Mobile responsiveness across devices
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Performance benchmarks achieved
- [ ] Cross-browser compatibility verified

## Risk Mitigation

### Technical Risks
1. **API Compatibility**: Ensure backend endpoints match specification
   - *Mitigation*: Test with mock data first, then integrate with real API
2. **Performance Issues**: Large attempt lists could impact performance
   - *Mitigation*: Implement pagination and lazy loading
3. **Authentication Edge Cases**: JWT token expiration during use
   - *Mitigation*: Use existing authentication patterns from codebase

### Design Risks
1. **Inconsistent UI**: Components might not match existing design
   - *Mitigation*: Follow established design system and CSS classes
2. **Mobile UX Issues**: Complex layouts on small screens
   - *Mitigation*: Mobile-first design approach and testing

### Timeline Risks
1. **Feature Creep**: Adding unnecessary features
   - *Mitigation*: Stick to MVP requirements in each phase
2. **Integration Complexity**: Unforeseen integration issues
   - *Mitigation*: Build and test incrementally

## Success Criteria

### Phase Completion
Each phase must deliver:
- [ ] Working code that meets specifications
- [ ] Tests that verify functionality
- [ ] Documentation updates
- [ ] Code review approval

### Final Deliverable
- [ ] Complete View Past Attempts feature
- [ ] All user stories implemented
- [ ] Performance and accessibility standards met
- [ ] Production-ready code
- [ ] Comprehensive documentation

## Dependencies

### External Dependencies
- Backend API endpoints must be available
- JWT authentication system must be working
- Existing design system and components

### Internal Dependencies
- Current paperService.ts must be extended (not replaced)
- Existing routing structure should accommodate new pages
- Current authentication patterns must be maintained

This phased approach ensures systematic development with clear milestones and working deliverables at each stage, minimizing risk and ensuring high-quality implementation.