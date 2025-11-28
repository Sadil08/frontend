"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ResultsCard } from '@/components/ResultsCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { paperService } from '@/services/paperService';
import { leaderboardService } from '@/services/leaderboardService';
import { StudentPaperAttemptDto, LeaderboardEntryDto } from '@/types';
import { message, Modal } from 'antd';

/**
 * Paper Results Page
 * Displays paper attempt results with AI feedback and leaderboard
 */
export default function PaperResultsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attemptId');
    const paperId = parseInt(params.id as string);

    const [attempt, setAttempt] = useState<StudentPaperAttemptDto | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optingIn, setOptingIn] = useState(false);

    const fetchResults = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await paperService.getAttemptResults(parseInt(attemptId!));
            setAttempt(data);
        } catch (err: any) {
            console.error('Error fetching results:', err);
            setError(err.response?.data?.message || 'Failed to load results');
            message.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    }, [attemptId]);

    const fetchLeaderboard = useCallback(async () => {
        try {
            setLoadingLeaderboard(true);
            const data = await leaderboardService.getPaperLeaderboard(paperId);
            setLeaderboard(data);
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            // Don't show error message for leaderboard - it's optional
        } finally {
            setLoadingLeaderboard(false);
        }
    }, [paperId]);

    useEffect(() => {
        if (attemptId) {
            fetchResults();
            fetchLeaderboard();

            // Poll for AI feedback if not ready
            const pollInterval = setInterval(() => {
                setAttempt(currentAttempt => {
                    if (currentAttempt && (currentAttempt.totalMarks === null || currentAttempt.overallFeedback === null)) {
                        fetchResults();
                        return currentAttempt;
                    }
                    return currentAttempt;
                });
            }, 5000);

            return () => clearInterval(pollInterval);
        }
    }, [attemptId, fetchResults, fetchLeaderboard]);

    const handleOptIn = async () => {
        if (!attemptId) return;

        Modal.confirm({
            title: 'Share Your Results?',
            content: 'Your score will be visible on the leaderboard for this paper. Do you want to continue?',
            okText: 'Yes, Share',
            cancelText: 'No',
            onOk: async () => {
                try {
                    setOptingIn(true);
                    await leaderboardService.optInToLeaderboard(parseInt(attemptId));
                    message.success('Successfully opted in to leaderboard!');
                    // Refresh leaderboard after opt-in
                    fetchLeaderboard();
                } catch (err: any) {
                    console.error('Error opting in:', err);
                    message.error('Failed to opt in to leaderboard');
                } finally {
                    setOptingIn(false);
                }
            }
        });
    };

    const getPerformancePercentage = () => {
        if (!attempt || !attempt.totalMarks) return 0;
        const totalPossible = attempt.answers.reduce((sum, ans) => sum + ans.marksAvailable, 0);
        return totalPossible > 0 ? (attempt.totalMarks / totalPossible) * 100 : 0;
    };

    const performancePercentage = getPerformancePercentage();

    return (
        <ProtectedRoute role="STUDENT">
            <div className="page-wrapper">
                <Header />

                <div className="page-content max-w-5xl mx-auto">
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 animate-slide-up">
                        <button onClick={() => router.push('/dashboard')} className="hover:text-blue-600 transition-colors">
                            Dashboard
                        </button>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Results</span>
                    </nav>

                    {loading && (
                        <div className="space-y-6">
                            <LoadingSkeleton variant="card" height="200px" />
                            <LoadingSkeleton variant="card" count={3} />
                        </div>
                    )}

                    {error && !loading && (
                        <div className="card-base p-8 text-center bg-red-50 border-red-200">
                            <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Results</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button onClick={() => router.push('/dashboard')} className="btn-primary">Back to Dashboard</button>
                        </div>
                    )}

                    {!loading && !error && attempt && (
                        <>
                            <div className={`card-elevated p-8 mb-8 animate-slide-up ${performancePercentage >= 80 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' :
                                performancePercentage >= 60 ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' :
                                    performancePercentage >= 40 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
                                        'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                                }`}>
                                <div className="text-center mb-6">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Paper Results</h1>
                                    <p className="text-gray-600">Attempt #{attempt.attemptNumber}</p>
                                </div>

                                {attempt.totalMarks !== null ? (
                                    <div className="flex items-center justify-center gap-8 mb-6">
                                        <div className="text-center">
                                            <div className="text-6xl font-bold text-gray-900 mb-2">
                                                {attempt.totalMarks}
                                                <span className="text-3xl text-gray-500">/{attempt.answers.reduce((sum, ans) => sum + ans.marksAvailable, 0)}</span>
                                            </div>
                                            <div className="text-xl text-gray-600">{performancePercentage.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="spinner w-12 h-12 mx-auto mb-4" />
                                        <p className="text-gray-600">AI is analyzing your answers... Please wait.</p>
                                    </div>
                                )}

                                {attempt.overallFeedback && (
                                    <div className="bg-white rounded-lg p-6 mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            Overall Feedback
                                        </h3>
                                        <p className="text-gray-800 leading-relaxed">{attempt.overallFeedback}</p>
                                    </div>
                                )}

                                {attempt.totalMarks !== null && (
                                    <div className="flex flex-wrap items-center justify-center gap-4">
                                        <button onClick={handleOptIn} disabled={optingIn} className="btn-success">
                                            {optingIn ? 'Opting In...' : '🏆 Share on Leaderboard'}
                                        </button>
                                        <button onClick={() => router.push(`/papers/${params.id}/attempt`)} className="btn-primary">
                                            🔄 Retry Paper
                                        </button>
                                        <button onClick={() => router.push('/dashboard')} className="btn-secondary">
                                            ← Back to Dashboard
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Question-by-Question Breakdown</h2>
                                <div className="space-y-6">
                                    {attempt.answers.map((answer, index) => (
                                        <ResultsCard key={answer.id} answer={answer} questionNumber={index + 1} />
                                    ))}
                                </div>
                            </div>

                            {/* Leaderboard Section */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        🏆 Paper Leaderboard
                                    </h2>
                                    <button
                                        onClick={fetchLeaderboard}
                                        className="btn-secondary text-sm"
                                        disabled={loadingLeaderboard}
                                    >
                                        {loadingLeaderboard ? 'Refreshing...' : '🔄 Refresh'}
                                    </button>
                                </div>
                                <div className="card-base p-6">
                                    <p className="text-sm text-gray-600 mb-4">
                                        This leaderboard shows the best attempt from each student who has opted in to share their results.
                                    </p>
                                    <LeaderboardTable
                                        data={leaderboard}
                                        currentUserId={attempt.studentId}
                                        loading={loadingLeaderboard}
                                    />
                                </div>
                            </div>

                            {attempt.timeTakenMinutes && (
                                <div className="card-base p-6 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">Time Taken:</span>
                                        </div>
                                        <span className="text-xl font-bold text-gray-900">{attempt.timeTakenMinutes} minutes</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
