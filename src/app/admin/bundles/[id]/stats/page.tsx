"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Statistic, Row, Col, Spin, Alert, Button } from 'antd';
import {
    BookOutlined,
    FileTextOutlined,
    QuestionCircleOutlined,
    UserOutlined,
    RocketOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { BundleStatsDto } from '@/types/admin';
import Header from '@/components/Header';

export default function BundleStatsPage() {
    const params = useParams();
    const router = useRouter();
    const bundleId = Number(params.id);
    const [stats, setStats] = useState<BundleStatsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getBundleStats(bundleId);
                setStats(data);
            } catch (err) {
                console.error('Failed to load bundle stats:', err);
                setError('Failed to load bundle statistics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [bundleId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto p-6 flex justify-center items-center" style={{ minHeight: '60vh' }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto p-6">
                    <Alert
                        message="Error"
                        description={error || 'Failed to load statistics'}
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

    const statCards = [
        {
            title: 'Total Papers',
            value: stats.totalPapers,
            icon: <FileTextOutlined />,
            color: '#1890ff',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Total Questions',
            value: stats.totalQuestions,
            icon: <QuestionCircleOutlined />,
            color: '#52c41a',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Students with Access',
            value: stats.totalStudentsWithAccess,
            icon: <UserOutlined />,
            color: '#722ed1',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Total Attempts',
            value: stats.totalAttempts,
            icon: <RocketOutlined />,
            color: '#fa8c16',
            bgColor: 'bg-orange-50'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push('/admin/bundles')}
                        className="mb-4"
                    >
                        Back to Bundles
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">{stats.bundleName}</h1>
                    <p className="text-gray-600 mt-2">Bundle Statistics</p>
                </div>

                <Row gutter={[16, 16]}>
                    {statCards.map((card, idx) => (
                        <Col xs={24} sm={12} lg={6} key={idx}>
                            <Card
                                className={`${card.bgColor} border-none`}
                                bodyStyle={{ padding: '24px' }}
                            >
                                <Statistic
                                    title={<span className="text-gray-600 font-medium">{card.title}</span>}
                                    value={card.value}
                                    prefix={card.icon}
                                    valueStyle={{ color: card.color, fontWeight: 'bold', fontSize: '28px' }}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Additional Info */}
                <Card className="mt-6" title="Summary">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Bundle ID:</span>
                            <span className="font-semibold">{stats.bundleId}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Average Questions per Paper:</span>
                            <span className="font-semibold">
                                {stats.totalPapers > 0
                                    ? (stats.totalQuestions / stats.totalPapers).toFixed(1)
                                    : '0'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Average Attempts per Student:</span>
                            <span className="font-semibold">
                                {stats.totalStudentsWithAccess > 0
                                    ? (stats.totalAttempts / stats.totalStudentsWithAccess).toFixed(1)
                                    : '0'}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
