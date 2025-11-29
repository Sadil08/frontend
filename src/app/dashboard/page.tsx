"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/ProtectedRoute';
import { BundleCard } from '@/components/BundleCard';
import { BundleCardSkeleton } from '@/components/LoadingSkeleton';
import { bundleService } from '@/services/bundleService';
import { StudentBundleAccess } from '@/types';
import { message } from 'antd';

/**
 * Dashboard Page
 * Student dashboard showing purchased bundles
 */
export default function DashboardPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState<StudentBundleAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bundleService.getMyBundles();
      setBundles(data);
    } catch (err: any) {
      console.error('Error fetching bundles:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load bundles');
      message.error('Failed to load your bundles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute role="STUDENT">
      <div className="page-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-10 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-900 mb-3">
            Welcome back, Student!
          </h1>
          <p className="text-secondary-600 text-lg max-w-2xl">
            Track your progress, access your purchased bundles, and continue your learning journey.
          </p>
        </div>

        {/* Quick Stats */}
        {!loading && bundles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide">Total Bundles</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">{bundles.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide">Total Papers</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  {bundles.reduce((sum, b) => sum + b.paperCount, 0)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide">AI Feedback</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">Enabled</p>
              </div>
            </div>
          </div>
        )}

        {/* Bundles Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-primary-600 rounded-full"></span>
              My Bundles
            </h2>
            <button
              onClick={() => router.push('/bundles')}
              className="px-4 py-2 rounded-lg border border-primary-600 text-primary-600 font-medium hover:bg-primary-50 transition-colors flex items-center gap-2"
            >
              Browse More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <BundleCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                Failed to Load Bundles
              </h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button onClick={fetchBundles} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md">
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && bundles.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Bundles Yet
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                You haven&apos;t purchased any bundles yet. Browse our collection to find papers that match your learning goals.
              </p>
              <button
                onClick={() => router.push('/bundles')}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Browse Bundles
              </button>
            </div>
          )}

          {/* Bundles Grid */}
          {!loading && !error && bundles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bundles.map((bundleAccess) => (
                <BundleCard
                  key={bundleAccess.accessId}
                  bundleAccess={bundleAccess}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </ProtectedRoute >
  );
}
