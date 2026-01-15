'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, message } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import analyticsService from '@/services/analyticsService';
import { ExtractionStats } from '@/types/analytics';
import MetricCard from '../components/MetricCard';
import BarChartCard from '../components/BarChartCard';
import PieChartCard from '../components/PieChartCard';

const ExtractionsTab: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [extractionStats, setExtractionStats] = useState<ExtractionStats | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await analyticsService.getExtractionStats();
            setExtractionStats(data);
        } catch (error: any) {
            console.error('Failed to load extraction analytics:', error);
            message.error('Failed to load extraction analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!extractionStats) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#8c8c8c' }}>
                No extraction data available
            </div>
        );
    }

    // Prepare chart data
    const topUsersByExtractions = Object.entries(extractionStats.extractionsByUser || {})
        .map(([userId, count]) => ({
            user: `User ${userId}`,
            extractions: count
        }))
        .sort((a, b) => b.extractions - a.extractions)
        .slice(0, 20);

    // Limit utilization data
    const usersWithExtractions = extractionStats.uniqueUsersWithExtractions;
    const usersHitLimit = extractionStats.usersHitLimit;
    const usersUnderLimit = usersWithExtractions - usersHitLimit;

    const limitUtilization = [
        { name: 'Under Limit', value: usersUnderLimit > 0 ? usersUnderLimit : 0 },
        { name: 'Hit Limit', value: usersHitLimit }
    ];

    // Cost estimation (assuming $0.002 per extraction as example)
    const costPerExtraction = 0.002;
    const estimatedCost = extractionStats.totalExtractions * costPerExtraction;
    const avgExtractionsPerUser = usersWithExtractions > 0
        ? extractionStats.totalExtractions / usersWithExtractions
        : 0;

    return (
        <div>
            {/* Summary Metrics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Total Extractions"
                        value={extractionStats.totalExtractions}
                        icon={<DatabaseOutlined />}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Extractions Today"
                        value={extractionStats.extractionsToday}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Active Users"
                        value={extractionStats.uniqueUsersWithExtractions}
                        suffix="users"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <MetricCard
                        title="Users Hit Limit"
                        value={extractionStats.usersHitLimit}
                        valueStyle={{ color: '#f5222d' }}
                    />
                </Col>
            </Row>

            {/* Cost Metrics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={8}>
                    <MetricCard
                        title="Estimated Cost"
                        value={estimatedCost}
                        prefix="$"
                        precision={2}
                    />
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <MetricCard
                        title="Avg Extractions/User"
                        value={avgExtractionsPerUser}
                        precision={1}
                    />
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <MetricCard
                        title="Cost per User"
                        value={usersWithExtractions > 0 ? estimatedCost / usersWithExtractions : 0}
                        prefix="$"
                        precision={3}
                    />
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={16}>
                    <BarChartCard
                        title="Top 20 Users by Extractions"
                        data={topUsersByExtractions}
                        xKey="user"
                        bars={[
                            { dataKey: 'extractions', name: 'Extractions', color: '#1890ff' }
                        ]}
                        height={400}
                        layout="vertical"
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <PieChartCard
                        title="Limit Utilization"
                        data={limitUtilization}
                        height={400}
                        colors={['#52c41a', '#f5222d']}
                    />
                </Col>
            </Row>

            {/* Info Card */}
            <Row>
                <Col xs={24}>
                    <div style={{
                        padding: '16px',
                        background: '#f0f2f5',
                        borderRadius: '4px',
                        color: '#8c8c8c'
                    }}>
                        <p style={{ margin: 0 }}>
                            <strong>Note:</strong> Cost estimation is based on ${costPerExtraction} per extraction.
                            Actual costs may vary based on your AI service provider.
                        </p>
                        <p style={{ margin: '8px 0 0 0' }}>
                            Users who hit the extraction limit ({extractionStats.usersHitLimit}) may need
                            higher limits or should be encouraged to purchase more bundles.
                        </p>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ExtractionsTab;
