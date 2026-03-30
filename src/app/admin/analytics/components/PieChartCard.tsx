import React from 'react';
import { Card } from 'antd';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartCardProps {
    title: string;
    data: Array<{ name: string; value: number }>;
    loading?: boolean;
    height?: number;
    colors?: string[];
    showPercentage?: boolean;
    formatTooltip?: (value: any) => string;
}

const DEFAULT_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'];

const PieChartCard: React.FC<PieChartCardProps> = ({
    title,
    data,
    loading = false,
    height = 300,
    colors = DEFAULT_COLORS,
    showPercentage = true,
    formatTooltip
}) => {
    const renderLabel = (entry: any) => {
        if (!showPercentage) return entry.name;
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const percent = ((entry.value / total) * 100).toFixed(1);
        return `${entry.name} (${percent}%)`;
    };

    return (
        <Card title={title} bordered={false} loading={loading}>
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height={height}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={formatTooltip}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #d9d9d9' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
                    No data available
                </div>
            )}
        </Card>
    );
};

export default PieChartCard;
