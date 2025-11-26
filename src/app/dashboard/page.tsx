"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
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
      <div className="page-wrapper">
        <Header />

        <div className="page-content">
          {/* Page Header */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Access your purchased bundles and track your progress
            </p>
          </div>

          {/* Bundles Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                My Bundles
              </h2>
              <button
                onClick={() => router.push('/')}
                className="btn-outline-primary"
              >
                Browse More Bundles
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <BundleCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="card-base p-8 text-center bg-red-50 border-red-200">
                <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Failed to Load Bundles
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button onClick={fetchBundles} className="btn-primary">
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && bundles.length === 0 && (
              <div className="card-base p-12 text-center bg-blue-50 border-blue-200">
                <svg className="w-20 h-20 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Bundles Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven&apos;t purchased any bundles yet. Browse our collection to find papers that match your learning goals.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="btn-primary px-8"
                >
                  Browse Bundles
                </button>
              </div>
            )}

            {/* Bundles Grid */}
            {!loading && !error && bundles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bundles.map((bundleAccess) => (
                  <BundleCard
                    key={bundleAccess.accessId}
                    bundleAccess={bundleAccess}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {!loading && bundles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card-base p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Bundles</p>
                    <p className="text-2xl font-bold text-gray-900">{bundles.length}</p>
                  </div>
                </div>
              </div>

              <div className="card-base p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Papers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bundles.reduce((sum, b) => sum + b.paperCount, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-base p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">AI Powered</p>
                    <p className="text-2xl font-bold text-gray-900">Feedback</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
