"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Spin, message, Typography, Empty } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, TrophyOutlined, EyeOutlined } from '@ant-design/icons';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AttemptStatusBanner } from '@/components/AttemptStatusBanner';
import { paperService } from '@/services/paperService';
import { AttemptHistoryItem, PaperDto } from '@/types';
import YouTubeEmbed from '@/components/YouTubeEmbed';

const { Title, Text } = Typography;

/**
 * Past Attempts Page
 * Shows all previous attempts for a specific paper with navigation to detailed views
 */
export default function PastAttemptsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const paperId = parseInt(params.id as string);
    const bundleId = searchParams.get('bundleId');

    const getLink = (path: string) => {
        return bundleId ? `${path}?bundleId=${bundleId}` : path;
    };

    const [attempts, setAttempts] = useState<AttemptHistoryItem[]>([]);
    const [paper, setPaper] = useState<PaperDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attemptInfo, setAttemptInfo] = useState<{ canAttempt: boolean, inProgressAttemptId?: number } | null>(null);

    useEffect(() => {
        console.log('PastAttemptsPage - useEffect triggered, paperId:', paperId); // Debug logging
        if (paperId) {
            fetchPaper();
            fetchAttempts();
            fetchAttemptInfo();
        }
    }, [paperId]);

    const fetchPaper = async () => {
        try {
            const data = await paperService.getPaper(paperId);
            setPaper(data);
        } catch (err) {
            console.error('Error fetching paper details:', err);
        }
    };

    const fetchAttemptInfo = async () => {
        try {
            const infoMap = await paperService.getAttemptInfo([paperId], bundleId ? parseInt(bundleId) : undefined);
            const info = infoMap[paperId];
            if (info) {
                setAttemptInfo({
                    canAttempt: info.canAttempt ?? true,
                    inProgressAttemptId: info.inProgressAttemptId
                });
            }
        } catch (err) {
            console.error('Error fetching attempt info:', err);
        }
    };

    const fetchAttempts = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await paperService.getAttemptHistory(paperId);
            setAttempts(data);
        } catch (err: any) {
            console.error('Error fetching attempts:', err);
            setError('Failed to load past attempts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        router.push(getLink(`/papers/${paperId}`));
    };

    const handleAttemptClick = (attemptId: number) => {
        router.push(`/papers/${paperId}/attempts/${attemptId}`);
    };

    const handleRetryClick = () => {
        fetchAttempts();
    };

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
        const totalPossible = attempt.paperTotalMarks || 100; // Use paper's total marks, fallback to 100
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
                                    Loading your past attempts...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Error State
    if (error) {
        return (
            <ProtectedRoute role="STUDENT">
                <div className="page-wrapper">
                    <Header />
                    <div className="page-content max-w-4xl mx-auto">
                        <Card className="card-base text-center">
                            <div className="py-8">
                                <Title level={3} className="text-gray-800 mb-4">
                                    Unable to Load Attempts
                                </Title>
                                <div className="text-red-600 mb-6">{error}</div>
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

    console.log('PastAttemptsPage - rendering success state'); // Debug logging
    return (
        <ProtectedRoute role="STUDENT">
            <div className="page-wrapper">


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
                            Past Attempts
                        </span>
                    </nav>

                    {/* Page Header */}
                    <div className="text-center mb-8">
                        <Title level={1} className="mb-4">
                            📚 Your Past Attempts
                        </Title>
                        <Text type="secondary" className="text-lg">
                            Review your previous attempts and see how you have improved over time
                        </Text>
                    </div>

                    {/* Paper Explanation Video */}
                    {paper?.videoUrl && (
                        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span>🎬</span> Paper Explanation
                            </h2>
                            <YouTubeEmbed videoUrl={paper.videoUrl} title="Paper Explanation Video" />
                        </div>
                    )}

                    {/* Attempts Summary */}
                    {attempts.length > 0 && (
                        <Card className="card-elevated mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                            <div className="text-center">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="stat-box">
                                        <div className="text-3xl font-bold text-blue-600 mb-1">
                                            {attempts.length}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Attempts</div>
                                    </div>

                                    <div className="stat-box">
                                        <div className="text-3xl font-bold text-green-600 mb-1">
                                            {attempts.filter(a => {
                                                const paperTotal = a.paperTotalMarks || 100;
                                                const percentage = (a.totalMarks / paperTotal) * 100;
                                                return percentage >= 75;
                                            }).length}
                                        </div>
                                        <div className="text-sm text-gray-600">High Scores (75%+)</div>
                                    </div>

                                    <div className="stat-box">
                                        <div className="text-3xl font-bold text-purple-600 mb-1">
                                            {attempts[0] ? Math.round(calculatePercentage(attempts[0])) : 0}%
                                        </div>
                                        <div className="text-sm text-gray-600">Latest Score</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Attempts List */}
                    {attempts.length === 0 ? (
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
                                    onClick={() => router.push(getLink(`/papers/${paperId}/attempt`))}
                                    className="mt-4"
                                >
                                    Start Your First Attempt
                                </Button>
                            </Empty>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Title level={3} className="mb-0">
                                    Attempt History
                                </Title>
                                <Text type="secondary">
                                    Click on any attempt to view detailed feedback
                                </Text>
                            </div>

                            <div className="space-y-4">
                                {attempts.map((attempt, index) => {
                                    const percentage = calculatePercentage(attempt);

                                    return (
                                        <Card
                                            key={attempt.id}
                                            className="card-interactive hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                            onClick={() => handleAttemptClick(attempt.id)}
                                            hoverable
                                            styles={{ body: { padding: '24px' } }}
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
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${attempt.status === 'SUBMITTED'
                                                                ? 'bg-green-100 text-green-800'
                                                                : attempt.status === 'IN_PROGRESS'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {attempt.status}
                                                            </span>
                                                            {index === 0 && (
                                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                                    Latest
                                                                </span>
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
                                                            <span className="text-xl text-gray-500">/{attempt.paperTotalMarks || 100}</span>
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

                                            {/* Retry Analysis Banner - Show if analysis failed/incomplete */}
                                            {(!attempt.analysisCompleted || attempt.analysisError) && attempt.status === 'SUBMITTED' && (
                                                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                                                    <AttemptStatusBanner
                                                        attempt={{
                                                            id: attempt.id,
                                                            analysisCompleted: attempt.analysisCompleted,
                                                            analysisError: attempt.analysisError || undefined,
                                                            submissionCount: attempt.submissionCount || 1,
                                                        }}
                                                        onRetrySuccess={fetchAttempts}
                                                    />
                                                </div>
                                            )}

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
                    )}

                    {/* Navigation Footer */}
                    <div className="mt-12 text-center">
                        <Card className="card-base">
                            <div className="space-y-4">
                                <Title level={4} className="text-gray-700">
                                    {attemptInfo?.inProgressAttemptId
                                        ? 'Continue your attempt'
                                        : attemptInfo?.canAttempt === false
                                            ? 'All attempts used'
                                            : 'Ready for another attempt?'}
                                </Title>
                                <div className="space-x-4">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<TrophyOutlined />}
                                        onClick={() => router.push(getLink(`/papers/${paperId}/attempt`))}
                                        disabled={attemptInfo?.canAttempt === false && !attemptInfo?.inProgressAttemptId}
                                    >
                                        {attemptInfo?.inProgressAttemptId
                                            ? 'Resume Attempt'
                                            : attemptInfo?.canAttempt === false
                                                ? 'No Attempts Left'
                                                : 'Start New Attempt'}
                                    </Button>
                                    <Button
                                        size="large"
                                        onClick={handleBackClick}
                                    >
                                        Back to Paper Details
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