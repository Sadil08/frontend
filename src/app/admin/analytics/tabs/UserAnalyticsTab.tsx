'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, message, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import analyticsService from '@/services/analyticsService';
import { UserAnalytics, DailyUserActivity } from '@/types/analytics';
import MetricCard from '../components/MetricCard';
import LineChartCard from '../components/LineChartCard';
import DataTable from '../components/DataTable';
import PieChartCard from '../components/PieChartCard';
import { format } from 'date-fns';

interface UserAnalyticsTabProps {
    dateRange: { startDate: string; endDate: string };
}

const UserAnalyticsTab: React.FC<UserAnalyticsTabProps> = ({ dateRange }) => {
    const [loading, setLoading] = useState(true);
    const [usersPage, setUsersPage] = useState<any>(null); // Spring Page<UserAnalytics>
    const [dailyActivity, setDailyActivity] = useState<DailyUserActivity[]>([]);
    const [pagination, setPagination] = useState({ page: 0, size: 20 });
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState<string | undefined>();

    useEffect(() => {
        loadData();
    }, [dateRange, pagination.page, pagination.size, searchTerm, countryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, activityData] = await Promise.all([
                analyticsService.getUserAnalytics({
                    page: pagination.page,
                    size: pagination.size,
                    searchTerm: searchTerm || undefined,
                    country: countryFilter
                }),
                analyticsService.getDailyUserActivity(dateRange.startDate, dateRange.endDate)
            ]);
            setUsersPage(usersData);
            setDailyActivity(activityData);
        } catch (error: any) {
            console.error('Failed to load user analytics:', error);
            message.error('Failed to load user analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate metrics from page data
    const users = usersPage?.content || [];
    const totalUsers = usersPage?.totalElements || 0;
    const activeUsers = users.filter((u: UserAnalytics) => u.lastLoginTime).length;
    const newUsersThisMonth = dailyActivity.reduce((sum, day) => sum + day.newRegistrations, 0);

    // Prepare chart data
    const activityChartData = dailyActivity.map(day => ({
        date: format(new Date(day.date), 'MMM dd'),
        registrations: day.newRegistrations,
        activeUsers: day.activeUsers
    }));

    // Top users by spending (from current page)
    const topUsersBySpending = [...users]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

    // User segmentation by spending (from current page)
    const spendingSegments = [
        { name: 'Free Users ($0)', value: users.filter((u: UserAnalytics) => u.totalSpent === 0).length },
        { name: 'Low ($1-$50)', value: users.filter((u: UserAnalytics) => u.totalSpent > 0 && u.totalSpent <= 50).length },
        { name: 'Medium ($51-$200)', value: users.filter((u: UserAnalytics) => u.totalSpent > 50 && u.totalSpent <= 200).length },
        { name: 'High ($200+)', value: users.filter((u: UserAnalytics) => u.totalSpent > 200).length }
    ];

    // Country distribution (top 10 from current page)
    const countryCount: Record<string, number> = {};
    users.forEach((u: UserAnalytics) => {
        if (u.country) {
            countryCount[u.country] = (countryCount[u.country] || 0) + 1;
        }
    });
    const countriesByUsers = Object.entries(countryCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    // Table columns
    const userColumns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a: UserAnalytics, b: UserAnalytics) => a.username.localeCompare(b.username)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            filters: Array.from(new Set(users.map((u: UserAnalytics) => u.country).filter(Boolean))).map(c => ({ text: c!, value: c! })),
            onFilter: (value: any, record: UserAnalytics) => record.country === value
        },
        {
            title: 'Total Spent',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            sorter: (a: UserAnalytics, b: UserAnalytics) => a.totalSpent - b.totalSpent,
            render: (value: number) => `$${value.toFixed(2)}`
        },
        {
            title: 'Bundles',
            dataIndex: 'totalBundlesPurchased',
            key: 'bundles',
            sorter: (a: UserAnalytics, b: UserAnalytics) => a.totalBundlesPurchased - b.totalBundlesPurchased
        },
        {
            title: 'Extractions',
            dataIndex: 'totalExtractions',
            key: 'extractions',
            sorter: (a: UserAnalytics, b: UserAnalytics) => a.totalExtractions - b.totalExtractions
        },
        {
            title: 'Attempts',
            dataIndex: 'totalPaperAttempts',
            key: 'attempts',
            sorter: (a: UserAnalytics, b: UserAnalytics) => a.totalPaperAttempts - b.totalPaperAttempts
        },
        {
            title: 'Avg Score',
            dataIndex: 'averageScore',
            key: 'avgScore',
            sorter: (a: UserAnalytics, b: UserAnalytics) => (a.averageScore || 0) - (b.averageScore || 0),
            render: (value: number | null) => value ? value.toFixed(1) : 'N/A'
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            {/* Summary Metrics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Total Users"
                        value={totalUsers}
                        icon={<UserOutlined />}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Active Users"
                        value={activeUsers}
                        suffix="users"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="New This Month"
                        value={newUsersThisMonth}
                        suffix="users"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Avg Spending"
                        value={totalUsers > 0 ? (users.reduce((sum: number, u: UserAnalytics) => sum + u.totalSpent, 0) / users.length) : 0}
                        prefix="$"
                        precision={2}
                    />
                </Col>
            </Row>

            {/* Registration Trend */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24}>
                    <LineChartCard
                        title="User Registration & Activity Trend"
                        data={activityChartData}
                        xKey="date"
                        lines={[
                            { dataKey: 'registrations', name: 'New Registrations', color: '#1890ff' },
                            { dataKey: 'activeUsers', name: 'Active Users', color: '#52c41a' }
                        ]}
                        height={300}
                    />
                </Col>
            </Row>

            {/* Segmentation Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={12}>
                    <PieChartCard
                        title="User Segmentation by Spending"
                        data={spendingSegments}
                        height={300}
                        colors={['#8c8c8c', '#1890ff', '#52c41a', '#faad14']}
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <PieChartCard
                        title="Users by Country (Top 10)"
                        data={countriesByUsers}
                        height={300}
                    />
                </Col>
            </Row>

            {/* Users Table with Pagination */}
            <Row>
                <Col xs={24}>
                    <div style={{ marginBottom: 16 }}>
                        <Input.Search
                            placeholder="Search by username or email..."
                            onSearch={(value) => {
                                setSearchTerm(value);
                                setPagination({ ...pagination, page: 0 });
                            }}
                            style={{ width: 300 }}
                            allowClear
                        />
                    </div>
                    <DataTable
                        title="All Users"
                        data={users}
                        columns={userColumns}
                        exportable
                        exportFilename="users"
                        pagination={{
                            current: pagination.page + 1,
                            pageSize: pagination.size,
                            total: totalUsers,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            onChange: (page, pageSize) => {
                                setPagination({
                                    page: page - 1,
                                    size: pageSize || pagination.size
                                });
                            }
                        }}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default UserAnalyticsTab;
