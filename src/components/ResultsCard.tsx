"use client";

import React from 'react';
import { AttemptAnswer } from '@/types';

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
 * - Expandable/collapsible design
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
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800',
                badgeColor: 'badge-success',
                label: 'Excellent',
                icon: '🎉'
            };
        } else if (percentage >= 60) {
            return {
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-800',
                badgeColor: 'badge-primary',
                label: 'Good',
                icon: '👍'
            };
        } else if (percentage >= 40) {
            return {
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                textColor: 'text-yellow-800',
                badgeColor: 'badge-warning',
                label: 'Fair',
                icon: '📝'
            };
        } else {
            return {
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                badgeColor: 'badge-danger',
                label: 'Needs Improvement',
                icon: '📚'
            };
        }
    };

    const style = getPerformanceStyle();

    return (
        <div className={`card-base p-6 ${style.bgColor} border-2 ${style.borderColor} animate-slide-up`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="badge-gray font-semibold">
                            Question {questionNumber}
                        </span>
                        <span className={style.badgeColor}>
                            {style.icon} {style.label}
                        </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                        {answer.questionText}
                    </p>
                </div>

                {/* Marks Display */}
                <div className="flex-shrink-0 text-right">
                    <div className={`text-3xl font-bold ${style.textColor}`}>
                        {marksAwarded}
                        <span className="text-lg text-gray-500">/{marksAvailable}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {percentage.toFixed(0)}%
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar mb-4">
                <div
                    className={`progress-fill ${percentage >= 80 ? 'bg-green-600' :
                            percentage >= 60 ? 'bg-blue-600' :
                                percentage >= 40 ? 'bg-yellow-600' :
                                    'bg-red-600'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Your Answer */}
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</h4>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap">
                        {answer.answerText || 'No answer provided'}
                    </p>
                </div>
            </div>

            {/* AI Feedback */}
            {answer.aiFeedback && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Feedback:
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-gray-800 leading-relaxed">
                            {answer.aiFeedback}
                        </p>
                    </div>
                </div>
            )}

            {/* Waiting for AI Feedback */}
            {!answer.aiFeedback && answer.marksAwarded === null && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                        <div className="spinner w-4 h-4 border-2" />
                        AI is analyzing your answer... Please check back in a few moments.
                    </p>
                </div>
            )}
        </div>
    );
};
