import React from 'react';
import { Card, Statistic } from 'antd';
import {
    UserOutlined,
    DollarOutlined,
    DatabaseOutlined,
    GlobalOutlined,
    RiseOutlined,
    FallOutlined
} from '@ant-design/icons';

interface MetricCardProps {
    title: string;
    value: number | string;
    prefix?: string;
    suffix?: string;
    icon?: React.ReactNode;
    trend?: number; // Percentage change
    loading?: boolean;
    precision?: number;
    valueStyle?: React.CSSProperties;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    prefix,
    suffix,
    icon,
    trend,
    loading = false,
    precision,
    valueStyle
}) => {
    const getTrendIcon = () => {
        if (trend === undefined || trend === null) return null;
        return trend >= 0 ? (
            <RiseOutlined style={{ color: '#3f8600' }} />
        ) : (
            <FallOutlined style={{ color: '#cf1322' }} />
        );
    };

    const getTrendText = () => {
        if (trend === undefined || trend === null) return null;
        return (
            <span style={{ fontSize: '14px', color: trend >= 0 ? '#3f8600' : '#cf1322' }}>
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
        );
    };

    return (
        <Card bordered={false} loading={loading}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                    <Statistic
                        title={title}
                        value={value}
                        prefix={prefix}
                        suffix={suffix}
                        precision={precision}
                        valueStyle={valueStyle}
                    />
                    {trend !== undefined && trend !== null && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {getTrendIcon()}
                            {getTrendText()}
                        </div>
                    )}
                </div>
                {icon && (
                    <div style={{
                        fontSize: '32px',
                        color: '#1890ff',
                        opacity: 0.8
                    }}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default MetricCard;

// Export common icons for convenience
export const MetricIcons = {
    Users: <UserOutlined />,
    Revenue: <DollarOutlined />,
    Database: <DatabaseOutlined />,
    Global: <GlobalOutlined />
};
