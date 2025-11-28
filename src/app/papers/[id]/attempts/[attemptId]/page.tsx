"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Spin, message, Typography, Alert } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { paperService } from '@/services/paperService';
import { AttemptDetails } from '@/types/attemptTypes';
import { QuestionReview } from '@/components/QuestionReview';

const { Title, Paragraph } = Typography;

/**
 * Attempt Details Page
 * Shows full breakdown of a specific attempt including all questions and answers
 */
export default function AttemptDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const paperId = parseInt(params.id as string);
    const attemptId = parseInt(params.attemptId as string);

    const [attempt, setAttempt] = useState<AttemptDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (paperId && attemptId) {
            fetchAttemptDetails();
        }
    }, [paperId, attemptId]);

    const fetchAttemptDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching attempt details for attemptId:', attemptId); // Debug logging

            const data = await paperService.getAttemptDetails(attemptId);
            console.log('Received attempt data:', data); // Debug logging
            setAttempt(data);
            console.log('Attempt data set successfully'); // Debug logging
        } catch (err: any) {
            console.error('Error fetching attempt details:', err);

            if (err.message?.includes('permission')) {
                setError('You do not have permission to view this attempt');
            } else if (err.message?.includes('not found')) {
                setError('Attempt not found');
            } else if (err.message?.includes('Authentication')) {
                setError('Please log in to view this attempt');
            } else {
                setError('Failed to load attempt details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        router.push(`/papers/${paperId}`);
    };

    const handleRetryClick = () => {
        fetchAttemptDetails();
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
                                    Loading attempt details...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Error State
    if (error || !attempt) {
        return (
            <ProtectedRoute role="STUDENT">
                <div className="page-wrapper">
                    <Header />
                    <div className="page-content max-w-2xl mx-auto">
                        <Card className="card-base text-center">
                            <div className="py-8">
                                <Title level={3} className="text-gray-800 mb-4">
                                    Unable to Load Attempt
                                </Title>
                                <Alert
                                    message={error || 'Attempt not found'}
                                    type="error"
                                    showIcon
                                    className="mb-6 text-left"
                                />
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

    // Success State - Render Attempt Details
    console.log('Rendering success state with attempt:', attempt); // Debug logging
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
                            Attempt #{attempt.attemptNumber} Details
                        </span>
                    </nav>

                    {/* Attempt Header Summary */}
                    <Card className="card-elevated mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                        <div className="text-center">
                            <Title level={2} className="mb-6 text-gray-800">
                                Attempt #{attempt.attemptNumber} - Detailed Review
                            </Title>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="stat-box bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">
                                        {attempt.totalMarks}
                                        <span className="text-lg text-gray-500">/20</span>
                                    </div>
                                    <div className="text-sm text-gray-600">Total Score</div>
                                </div>

                                <div className="stat-box bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-center gap-2 text-gray-700 mb-1">
                                        <ClockCircleOutlined />
                                        <span className="text-xl font-semibold">
                                            {attempt.timeTakenMinutes}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">Minutes</div>
                                </div>

                                <div className="stat-box bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-xl font-semibold text-gray-700 mb-1">
                                        {new Date(attempt.completedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Completed</div>
                                </div>

                                <div className="stat-box bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-center gap-1 text-gray-700 mb-1">
                                        <TrophyOutlined />
                                        <span className="text-xl font-semibold">
                                            {attempt.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">Status</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Overall Feedback Section */}
                    {attempt.overallFeedback && (
                        <Card className="card-base mb-8">
                            <Title level={3} className="mb-4 flex items-center gap-2">
                                <span>💡</span>
                                Overall AI Feedback
                            </Title>
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                                <Paragraph className="text-gray-700 mb-0 text-base leading-relaxed">
                                    {attempt.overallFeedback}
                                </Paragraph>
                            </div>
                        </Card>
                    )}

                    {/* Questions & Answers Section */}
                    <div className="space-y-6">
                        <Title level={3}>Questions & Answers Breakdown</Title>
                        {attempt.answers.map((answer, index) => (
                            <QuestionReview
                                key={answer.id}
                                answer={answer}
                                questionNumber={index + 1}
                            />
                        ))}
                    </div>

                    {/* Navigation Footer */}
                    <div className="mt-12 text-center">
                        <Card className="card-base">
                            <div className="space-y-4">
                                <Title level={4} className="text-gray-700">
                                    What would you like to do next?
                                </Title>
                                <div className="space-x-4">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<ArrowLeftOutlined />}
                                        onClick={handleBackClick}
                                    >
                                        Back to Attempt History
                                    </Button>
                                    <Button
                                        size="large"
                                        onClick={() => router.push(`/papers/${paperId}/attempt`)}
                                    >
                                        Try Again
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