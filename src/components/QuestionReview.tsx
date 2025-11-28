"use client";

import React, { memo } from 'react';
import { AttemptAnswer } from '@/types';
import { CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface QuestionReviewProps {
    answer: AttemptAnswer;
    questionNumber: number;
}

/**
 * Question Review Component
 * Displays a single question with student answer, correct answer, marks, and AI feedback
 * Color-coded based on correctness (green=correct, yellow=partial, red=incorrect)
 */
const QuestionReviewComponent: React.FC<QuestionReviewProps> = ({ answer, questionNumber }) => {
    // Determine correctness level
    const isCorrect = answer.marksAwarded === answer.marksAvailable;
    const isPartiallyCorrect = answer.marksAwarded !== null && answer.marksAwarded > 0 && answer.marksAwarded < answer.marksAvailable;
    const isIncorrect = answer.marksAwarded === 0;

    // Get border and background colors based on correctness
    const getCardStyle = () => {
        if (isCorrect) return 'border-green-500 bg-green-50';
        if (isPartiallyCorrect) return 'border-yellow-500 bg-yellow-50';
        return 'border-red-500 bg-red-50';
    };

    // Get icon based on correctness
    const getStatusIcon = () => {
        if (isCorrect) return <CheckCircleOutlined className="text-green-600 text-2xl" />;
        if (isPartiallyCorrect) return <MinusCircleOutlined className="text-yellow-600 text-2xl" />;
        return <CloseCircleOutlined className="text-red-600 text-2xl" />;
    };

    // Get status text
    const getStatusText = () => {
        if (isCorrect) return 'Correct';
        if (isPartiallyCorrect) return 'Partially Correct';
        return 'Incorrect';
    };

    // Get status color
    const getStatusColor = () => {
        if (isCorrect) return 'text-green-700';
        if (isPartiallyCorrect) return 'text-yellow-700';
        return 'text-red-700';
    };

    return (
        <div className={`card-base border-l-4 ${getCardStyle()} p-4 sm:p-6 mb-6 animate-slide-up hover:shadow-lg transition-all duration-300`}>
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 pb-4 border-b border-gray-300 gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        {getStatusIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            Question {questionNumber}
                        </h3>
                        <span className={`text-sm font-semibold ${getStatusColor()}`}>
                            {getStatusText()}
                        </span>
                    </div>
                </div>

                {/* Marks Badge */}
                <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-gray-200 self-start sm:self-auto">
                    <span className={`text-2xl sm:text-3xl font-bold ${isCorrect ? 'text-green-600' :
                            isPartiallyCorrect ? 'text-yellow-600' :
                                'text-red-600'
                        }`}>
                        {answer.marksAwarded ?? 0}
                    </span>
                    <span className="text-gray-400 text-lg sm:text-xl font-medium">/</span>
                    <span className="text-gray-600 text-xl sm:text-2xl font-semibold">
                        {answer.marksAvailable}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm ml-1">marks</span>
                </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Question
                </h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 text-lg leading-relaxed">
                        {answer.questionText}
                    </p>
                </div>
            </div>

            {/* Answer Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Student's Answer */}
                <div className="order-2 lg:order-1">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Answer
                    </h4>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 sm:p-4 rounded-lg min-h-[80px] hover:bg-orange-100 transition-colors duration-200">
                        <p className="text-gray-900 leading-relaxed text-sm sm:text-base">
                            {answer.answerText || (
                                answer.selectedOptionId ?
                                    `Selected Option ID: ${answer.selectedOptionId}` :
                                    <span className="text-gray-400 italic">No answer provided</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Correct Answer */}
                <div className="order-1 lg:order-2">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Correct Answer
                    </h4>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded-lg min-h-[80px] hover:bg-green-100 transition-colors duration-200">
                        <p className="text-gray-900 leading-relaxed font-medium text-sm sm:text-base">
                            {answer.correctAnswerText || answer.correctOptionText || (
                                answer.correctOptionId ?
                                    `Correct Option ID: ${answer.correctOptionId}` :
                                    <span className="text-gray-400 italic">Not available</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Feedback */}
            {answer.aiFeedback && (
                <div className="mt-6 pt-6 border-t border-gray-300">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Feedback & Explanation
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-800 leading-relaxed text-base">
                                    {answer.aiFeedback}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export const QuestionReview = memo(QuestionReviewComponent);
QuestionReview.displayName = 'QuestionReview';
