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
      className="card-interactive hover-lift animate-slide-up cursor-pointer group"
    >
      {/* Bundle Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {bundleAccess.bundleName}
        </h3>
        <p className="text-gray-600 text-sm text-clamp-2">
          {bundleAccess.bundleDescription}
        </p>
      </div>

      {/* Bundle Metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="badge-primary">
          {bundleAccess.examType}
        </span>
        <span className="badge-gray">
          {bundleAccess.type}
        </span>
        {bundleAccess.isPastPaper && (
          <span className="badge-warning">
            📄 Past Paper
          </span>
        )}
        {bundleAccess.paperCount > 0 && (
          <span className="badge-success">
            {bundleAccess.paperCount} {bundleAccess.paperCount === 1 ? 'Paper' : 'Papers'}
          </span>
        )}
      </div>

      {/* Subject and Lesson Info */}
      {(bundleAccess.subjectName || bundleAccess.lessonName) && (
        <div className="mb-4 text-sm text-gray-600">
          {bundleAccess.subjectName && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{bundleAccess.subjectName}</span>
            </div>
          )}
          {bundleAccess.lessonName && (
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{bundleAccess.lessonName}</span>
            </div>
          )}
        </div>
      )}

      {/* Price Display */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-2xl font-bold text-green-600">
          ${bundleAccess.price.toFixed(2)}
        </div>
        <button className="btn-primary text-sm px-4 py-2">
          View Papers →
        </button>
      </div>

      {/* Purchase Date */}
      <div className="mt-3 text-xs text-gray-500">
        Purchased: {new Date(bundleAccess.purchasedAt).toLocaleDateString()}
      </div>
    </div>
  );
};