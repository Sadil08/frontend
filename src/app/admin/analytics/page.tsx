'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tabs, Alert, Space } from 'antd';
import { BarChartOutlined, UserOutlined, GlobalOutlined, DatabaseOutlined, DollarOutlined } from '@ant-design/icons';
import analyticsService from '@/services/analyticsService';
import { AnalyticsOverview } from '@/types/analytics';
import MetricCard, { MetricIcons } from './components/MetricCard';
import DateRangeSelector from './components/DateRangeSelector';
import ExportButton from './components/ExportButton';
import RefreshButton from './components/RefreshButton';
import UserAnalyticsTab from './tabs/UserAnalyticsTab';
import RevenueTab from './tabs/RevenueTab';
import GeographyTab from './tabs/GeographyTab';
import ExtractionsTab from './tabs/ExtractionsTab';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

export default function AnalyticsDashboard() {
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Default date range: Last 30 days
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD')
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await analyticsService.getOverview();
            setOverview(data);
        } catch (err: any) {
            console.error('Failed to load analytics overview:', err);
            setError(err.response?.data?.message || 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (start: string, end: string) => {
        setDateRange({ startDate: start, endDate: end });
        // Refresh data when date range changes
        loadData();
    };

    if (error) {
        return (
            <div style={{ padding: '24px' }}>
                <Alert
                    message="Error Loading Analytics"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    // Determine export type based on active tab
    const getExportType = (): 'overview' | 'users' | 'revenue' | 'geo' | 'extractions' => {
        switch (activeTab) {
            case 'users': return 'users';
            case 'revenue': return 'revenue';
            case 'geography': return 'geo';
            case 'extractions': return 'extractions';
            default: return 'overview';
        }
    };

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>
                        <BarChartOutlined style={{ marginRight: '8px' }} />
                        Analytics Dashboard
                    </h1>
                    <p style={{ color: '#8c8c8c', marginTop: '8px', marginBottom: 0 }}>
                        Comprehensive insights into your platform performance
                    </p>
                </div>
                <Space wrap>
                    <RefreshButton onRefresh={loadData} loading={loading} />
                    <DateRangeSelector onRangeChange={handleDateRangeChange} defaultRange="month" />
                    <ExportButton type={getExportType()} dateRange={dateRange} />
                </Space>
            </div>

            {/* Overview Metrics - Always visible on top */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Total Users"
                        value={overview?.totalUsers || 0}
                        icon={MetricIcons.Users}
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Total Revenue"
                        value={overview?.totalRevenue || 0}
                        prefix="$"
                        precision={2}
                        icon={MetricIcons.Revenue}
                        loading={loading}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Today's Active Users"
                        value={overview?.activeUsersToday || 0}
                        icon={MetricIcons.Database}
                        loading={loading}
                        trend={overview?.activeUsersToday && overview.totalUsers ? (overview.activeUsersToday / overview.totalUsers) * 100 : undefined}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Countries"
                        value={overview?.totalCountries || 0}
                        icon={MetricIcons.Global}
                        loading={loading}
                    />
                </Col>
            </Row>

            {/* Detailed Analytics Tabs */}
            <Card className="analytics-tabs">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="large"
                    type="card"
                >
                    <TabPane
                        tab={
                            <span>
                                <UserOutlined />
                                User Analytics
                            </span>
                        }
                        key="users"
                    >
                        <UserAnalyticsTab dateRange={dateRange} />
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <DollarOutlined />
                                Revenue Trends
                            </span>
                        }
                        key="revenue"
                    >
                        <RevenueTab dateRange={dateRange} />
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <GlobalOutlined />
                                Geography
                            </span>
                        }
                        key="geography"
                    >
                        <GeographyTab />
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <DatabaseOutlined />
                                Extractions
                            </span>
                        }
                        key="extractions"
                    >
                        <ExtractionsTab />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
}
