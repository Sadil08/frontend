"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, Tabs, message, InputNumber, Modal, Spin, Empty } from 'antd';
import { CheckOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons';
import ProtectedRoute from '@/components/ProtectedRoute';
import { customBundleService, CustomBundleDto } from '@/services/customBundleService';

export default function AdminCustomBundlesPage() {
    const [loading, setLoading] = useState(true);
    const [pendingBundles, setPendingBundles] = useState<CustomBundleDto[]>([]);
    const [approvedBundles, setApprovedBundles] = useState<CustomBundleDto[]>([]);
    const [pricePerPaper, setPricePerPaper] = useState(2);
    const [newPrice, setNewPrice] = useState(2);
    const [approving, setApproving] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pending, approved, price] = await Promise.all([
                customBundleService.admin.getPending(),
                customBundleService.admin.getApproved(),
                customBundleService.getPricePerPaper()
            ]);
            setPendingBundles(pending);
            setApprovedBundles(approved);
            setPricePerPaper(price);
            setNewPrice(price);
        } catch (error) {
            message.error('Failed to load custom bundles');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (bundleId: number) => {
        try {
            setApproving(bundleId);
            await customBundleService.admin.approveBundle(bundleId);
            message.success('Bundle approved for public display');
            fetchData();
        } catch (error) {
            message.error('Failed to approve bundle');
        } finally {
            setApproving(null);
        }
    };

    const handleUpdatePrice = async () => {
        try {
            await customBundleService.admin.updatePrice(newPrice);
            setPricePerPaper(newPrice);
            message.success('Price updated successfully');
        } catch (error) {
            message.error('Failed to update price');
        }
    };

    const columns = [
        {
            title: 'Bundle Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: CustomBundleDto) => (
                <div>
                    <div className="font-semibold">{name}</div>
                    {record.description && (
                        <div className="text-sm text-gray-500">{record.description}</div>
                    )}
                </div>
            )
        },
        {
            title: 'Creator',
            dataIndex: 'creatorName',
            key: 'creatorName',
        },
        {
            title: 'Papers',
            dataIndex: 'paperIds',
            key: 'papers',
            render: (paperIds: number[]) => (
                <Tag color="blue">{paperIds.length} papers</Tag>
            )
        },
        {
            title: 'Price',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price: number) => (
                <span className="font-semibold">${price?.toFixed(2) || '0.00'}</span>
            )
        },
        {
            title: 'Purchased',
            dataIndex: 'purchasedAt',
            key: 'purchasedAt',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    CREATED: 'default',
                    PURCHASED: 'orange',
                    APPROVED: 'green'
                };
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: CustomBundleDto) => (
                record.status === 'PURCHASED' ? (
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleApprove(record.id)}
                        loading={approving === record.id}
                    >
                        Approve
                    </Button>
                ) : (
                    <Tag color="green">Approved</Tag>
                )
            )
        }
    ];

    if (loading) {
        return (
            <ProtectedRoute role="ADMIN">
                <div className="min-h-screen flex items-center justify-center">
                    <Spin size="large" />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute role="ADMIN">
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Custom Bundles Management</h1>
                        <p className="text-gray-600">Approve user-created bundles for public visibility</p>
                    </div>

                    {/* Price Configuration */}
                    <Card className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    <DollarOutlined className="mr-2" />
                                    Price Per Paper
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Current: ${pricePerPaper.toFixed(2)} per paper
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <InputNumber
                                    value={newPrice}
                                    onChange={(value) => setNewPrice(value || 0)}
                                    min={0}
                                    precision={2}
                                    prefix="$"
                                    style={{ width: 120 }}
                                />
                                <Button
                                    type="primary"
                                    onClick={handleUpdatePrice}
                                    disabled={newPrice === pricePerPaper}
                                >
                                    Update Price
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Tabs for Pending/Approved */}
                    <Card>
                        <Tabs
                            defaultActiveKey="pending"
                            items={[
                                {
                                    key: 'pending',
                                    label: (
                                        <span>
                                            Pending Approval
                                            {pendingBundles.length > 0 && (
                                                <Tag color="orange" className="ml-2">{pendingBundles.length}</Tag>
                                            )}
                                        </span>
                                    ),
                                    children: pendingBundles.length > 0 ? (
                                        <Table
                                            dataSource={pendingBundles}
                                            columns={columns}
                                            rowKey="id"
                                            pagination={false}
                                        />
                                    ) : (
                                        <Empty description="No bundles pending approval" />
                                    )
                                },
                                {
                                    key: 'approved',
                                    label: (
                                        <span>
                                            Approved Bundles
                                            <Tag color="green" className="ml-2">{approvedBundles.length}</Tag>
                                        </span>
                                    ),
                                    children: approvedBundles.length > 0 ? (
                                        <Table
                                            dataSource={approvedBundles}
                                            columns={columns}
                                            rowKey="id"
                                            pagination={{ pageSize: 10 }}
                                        />
                                    ) : (
                                        <Empty description="No approved bundles yet" />
                                    )
                                }
                            ]}
                        />
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
