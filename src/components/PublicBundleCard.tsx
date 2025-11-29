"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PaperBundleSummaryDto } from '@/types';

/**
 * Props for PublicBundleCard component
 */
interface PublicBundleCardProps {
    /** Public bundle data */
    bundle: PaperBundleSummaryDto;
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
            className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-secondary-200 flex flex-col h-full overflow-hidden"
        >
            <div className="p-6 flex-grow">
                <div className="flex gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary-700 uppercase tracking-wide">
                        {bundle.examType}
                    </span>
                    {bundle.isPastPaper && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 uppercase tracking-wide">
                            Past Paper
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {bundle.name}
                </h3>
                <p className="text-secondary-600 text-sm line-clamp-3 mb-4">
                    {bundle.description}
                </p>
            </div>

            <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-secondary-500 font-medium uppercase">Price</span>
                    <span className="text-lg font-bold text-green-600">
                        ${typeof bundle.price === 'number' ? bundle.price.toFixed(2) : '0.00'}
                    </span>
                </div>
                <button className="text-sm font-semibold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center">
                    View Details <span className="ml-1">→</span>
                </button>
            </div>
        </div>
    );
};
