"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Spin, Alert, Button, Table, Tag, Modal, Form, Select, Input, message } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { AdminUserDto, UserBundleAccessDto, UserAttemptInfoDto, AdminBundleDto } from '@/types/admin';


export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = Number(params.id);
    const [user, setUser] = useState<AdminUserDto | null>(null);
    const [bundles, setBundles] = useState<UserBundleAccessDto[]>([]);
    const [attempts, setAttempts] = useState<UserAttemptInfoDto[]>([]);
    const [availableBundles, setAvailableBundles] = useState<AdminBundleDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
    const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);
    const [selectedAttempt, setSelectedAttempt] = useState<UserAttemptInfoDto | null>(null);
    const [grantForm] = Form.useForm();
    const [attemptForm] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [userData, bundlesData, attemptsData, allBundles] = await Promise.all([
                adminService.getUser(userId),
                adminService.getUserBundles(userId),
                adminService.getUserAttempts(userId),
                adminService.getBundles()
            ]);
            setUser(userData);
            setBundles(bundlesData);
            setAttempts(attemptsData);
            setAvailableBundles(allBundles);
        } catch (err) {
            console.error('Failed to load user data:', err);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

    const handleGrantAccess = async (values: any) => {
        try {
            await adminService.grantBundleAccess(userId, {
                userId,
                bundleId: values.bundleId,
                reason: values.reason
            });
            message.success('Bundle access granted successfully');
            setIsGrantModalOpen(false);
            grantForm.resetFields();
            fetchData();
        } catch (error) {
            console.error('Failed to grant access:', error);
            message.error('Failed to grant bundle access');
        }
    };

    const handleRevokeAccess = (access: UserBundleAccessDto) => {
        Modal.confirm({
            title: 'Revoke Bundle Access',
            content: `Are you sure you want to revoke access to "${access.bundleName}"?`,
            okText: 'Revoke',
            okType: 'danger',
            onOk: async () => {
                try {
                    await adminService.revokeBundleAccess(userId, access.bundleId);
                    message.success('Bundle access revoked successfully');
                    fetchData();
                } catch (error) {
                    console.error('Failed to revoke access:', error);
                    message.error('Failed to revoke bundle access');
                }
            }
        });
    };

    const handleUpdateAttemptLimit = async (values: any) => {
        if (!selectedAttempt) return;

        try {
            await adminService.updateAttemptLimit(userId, selectedAttempt.paperId, {
                userId,
                paperId: selectedAttempt.paperId,
                maxFreeAttempts: values.maxFreeAttempts
            });
            message.success('Attempt limit updated successfully');
            setIsAttemptModalOpen(false);
            attemptForm.resetFields();
            setSelectedAttempt(null);
            fetchData();
        } catch (error) {
            console.error('Failed to update attempt limit:', error);
            message.error('Failed to update attempt limit');
        }
    };

    const openAttemptModal = (attempt: UserAttemptInfoDto) => {
        setSelectedAttempt(attempt);
        attemptForm.setFieldsValue({
            maxFreeAttempts: attempt.maxFreeAttempts
        });
        setIsAttemptModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-6 flex justify-center items-center" style={{ minHeight: '60vh' }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-6">
                    <Alert
                        message="Error"
                        description={error || 'User not found'}
                        type="error"
                        showIcon
                    />
                    <Button onClick={() => router.back()} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const bundleColumns = [
        {
            title: 'Bundle Name',
            dataIndex: 'bundleName',
            key: 'bundleName'
        },
        {
            title: 'Purchased At',
            dataIndex: 'purchasedAt',
            key: 'purchasedAt',
            render: (date: string) => new Date(date).toLocaleString()
        },
        {
            title: 'Source',
            key: 'source',
            render: (_: any, record: UserBundleAccessDto) => (
                record.grantedByAdmin ? (
                    <Tag color="orange">Admin Grant</Tag>
                ) : (
                    <Tag color="green">Purchase</Tag>
                )
            )
        },
        {
            title: 'Grant Reason',
            dataIndex: 'grantReason',
            key: 'grantReason',
            render: (reason: string | null) => reason || '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: UserBundleAccessDto) => (
                <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRevokeAccess(record)}
                >
                    Revoke
                </Button>
            )
        }
    ];

    const attemptColumns = [
        {
            title: 'Paper Name',
            dataIndex: 'paperName',
            key: 'paperName'
        },
        {
            title: 'Attempts Made',
            dataIndex: 'attemptsMade',
            key: 'attemptsMade'
        },
        {
            title: 'Max Attempts',
            dataIndex: 'maxFreeAttempts',
            key: 'maxFreeAttempts'
        },
        {
            title: 'Remaining',
            dataIndex: 'remainingAttempts',
            key: 'remainingAttempts',
            render: (remaining: number) => (
                <Tag color={remaining > 0 ? 'green' : 'red'}>{remaining}</Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: UserAttemptInfoDto) => (
                <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openAttemptModal(record)}
                >
                    Update Limit
                </Button>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/admin/users')}
                    className="mb-4"
                >
                    Back to Users
                </Button>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">User Details</h1>

                {/* User Info */}
                <Card title="User Information" className="mb-6">
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
                        <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
                        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                        <Descriptions.Item label="Role">
                            <Tag color={user.role === 'ADMIN' ? 'red' : 'blue'}>{user.role}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Bundles">{user.totalBundlesPurchased}</Descriptions.Item>
                        <Descriptions.Item label="Total Attempts">{user.totalAttempts}</Descriptions.Item>
                        <Descriptions.Item label="Created At" span={2}>
                            {new Date(user.createdAt).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Bundle Access */}
                <Card
                    title="Bundle Access"
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsGrantModalOpen(true)}
                        >
                            Grant Access
                        </Button>
                    }
                    className="mb-6"
                >
                    <Table
                        dataSource={bundles}
                        columns={bundleColumns}
                        rowKey="accessId"
                        pagination={false}
                    />
                </Card>

                {/* Attempt Summary */}
                <Card title="Attempt Summary" className="mb-6">
                    <Table
                        dataSource={attempts}
                        columns={attemptColumns}
                        rowKey="paperId"
                        pagination={false}
                    />
                </Card>

                {/* Grant Access Modal */}
                <Modal
                    title="Grant Bundle Access"
                    open={isGrantModalOpen}
                    onCancel={() => {
                        setIsGrantModalOpen(false);
                        grantForm.resetFields();
                    }}
                    onOk={() => grantForm.submit()}
                >
                    <Form form={grantForm} layout="vertical" onFinish={handleGrantAccess}>
                        <Form.Item
                            name="bundleId"
                            label="Select Bundle"
                            rules={[{ required: true, message: 'Please select a bundle' }]}
                        >
                            <Select placeholder="Select bundle">
                                {availableBundles
                                    .filter(b => !bundles.some(ub => ub.bundleId === b.id))
                                    .map(bundle => (
                                        <Select.Option key={bundle.id} value={bundle.id}>
                                            {bundle.name} (${bundle.price})
                                        </Select.Option>
                                    ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="reason"
                            label="Reason"
                            rules={[{ required: true, message: 'Please provide a reason' }]}
                        >
                            <Input.TextArea rows={3} placeholder="e.g., Scholarship program - top performer" />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Update Attempt Limit Modal */}
                <Modal
                    title="Update Attempt Limit"
                    open={isAttemptModalOpen}
                    onCancel={() => {
                        setIsAttemptModalOpen(false);
                        attemptForm.resetFields();
                        setSelectedAttempt(null);
                    }}
                    onOk={() => attemptForm.submit()}
                >
                    {selectedAttempt && (
                        <>
                            <p className="mb-4">
                                Paper: <strong>{selectedAttempt.paperName}</strong>
                            </p>
                            <p className="mb-4">
                                Current: {selectedAttempt.attemptsMade} / {selectedAttempt.maxFreeAttempts} attempts
                            </p>
                            <Form form={attemptForm} layout="vertical" onFinish={handleUpdateAttemptLimit}>
                                <Form.Item
                                    name="maxFreeAttempts"
                                    label="New Maximum Attempts"
                                    rules={[{ required: true, message: 'Please enter max attempts' }]}
                                >
                                    <Input type="number" min={0} />
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </Modal>
            </div>
        </div>
    );
}
