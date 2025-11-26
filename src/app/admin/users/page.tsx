"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { message, Tag } from 'antd';
import { adminService } from '@/services/adminService';
import { AdminUserDto } from '@/types/admin';
import { ListTable } from '@/components/ListTable';
import Header from '@/components/Header';

export default function UserListPage() {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await adminService.getUsers();
                setUsers(data);
            } catch (error) {
                console.error('Failed to load users:', error);
                message.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: 150
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 100,
            render: (role: string) => (
                <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>
            )
        },
        {
            title: 'Bundles Purchased',
            dataIndex: 'totalBundlesPurchased',
            key: 'totalBundlesPurchased',
            width: 130
        },
        {
            title: 'Total Attempts',
            dataIndex: 'totalAttempts',
            key: 'totalAttempts',
            width: 120
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date: string) => new Date(date).toLocaleDateString()
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">View and manage user accounts</p>
                </div>
                <ListTable
                    data={users}
                    columns={columns}
                    loading={loading}
                    onView={(record) => router.push(`/admin/users/${record.id}`)}
                />
            </div>
        </div>
    );
}
