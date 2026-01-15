"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { message, Tag } from 'antd';
import { adminService } from '@/services/adminService';
import { AdminUserDto } from '@/types/admin';
import { ListTable } from '@/components/ListTable';
import { Input } from 'antd';

const { Search } = Input;

export default function UserListPage() {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async (search?: string) => {
        setLoading(true);
        try {
            const data = await adminService.getUsers(search);
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onSearch = (value: string) => fetchUsers(value);

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
            width: 150,
            render: (text: string) => <span className="font-medium text-gray-900">{text}</span>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            render: (text: string) => <span className="text-gray-600">{text}</span>
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 100,
            render: (role: string) => (
                <Tag color={role === 'ADMIN' ? 'red' : 'blue'} className="rounded-full px-2">
                    {role}
                </Tag>
            )
        },
        {
            title: 'Bundles Purchased',
            dataIndex: 'totalBundlesPurchased',
            key: 'totalBundlesPurchased',
            width: 130,
            render: (val: number) => <span className="font-medium">{val}</span>
        },
        {
            title: 'Total Attempts',
            dataIndex: 'totalAttempts',
            key: 'totalAttempts',
            width: 120,
            render: (val: number) => <span className="font-medium">{val}</span>
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date: string) => <span className="text-gray-500">{new Date(date).toLocaleDateString()}</span>
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="mb-8 animate-slide-up">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-secondary-900">User Management</h1>
                            <p className="text-secondary-600 mt-1 text-lg">View and manage user accounts</p>
                        </div>
                        <div className="w-64">
                            <Search
                                placeholder="Search by name or email"
                                onSearch={onSearch}
                                enterButton
                                allowClear
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <ListTable
                        data={users}
                        columns={columns}
                        loading={loading}
                        onView={(record) => router.push(`/admin/users/${record.id}`)}
                    />
                </div>
            </div>
        </div>
    );
}
