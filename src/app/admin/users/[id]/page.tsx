"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Spin, Tabs, message, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import Header from '@/components/Header';
import { ListTable } from '@/components/ListTable';

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await adminService.getUserDetails(Number(id));
                setUser(data);
            } catch (error) {
                message.error('Failed to load user details');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchUser();
    }, [id]);

    if (loading) return <div className="flex justify-center p-12"><Spin size="large" /></div>;
    if (!user) return <div className="p-12 text-center">User not found</div>;

    const items = [
        {
            key: '1',
            label: 'Accessed Bundles',
            children: <ListTable
                data={user.accessedBundles || []}
                columns={[
                    { title: 'Bundle Name', dataIndex: 'name', key: 'name' },
                    { title: 'Price', dataIndex: 'price', key: 'price', render: (val: number) => `$${val}` },
                ]}
            />,
        },
        {
            key: '2',
            label: 'Attempted Papers',
            children: <ListTable
                data={user.attemptedPapers || []}
                columns={[
                    { title: 'Paper ID', dataIndex: 'paperId', key: 'paperId' },
                    { title: 'Status', dataIndex: 'status', key: 'status' },
                    { title: 'Score', dataIndex: 'score', key: 'score' }, // Assuming score is in attempt dto or needs join
                ]}
            />,
        },
        {
            key: '3',
            label: 'Progress',
            children: <ListTable
                data={user.progress || []}
                columns={[
                    { title: 'Paper ID', dataIndex: 'paperId', key: 'paperId' },
                    { title: 'Completion', dataIndex: 'completionPercentage', key: 'completionPercentage', render: (val: number) => `${val}%` },
                ]}
            />,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    Back
                </Button>

                <Card className="mb-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.username}</h1>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="mt-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{user.role}</span>
                    </div>
                </Card>

                <Card className="shadow-sm">
                    <Tabs defaultActiveKey="1" items={items} />
                </Card>
            </div>
        </div>
    );
}
