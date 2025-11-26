"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
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
                <Header />

                <div className="page-content">
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
                            {paperData?.name || 'Paper Attempt'}
                        </span>
                    </nav>

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-6">
                            <div className="skeleton h-32 w-full rounded-lg" />
                            <QuestionSkeleton />
                            <QuestionSkeleton />
                            <QuestionSkeleton />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="card-base p-8 text-center bg-red-50 border-red-200">
                            <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Failed to Load Paper
                            </h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <p className="text-sm text-gray-500">
                                Redirecting to dashboard...
                            </p>
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
