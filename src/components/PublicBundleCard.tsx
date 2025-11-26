"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PaperBundleDto } from '@/types';

/**
 * Props for PublicBundleCard component
 */
interface PublicBundleCardProps {
    /** Public bundle data */
    bundle: PaperBundleDto;
}

/**
 * PublicBundleCard Component
 * Displays bundle information for public listings (no purchase data)
 */
export const PublicBundleCard: React.FC<PublicBundleCardProps> = ({ bundle }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/bundles/${bundle.id}/papers`);
    };

    return (
        <div
            onClick={handleClick}
            className="card-interactive hover-lift animate-slide-up cursor-pointer group"
        >
            {/* Bundle Header */}
            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {bundle.name}
                </h3>
                <p className="text-gray-600 text-sm text-clamp-2">
                    {bundle.description}
                </p>
            </div>

            {/* Bundle Metadata */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="badge-primary">{bundle.examType}</span>
                <span className="badge-gray">{bundle.type}</span>
                {bundle.isPastPaper && (
                    <span className="badge-warning">📄 Past Paper</span>
                )}
            </div>

            {/* Price Display */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-2xl font-bold text-green-600">
                    ${typeof bundle.price === 'number' ? bundle.price.toFixed(2) : '0.00'}
                </div>
                <button className="btn-primary text-sm px-4 py-2">
                    View Papers →
                </button>
            </div>
        </div>
    );
};
