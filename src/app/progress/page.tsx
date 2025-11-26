"use client";

import { useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
import { progressService } from '@/services/progressService';
import Header from '@/components/Header';

export default function ProgressPage() {
    const [progress, setProgress] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const data = await progressService.getProgress();
                setProgress(data);
            } catch (error) {
                message.error('Failed to load progress');
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const columns = [
        {
            title: 'Paper',
            dataIndex: 'paperId', // Ideally join with paper name
            key: 'paperId',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span className={`px-2 py-1 rounded text-sm ${status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {status}
                </span>
            ),
        },
        {
            title: 'Completion',
            dataIndex: 'completionPercentage',
            key: 'completionPercentage',
            render: (val: number) => `${val}%`,
        },
        {
            title: 'Time Spent (min)',
            dataIndex: 'timeSpentMinutes',
            key: 'timeSpentMinutes',
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (val: string) => new Date(val).toLocaleDateString(),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Progress</h1>
                <div className="card">
                    <Table
                        dataSource={progress}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
