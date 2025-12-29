'use client';

import { useState, useEffect } from 'react';
import { Card, Tabs, Table, Modal, Button, Tag, Rate, Select, Input, message, Statistic, Row, Col } from 'antd';
import { ReviewDto } from '@/services/reviewService';
import { ImprovementDto } from '@/services/improvementService';
import { adminFeedbackService, ReviewStatus, ImprovementStatus } from '@/services/adminFeedbackService';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

export default function AdminFeedbackPage() {
    const [loading, setLoading] = useState(false);

    // Reviews
    const [reviews, setReviews] = useState<ReviewDto[]>([]);
    const [selectedReview, setSelectedReview] = useState<ReviewDto | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Improvements
    const [improvements, setImprovements] = useState<ImprovementDto[]>([]);
    const [selectedImprovement, setSelectedImprovement] = useState<ImprovementDto | null>(null);
    const [showImprovementModal, setShowImprovementModal] = useState(false);
    const [improvementStatus, setImprovementStatus] = useState<ImprovementStatus>('PENDING');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        loadReviews();
        loadImprovements();
    }, []);

    const loadReviews = async () => {
        try {
            const data = await adminFeedbackService.getAllReviews();
            setReviews(data);
        } catch (error) {
            message.error('Failed to load reviews');
        }
    };

    const loadImprovements = async () => {
        try {
            const data = await adminFeedbackService.getAllImprovements();
            setImprovements(data);
        } catch (error) {
            message.error('Failed to load improvements');
        }
    };

    const handleApproveReview = async (id: number) => {
        setLoading(true);
        try {
            await adminFeedbackService.approveReview(id);
            message.success('Review approved');
            loadReviews();
            setShowReviewModal(false);
        } catch (error) {
            message.error('Failed to approve review');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectReview = async (id: number) => {
        setLoading(true);
        try {
            await adminFeedbackService.rejectReview(id);
            message.success('Review rejected');
            loadReviews();
            setShowReviewModal(false);
        } catch (error) {
            message.error('Failed to reject review');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateImprovement = async () => {
        if (!selectedImprovement) return;

        setLoading(true);
        try {
            await adminFeedbackService.updateImprovementStatus(
                selectedImprovement.id,
                improvementStatus,
                adminNotes
            );
            message.success('Improvement updated');
            loadImprovements();
            setShowImprovementModal(false);
        } catch (error) {
            message.error('Failed to update improvement');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            APPROVED: 'green',
            IMPLEMENTED: 'green',
            PENDING: 'gold',
            UNDER_REVIEW: 'blue',
            REJECTED: 'red',
        };
        return colors[status] || 'default';
    };

    const reviewColumns: ColumnsType<ReviewDto> = [
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => <Rate disabled value={rating} style={{ fontSize: 16 }} />,
        },
        {
            title: 'Preview',
            dataIndex: 'reviewText',
            key: 'preview',
            render: (text) => text.substring(0, 50) + '...',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        setSelectedReview(record);
                        setShowReviewModal(true);
                    }}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const improvementColumns: ColumnsType<ImprovementDto> = [
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Preview',
            dataIndex: 'improvementText',
            key: 'preview',
            render: (text) => text.substring(0, 50) + '...',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        setSelectedImprovement(record);
                        setImprovementStatus(record.status);
                        setAdminNotes(record.adminNotes || '');
                        setShowImprovementModal(true);
                    }}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const pendingReviews = reviews.filter(r => r.status === 'PENDING').length;
    const pendingImprovements = improvements.filter(i => i.status === 'PENDING').length;
    const approvedReviews = reviews.filter(r => r.status === 'APPROVED').length;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-secondary-900 mb-8">Reviews & Improvements Management</h1>

                {/* Stats */}
                <Row gutter={16} className="mb-8">
                    <Col span={6}>
                        <Card>
                            <Statistic title="Pending Reviews" value={pendingReviews} valueStyle={{ color: '#faad14' }} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Approved Reviews" value={approvedReviews} valueStyle={{ color: '#52c41a' }} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Pending Improvements" value={pendingImprovements} valueStyle={{ color: '#faad14' }} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Total Improvements" value={improvements.length} />
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <Tabs defaultActiveKey="reviews">
                        <Tabs.TabPane tab="Reviews" key="reviews">
                            <Table
                                columns={reviewColumns}
                                dataSource={reviews}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                            />
                        </Tabs.TabPane>

                        <Tabs.TabPane tab="Improvements" key="improvements">
                            <Table
                                columns={improvementColumns}
                                dataSource={improvements}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                            />
                        </Tabs.TabPane>
                    </Tabs>
                </Card>

                {/* Review Detail Modal */}
                <Modal
                    title="Review Details"
                    open={showReviewModal}
                    onCancel={() => setShowReviewModal(false)}
                    footer={
                        selectedReview?.status === 'PENDING' ? [
                            <Button key="reject" danger onClick={() => handleRejectReview(selectedReview.id)} loading={loading}>
                                Reject
                            </Button>,
                            <Button key="approve" type="primary" onClick={() => handleApproveReview(selectedReview.id)} loading={loading}>
                                Approve
                            </Button>,
                        ] : null
                    }
                    width={600}
                >
                    {selectedReview && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">User</p>
                                <p className="font-medium">{selectedReview.userName} ({selectedReview.userEmail})</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Rating</p>
                                <Rate disabled value={selectedReview.rating} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Review</p>
                                <p className="mt-1">{selectedReview.reviewText}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <Tag color={getStatusColor(selectedReview.status)}>{selectedReview.status}</Tag>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Submitted</p>
                                <p>{new Date(selectedReview.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Improvement Detail Modal */}
                <Modal
                    title="Improvement Details"
                    open={showImprovementModal}
                    onCancel={() => setShowImprovementModal(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setShowImprovementModal(false)}>
                            Cancel
                        </Button>,
                        <Button key="save" type="primary" onClick={handleUpdateImprovement} loading={loading}>
                            Save
                        </Button>,
                    ]}
                    width={700}
                >
                    {selectedImprovement && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">User</p>
                                <p className="font-medium">{selectedImprovement.userName} ({selectedImprovement.userEmail})</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Improvement Suggestion</p>
                                <p className="mt-1">{selectedImprovement.improvementText}</p>
                            </div>
                            {selectedImprovement.issueDescription && (
                                <div>
                                    <p className="text-sm text-gray-500">Issues Described</p>
                                    <p className="mt-1">{selectedImprovement.issueDescription}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Status</p>
                                <Select
                                    value={improvementStatus}
                                    onChange={setImprovementStatus}
                                    className="w-full"
                                >
                                    <Select.Option value="PENDING">Pending</Select.Option>
                                    <Select.Option value="UNDER_REVIEW">Under Review</Select.Option>
                                    <Select.Option value="IMPLEMENTED">Implemented</Select.Option>
                                    <Select.Option value="REJECTED">Rejected</Select.Option>
                                </Select>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Admin Notes</p>
                                <TextArea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Add notes about this improvement..."
                                    maxLength={500}
                                />
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}
