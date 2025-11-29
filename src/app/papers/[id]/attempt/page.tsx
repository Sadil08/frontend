"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/ProtectedRoute';
import { FullPaper } from '@/components/FullPaper';
import { QuestionSkeleton } from '@/components/LoadingSkeleton';
import { paperService } from '@/services/paperService';
import { PaperAttemptDto, PaperSubmissionDto, AnswerSubmissionDto } from '@/types';
import { message } from 'antd';

/**
 * Paper Attempt Page
 * Full paper attempt with all questions
 * Features:
 * - Fetches paper attempt data from new endpoint
 * - Displays full paper using FullPaper component
 * - Tracks time taken
 * - Submits all answers together
 * - Redirects to results page
 */
export default function PaperAttemptPage() {
    const params = useParams();
    const router = useRouter();
    const paperId = parseInt(params.id as string);

    const [paperData, setPaperData] = useState<PaperAttemptDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch paper attempt data
     */
    const fetchPaperAttempt = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setStartTime(Date.now());

            const data = await paperService.attemptPaper(paperId);
            setPaperData(data);
        } catch (err: any) {
            console.error('Error fetching paper attempt:', err);
            setError(err.response?.data?.message || 'Failed to load paper');
            message.error('Failed to load paper for attempt');

            // Redirect to dashboard after error
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        } finally {
            setLoading(false);
        }
    }, [paperId, router]);

    useEffect(() => {
        if (paperId) {
            fetchPaperAttempt();
        }
    }, [paperId, fetchPaperAttempt]);

    /**
     * Handle paper submission
     */
    const handleSubmit = async (answers: AnswerSubmissionDto[]) => {
        try {
            setSubmitting(true);

            // Calculate time taken in minutes
            const timeTakenMinutes = Math.round((Date.now() - startTime) / 60000);

            // Create submission payload
            const submission: PaperSubmissionDto = {
                timeTakenMinutes,
                answers
            };

            // Submit paper
            const result = await paperService.submitPaper(paperId, submission);

            message.success('Paper submitted successfully! Redirecting to results...');

            // Redirect to results page
            setTimeout(() => {
                router.push(`/papers/${paperId}/results?attemptId=${result.id}`);
            }, 1500);
        } catch (err: any) {
            console.error('Error submitting paper:', err);
            message.error(err.response?.data?.message || 'Failed to submit paper');
            setSubmitting(false);
        }
    };

    return (
        <ProtectedRoute role="STUDENT">
            <div className="page-wrapper">


                <div className="page-content max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-secondary-500 mb-8 animate-slide-up">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="hover:text-primary-600 transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </button>
                        <span className="text-gray-300">/</span>
                        <span className="text-secondary-900 font-medium truncate max-w-[200px] sm:max-w-md">
                            {paperData?.name || 'Paper Attempt'}
                        </span>
                    </nav>

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-8">
                            <div className="animate-pulse bg-white rounded-xl h-48 w-full shadow-sm border border-gray-200" />
                            <QuestionSkeleton />
                            <QuestionSkeleton />
                            <QuestionSkeleton />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center max-w-2xl mx-auto mt-10">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Failed to Load Paper
                            </h3>
                            <p className="text-gray-600 mb-6 text-lg">{error}</p>
                            <div className="flex items-center justify-center gap-2 text-primary-600 font-medium animate-pulse">
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Redirecting to dashboard...
                            </div>
                        </div>
                    )}

                    {/* Paper Content */}
                    {!loading && !error && paperData && (
                        <FullPaper
                            paperData={paperData}
                            onSubmit={handleSubmit}
                            isSubmitting={submitting}
                        />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
