"use client";

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import ProtectedRoute from '@/components/ProtectedRoute';
import { ResultsCard } from '@/components/ResultsCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { paperService } from '@/services/paperService';
import { leaderboardService } from '@/services/leaderboardService';
import { AttemptDetails } from '@/types';
import { LeaderboardEntry } from '@/types/leaderboardTypes';
import { message, Modal } from 'antd';

function ResultsContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attemptId');
    const paperId = parseInt(params.id as string);

    const [attempt, setAttempt] = useState<AttemptDetails | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
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
            const data = await leaderboardService.getPaperLeaderboard(paperId, attempt?.studentId);
            setLeaderboard(data);
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            // Don't show error message for leaderboard - it's optional
        } finally {
            setLoadingLeaderboard(false);
        }
    }, [paperId, attempt?.studentId]);

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
        const totalPossible = attempt.paperTotalMarks || 100; // Use paper's total marks, fallback to 100
        return totalPossible > 0 ? (attempt.totalMarks / totalPossible) * 100 : 0;
    };

    const performancePercentage = getPerformancePercentage();

    return (
        <ProtectedRoute role="STUDENT">
            <div className="page-wrapper">


                <div className="page-content max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <nav className="flex items-center gap-2 text-sm text-secondary-500 mb-8 animate-slide-up">
                        <button onClick={() => router.push('/dashboard')} className="hover:text-primary-600 transition-colors flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </button>
                        <span className="text-gray-300">/</span>
                        <span className="text-secondary-900 font-medium">Results</span>
                    </nav>

                    {loading && (
                        <div className="space-y-8">
                            <LoadingSkeleton variant="card" height="240px" />
                            <LoadingSkeleton variant="card" count={3} />
                        </div>
                    )}

                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Failed to Load Results</h3>
                            <p className="text-gray-600 mb-8 text-lg">{error}</p>
                            <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md">
                                Back to Dashboard
                            </button>
                        </div>
                    )}

                    {!loading && !error && attempt && (
                        <>
                            <div className={`rounded-2xl p-8 mb-10 animate-slide-up shadow-card border ${performancePercentage >= 80 ? 'bg-gradient-to-br from-green-50 to-white border-green-200' :
                                performancePercentage >= 60 ? 'bg-gradient-to-br from-blue-50 to-white border-blue-200' :
                                    performancePercentage >= 40 ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200' :
                                        'bg-gradient-to-br from-red-50 to-white border-red-200'
                                }`}>
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-900 mb-2">Paper Results</h1>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-gray-200 text-sm font-medium text-secondary-600">
                                        <span className="w-2 h-2 rounded-full bg-secondary-400"></span>
                                        Attempt #{attempt.attemptNumber}
                                    </div>
                                </div>

                                {attempt.totalMarks !== null ? (
                                    <div className="flex flex-col items-center justify-center mb-8">
                                        <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke={performancePercentage >= 80 ? '#16a34a' : performancePercentage >= 60 ? '#2563eb' : performancePercentage >= 40 ? '#d97706' : '#dc2626'}
                                                    strokeWidth="8"
                                                    strokeDasharray={`${(performancePercentage / 100) * 283} 283`}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-5xl font-bold text-secondary-900">{attempt.totalMarks}</span>
                                                <span className="text-lg text-secondary-500 font-medium">/ {attempt.paperTotalMarks || 100}</span>
                                            </div>
                                        </div>
                                        <div className={`text-2xl font-bold ${performancePercentage >= 80 ? 'text-green-600' : performancePercentage >= 60 ? 'text-blue-600' : performancePercentage >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {performancePercentage.toFixed(1)}% Score
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white/50 rounded-xl border border-gray-100 mb-8">
                                        <div className="spinner w-12 h-12 mx-auto mb-4 text-primary-600" />
                                        <h3 className="text-xl font-bold text-secondary-900 mb-2">Analyzing Results</h3>
                                        <p className="text-secondary-600">AI is grading your answers and generating feedback...</p>
                                    </div>
                                )}

                                {attempt.overallFeedback && (
                                    <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-blue-100 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                        <h3 className="text-lg font-bold text-secondary-900 mb-3 flex items-center gap-2">
                                            <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </span>
                                            AI Overall Feedback
                                        </h3>
                                        <p className="text-secondary-700 leading-relaxed text-lg">{attempt.overallFeedback}</p>
                                    </div>
                                )}

                                {attempt.totalMarks !== null && (
                                    <div className="flex flex-wrap items-center justify-center gap-4">
                                        <button
                                            onClick={handleOptIn}
                                            disabled={optingIn}
                                            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                                        >
                                            {optingIn ? (
                                                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sharing...</span>
                                            ) : (
                                                <>🏆 Share on Leaderboard</>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => router.push(`/papers/${params.id}/attempt`)}
                                            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Retry Paper
                                        </button>
                                        <button
                                            onClick={() => router.push('/dashboard')}
                                            className="px-6 py-3 bg-white text-secondary-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:text-secondary-900 transition-colors shadow-sm"
                                        >
                                            Back to Dashboard
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center gap-3">
                                    <span className="w-1.5 h-8 bg-primary-600 rounded-full"></span>
                                    Question Breakdown
                                </h2>
                                <div className="space-y-6">
                                    {attempt.answers.map((answer, index) => (
                                        <ResultsCard key={answer.id} answer={answer} questionNumber={index + 1} />
                                    ))}
                                </div>
                            </div>

                            {/* Leaderboard Section */}
                            <div className="mb-12">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                                            🏆 Paper Leaderboard
                                        </h2>
                                        <p className="text-secondary-500 mt-1">Top performers on this paper</p>
                                    </div>
                                    <button
                                        onClick={fetchLeaderboard}
                                        className="px-4 py-2 bg-white border border-gray-200 text-secondary-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-primary-600 transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm"
                                        disabled={loadingLeaderboard}
                                    >
                                        <svg className={`w-4 h-4 ${loadingLeaderboard ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        {loadingLeaderboard ? 'Refreshing...' : 'Refresh Board'}
                                    </button>
                                </div>
                                <div className="bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                        <p className="text-sm text-secondary-600">
                                            This leaderboard shows the best attempt from each student who has opted in to share their results.
                                        </p>
                                    </div>
                                    <div className="p-0">
                                        <LeaderboardTable
                                            entries={leaderboard}
                                            currentUserId={attempt.studentId}
                                            loading={loadingLeaderboard}
                                        />
                                    </div>
                                </div>
                            </div>

                            {attempt.timeTakenMinutes && (
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between max-w-md mx-auto">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-secondary-700 font-medium">Time Taken</span>
                                    </div>
                                    <span className="text-xl font-bold text-secondary-900">{attempt.timeTakenMinutes} minutes</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default function PaperResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSkeleton variant="card" height="300px" width="500px" />
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
