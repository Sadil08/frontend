"use client";

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import {
    UserOutlined,
    BookOutlined,
    FileTextOutlined,
    QuestionCircleOutlined,
    RocketOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { SystemStatsDto } from '@/types/admin';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState<SystemStatsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getSystemStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to load stats:', err);
                setError('Failed to load system statistics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: <UserOutlined />,
            link: '/admin/users',
            color: '#1890ff',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Bundles',
            value: stats.totalBundles,
            icon: <BookOutlined />,
            link: '/admin/bundles',
            color: '#52c41a',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Papers',
            value: stats.totalPapers,
            icon: <FileTextOutlined />,
            link: '/admin/papers',
            color: '#722ed1',
            bgColor: 'bg-purple-50'
        },

        {
            title: 'Total Attempts',
            value: stats.totalAttempts,
            icon: <RocketOutlined />,
            link: '#',
            color: '#eb2f96',
            bgColor: 'bg-pink-50'
        },
        {
            title: 'Revenue',
            value: stats.totalRevenue,
            icon: <DollarOutlined />,
            link: '#',
            color: '#13c2c2',
            bgColor: 'bg-cyan-50',
            prefix: '$',
            precision: 2
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">System-wide statistics and quick actions</p>
                </div>

                {/* Statistics Grid */}
                <Row gutter={[16, 16]} className="mb-8">
                    {statCards.map((card, idx) => (
                        <Col xs={24} sm={12} lg={8} key={idx}>
                            <Link href={card.link} className={card.link === '#' ? 'pointer-events-none' : ''}>
                                <Card
                                    className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${card.bgColor} border-none`}
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <Statistic
                                        title={<span className="text-gray-600 font-medium">{card.title}</span>}
                                        value={card.value}
                                        prefix={card.prefix || card.icon}
                                        precision={card.precision}
                                        valueStyle={{ color: card.color, fontWeight: 'bold', fontSize: '28px' }}
                                    />
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>

                {/* Quick Actions */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Content Management" className="shadow-sm">
                            <div className="flex flex-col gap-3">
                                <Link href="/admin/bundles" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
                                    <BookOutlined /> Manage Bundles
                                </Link>
                                <Link href="/admin/papers" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
                                    <FileTextOutlined /> Manage Papers
                                </Link>

                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Configuration" className="shadow-sm">
                            <div className="flex flex-col gap-3">
                                <Link href="/admin/subjects" className="text-blue-600 hover:text-blue-800 hover:underline">
                                    Manage Subjects
                                </Link>
                                <Link href="/admin/lessons" className="text-blue-600 hover:text-blue-800 hover:underline">
                                    Manage Lessons
                                </Link>
                                <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
                                    <UserOutlined /> Manage Users
                                </Link>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
