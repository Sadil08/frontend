"use client";

import React, { memo, useEffect } from 'react';
import { AttemptAnswer } from '@/types';
import { CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ImageLightbox } from './ImageLightbox';
import { FormattedFeedback } from './FormattedFeedback';

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

    // Diagnostic effects
    useEffect(() => {
        console.log(`Question ${questionNumber} Answer Data:`, {
            id: answer.id,
            questionId: answer.questionId,
            answerText: !!answer.answerText,
            imageUrl: answer.imageUrl,
            extractedText: !!answer.extractedText,
            questionImageUrl: answer.questionImageUrl
        });
    }, [answer, questionNumber]);

    const getFullImageUrl = (path?: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const separator = path.startsWith('/') ? '' : '/';
        return `${baseUrl}${separator}${path}`;
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

            {/* Question Text & Image */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Question Reference
                </h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    {answer.questionImageUrl && (
                        <div className="mb-4">
                            <span className="text-xs font-semibold text-gray-500 block mb-2 font-bold uppercase tracking-tight">Question Image:</span>
                            <ImageLightbox
                                src={getFullImageUrl(answer.questionImageUrl)}
                                alt="Question Reference"
                                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                style={{ maxHeight: '400px' }}
                                onError={(e) => {
                                    console.error('Failed to load question image:', answer.questionImageUrl);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                    {!answer.hideQuestionText && (
                        <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">
                            {answer.questionText || <span className="text-gray-400 italic text-sm">No question text available</span>}
                        </p>
                    )}
                    {!answer.questionImageUrl && answer.hideQuestionText && (
                        <p className="text-amber-600 text-sm italic mt-2">
                            (Question text is hidden and no reference image is available)
                        </p>
                    )}
                </div>
            </div>

            {/* Student's Answer */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Answer
                </h4>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-3 sm:p-4 rounded-lg min-h-[100px] hover:bg-orange-100 transition-colors duration-200 space-y-4">
                    {/* Display Handwritten Image if available */}
                    {answer.imageUrl && (
                        <div className="mb-2">
                            <span className="text-xs font-semibold text-orange-700 block mb-1 font-bold">Uploaded Handwriting:</span>
                            <ImageLightbox
                                src={getFullImageUrl(answer.imageUrl)}
                                alt="Handwritten Answer"
                                className="max-w-full h-auto rounded border border-orange-200 shadow-sm hover:shadow-md transition-all"
                                style={{ maxHeight: '400px' }}
                                onError={(e) => {
                                    console.error('Failed to load student answer image:', answer.imageUrl);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Display Typed Text or Extracted Text */}
                    {(answer.answerText || answer.extractedText) ? (
                        <div className="space-y-2">
                            {answer.answerText && (
                                <div>
                                    {answer.imageUrl && <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1">Typed Answer:</span>}
                                    <p className="text-gray-900 leading-relaxed text-sm sm:text-base whitespace-pre-wrap font-medium">
                                        {answer.answerText}
                                    </p>
                                </div>
                            )}
                            {answer.extractedText && !answer.answerText && (
                                <div>
                                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1 italic">Extracted from Handwriting:</span>
                                    <div className="text-gray-800 leading-relaxed text-sm sm:text-base font-medium">
                                        <FormattedFeedback content={answer.extractedText} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Fallback for no answer */}
                    {(!answer.answerText && !answer.imageUrl && !answer.extractedText && !answer.selectedOptionId) && (
                        <div className="flex items-center gap-2 text-gray-400 italic py-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-sm">No answer provided or detected.</span>
                        </div>
                    )}

                    {/* MCQ Selection */}
                    {answer.selectedOptionId && (
                        <p className="text-gray-900 font-medium bg-white/50 p-2 rounded border border-orange-100 italic">
                            Selected Option: <span className="text-orange-700 font-bold underline decoration-orange-300">{answer.selectedOptionText || `ID ${answer.selectedOptionId}`}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* AI Feedback */}
            <div className="mt-6 pt-6 border-t border-gray-300">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Feedback & Explanation
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            {answer.aiFeedback ? (
                                <FormattedFeedback content={answer.aiFeedback} />
                            ) : (
                                <div className="text-gray-500 italic text-sm space-y-2">
                                    <p>AI feedback is being generated. Please refresh the page in a moment.</p>
                                    <p className="text-xs text-gray-400">If this persists, the AI analysis may have encountered an error. Try refreshing or re-submitting.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const QuestionReview = memo(QuestionReviewComponent);
QuestionReview.displayName = 'QuestionReview';
