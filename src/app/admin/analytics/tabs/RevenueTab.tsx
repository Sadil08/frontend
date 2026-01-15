'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, message } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import analyticsService from '@/services/analyticsService';
import { DailyRevenue, BundlePerformance, GeographicalStats } from '@/types/analytics';
import MetricCard from '../components/MetricCard';
import LineChartCard from '../components/LineChartCard';
import BarChartCard from '../components/BarChartCard';
import PieChartCard from '../components/PieChartCard';
import { format } from 'date-fns';

interface RevenueTabProps {
    dateRange: { startDate: string; endDate: string };
}

const RevenueTab: React.FC<RevenueTabProps> = ({ dateRange }) => {
    const [loading, setLoading] = useState(true);
    const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
    const [bundles, setBundles] = useState<BundlePerformance[]>([]);
    const [geoStats, setGeoStats] = useState<GeographicalStats[]>([]);

    useEffect(() => {
        loadData();
    }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {
        try {
            setLoading(true);
            const [revenueData, bundleData, geoData] = await Promise.all([
                analyticsService.getDailyRevenue(dateRange.startDate, dateRange.endDate),
                analyticsService.getBundlePerformance(),
                analyticsService.getGeographicalStats()
            ]);
            setDailyRevenue(revenueData);
            setBundles(bundleData);
            setGeoStats(geoData);
        } catch (error: any) {
            console.error('Failed to load revenue analytics:', error);
            message.error('Failed to load revenue analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate metrics
    const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
    const totalTransactions = dailyRevenue.reduce((sum, day) => sum + day.transactions, 0);
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate growth (compare first half vs second half of period)
    const midpoint = Math.floor(dailyRevenue.length / 2);
    const firstHalfRevenue = dailyRevenue.slice(0, midpoint).reduce((sum, day) => sum + day.revenue, 0);
    const secondHalfRevenue = dailyRevenue.slice(midpoint).reduce((sum, day) => sum + day.revenue, 0);
    const growthRate = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

    // Prepare chart data
    const revenueChartData = dailyRevenue.map(day => ({
        date: format(new Date(day.date), 'MMM dd'),
        revenue: day.revenue,
        transactions: day.transactions
    }));

    // Top bundles by revenue
    const topBundles = [...bundles]
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10)
        .map(b => ({
            name: b.bundleName,
            revenue: b.totalRevenue,
            purchases: b.totalPurchases
        }));

    // Revenue by country (top 10)
    const revenueByCountry = [...geoStats]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(g => ({
            name: g.country,
            value: g.revenue
        }));

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
                        title="Total Revenue"
                        value={totalRevenue}
                        prefix="$"
                        precision={2}
                        icon={<DollarOutlined />}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Total Transactions"
                        value={totalTransactions}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Avg Transaction"
                        value={avgTransactionValue}
                        prefix="$"
                        precision={2}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Growth Rate"
                        value={`${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`}
                        trend={growthRate}
                    />
                </Col>
            </Row>

            {/* Revenue Trend */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24}>
                    <LineChartCard
                        title="Daily Revenue Trend"
                        data={revenueChartData}
                        xKey="date"
                        lines={[
                            { dataKey: 'revenue', name: 'Revenue ($)', color: '#3f8600' }
                        ]}
                        height={300}
                        formatYAxis={(value) => `$${value}`}
                        formatTooltip={(value) => `$${value.toFixed(2)}`}
                    />
                </Col>
            </Row>

            {/* Bundle & Country Revenue */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={14}>
                    <BarChartCard
                        title="Top 10 Bundles by Revenue"
                        data={topBundles}
                        xKey="name"
                        bars={[
                            { dataKey: 'revenue', name: 'Revenue ($)', color: '#3f8600' }
                        ]}
                        height={400}
                        layout="vertical"
                        formatXAxis={(value) => `$${value}`}
                        formatTooltip={(value) => `$${value.toFixed(2)}`}
                    />
                </Col>
                <Col xs={24} lg={10}>
                    <PieChartCard
                        title="Revenue by Country (Top 10)"
                        data={revenueByCountry}
                        height={400}
                        formatTooltip={(value) => `$${value.toFixed(2)}`}
                    />
                </Col>
            </Row>

            {/* Transactions Trend */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <LineChartCard
                        title="Daily Transactions"
                        data={revenueChartData}
                        xKey="date"
                        lines={[
                            { dataKey: 'transactions', name: 'Transactions', color: '#1890ff' }
                        ]}
                        height={250}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default RevenueTab;
