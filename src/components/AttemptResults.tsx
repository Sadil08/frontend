"use client";

import React, { useEffect, useState } from 'react';
import { Card, Tag, Spin, Alert, Progress, Divider } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { AttemptDetails } from '@/types';
import { paperService } from '@/services/paperService';
import { QuestionReview } from './QuestionReview';

interface AttemptResultsProps {
    attemptId: number;
}

/**
 * Comprehensive Attempt Results Component
 * Displays final weighted score, score breakdown, overall feedback, and question-by-question review
 */
export const AttemptResults: React.FC<AttemptResultsProps> = ({ attemptId }) => {
    const [attempt, setAttempt] = useState<AttemptDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                setLoading(true);
                const data = await paperService.getAttemptDetails(attemptId);
                setAttempt(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load attempt details');
            } finally {
                setLoading(false);
            }
        };

        fetchAttempt();
    }, [attemptId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="Loading your results..." />
            </div>
        );
    }

    if (error || !attempt) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Alert
                    message="Error Loading Results"
                    description={error || 'Could not load attempt details'}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    // Calculate metrics
    const totalObtained = attempt.answers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0);
    const totalAllocated = attempt.answers.reduce((sum, a) => sum + a.marksAvailable, 0);
    const finalScore = attempt.totalMarks;
    const paperTotal = attempt.paperTotalMarks || 100;
    const percentage = paperTotal > 0 ? (finalScore / paperTotal) * 100 : 0;
    const isScaled = totalAllocated !== paperTotal;

    // Performance level
    const getPerformanceLevel = () => {
        if (percentage >= 90) return { label: 'Excellent', color: 'green', emoji: '🌟' };
        if (percentage >= 75) return { label: 'Very Good', color: 'blue', emoji: '🎯' };
        if (percentage >= 60) return { label: 'Good', color: 'cyan', emoji: '👍' };
        if (percentage >= 50) return { label: 'Fair', color: 'orange', emoji: '📚' };
        return { label: 'Needs Improvement', color: 'red', emoji: '💪' };
    };

    const performance = getPerformanceLevel();

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Score Summary Card */}
            <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 shadow-xl">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <TrophyOutlined className="text-6xl text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Your Score</h2>

                    {/* Final Score Display */}
                    <div className="flex justify-center items-baseline gap-2">
                        <span className="text-7xl font-bold text-blue-600">{finalScore}</span>
                        <span className="text-4xl text-gray-400">/</span>
                        <span className="text-5xl font-semibold text-gray-600">{paperTotal}</span>
                    </div>

                    {/* Percentage and Performance */}
                    <div className="space-y-2">
                        <div className={`text-4xl font-bold text-${performance.color}-600`}>
                            {percentage.toFixed(1)}% {performance.emoji}
                        </div>
                        <Tag color={performance.color} className="text-lg px-4 py-1">
                            {performance.label}
                        </Tag>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto">
                        <Progress
                            percent={Math.round(percentage)}
                            strokeColor={{
                                '0%': '#1890ff',
                                '100%': '#52c41a',
                            }}
                            strokeWidth={12}
                            showInfo={false}
                        />
                    </div>
                </div>
            </Card>

            {/* Score Breakdown (only show if scaled) */}
            {isScaled && (
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <WarningOutlined className="text-blue-500" />
                            <span>Score Breakdown</span>
                        </div>
                    }
                    className="border-blue-200"
                >
                    <div className="space-y-4">
                        <Alert
                            message="Your score has been scaled"
                            description={`The questions totaled ${totalAllocated} marks, but this paper is configured for ${paperTotal} marks. Your final score has been automatically adjusted.`}
                            type="info"
                            showIcon
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Raw Score */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="text-sm text-gray-600 mb-1">Raw Score</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {totalObtained}/{totalAllocated}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Marks from questions
                                </div>
                            </div>

                            {/* Scaling Factor */}
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <div className="text-sm text-gray-600 mb-1">Scaling Factor</div>
                                <div className="text-2xl font-bold text-purple-600">
                                    ×{(paperTotal / totalAllocated).toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {totalAllocated > paperTotal ? 'Scaled down' : 'Scaled up'}
                                </div>
                            </div>

                            {/* Final Score */}
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="text-sm text-gray-600 mb-1">Final Score</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {finalScore}/{paperTotal}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Weighted result
                                </div>
                            </div>
                        </div>

                        {/* Formula Explanation */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Calculation:</div>
                            <div className="font-mono text-sm text-gray-600">
                                ({totalObtained} ÷ {totalAllocated}) × {paperTotal} = {finalScore}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Overall Feedback */}
            {attempt.overallFeedback && (
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <CheckCircleOutlined className="text-green-500" />
                            <span>Overall Feedback</span>
                        </div>
                    }
                    className="border-green-200"
                >
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                        <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                            {attempt.overallFeedback}
                        </p>
                    </div>
                </Card>
            )}

            <Divider className="my-8">
                <span className="text-xl font-semibold text-gray-700">Question-by-Question Review</span>
            </Divider>

            {/* Question Reviews */}
            <div className="space-y-6">
                {attempt.answers.map((answer, index) => (
                    <QuestionReview
                        key={answer.id}
                        answer={answer}
                        questionNumber={index + 1}
                    />
                ))}
            </div>

            {/* Summary Footer */}
            <Card className="bg-gray-50 border-gray-200">
                <div className="text-center space-y-2">
                    <p className="text-gray-600">
                        Attempt completed on {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                    <p className="text-gray-600">
                        Time taken: <span className="font-semibold">{attempt.timeTakenMinutes} minutes</span>
                    </p>
                    <p className="text-gray-600">
                        Attempt #{attempt.attemptNumber}
                    </p>
                </div>
            </Card>
        </div>
    );
};
