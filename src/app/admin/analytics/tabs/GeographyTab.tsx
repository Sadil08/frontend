'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, message } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import analyticsService from '@/services/analyticsService';
import { GeographicalStats } from '@/types/analytics';
import MetricCard from '../components/MetricCard';
import BarChartCard from '../components/BarChartCard';
import PieChartCard from '../components/PieChartCard';
import DataTable from '../components/DataTable';

const GeographyTab: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [geoStats, setGeoStats] = useState<GeographicalStats[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await analyticsService.getGeographicalStats();
            setGeoStats(data);
        } catch (error: any) {
            console.error('Failed to load geographical analytics:', error);
            message.error('Failed to load geographical analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate metrics
    const totalCountries = geoStats.length;
    const topCountryByUsers = geoStats.length > 0
        ? geoStats.reduce((prev, current) => prev.userCount > current.userCount ? prev : current).country
        : 'N/A';
    const topCountryByRevenue = geoStats.length > 0
        ? geoStats.reduce((prev, current) => prev.revenue > current.revenue ? prev : current).country
        : 'N/A';
    const totalGlobalRevenue = geoStats.reduce((sum, g) => sum + g.revenue, 0);

    // Prepare chart data
    const topCountriesByUsers = [...geoStats]
        .sort((a, b) => b.userCount - a.userCount)
        .slice(0, 10)
        .map(g => ({
            country: g.country,
            users: g.userCount,
            activeUsers: g.activeUsers
        }));

    const topCountriesByRevenue = [...geoStats]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(g => ({
            name: g.country,
            value: g.revenue
        }));

    // Table columns
    const geoColumns = [
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            sorter: (a: GeographicalStats, b: GeographicalStats) => a.country.localeCompare(b.country)
        },
        {
            title: 'Total Users',
            dataIndex: 'userCount',
            key: 'userCount',
            sorter: (a: GeographicalStats, b: GeographicalStats) => a.userCount - b.userCount,
            defaultSortOrder: 'descend' as const
        },
        {
            title: 'Active Users',
            dataIndex: 'activeUsers',
            key: 'activeUsers',
            sorter: (a: GeographicalStats, b: GeographicalStats) => a.activeUsers - b.activeUsers
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            sorter: (a: GeographicalStats, b: GeographicalStats) => a.revenue - b.revenue,
            render: (value: number) => `$${value.toFixed(2)}`
        },
        {
            title: 'Avg Revenue/User',
            key: 'avgRevenue',
            sorter: (a: GeographicalStats, b: GeographicalStats) =>
                (a.revenue / a.userCount) - (b.revenue / b.userCount),
            render: (record: GeographicalStats) =>
                record.userCount > 0 ? `$${(record.revenue / record.userCount).toFixed(2)}` : '$0.00'
        },
        {
            title: 'Total Extractions',
            dataIndex: 'totalExtractions',
            key: 'extractions',
            sorter: (a: GeographicalStats, b: GeographicalStats) => a.totalExtractions - b.totalExtractions
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
                        title="Total Countries"
                        value={totalCountries}
                        icon={<GlobalOutlined />}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Top by Users"
                        value={topCountryByUsers}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Top by Revenue"
                        value={topCountryByRevenue}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Global Revenue"
                        value={totalGlobalRevenue}
                        prefix="$"
                        precision={2}
                    />
                </Col>
            </Row>

            {/* Country Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={14}>
                    <BarChartCard
                        title="Top 10 Countries by Users"
                        data={topCountriesByUsers}
                        xKey="country"
                        bars={[
                            { dataKey: 'users', name: 'Total Users', color: '#1890ff' },
                            { dataKey: 'activeUsers', name: 'Active Users', color: '#52c41a' }
                        ]}
                        height={400}
                        layout="vertical"
                    />
                </Col>
                <Col xs={24} lg={10}>
                    <PieChartCard
                        title="Revenue Distribution (Top 10)"
                        data={topCountriesByRevenue}
                        height={400}
                        formatTooltip={(value) => `$${value.toFixed(2)}`}
                    />
                </Col>
            </Row>

            {/* All Countries Table */}
            <Row>
                <Col xs={24}>
                    <DataTable
                        title="All Countries"
                        data={geoStats}
                        columns={geoColumns}
                        searchable
                        searchPlaceholder="Search country"
                        exportable
                        exportFilename="geographical_stats"
                        pagination={{ pageSize: 25, showSizeChanger: true }}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default GeographyTab;
