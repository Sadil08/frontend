"use client";

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, bundles: 0, papers: 0 });

    useEffect(() => {
        // In a real app, we'd have a stats endpoint. 
        // For now, fetching lists to count.
        const fetchStats = async () => {
            try {
                const [users] = await Promise.all([
                    adminService.getUsers(),
                ]);
                setStats({
                    users: users.length,
                    bundles: 0, // Placeholder
                    papers: 0 // Placeholder
                });
            } catch (error) {
                console.error('Failed to load stats');
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Users', value: stats.users, icon: <UserOutlined />, link: '/admin/users', color: 'bg-blue-50' },
        { title: 'Bundles', value: stats.bundles, icon: <BookOutlined />, link: '/admin/bundles', color: 'bg-green-50' },
        { title: 'Papers', value: stats.papers, icon: <FileTextOutlined />, link: '/admin/papers', color: 'bg-purple-50' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                <Row gutter={[16, 16]}>
                    {cards.map((card, idx) => (
                        <Col xs={24} sm={8} key={idx}>
                            <Link href={card.link}>
                                <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${card.color}`}>
                                    <Statistic
                                        title={card.title}
                                        value={card.value}
                                        prefix={card.icon}
                                        valueStyle={{ fontWeight: 'bold' }}
                                    />
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Quick Actions" className="shadow-sm">
                        <div className="flex flex-col gap-2">
                            <Link href="/admin/subjects" className="text-blue-600 hover:underline">Manage Subjects</Link>
                            <Link href="/admin/lessons" className="text-blue-600 hover:underline">Manage Lessons</Link>
                            <Link href="/admin/questions" className="text-blue-600 hover:underline">Manage Questions</Link>
                        </div>
                    </Card>
                    {/* Add more widgets like recent activity here */}
                </div>
            </div>
        </div>
    );
}
