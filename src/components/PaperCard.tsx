"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PaperDto } from '@/types';

/**
 * Props for PaperCard component
 */
interface PaperCardProps {
    /** Paper data */
    paper: PaperDto;
    /** Number of attempts remaining */
    attemptsRemaining?: number;
    /** Whether the paper has been attempted */
    hasAttempted?: boolean;
    /** Whether the attempt button is disabled */
    disabled?: boolean;
}

/**
 * PaperCard Component
 * Displays paper information with attempt status
 * Features:
 * - Attempt status indicator
 * - Progress visualization
 * - Hover effects
 * - Responsive design
 */
export const PaperCard: React.FC<PaperCardProps> = ({
    paper,
    attemptsRemaining,
    hasAttempted = false,
    disabled = false
}) => {
    const router = useRouter();

    const handleAttempt = () => {
        if (!disabled) {
            router.push(`/papers/${paper.id}/attempt`);
        }
    };

    return (
        <div className="card-interactive hover-lift animate-slide-up">
            {/* Paper Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {paper.name}
                    </h3>
                    <p className="text-gray-600 text-sm text-clamp-2">
                        {paper.description}
                    </p>
                </div>
                <span className="badge-primary flex-shrink-0">
                    {paper.type}
                </span>
            </div>

            {/* Attempt Status */}
            <div className="mb-4">
                {hasAttempted && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-green-600">Previously Attempted</span>
                    </div>
                )}

                {attemptsRemaining !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            Attempts Remaining:
                        </span>
                        <span className={`font-semibold ${attemptsRemaining > 0 ? 'text-blue-600' : 'text-red-600'
                            }`}>
                            {attemptsRemaining} / {paper.maxFreeAttempts}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
                {/* Primary Action Button */}
                <button
                    onClick={handleAttempt}
                    disabled={disabled || (attemptsRemaining !== undefined && attemptsRemaining === 0)}
                    className={`w-full ${disabled || (attemptsRemaining !== undefined && attemptsRemaining === 0)
                            ? 'btn-secondary cursor-not-allowed'
                            : 'btn-primary'
                        }`}
                >
                    {disabled
                        ? 'Purchase Required'
                        : attemptsRemaining === 0
                            ? 'No Attempts Left'
                            : hasAttempted
                                ? 'Retry Paper'
                                : 'Attempt Paper'
                    }
                </button>

                {/* View Past Attempts Button - Only show if attempted */}
                {hasAttempted && (
                    <button
                        onClick={() => router.push(`/papers/${paper.id}/past-attempts`)}
                        className="w-full btn-outline-primary"
                    >
                        📚 View Past Attempts
                    </button>
                )}
            </div>
        </div>
    );
};
