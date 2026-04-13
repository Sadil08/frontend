"use client";

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import {
    UserOutlined,
    BookOutlined,
    FileTextOutlined,
    QuestionCircleOutlined,
    RocketOutlined,
    DollarOutlined,
    CloudUploadOutlined
} from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { SystemStatsDto } from '@/types/admin';

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
            <div className="min-h-screen bg-gray-50 flex flex-col">

                <div className="flex-grow flex justify-center items-center">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">

                <div className="max-w-7xl mx-auto p-6 w-full">
                    <Alert
                        message="Error"
                        description={error || 'Failed to load statistics'}
                        type="error"
                        showIcon
                        className="rounded-xl"
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
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100'
        },
        {
            title: 'Bundles',
            value: stats.totalBundles,
            icon: <BookOutlined />,
            link: '/admin/bundles',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-100'
        },
        {
            title: 'Papers',
            value: stats.totalPapers,
            icon: <FileTextOutlined />,
            link: '/admin/papers',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-100'
        },
        {
            title: 'Total Attempts',
            value: stats.totalAttempts,
            icon: <RocketOutlined />,
            link: '#',
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-100'
        },
        {
            title: 'Revenue',
            value: stats.totalRevenue,
            icon: <DollarOutlined />,
            link: '#',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50',
            borderColor: 'border-cyan-100',
            prefix: '$',
            precision: 2
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="mb-10 animate-slide-up">
                    <h1 className="text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
                    <p className="text-secondary-600 mt-2 text-lg">System-wide statistics and management overview</p>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {statCards.map((card, idx) => (
                        <Link href={card.link} key={idx} className={`block ${card.link === '#' ? 'pointer-events-none' : ''}`}>
                            <div className={`bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-300 h-full group ${card.borderColor}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${card.bgColor} ${card.color}`}>
                                        {card.icon}
                                    </div>
                                    {card.link !== '#' && (
                                        <div className="text-gray-400 group-hover:text-primary-600 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-secondary-500 font-medium text-sm uppercase tracking-wide mb-1">{card.title}</h3>
                                <div className="text-3xl font-bold text-secondary-900">
                                    {card.prefix}{typeof card.value === 'number' && card.precision ? card.value.toFixed(card.precision) : card.value}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-lg text-secondary-900">Content Management</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <Link href="/admin/bundles" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <BookOutlined />
                                </div>
                                <div>
                                    <div className="font-semibold text-secondary-900">Manage Bundles</div>
                                    <div className="text-sm text-secondary-500">Create and edit paper bundles</div>
                                </div>
                                <div className="ml-auto text-gray-400 group-hover:text-blue-600">→</div>
                            </Link>
                            <Link href="/admin/papers" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <FileTextOutlined />
                                </div>
                                <div>
                                    <div className="font-semibold text-secondary-900">Manage Papers</div>
                                    <div className="text-sm text-secondary-500">Add questions and manage papers</div>
                                </div>
                                <div className="ml-auto text-gray-400 group-hover:text-purple-600">→</div>
                            </Link>
                            <Link href="/admin/batch-import" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-dashed border-indigo-200 bg-indigo-50/40">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <CloudUploadOutlined />
                                </div>
                                <div>
                                    <div className="font-semibold text-secondary-900 flex items-center gap-2">
                                        Batch Import Papers
                                        <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold">AI</span>
                                    </div>
                                    <div className="text-sm text-secondary-500">Upload PDF pairs — fully automated</div>
                                </div>
                                <div className="ml-auto text-gray-400 group-hover:text-indigo-600">→</div>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-lg text-secondary-900">System Configuration</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <Link href="/admin/users" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <UserOutlined />
                                </div>
                                <div>
                                    <div className="font-semibold text-secondary-900">Manage Users</div>
                                    <div className="text-sm text-secondary-500">View and manage registered users</div>
                                </div>
                                <div className="ml-auto text-gray-400 group-hover:text-indigo-600">→</div>
                            </Link>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <Link href="/admin/subjects" className="px-4 py-2 bg-gray-100 text-secondary-700 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors">
                                    Subjects
                                </Link>
                                <Link href="/admin/lessons" className="px-4 py-2 bg-gray-100 text-secondary-700 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors">
                                    Lessons
                                </Link>
                                <Link href="/admin/exam-types" className="col-span-2 px-4 py-2 bg-gray-100 text-secondary-700 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors">
                                    Exam Types
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
