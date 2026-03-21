"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { AttemptHistory } from '@/components/AttemptHistory';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { paperService } from '@/services/paperService';
import { leaderboardService } from '@/services/leaderboardService';
import { AttemptHistoryItem, PaperDto } from '@/types';
import { LeaderboardEntry } from '@/types/leaderboardTypes';
import { Tabs, message } from 'antd';

const { TabPane } = Tabs;

/**
 * Paper Details Page
 * Shows paper information, attempt history, and leaderboard
 */
export default function PaperDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const paperId = parseInt(params.id as string);
    const bundleId = searchParams.get('bundleId');

    // Helper to get link with bundle context
    const getLink = (path: string) => {
        return bundleId ? `${path}?bundleId=${bundleId}` : path;
    };

    const [paper, setPaper] = useState<PaperDto | null>(null);
    const [attempts, setAttempts] = useState<AttemptHistoryItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAttempts, setLoadingAttempts] = useState(false);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [activeTab, setActiveTab] = useState('history');

    // Get current user ID from localStorage (set during login)
    const getCurrentUserId = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.id;
            }
        } catch (err) {
            console.error('Error getting user ID:', err);
        }
        return undefined;
    };

    const currentUserId = getCurrentUserId();

    const fetchPaper = useCallback(async () => {
        try {
            setLoading(true);
            const data = await paperService.getPaper(paperId);
            setPaper(data);
        } catch (err: any) {
            console.error('Error fetching paper:', err);
            message.error('Failed to load paper details');
        } finally {
            setLoading(false);
        }
    }, [paperId]);

    const fetchAttemptHistory = useCallback(async () => {
        try {
            setLoadingAttempts(true);
            const data = await paperService.getAttemptHistory(paperId);
            setAttempts(data);
        } catch (err: any) {
            console.error('Error fetching attempt history:', err);
            message.error('Failed to load attempt history');
        } finally {
            setLoadingAttempts(false);
        }
    }, [paperId]);

    const fetchLeaderboard = useCallback(async () => {
        try {
            setLoadingLeaderboard(true);
            const data = await leaderboardService.getPaperLeaderboard(paperId, currentUserId);
            setLeaderboard(data);
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            // Don't show error for leaderboard - it's optional
        } finally {
            setLoadingLeaderboard(false);
        }
    }, [paperId, currentUserId]);

    useEffect(() => {
        if (paperId) {
            fetchPaper();
            fetchAttemptHistory();
            fetchLeaderboard();
        }
    }, [paperId, fetchPaper, fetchAttemptHistory, fetchLeaderboard]);

    return (
        <ProtectedRoute role="STUDENT">
            <div className="page-wrapper">


                <div className="page-content max-w-6xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 animate-slide-up">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="hover:text-blue-600 transition-colors"
                        >
                            Dashboard
                        </button>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">
                            {paper?.name || 'Paper Details'}
                        </span>
                    </nav>

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-6">
                            <LoadingSkeleton variant="card" height="200px" />
                            <LoadingSkeleton variant="card" count={3} />
                        </div>
                    )}

                    {/* Paper Content */}
                    {!loading && paper && (
                        <>
                            {/* Paper Header */}
                            <div className="card-elevated p-8 mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                            {paper.name}
                                        </h1>
                                        <p className="text-gray-600 text-lg">
                                            {paper.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                                            {paper.type}
                                        </span>
                                        <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold text-sm text-center">
                                            {paper.maxFreeAttempts} Free Attempts
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => router.push(getLink(`/papers/${paperId}/past-attempts`))}
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
                            </div>

                            {/* Tabs for History and Leaderboard */}
                            <div className="card-base p-6">
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                    size="large"
                                    className="custom-tabs"
                                >
                                    <TabPane
                                        tab={
                                            <span className="flex items-center gap-2">
                                                📚 My Attempt History
                                                {attempts.length > 0 && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                        {attempts.length}
                                                    </span>
                                                )}
                                            </span>
                                        }
                                        key="history"
                                    >
                                        <div id="attempt-history" className="mt-6">
                                            <div className="mt-6">
                                                <div className="mb-4">
                                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                                        Your Attempts
                                                    </h2>
                                                    <p className="text-gray-600 text-sm">
                                                        View all your previous attempts for this paper. Click on any attempt to see detailed results.
                                                    </p>
                                                </div>
                                                <AttemptHistory
                                                    attempts={attempts}
                                                    paperId={paperId}
                                                    loading={loadingAttempts}
                                                    bundleId={bundleId ? parseInt(bundleId) : undefined}
                                                    videoUrl={paper?.videoUrl}
                                                />
                                            </div>
                                        </div>
                                    </TabPane>

                                    <TabPane
                                        tab={
                                            <span className="flex items-center gap-2">
                                                🏆 Leaderboard
                                                {leaderboard.length > 0 && (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                                        {leaderboard.length}
                                                    </span>
                                                )}
                                            </span>
                                        }
                                        key="leaderboard"
                                    >
                                        <div className="mt-6">
                                            <div className="mb-4">
                                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                                    Paper Leaderboard
                                                </h2>
                                                <p className="text-gray-600 text-sm">
                                                    This leaderboard shows the best attempt from each student who has opted in to share their results.
                                                    Complete an attempt and opt-in to appear on the leaderboard!
                                                </p>
                                            </div>
                                            <LeaderboardTable
                                                entries={leaderboard}
                                                currentUserId={currentUserId}
                                                loading={loadingLeaderboard}
                                            />
                                        </div>
                                    </TabPane>
                                </Tabs>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
