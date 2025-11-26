"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { adminService } from '@/services/adminService';
import { ListTable } from '@/components/ListTable';
import Header from '@/components/Header';

export default function UserListPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await adminService.getUsers();
                setUsers(data);
            } catch (error) {
                message.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Role', dataIndex: 'role', key: 'role' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
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
