"use client";

import React from 'react';
import { AttemptAnswer } from '@/types';
import { ImageLightbox } from './ImageLightbox';
import { FormattedFeedback } from './FormattedFeedback';

/**
 * Props for ResultsCard component
 */
interface ResultsCardProps {
    /** Answer data with AI feedback */
    answer: AttemptAnswer;
    /** Question number for display */
    questionNumber: number;
}

/**
 * ResultsCard Component
 * Displays individual question results with AI feedback
 * Features:
 * - Color-coded performance indicators
 * - Marks awarded vs available
 * - AI feedback display
 * - Image support for question and student answer
 */
export const ResultsCard: React.FC<ResultsCardProps> = ({
    answer,
    questionNumber
}) => {
    const marksAwarded = answer.marksAwarded ?? 0;
    const marksAvailable = answer.marksAvailable;
    const percentage = marksAvailable > 0 ? (marksAwarded / marksAvailable) * 100 : 0;

    // Determine performance level and colors
    const getPerformanceStyle = () => {
        if (percentage >= 80) {
            return {
                bgColor: 'bg-green-50/50',
                borderColor: 'border-green-200',
                textColor: 'text-green-700',
                badgeColor: 'bg-green-100 text-green-800',
                label: 'Excellent',
                icon: '🎉',
                progressColor: 'bg-green-500'
            };
        } else if (percentage >= 60) {
            return {
                bgColor: 'bg-blue-50/50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-700',
                badgeColor: 'bg-blue-100 text-blue-800',
                label: 'Good',
                icon: '👍',
                progressColor: 'bg-blue-500'
            };
        } else if (percentage >= 40) {
            return {
                bgColor: 'bg-yellow-50/50',
                borderColor: 'border-yellow-200',
                textColor: 'text-yellow-700',
                badgeColor: 'bg-yellow-100 text-yellow-800',
                label: 'Fair',
                icon: '📝',
                progressColor: 'bg-yellow-500'
            };
        } else {
            return {
                bgColor: 'bg-red-50/50',
                borderColor: 'border-red-200',
                textColor: 'text-red-700',
                badgeColor: 'bg-red-100 text-red-800',
                label: 'Needs Improvement',
                icon: '📚',
                progressColor: 'bg-red-500'
            };
        }
    };

    const style = getPerformanceStyle();

    const getFullImageUrl = (path?: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const separator = path.startsWith('/') ? '' : '/';
        return `${baseUrl}${separator}${path}`;
    };

    return (
        <div className={`rounded-xl border ${style.borderColor} ${style.bgColor} p-6 mb-6 animate-slide-up shadow-sm`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-2.5 py-0.5 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Question {questionNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${style.badgeColor}`}>
                            <span>{style.icon}</span>
                            {style.label}
                        </span>
                    </div>

                    {/* Question Image if hidden context */}
                    {answer.questionImageUrl && (
                        <div className="mb-4">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Original Question Image:</span>
                            <ImageLightbox
                                src={getFullImageUrl(answer.questionImageUrl)}
                                alt="Question Reference"
                                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                                style={{ maxHeight: '300px' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    )}

                    {!answer.hideQuestionText && (
                        <p className="text-gray-900 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                            {answer.questionText}
                        </p>
                    )}
                </div>

                {/* Marks Display */}
                <div className="flex-shrink-0 text-right bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                    <div className={`text-2xl font-bold ${style.textColor}`}>
                        {marksAwarded}
                        <span className="text-sm text-gray-400 font-normal ml-1">/ {marksAvailable}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">
                        {percentage.toFixed(0)}% Score
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${style.progressColor}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Your Answer */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Your Answer</h4>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-4">
                    {/* Student Image if available */}
                    {answer.imageUrl && (
                        <div className="mb-3">
                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-2">Uploaded Handwriting:</span>
                            <ImageLightbox
                                src={getFullImageUrl(answer.imageUrl)}
                                alt="Handwritten Answer"
                                className="max-w-full h-auto rounded border border-orange-100 shadow-sm"
                                style={{ maxHeight: '400px' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    )}

                    {/* Answer Text */}
                    {(answer.answerText || answer.extractedText) ? (
                        <div className="space-y-2">
                            {answer.answerText && (
                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {answer.answerText}
                                </p>
                            )}
                            {answer.extractedText && !answer.answerText && (
                                <div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight italic block mb-1">Extracted content:</span>
                                    <p className="text-gray-800 leading-relaxed italic">
                                        {answer.extractedText}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        !answer.imageUrl && <p className="text-gray-400 italic">No answer provided</p>
                    )}
                </div>
            </div>

            {/* AI Feedback */}
            {answer.aiFeedback && (
                <div className="mt-6">
                    <h4 className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Analysis & Feedback
                    </h4>
                    <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <FormattedFeedback content={answer.aiFeedback} />
                    </div>
                </div>
            )}

            {/* Waiting for AI Feedback */}
            {!answer.aiFeedback && answer.marksAwarded === null && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                    <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-amber-800 font-medium">
                        AI is analyzing your answer... Please check back in a few moments.
                    </p>
                </div>
            )}
        </div>
    );
};
