"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PaperCard } from '@/components/PaperCard';
import { PaperCardSkeleton } from '@/components/LoadingSkeleton';
import { bundleService } from '@/services/bundleService';
import { paperService } from '@/services/paperService';
import { PaperBundleDto, PaperDto } from '@/types';
import { message } from 'antd';

/**
 * Bundle Detail Page
 * Displays bundle details and papers if purchased, or purchase option
 */
export default function BundleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bundleId = parseInt(params.id as string);

    const [bundle, setBundle] = useState<PaperBundleDto | null>(null);
    const [papers, setPapers] = useState<PaperDto[]>([]);
    const [attemptedPapers, setAttemptedPapers] = useState<Set<number>>(new Set());
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBundleData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch bundle details
            const bundleData = await bundleService.getBundle(bundleId);
            setBundle(bundleData);

            // Check access
            try {
                const myBundles = await bundleService.getMyBundles();
                const access = myBundles.find(b => b.bundleId === bundleId);
                setHasAccess(!!access);

                if (access) {
                    // If purchased, fetch papers
                    const papersData = await paperService.getBundlePapers(bundleId);
                    setPapers(papersData);

                    // Check which papers have been attempted
                    const attempted = new Set<number>();
                    for (const paper of papersData) {
                        try {
                            const attempts = await paperService.getAttemptHistory(paper.id);
                            if (attempts.length > 0) {
                                attempted.add(paper.id);
                            }
                        } catch (err) {
                            // If we can't check attempts, assume not attempted
                            console.log(`Could not check attempts for paper ${paper.id}:`, err);
                        }
                    }
                    setAttemptedPapers(attempted);
                }
            } catch (err) {
                console.error('Error checking access:', err);
                // Continue showing bundle details even if access check fails (assume no access)
            }
        } catch (err: any) {
            console.error('Error fetching bundle:', err);
            setError(err.response?.data?.message || 'Failed to load bundle');
            message.error('Failed to load bundle details');
        } finally {
            setLoading(false);
        }
    }, [bundleId]);

    useEffect(() => {
        if (bundleId) {
            fetchBundleData();
        }
    }, [bundleId, fetchBundleData]);

    const handlePurchase = async () => {
        try {
            setPurchasing(true);
            await bundleService.purchaseBundle(bundleId);
            message.success('Bundle purchased successfully!');
            setHasAccess(true);
            fetchBundleData(); // Refresh to get papers
        } catch (err: any) {
            console.error('Error purchasing bundle:', err);
            message.error(err.response?.data?.message || 'Failed to purchase bundle');
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <ProtectedRoute role="STUDENT">
            <div className="page-wrapper">
                <Header />

                <div className="page-content">
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 animate-slide-up">
                        <button onClick={() => router.push('/dashboard')} className="hover:text-blue-600 transition-colors">
                            Dashboard
                        </button>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{bundle?.name || 'Bundle Details'}</span>
                    </nav>

                    {loading && (
                        <div className="space-y-8">
                            <div className="skeleton h-64 w-full rounded-lg" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <PaperCardSkeleton />
                                <PaperCardSkeleton />
                                <PaperCardSkeleton />
                            </div>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="card-base p-8 text-center bg-red-50 border-red-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Bundle</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button onClick={() => router.push('/dashboard')} className="btn-primary">Back to Dashboard</button>
                        </div>
                    )}

                    {!loading && !error && bundle && (
                        <>
                            {/* Hero Section */}
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 animate-slide-up">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <h1 className="text-4xl font-bold mb-2">{bundle.name}</h1>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                                    {bundle.examType}
                                                </span>
                                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                                    {bundle.type}
                                                </span>
                                                {bundle.isPastPaper && (
                                                    <span className="bg-yellow-400/20 text-yellow-100 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-yellow-400/30">
                                                        Past Paper
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold mb-1">${bundle.price.toFixed(2)}</div>
                                            {!hasAccess && (
                                                <button
                                                    onClick={handlePurchase}
                                                    disabled={purchasing}
                                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                                                >
                                                    {purchasing ? 'Processing...' : 'Purchase Now'}
                                                </button>
                                            )}
                                            {hasAccess && (
                                                <div className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 inline-flex">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Purchased
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                                    <p className="text-gray-600 leading-relaxed text-lg">{bundle.description}</p>
                                </div>
                            </div>

                            {/* Papers Section */}
                            {hasAccess ? (
                                <div className="animate-slide-up">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        Included Papers
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                            {papers.length}
                                        </span>
                                    </h2>
                                    {papers.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {papers.map((paper) => (
                                                <PaperCard
                                                    key={paper.id}
                                                    paper={paper}
                                                    attemptsRemaining={paper.maxFreeAttempts}
                                                    hasAttempted={attemptedPapers.has(paper.id)}
                                                    disabled={false}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="card-base p-12 text-center bg-gray-50">
                                            <p className="text-gray-600">No papers available in this bundle yet.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="card-base p-12 text-center bg-blue-50 border-blue-200 animate-slide-up">
                                    <svg className="w-16 h-16 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Full Access</h3>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        Purchase this bundle to access all {papers.length > 0 ? papers.length : ''} papers and get AI-powered feedback on your attempts.
                                    </p>
                                    <button
                                        onClick={handlePurchase}
                                        disabled={purchasing}
                                        className="btn-primary px-8 py-3 text-lg"
                                    >
                                        {purchasing ? 'Processing...' : `Purchase for $${bundle.price.toFixed(2)}`}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
