import React from 'react';
import { Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartCardProps {
    title: string;
    data: any[];
    xKey: string;
    lines: Array<{
        dataKey: string;
        name: string;
        color: string;
    }>;
    loading?: boolean;
    height?: number;
    formatXAxis?: (value: any) => string;
    formatYAxis?: (value: any) => string;
    formatTooltip?: (value: any) => string;
}

const LineChartCard: React.FC<LineChartCardProps> = ({
    title,
    data,
    xKey,
    lines,
    loading = false,
    height = 300,
    formatXAxis,
    formatYAxis,
    formatTooltip
}) => {
    return (
        <Card title={title} bordered={false} loading={loading}>
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey={xKey}
                            tickFormatter={formatXAxis}
                        />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip
                            formatter={formatTooltip}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #d9d9d9' }}
                        />
                        <Legend />
                        {lines.map((line) => (
                            <Line
                                key={line.dataKey}
                                type="monotone"
                                dataKey={line.dataKey}
                                name={line.name}
                                stroke={line.color}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
                    No data available
                </div>
            )}
        </Card>
    );
};

export default LineChartCard;
