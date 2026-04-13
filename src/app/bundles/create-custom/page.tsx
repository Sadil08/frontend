"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { message, Input, Button, Spin, Modal } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    CreditCardOutlined,
    BookOutlined,
    CheckCircleFilled,
    SearchOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';

import ProtectedRoute from '@/components/ProtectedRoute';
import { customBundleService, CustomBundleDto } from '@/services/customBundleService';
import { bundleService } from '@/services/bundleService';
import { paperService } from '@/services/paperService';
import { PaperDto, PaperBundleSummaryDto } from '@/types';
import PayHereCheckout from '@/components/PayHereCheckout';

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    MCQ:   { bg: 'bg-blue-50',    text: 'text-blue-700'    },
    ESSAY: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    MIXED: { bg: 'bg-purple-50',  text: 'text-purple-700'  },
};

const TYPE_STRIP: Record<string, string> = {
    MCQ:   'bg-blue-500',
    ESSAY: 'bg-emerald-500',
    MIXED: 'bg-purple-500',
};

export default function CreateCustomBundlePage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [bundle, setBundle] = useState<CustomBundleDto | null>(null);
    const [pricePerPaper, setPricePerPaper] = useState(2);
    const [papers, setPapers] = useState<PaperDto[]>([]);
    const [selectedPapers, setSelectedPapers] = useState<Set<number>>(new Set());

    // Search & filter
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'MCQ' | 'ESSAY' | 'MIXED'>('ALL');
    const [pastPaperOnly, setPastPaperOnly] = useState(false);

    // Bundle metadata for cross-referencing paper categories
    const [bundleMetaMap, setBundleMetaMap] = useState<Map<number, PaperBundleSummaryDto>>(new Map());

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Bundle creation
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bundleName, setBundleName] = useState('');
    const [bundleDescription, setBundleDescription] = useState('');
    const [creating, setCreating] = useState(false);

    // Payment
    const [showPayment, setShowPayment] = useState(false);
    const [purchasing, setPurchasing] = useState(false);

    const MAX_PAPERS = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [price, draft, allPapers, allBundles] = await Promise.all([
                    customBundleService.getPricePerPaper(),
                    customBundleService.getMyDraft(),
                    paperService.getAllPapers(),
                    bundleService.filterBundles(),
                ]);

                setPricePerPaper(price);
                if (draft) {
                    setBundle(draft);
                    setSelectedPapers(new Set(draft.paperIds));
                }
                setPapers(allPapers);

                // Build map: bundleId → bundle summary (for paper metadata cross-reference)
                const map = new Map<number, PaperBundleSummaryDto>(
                    allBundles.map((b: PaperBundleSummaryDto) => [b.id, b])
                );
                setBundleMetaMap(map);
            } catch (error) {
                console.error('Error loading data:', error);
                message.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derive paper metadata (examType, isPastPaper) from the bundles it belongs to
    const getPaperMeta = (paper: PaperDto) => {
        const bundles = (paper.bundleIds || [])
            .map(id => bundleMetaMap.get(id))
            .filter((b): b is PaperBundleSummaryDto => !!b);
        return {
            isPastPaper: bundles.some(b => b.isPastPaper),
            examTypes: [...new Set(bundles.map(b => b.examType).filter(Boolean))],
        };
    };

    const filteredPapers = useMemo(() => {
        return papers.filter(paper => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                paper.name.toLowerCase().includes(q) ||
                paper.description?.toLowerCase().includes(q) ||
                paper.type.toLowerCase().includes(q);

            const matchesType = typeFilter === 'ALL' || paper.type === typeFilter;
            if (!matchesSearch || !matchesType) return false;

            if (pastPaperOnly) {
                const meta = getPaperMeta(paper);
                if (!meta.isPastPaper) return false;
            }

            return true;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [papers, searchQuery, typeFilter, pastPaperOnly, bundleMetaMap]);

    const paginatedPapers = filteredPapers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    const totalPages = Math.ceil(filteredPapers.length / pageSize);
    const totalPrice = selectedPapers.size * pricePerPaper;
    const selectedCount = selectedPapers.size;
    const progressPct = (selectedCount / MAX_PAPERS) * 100;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleCreateBundle = async () => {
        if (!bundleName.trim()) { message.error('Please enter a bundle name'); return; }
        try {
            setCreating(true);
            const newBundle = await customBundleService.createBundle({ name: bundleName, description: bundleDescription });
            setBundle(newBundle);
            setShowCreateModal(false);
            setBundleName('');
            setBundleDescription('');
            message.success('Bundle created! Now pick your papers.');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to create bundle');
        } finally {
            setCreating(false);
        }
    };

    const handleAddPaper = async (paperId: number) => {
        if (!bundle) return;
        if (selectedPapers.size >= MAX_PAPERS) {
            message.warning(`You can only add up to ${MAX_PAPERS} papers`);
            return;
        }
        try {
            const updated = await customBundleService.addPaper(bundle.id, paperId);
            setBundle(updated);
            setSelectedPapers(new Set(updated.paperIds));
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to add paper');
        }
    };

    const handleRemovePaper = async (paperId: number) => {
        if (!bundle) return;
        try {
            const updated = await customBundleService.removePaper(bundle.id, paperId);
            setBundle(updated);
            setSelectedPapers(new Set(updated.paperIds));
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to remove paper');
        }
    };

    const handleDeleteBundle = async () => {
        if (!bundle) return;
        Modal.confirm({
            title: 'Delete this bundle draft?',
            content: 'This will permanently remove your draft and all selected papers.',
            okText: 'Yes, delete it',
            okType: 'danger',
            onOk: async () => {
                try {
                    await customBundleService.deleteBundle(bundle.id);
                    setBundle(null);
                    setSelectedPapers(new Set());
                    message.success('Bundle deleted');
                } catch {
                    message.error('Failed to delete bundle');
                }
            },
        });
    };

    const handlePaymentSuccess = async (paymentReference: string) => {
        if (!bundle) return;
        setShowPayment(false);
        setPurchasing(true);
        try {
            await customBundleService.purchaseBundle(bundle.id, paymentReference);
            message.success('Bundle purchased! Your papers are ready.');
            router.push('/dashboard');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to purchase bundle');
        } finally {
            setPurchasing(false);
        }
    };

    const handlePurchaseClick = () => {
        if (!bundle || selectedCount === 0) {
            message.warning('Add at least one paper before purchasing');
            return;
        }
        setShowPayment(true);
    };

    // ── Loading ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <ProtectedRoute role="STUDENT">
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                    <div className="text-center">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-500 font-medium">Loading your workspace...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <ProtectedRoute role="STUDENT">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

                {/* ── Page Header ── */}
                <div className="bg-white border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Build Your Study Bundle</h1>
                                <p className="text-gray-500 mt-0.5 text-sm">
                                    Mix and match up to {MAX_PAPERS} papers — ${pricePerPaper.toFixed(2)} each
                                </p>
                            </div>

                            {bundle && (
                                <div className="flex items-center gap-4">
                                    {/* Desktop progress bar */}
                                    <div className="hidden sm:flex flex-col items-end gap-1.5">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {selectedCount} of {MAX_PAPERS} papers selected
                                        </span>
                                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${progressPct}%`,
                                                    background: selectedCount === MAX_PAPERS
                                                        ? 'linear-gradient(90deg, #10b981, #059669)'
                                                        : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<CreditCardOutlined />}
                                        onClick={handlePurchaseClick}
                                        loading={purchasing}
                                        disabled={selectedCount === 0}
                                        className="bg-indigo-600 hover:bg-indigo-700 border-none font-semibold shadow-md"
                                    >
                                        Pay ${totalPrice.toFixed(2)}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* ── No Bundle State ── */}
                    {!bundle && (
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <div className="text-center max-w-md">
                                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOutlined className="text-4xl text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Start Building</h2>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    Give your bundle a name, then hand-pick the papers you want to practice.
                                    Mix subjects, exam types, past papers — it's yours to design.
                                </p>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setShowCreateModal(true)}
                                    size="large"
                                    className="bg-indigo-600 hover:bg-indigo-700 border-none font-semibold px-8 shadow-lg"
                                >
                                    Create New Bundle
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Bundle Builder ── */}
                    {bundle && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left: Paper Selection */}
                            <div className="lg:col-span-2 space-y-4">

                                {/* Search & Filter Bar */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                                    <Input
                                        prefix={<SearchOutlined className="text-gray-400" />}
                                        placeholder="Search by name, description, or type..."
                                        value={searchQuery}
                                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        size="large"
                                        className="rounded-lg"
                                        allowClear
                                    />

                                    {/* Quick-filter pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {(['ALL', 'MCQ', 'ESSAY', 'MIXED'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
                                                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                                                    typeFilter === t
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                                                }`}
                                            >
                                                {t === 'ALL' ? 'All Types' : t}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => { setPastPaperOnly(p => !p); setCurrentPage(1); }}
                                            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                                                pastPaperOnly
                                                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400 hover:text-amber-600'
                                            }`}
                                        >
                                            <ClockCircleOutlined />
                                            Past Papers
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-400">
                                        {filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''}
                                        {searchQuery || typeFilter !== 'ALL' || pastPaperOnly
                                            ? ' match your filters'
                                            : ' available'}
                                    </p>
                                </div>

                                {/* Paper Grid */}
                                {paginatedPapers.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                                        <div className="text-5xl mb-4">🔍</div>
                                        <h3 className="text-lg font-bold text-gray-700 mb-2">No papers match</h3>
                                        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                                        <button
                                            onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); setPastPaperOnly(false); }}
                                            className="mt-4 text-indigo-600 text-sm font-semibold hover:underline"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {paginatedPapers.map(paper => {
                                            const isSelected = selectedPapers.has(paper.id);
                                            const isDisabled = !isSelected && selectedCount >= MAX_PAPERS;
                                            const meta = getPaperMeta(paper);
                                            const colors = TYPE_COLORS[paper.type] || TYPE_COLORS.MCQ;
                                            const strip = TYPE_STRIP[paper.type] || TYPE_STRIP.MCQ;

                                            return (
                                                <div
                                                    key={paper.id}
                                                    onClick={() => !isDisabled && (isSelected ? handleRemovePaper(paper.id) : handleAddPaper(paper.id))}
                                                    className={`relative bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                                                        isSelected
                                                            ? 'border-indigo-500 shadow-md shadow-indigo-100 cursor-pointer'
                                                            : isDisabled
                                                            ? 'border-gray-100 opacity-50 cursor-not-allowed'
                                                            : 'border-gray-100 hover:border-indigo-300 hover:shadow-md cursor-pointer'
                                                    }`}
                                                >
                                                    {/* Coloured top strip */}
                                                    <div className={`h-1.5 w-full ${strip}`} />

                                                    <div className="p-4">
                                                        {/* Badges */}
                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                                                                {paper.type}
                                                            </span>
                                                            {meta.isPastPaper && (
                                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                                                                    Past Paper
                                                                </span>
                                                            )}
                                                            {meta.examTypes.slice(0, 1).map(et => (
                                                                <span key={et} className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                                                    {et}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
                                                            {paper.name}
                                                        </h3>
                                                        {paper.description && (
                                                            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                                                                {paper.description}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                            <span className="text-xs text-gray-400 font-medium">
                                                                ${pricePerPaper.toFixed(2)}
                                                            </span>
                                                            <button
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    if (!isDisabled) {
                                                                        isSelected
                                                                            ? handleRemovePaper(paper.id)
                                                                            : handleAddPaper(paper.id);
                                                                    }
                                                                }}
                                                                disabled={isDisabled}
                                                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                                                                    isSelected
                                                                        ? 'bg-indigo-600 text-white hover:bg-red-500'
                                                                        : isDisabled
                                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
                                                                }`}
                                                            >
                                                                {isSelected ? '✓ Added' : '+ Add'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Checkmark overlay */}
                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3">
                                                            <CheckCircleFilled className="text-indigo-600 text-lg" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 pt-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            ← Previous
                                        </button>
                                        <span className="px-3 py-2 text-sm text-gray-500">
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            disabled={currentPage >= totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right: Sticky Summary */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-6 space-y-4">

                                    {/* Progress + Price Card */}
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                        <div className="mb-4">
                                            <h2 className="font-bold text-gray-900">{bundle.name}</h2>
                                            {bundle.description && (
                                                <p className="text-xs text-gray-400 mt-0.5">{bundle.description}</p>
                                            )}
                                        </div>

                                        {/* Slot indicators */}
                                        <div className="flex gap-2 mb-4">
                                            {Array.from({ length: MAX_PAPERS }).map((_, i) => {
                                                const paperId = Array.from(selectedPapers)[i];
                                                const paper = paperId ? papers.find(p => p.id === paperId) : null;
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                                            paper
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-gray-100 text-gray-300 border-2 border-dashed border-gray-200'
                                                        }`}
                                                    >
                                                        {paper ? '✓' : i + 1}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Progress bar (mobile) */}
                                        <div className="sm:hidden mb-4">
                                            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                                <span>{selectedCount} of {MAX_PAPERS} selected</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 bg-indigo-500"
                                                    style={{ width: `${progressPct}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="border-t border-gray-100 pt-3 space-y-1.5">
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Papers</span>
                                                <span>{selectedCount} × ${pricePerPaper.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg pt-1">
                                                <span className="text-gray-900">Total</span>
                                                <span className="text-indigo-600">${totalPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Papers List */}
                                    {selectedCount > 0 && (
                                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                            <h4 className="font-semibold text-gray-700 text-sm mb-3">Selected Papers</h4>
                                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                                {Array.from(selectedPapers).map(id => {
                                                    const paper = papers.find(p => p.id === id);
                                                    return paper ? (
                                                        <div key={id} className="flex items-center justify-between gap-2 text-sm group/item">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_STRIP[paper.type] || 'bg-gray-400'}`} />
                                                                <span className="truncate text-gray-700">{paper.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemovePaper(id)}
                                                                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 text-lg leading-none opacity-0 group-hover/item:opacity-100"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="space-y-2">
                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            icon={<CreditCardOutlined />}
                                            onClick={handlePurchaseClick}
                                            loading={purchasing}
                                            disabled={selectedCount === 0}
                                            className="bg-indigo-600 hover:bg-indigo-700 border-none font-semibold h-12 shadow-md"
                                        >
                                            {selectedCount === 0
                                                ? 'Select papers to continue'
                                                : `Pay $${totalPrice.toFixed(2)}`}
                                        </Button>
                                        <Button
                                            danger
                                            block
                                            icon={<DeleteOutlined />}
                                            onClick={handleDeleteBundle}
                                            className="font-medium"
                                        >
                                            Delete Draft
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Bundle Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <BookOutlined className="text-indigo-600" />
                            <span>Name Your Bundle</span>
                        </div>
                    }
                    open={showCreateModal}
                    onCancel={() => setShowCreateModal(false)}
                    onOk={handleCreateBundle}
                    confirmLoading={creating}
                    okText="Let's Build It"
                    okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700 border-none' }}
                >
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Name *</label>
                            <Input
                                value={bundleName}
                                onChange={e => setBundleName(e.target.value)}
                                placeholder="e.g., A/L Chemistry Revision Pack"
                                maxLength={100}
                                size="large"
                                onPressEnter={handleCreateBundle}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                            <Input.TextArea
                                value={bundleDescription}
                                onChange={e => setBundleDescription(e.target.value)}
                                placeholder="What are you preparing for?"
                                rows={3}
                                maxLength={500}
                            />
                        </div>
                    </div>
                </Modal>

                {/* Payment */}
                {bundle && (
                    <PayHereCheckout
                        visible={showPayment}
                        amount={totalPrice}
                        description={`Custom Bundle: ${bundle.name} (${selectedCount} paper${selectedCount !== 1 ? 's' : ''})`}
                        onSuccess={handlePaymentSuccess}
                        onClose={() => setShowPayment(false)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
