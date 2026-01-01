"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { StudentBundleAccess } from '@/types';

/**
 * Props for BundleCard component
 */
interface BundleCardProps {
  /** Bundle access data with flat structure from backend */
  bundleAccess: StudentBundleAccess;
}

/**
 * BundleCard Component
 * Displays bundle information with advanced styling and animations
 * Features:
 * - Glassmorphism effects
 * - Hover animations
 * - Badges for bundle metadata
 * - Formatted price display
 * - Click to view papers
 */
export const BundleCard: React.FC<BundleCardProps> = ({ bundleAccess }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/bundles/${bundleAccess.bundleId}/papers`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-secondary-200 flex flex-col h-full overflow-hidden"
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary-700 uppercase tracking-wide">
              {bundleAccess.examTypeName}
            </span>
            {bundleAccess.isPastPaper && (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 uppercase tracking-wide">
                Past Paper
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {bundleAccess.bundleName}
        </h3>
        <p className="text-secondary-600 text-sm line-clamp-2 mb-4">
          {bundleAccess.bundleDescription}
        </p>

        <div className="space-y-2 mb-4">
          {bundleAccess.subjectName && (
            <div className="flex items-center text-sm text-secondary-500">
              <svg className="w-4 h-4 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {bundleAccess.subjectName}
            </div>
          )}
          {bundleAccess.lessonName && (
            <div className="flex items-center text-sm text-secondary-500">
              <svg className="w-4 h-4 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {bundleAccess.lessonName}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-secondary-500 font-medium uppercase">Price</span>
          <span className="text-lg font-bold text-green-600">${bundleAccess.price.toFixed(2)}</span>
        </div>
        <button className="text-sm font-semibold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center">
          View Papers <span className="ml-1">→</span>
        </button>
      </div>
    </div>
  );
};