"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Spin, message, Typography, Empty } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined } from '@ant-design/icons';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { leaderboardService } from '@/services/leaderboardService';
import { paperService } from '@/services/paperService';
import { LeaderboardEntry } from '@/types/leaderboardTypes';
import { PaperDto } from '@/types';

const { Title, Text } = Typography;

/**
 * Paper Leaderboard Page
 * Shows leaderboard rankings for a specific paper with user highlighting
 */
export default function PaperLeaderboardPage() {
    const params = useParams();
    const router = useRouter();
    const paperId = parseInt(params.id as string);

    const [paper, setPaper] = useState<PaperDto | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPaperData = useCallback(async () => {
        try {
            const paperData = await paperService.getPaper(paperId);
            setPaper(paperData);
        } catch (err: any) {
            console.error('Error fetching paper:', err);
        }
    }, [paperId]);

    const fetchLeaderboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await leaderboardService.getPaperLeaderboard(paperId);
            setLeaderboard(data);
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            setError('Failed to load leaderboard. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [paperId]);

    useEffect(() => {
        if (paperId) {
            fetchPaperData();
            fetchLeaderboard();
        }
    }, [paperId, fetchPaperData, fetchLeaderboard]);

    const handleBackClick = () => {
        router.push(`/papers/${paperId}`);
    };

    const handleRetryClick = () => {
        fetchLeaderboard();
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
                                    Loading leaderboard...
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
                                    Unable to Load Leaderboard
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
                            {paper?.name || 'Paper'} Leaderboard
                        </span>
                    </nav>

                    {/* Page Header */}
                    <div className="text-center mb-8">
                        <Title level={1} className="mb-4 flex items-center justify-center gap-3">
                            <TrophyOutlined className="text-yellow-500" />
                            🏆 Leaderboard
                        </Title>
                        <Text type="secondary" className="text-lg">
                            See how you rank against other students for{' '}
                            <span className="font-semibold text-blue-600">
                                {paper?.name || 'this paper'}
                            </span>
                        </Text>
                    </div>

                    {/* Leaderboard Table */}
                    {leaderboard.length === 0 ? (
                        <Card className="card-base text-center py-12">
                            <Empty
                                description={
                                    <div>
                                        <Title level={4} className="text-gray-600 mb-2">
                                            No leaderboard data yet
                                        </Title>
                                        <Text type="secondary">
                                            Students need to attempt this paper and opt-in to appear on the leaderboard
                                        </Text>
                                    </div>
                                }
                                image={<TrophyOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                            >
                                <div className="space-y-4">
                                    <Text type="secondary" className="block">
                                        Want to be the first on the leaderboard?
                                    </Text>
                                    <div className="space-x-4">
                                        <Button
                                            type="primary"
                                            icon={<TrophyOutlined />}
                                            onClick={() => router.push(`/papers/${paperId}/attempt`)}
                                        >
                                            Attempt Paper
                                        </Button>
                                        <Button onClick={handleBackClick}>
                                            Back to Paper
                                        </Button>
                                    </div>
                                </div>
                            </Empty>
                        </Card>
                    ) : (
                        <Card className="card-base">
                            <div className="mb-6">
                                <Title level={3} className="mb-2">
                                    Rankings
                                </Title>
                                <Text type="secondary">
                                    Students who have opted to share their results
                                </Text>
                            </div>
                            <LeaderboardTable
                                entries={leaderboard}
                                loading={false}
                            />
                        </Card>
                    )}

                    {/* Call to Action */}
                    <div className="mt-12 text-center">
                        <Card className="card-base">
                            <div className="space-y-4">
                                <Title level={4} className="text-gray-700">
                                    Want to improve your ranking?
                                </Title>
                                <Text type="secondary" className="block mb-4">
                                    Attempt this paper again to potentially improve your score and ranking
                                </Text>
                                <div className="space-x-4">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<TrophyOutlined />}
                                        onClick={() => router.push(`/papers/${paperId}/attempt`)}
                                    >
                                        Attempt Again
                                    </Button>
                                    <Button
                                        size="large"
                                        onClick={handleBackClick}
                                    >
                                        Back to Paper
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
