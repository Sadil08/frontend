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
        <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-secondary-200 flex flex-col h-full">
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${paper.type === 'MCQ' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                        {paper.type}
                    </span>
                    {hasAttempted && (
                        <span className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Completed
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-secondary-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {paper.name}
                </h3>
                <p className="text-secondary-600 text-sm line-clamp-3 mb-4 min-h-[3rem]">
                    {paper.description}
                </p>

                {attemptsRemaining !== undefined && (
                    <div className="flex items-center justify-between text-sm bg-secondary-50 p-3 rounded-lg mb-4">
                        <span className="text-secondary-600 font-medium">Attempts Left</span>
                        <span className={`font-bold ${attemptsRemaining > 0 ? 'text-primary-600' : 'text-red-600'}`}>
                            {attemptsRemaining} <span className="text-secondary-400 font-normal">/ {paper.maxFreeAttempts}</span>
                        </span>
                    </div>
                )}
            </div>

            <div className="p-6 pt-0 space-y-3 mt-auto">
                <button
                    onClick={handleAttempt}
                    disabled={disabled || (attemptsRemaining !== undefined && attemptsRemaining === 0)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center ${disabled || (attemptsRemaining !== undefined && attemptsRemaining === 0)
                            ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
                        }`}
                >
                    {disabled ? 'Purchase Required' :
                        attemptsRemaining === 0 ? 'No Attempts Left' :
                            hasAttempted ? 'Retry Paper' : 'Start Attempt'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                    {hasAttempted && (
                        <button
                            onClick={() => router.push(`/papers/${paper.id}/past-attempts`)}
                            className="py-2 px-3 rounded-lg border border-secondary-200 text-secondary-700 text-xs font-medium hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                        >
                            History
                        </button>
                    )}
                    <button
                        onClick={() => router.push(`/papers/${paper.id}/leaderboard`)}
                        className={`py-2 px-3 rounded-lg border border-secondary-200 text-secondary-700 text-xs font-medium hover:bg-secondary-50 hover:text-primary-600 transition-colors ${!hasAttempted ? 'col-span-2' : ''}`}
                    >
                        Leaderboard
                    </button>
                </div>
            </div>
        </div>
    );
};
