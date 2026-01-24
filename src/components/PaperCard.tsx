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
    /** Maximum attempts allowed (including purchased) */
    maxAttempts?: number;
    /** Whether the paper has been attempted */
    hasAttempted?: boolean;
    /** In-progress attempt ID if user has an ongoing attempt */
    inProgressAttemptId?: number;
    /** Whether the attempt button is disabled */
    disabled?: boolean;
    /** Context bundle ID for the paper */
    bundleId?: number;
    /** Context custom bundle ID for the paper */
    customBundleId?: number;
    /** Callback for when start button is clicked */
    onStart?: () => void;
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
export function PaperCard({
    paper,
    attemptsRemaining,
    maxAttempts,
    hasAttempted = false,
    disabled = false,
    inProgressAttemptId,
    bundleId,
    customBundleId,
    onStart
}: PaperCardProps) {
    const router = useRouter();

    const getLink = (path: string) => {
        const params = new URLSearchParams();
        if (bundleId) params.append('bundleId', bundleId.toString());
        if (customBundleId) params.append('customBundleId', customBundleId.toString());
        const queryString = params.toString();
        return queryString ? `${path}?${queryString}` : path;
    };

    const handleAttempt = () => {
        if (onStart) {
            onStart();
        } else {
            router.push(getLink(`/papers/${paper.id}/attempt`));
        }
    };

    const handleRetry = () => {
        const path = getLink(`/papers/${paper.id}/attempt`);
        router.push(`${path}${path.includes('?') ? '&' : '?'}forceNew=true`);
    };

    const effectiveDisabled = disabled && !inProgressAttemptId;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-0 flex flex-col h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            {/* Header / Info */}
            <div className="p-6 pb-4 space-y-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${paper.type === 'MCQ' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                        {paper.type}
                    </span>
                    {hasAttempted && (
                        <span className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Attempted
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]" title={paper.name}>
                    {paper.name}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]" title={paper.description}>
                    {paper.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 mt-2">
                    <span>{paper.totalMarks} Marks</span>
                    {maxAttempts !== undefined && (
                        <span className={attemptsRemaining === 0 ? "text-red-600 font-medium" : "text-gray-600"}>
                            {attemptsRemaining}/{maxAttempts} attempts left
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 pt-0 space-y-3 mt-auto">
                <button
                    onClick={() => {
                        const queryParams = new URLSearchParams();
                        if (bundleId) queryParams.append('bundleId', bundleId.toString());
                        if (customBundleId) queryParams.append('customBundleId', customBundleId.toString());

                        // If we have an in-progress attempt, Resume it.
                        // If we have attempted but no in-progress, Retry it (forceNew).
                        // If never attempted, Start it.
                        const isResume = !!inProgressAttemptId;
                        const isRetry = hasAttempted && !isResume;

                        router.push(`/papers/${paper.id}/attempt?${queryParams.toString()}${isRetry ? '&forceNew=true' : ''}`);
                    }}
                    disabled={effectiveDisabled}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
                            ${effectiveDisabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : inProgressAttemptId
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 hover:shadow-md'
                                : hasAttempted
                                    ? 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md'
                                    : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg hover:shadow-primary-500/30'
                        }`}
                >
                    {effectiveDisabled ? (customBundleId ? 'Limit Reached' : 'Purchase Required') :
                        inProgressAttemptId ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Resume Attempt
                            </>
                        ) :
                            attemptsRemaining === 0 ? 'No Attempts Left' :
                                hasAttempted ? 'Retry Paper' : 'Start Attempt'}
                </button>


                <div className="grid grid-cols-2 gap-3">
                    {hasAttempted && (
                        <button
                            onClick={() => router.push(getLink(`/papers/${paper.id}/past-attempts`))}
                            className="py-2 px-3 rounded-lg border border-secondary-200 text-secondary-700 text-xs font-medium hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                        >
                            History
                        </button>
                    )}
                    <button
                        onClick={() => router.push(getLink(`/papers/${paper.id}/leaderboard`))}
                        className={`py-2 px-3 rounded-lg border border-secondary-200 text-secondary-700 text-xs font-medium hover:bg-secondary-50 hover:text-primary-600 transition-colors ${!hasAttempted ? 'col-span-2' : ''}`}
                    >
                        Leaderboard
                    </button>
                </div>
            </div>
        </div>
    );
};
