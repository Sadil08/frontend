"use client";

import React from 'react';
import { StudentPaperAttemptDto } from '@/types';
import { Card, Tag, Empty } from 'antd';
import { useRouter } from 'next/navigation';

interface AttemptHistoryProps {
    attempts: StudentPaperAttemptDto[];
    paperId: number;
    loading?: boolean;
}

/**
 * Attempt History Component
 * Displays all previous attempts for a specific paper
 * Shows attempt number, date, marks, status, and allows viewing details
 */
export const AttemptHistory: React.FC<AttemptHistoryProps> = ({
    attempts,
    paperId,
    loading = false
}) => {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
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

    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const calculatePercentage = (attempt: StudentPaperAttemptDto) => {
        if (!attempt.totalMarks) return 0;
        const totalPossible = attempt.answers.reduce((sum, ans) => sum + ans.marksAvailable, 0);
        return totalPossible > 0 ? (attempt.totalMarks / totalPossible) * 100 : 0;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            <Card className="card-base">
                <Empty
                    description="No attempts yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <button
                        onClick={() => router.push(`/papers/${paperId}/attempt`)}
                        className="btn-primary mt-4"
                    >
                        Start Your First Attempt
                    </button>
                </Empty>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {attempts.map((attempt, index) => {
                const percentage = calculatePercentage(attempt);
                const totalPossible = attempt.answers.reduce((sum, ans) => sum + ans.marksAvailable, 0);

                return (
                    <Card
                        key={attempt.id}
                        className="card-base hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => router.push(`/papers/${paperId}/results?attemptId=${attempt.id}`)}
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
                                        <Tag color={getStatusColor(attempt.status)}>
                                            {attempt.status}
                                        </Tag>
                                        {index === 0 && (
                                            <Tag color="blue">Latest</Tag>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(attempt.startedAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Performance */}
                            <div className="text-right">
                                {attempt.totalMarks !== null ? (
                                    <>
                                        <div className="text-3xl font-bold text-gray-900 mb-1">
                                            {attempt.totalMarks}
                                            <span className="text-lg text-gray-500">/{totalPossible}</span>
                                        </div>
                                        <div className={`text-sm font-semibold ${getPerformanceColor(percentage)}`}>
                                            {percentage.toFixed(1)}%
                                        </div>
                                        {attempt.timeTakenMinutes && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                ⏱️ {attempt.timeTakenMinutes} min
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        <div className="spinner w-6 h-6 mx-auto mb-2" />
                                        Analyzing...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Overall Feedback Preview */}
                        {attempt.overallFeedback && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-700 line-clamp-2">
                                    💡 {attempt.overallFeedback}
                                </p>
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};
