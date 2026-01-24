"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PaperCard } from '@/components/PaperCard';
import { PaperCardSkeleton } from '@/components/LoadingSkeleton';
import { customBundleService, CustomBundleDto } from '@/services/customBundleService';
import { paperService } from '@/services/paperService';
import { PaperDto, AttemptInfo } from '@/types';
import { message } from 'antd';

/**
 * Custom Bundle Detail Page
 * Displays papers within a custom bundle
 */
export default function CustomBundleDetailPage() {
    const params = useParams();
    const router = useRouter();
    // Safely parse ID
    const parseId = (id: string | string[]): number => {
        if (Array.isArray(id)) return parseInt(id[0]);
        return parseInt(id);
    };
    const bundleId = parseId(params.id as string);

    const [bundle, setBundle] = useState<CustomBundleDto | null>(null);
    const [papers, setPapers] = useState<PaperDto[]>([]);
    const [attemptInfos, setAttemptInfos] = useState<Record<string, AttemptInfo>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track attempt status
    const [attemptedPapers, setAttemptedPapers] = useState<Set<number>>(new Set());

    const fetchBundleData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch bundle details
            const bundleData = await customBundleService.getBundleById(bundleId);
            setBundle(bundleData);

            // Set papers directly from bundle response
            if (bundleData.papers && bundleData.papers.length > 0) {
                setPapers(bundleData.papers);

                // Fetch attempt info for these papers in this custom bundle context
                try {
                    const paperIds = bundleData.papers.map(p => p.id);
                    const infoMap = await paperService.getAttemptInfo(paperIds, undefined, bundleId);
                    setAttemptInfos(infoMap);
                } catch (e) {
                    console.error("Failed to load attempt info", e);
                }
            } else {
                setPapers([]);
            }

            // Check attempting status (custom bundle scoped)
            // We need to check if user has attempted these papers *within this custom bundle context*
            // However, getAttemptHistory currently supports bundleId but not customBundleId?
            // Wait, we updated backend paperService.getAttemptInfoForPapers to support customBundleId.
            // But frontend paperService.getAttemptInfo needs update too?
            // Actually, we can just use getAttemptHistory per paper.

            // Or better, use getAttemptInfoForPapers.
            // Let's implement fetch for attempts if needed.
            // For now, simpler approach: rely on PaperCard's internal logic or fetch attempt info?
            // PaperCard relies on props.

            // Let's use paperService.getAttemptInfo if possible, but frontend service doesn't have customBundleId param yet for getAttemptInfo?
            // I updated attemptPaper/submitPaper, but not getAttemptInfo in paperService.ts (I did via 'if present' replacements).
            // Wait, I updated attemptPaper and submitPaper. Did I update getAttemptInfo?
            // I should have. Let's assume I missed it or verify.
            // Actually, I can just fetch attemptHistory for each paper with customBundle param?
            // But paperService.getAttemptHistory signature?
            // getAttemptHistory(paperId, bundleId) -> doesn't have customBundleId param yet.

            // I'll skip "attempted" status for now or assume not attempted initially, 
            // relying on PaperCard click to go to attempt page where it will show status.
            // OR I can add customBundleId to getAttemptHistory in paperService.ts.
            // I'll update paperService.ts later if needed.

        } catch (err: any) {
            console.error('Error fetching custom bundle:', err);
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

    return (
        <ProtectedRoute role="STUDENT">
            <div className="page-wrapper">
                <div className="page-content">
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 animate-slide-up">
                        <button onClick={() => router.push('/dashboard')} className="hover:text-blue-600 transition-colors">
                            Dashboard
                        </button>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{bundle?.name || 'Custom Bundle'}</span>
                    </nav>

                    {loading && (
                        <div className="space-y-8">
                            <div className="skeleton h-48 w-full rounded-lg" />
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
                                <div className="bg-gradient-to-r from-purple-600 to-indigo-800 p-8 text-white">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-4xl font-bold">{bundle.name}</h1>
                                                <span className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm border ${bundle.status === 'APPROVED' ? 'bg-green-400/20 border-green-400/30' :
                                                    bundle.status === 'PURCHASED' ? 'bg-blue-400/20 border-blue-400/30' :
                                                        'bg-white/20 border-white/30'
                                                    }`}>
                                                    {bundle.status}
                                                </span>
                                            </div>
                                            <p className="text-purple-100 text-lg max-w-2xl">{bundle.description || "No description provided."}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-medium opacity-80 mb-1">Total Value</div>
                                            <div className="text-3xl font-bold">${bundle.totalPrice?.toFixed(2) || '0.00'}</div>
                                            <div className="mt-2 text-sm opacity-75">
                                                Created by {bundle.creatorName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Papers Section */}
                            <div className="animate-slide-up">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    Included Papers
                                    <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                                        {papers.length}
                                    </span>
                                </h2>
                                {papers.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {papers.map((paper) => {
                                            const info = attemptInfos[paper.id];
                                            const attemptsRemaining = info ? info.remainingAttempts : 2;
                                            const hasAttempted = info ? info.attemptsMade > 0 : false;
                                            const disabled = info ? !info.canAttempt : false;

                                            return (
                                                <PaperCard
                                                    key={paper.id}
                                                    paper={paper}
                                                    attemptsRemaining={attemptsRemaining}
                                                    maxAttempts={info ? info.maxAttempts : 2}
                                                    hasAttempted={hasAttempted}
                                                    disabled={disabled}
                                                    inProgressAttemptId={info?.inProgressAttemptId}
                                                    customBundleId={bundleId}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="card-base p-12 text-center bg-gray-50">
                                        <p className="text-gray-600">No papers found in this bundle.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
