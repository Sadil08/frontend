"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { message, Input, Button, Card, Tag, Empty, Spin, Modal, Pagination } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    ShoppingCartOutlined,
    BookOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import ProtectedRoute from '@/components/ProtectedRoute';
import { customBundleService, CustomBundleDto } from '@/services/customBundleService';
import { paperService } from '@/services/paperService';
import { PaperDto } from '@/types';
import PayHereCheckout from '@/components/PayHereCheckout';

const { Search } = Input;

export default function CreateCustomBundlePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [bundle, setBundle] = useState<CustomBundleDto | null>(null);
    const [pricePerPaper, setPricePerPaper] = useState(2);
    const [papers, setPapers] = useState<PaperDto[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPapers, setSelectedPapers] = useState<Set<number>>(new Set());
    const [purchasing, setPurchasing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [bundleName, setBundleName] = useState('');
    const [bundleDescription, setBundleDescription] = useState('');
    const [creating, setCreating] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const MAX_PAPERS = 5;

    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Get price per paper
                const price = await customBundleService.getPricePerPaper();
                setPricePerPaper(price);

                // Check for existing draft
                const draft = await customBundleService.getMyDraft();
                if (draft) {
                    setBundle(draft);
                    setSelectedPapers(new Set(draft.paperIds));
                }

                // Load all available papers
                const allPapers = await paperService.getAllPapers();
                setPapers(allPapers);

            } catch (error) {
                console.error('Error loading data:', error);
                message.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Create new bundle
    const handleCreateBundle = async () => {
        if (!bundleName.trim()) {
            message.error('Please enter a bundle name');
            return;
        }

        try {
            setCreating(true);
            const newBundle = await customBundleService.createBundle({
                name: bundleName,
                description: bundleDescription
            });
            setBundle(newBundle);
            setShowCreateModal(false);
            setBundleName('');
            setBundleDescription('');
            message.success('Bundle created! Now add papers.');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to create bundle');
        } finally {
            setCreating(false);
        }
    };

    // Add paper to bundle
    const handleAddPaper = async (paperId: number) => {
        if (!bundle) return;
        if (selectedPapers.size >= MAX_PAPERS) {
            message.warning(`Maximum ${MAX_PAPERS} papers allowed`);
            return;
        }

        try {
            const updated = await customBundleService.addPaper(bundle.id, paperId);
            setBundle(updated);
            setSelectedPapers(new Set(updated.paperIds));
            message.success('Paper added');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to add paper');
        }
    };

    // Remove paper from bundle
    const handleRemovePaper = async (paperId: number) => {
        if (!bundle) return;

        try {
            const updated = await customBundleService.removePaper(bundle.id, paperId);
            setBundle(updated);
            setSelectedPapers(new Set(updated.paperIds));
            message.success('Paper removed');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to remove paper');
        }
    };

    // Delete bundle
    const handleDeleteBundle = async () => {
        if (!bundle) return;

        Modal.confirm({
            title: 'Delete Bundle?',
            content: 'This will delete your draft bundle and all selected papers.',
            onOk: async () => {
                try {
                    await customBundleService.deleteBundle(bundle.id);
                    setBundle(null);
                    setSelectedPapers(new Set());
                    message.success('Bundle deleted');
                } catch (error) {
                    message.error('Failed to delete bundle');
                }
            }
        });
    };

    // Handle Mock PayHere Payment Success
    const handlePaymentSuccess = async (paymentReference: string) => {
        if (!bundle) return;

        setShowPayment(false);
        setPurchasing(true);

        try {
            await customBundleService.purchaseBundle(bundle.id, paymentReference);
            message.success('Bundle purchased! You can now access the papers.');
            router.push('/dashboard');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to purchase bundle');
        } finally {
            setPurchasing(false);
        }
    };

    // Purchase bundle (opens payment modal)
    const handlePurchaseClick = () => {
        if (!bundle || selectedPapers.size === 0) {
            message.warning('Please add at least one paper');
            return;
        }
        setShowPayment(true);
    };

    // Filter papers by search
    const filteredPapers = papers.filter(paper =>
        paper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPrice = selectedPapers.size * pricePerPaper;

    if (loading) {
        return (
            <ProtectedRoute role="STUDENT">
                <div className="min-h-screen flex items-center justify-center">
                    <Spin size="large" />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute role="STUDENT">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Create Custom Bundle
                        </h1>
                        <p className="text-gray-600">
                            Select up to {MAX_PAPERS} papers to create your own bundle at ${pricePerPaper}/paper
                        </p>
                    </div>

                    {/* No bundle yet - show create button */}
                    {!bundle && (
                        <Card className="text-center py-12">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Start by creating a new bundle"
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setShowCreateModal(true)}
                                    size="large"
                                >
                                    Create New Bundle
                                </Button>
                            </Empty>
                        </Card>
                    )}

                    {/* Bundle exists - show builder */}
                    {bundle && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Paper Selection */}
                            <div className="lg:col-span-2">
                                <Card
                                    title={
                                        <div className="flex items-center gap-2">
                                            <BookOutlined />
                                            <span>Available Papers</span>
                                        </div>
                                    }
                                    extra={
                                        <Search
                                            placeholder="Search papers..."
                                            value={searchQuery}
                                            onChange={e => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            style={{ width: 250 }}
                                        />
                                    }
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto max-h-[600px]">
                                            {filteredPapers
                                                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                                .map(paper => {
                                                    const isSelected = selectedPapers.has(paper.id);
                                                    return (
                                                        <div
                                                            key={paper.id}
                                                            className={`p-4 rounded-lg border-2 transition-all ${isSelected
                                                                ? 'border-primary-500 bg-primary-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                                        {paper.name}
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500 mb-2">
                                                                        {paper.type}
                                                                    </p>
                                                                    <div className="flex gap-2">
                                                                        <Tag color="blue">{paper.type}</Tag>
                                                                        <Tag color="green">${pricePerPaper}</Tag>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type={isSelected ? 'default' : 'primary'}
                                                                    icon={isSelected ? <DeleteOutlined /> : <PlusOutlined />}
                                                                    onClick={() => isSelected
                                                                        ? handleRemovePaper(paper.id)
                                                                        : handleAddPaper(paper.id)
                                                                    }
                                                                    disabled={!isSelected && selectedPapers.size >= MAX_PAPERS}
                                                                >
                                                                    {isSelected ? 'Remove' : 'Add'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>

                                        {/* Pagination Controls */}
                                        {filteredPapers.length > pageSize && (
                                            <div className="mt-6 flex justify-end border-t pt-4">
                                                <Pagination
                                                    current={currentPage}
                                                    total={filteredPapers.length}
                                                    pageSize={pageSize}
                                                    onChange={page => setCurrentPage(page)}
                                                    showSizeChanger={false}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* Bundle Summary */}
                            <div>
                                <Card className="sticky top-6">
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold text-gray-900">{bundle.name}</h2>
                                        {bundle.description && (
                                            <p className="text-gray-500 text-sm mt-1">{bundle.description}</p>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Papers Selected</span>
                                            <span className="font-semibold">{selectedPapers.size} / {MAX_PAPERS}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Price per Paper</span>
                                            <span className="font-semibold">${pricePerPaper.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between">
                                                <span className="text-lg font-bold text-gray-900">Total</span>
                                                <span className="text-2xl font-bold text-primary-600">
                                                    ${totalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Papers List */}
                                    {selectedPapers.size > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-700 mb-2">Selected Papers:</h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {Array.from(selectedPapers).map(id => {
                                                    const paper = papers.find(p => p.id === id);
                                                    return paper ? (
                                                        <div key={id} className="flex justify-between items-center text-sm">
                                                            <span className="truncate flex-1">{paper.name}</span>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => handleRemovePaper(id)}
                                                            />
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            icon={<CreditCardOutlined />}
                                            onClick={handlePurchaseClick}
                                            loading={purchasing}
                                            disabled={selectedPapers.size === 0}
                                            className="bg-primary-600 hover:bg-primary-700 border-none font-semibold"
                                        >
                                            Pay with Card
                                        </Button> {/* WALLET_DISABLED: Switched to Pay with Card */}
                                        <Button
                                            danger
                                            block
                                            icon={<DeleteOutlined />}
                                            onClick={handleDeleteBundle}
                                        >
                                            Delete Draft
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Create Bundle Modal */}
                    <Modal
                        title="Create Custom Bundle"
                        open={showCreateModal}
                        onCancel={() => setShowCreateModal(false)}
                        onOk={handleCreateBundle}
                        confirmLoading={creating}
                        okText="Create"
                    >
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bundle Name *
                                </label>
                                <Input
                                    value={bundleName}
                                    onChange={e => setBundleName(e.target.value)}
                                    placeholder="e.g., My Chemistry Practice Bundle"
                                    maxLength={100}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (optional)
                                </label>
                                <Input.TextArea
                                    value={bundleDescription}
                                    onChange={e => setBundleDescription(e.target.value)}
                                    placeholder="Brief description of your bundle"
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                        </div>
                    </Modal>

                    {/* PayHere Checkout Modal */}
                    {bundle && (
                        <PayHereCheckout
                            visible={showPayment}
                            amount={totalPrice}
                            description={`Custom Bundle: ${bundle.name} (${selectedPapers.size} papers)`}
                            onSuccess={handlePaymentSuccess}
                            onClose={() => setShowPayment(false)}
                        />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
