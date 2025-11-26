"use client";

import React from 'react';

/**
 * Skeleton variant types
 */
type SkeletonVariant = 'text' | 'title' | 'card' | 'circle' | 'button';

/**
 * Props for LoadingSkeleton component
 */
interface LoadingSkeletonProps {
    /** Variant of skeleton to display */
    variant?: SkeletonVariant;
    /** Width override (e.g., '100%', '200px') */
    width?: string;
    /** Height override (e.g., '100px', '50%') */
    height?: string;
    /** Number of skeleton items to render (for lists) */
    count?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * LoadingSkeleton Component
 * Reusable loading skeleton for better UX during data fetching
 * Features:
 * - Multiple variants (text, title, card, circle, button)
 * - Shimmer animation effect
 * - Customizable dimensions
 * - Support for rendering multiple items
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    variant = 'text',
    width,
    height,
    count = 1,
    className = ''
}) => {
    const getSkeletonClasses = () => {
        const baseClasses = 'skeleton';

        switch (variant) {
            case 'text':
                return `${baseClasses} h-4 w-full ${className}`;
            case 'title':
                return `${baseClasses} h-6 w-3/4 ${className}`;
            case 'card':
                return `${baseClasses} h-48 w-full rounded-lg ${className}`;
            case 'circle':
                return `${baseClasses} rounded-full ${className}`;
            case 'button':
                return `${baseClasses} h-10 w-32 rounded-lg ${className}`;
            default:
                return `${baseClasses} ${className}`;
        }
    };

    const skeletonStyle: React.CSSProperties = {
        ...(width && { width }),
        ...(height && { height })
    };

    const skeletons = Array.from({ length: count }, (_, index) => (
        <div
            key={index}
            className={getSkeletonClasses()}
            style={skeletonStyle}
        />
    ));

    return count > 1 ? (
        <div className="space-y-3">
            {skeletons}
        </div>
    ) : (
        <>{skeletons}</>
    );
};

/**
 * BundleCardSkeleton Component
 * Skeleton specifically for bundle cards
 */
export const BundleCardSkeleton: React.FC = () => {
    return (
        <div className="card-base p-6 animate-pulse">
            <div className="skeleton h-6 w-3/4 mb-3" />
            <div className="skeleton h-4 w-full mb-2" />
            <div className="skeleton h-4 w-5/6 mb-4" />
            <div className="flex items-center gap-2 mb-4">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-24 rounded-full" />
            </div>
            <div className="skeleton h-10 w-full rounded-lg" />
        </div>
    );
};

/**
 * PaperCardSkeleton Component
 * Skeleton specifically for paper cards
 */
export const PaperCardSkeleton: React.FC = () => {
    return (
        <div className="card-base p-6 animate-pulse">
            <div className="flex items-start justify-between mb-3">
                <div className="skeleton h-6 w-2/3" />
                <div className="skeleton h-6 w-16 rounded-full" />
            </div>
            <div className="skeleton h-4 w-full mb-2" />
            <div className="skeleton h-4 w-4/5 mb-4" />
            <div className="flex items-center justify-between">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-10 w-28 rounded-lg" />
            </div>
        </div>
    );
};

/**
 * QuestionSkeleton Component
 * Skeleton for question components
 */
export const QuestionSkeleton: React.FC = () => {
    return (
        <div className="card-base p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
            </div>
            <div className="skeleton h-5 w-full mb-2" />
            <div className="skeleton h-5 w-3/4 mb-4" />
            <div className="space-y-3">
                <div className="skeleton h-12 w-full rounded-lg" />
                <div className="skeleton h-12 w-full rounded-lg" />
                <div className="skeleton h-12 w-full rounded-lg" />
                <div className="skeleton h-12 w-full rounded-lg" />
            </div>
        </div>
    );
};

/**
 * TableSkeleton Component
 * Skeleton for table/list views
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
                    <div className="skeleton h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-3/4" />
                        <div className="skeleton h-3 w-1/2" />
                    </div>
                    <div className="skeleton h-8 w-20 rounded" />
                </div>
            ))}
        </div>
    );
};
