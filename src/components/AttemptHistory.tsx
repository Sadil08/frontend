"use client";

import React from 'react';
import { AttemptHistoryItem, AttemptHistoryProps } from '@/types';
import { Card, Tag, Empty, Button, Typography } from 'antd';
import { ClockCircleOutlined, TrophyOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import YouTubeEmbed from './YouTubeEmbed';

const { Title, Text } = Typography;

/**
 * Attempt History Component
 * Displays all previous attempts for a specific paper
 * Shows attempt number, date, marks, status, and allows viewing details
 */
export const AttemptHistory: React.FC<AttemptHistoryProps> = ({
    attempts,
    paperId,
    loading = false,
    bundleId,
    videoUrl
}) => {
    const router = useRouter();

    const getLink = (path: string) => {
        return bundleId ? `${path}?bundleId=${bundleId}` : path;
    };

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

    const calculatePercentage = (attempt: AttemptHistoryItem): number => {
        const totalPossible = attempt.paperTotalMarks || 100; // Fallback to 100 if not set
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
                        onClick={() => router.push(getLink(`/papers/${paperId}/attempt`))}
                        className="btn-primary mt-4"
                    >
                        Start Your First Attempt
                    </button>
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

            {/* Video Explanation */}
            {videoUrl && (
                <div className="mb-6">
                    <Title level={4} className="mb-3">
                        Paper Explanation
                    </Title>
                    <YouTubeEmbed videoUrl={videoUrl} title="Paper Explanation Video" />
                </div>
            )}

            {/* Attempt Cards */}
            <div className="space-y-4">
                {attempts.map((attempt, index) => {
                    const percentage = calculatePercentage(attempt);

                    return (
                        <Card
                            key={attempt.id}
                            className="card-interactive hover:shadow-xl transition-all duration-300 cursor-pointer group"
                            onClick={() => router.push(getLink(`/papers/${paperId}/attempts/${attempt.id}`))}
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
                                                {formatDate(attempt.completedAt || attempt.startedAt)}
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
                                            <span className="text-xl text-gray-500">/{attempt.paperTotalMarks || '?'}</span>
                                        </div>
                                        <div className={`text-lg font-bold ${getPerformanceColor(percentage)} mb-2`}>
                                            {percentage.toFixed(0)}%
                                        </div>
                                        <div className="w-20 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${percentage >= 80 ? 'bg-green-500' :
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
