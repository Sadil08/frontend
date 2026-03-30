import React from 'react';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartCardProps {
    title: string;
    data: any[];
    xKey: string;
    bars: Array<{
        dataKey: string;
        name: string;
        color: string;
    }>;
    loading?: boolean;
    height?: number;
    layout?: 'horizontal' | 'vertical';
    formatXAxis?: (value: any) => string;
    formatYAxis?: (value: any) => string;
    formatTooltip?: (value: any) => string;
}

const BarChartCard: React.FC<BarChartCardProps> = ({
    title,
    data,
    xKey,
    bars,
    loading = false,
    height = 300,
    layout = 'horizontal',
    formatXAxis,
    formatYAxis,
    formatTooltip
}) => {
    return (
        <Card title={title} bordered={false} loading={loading}>
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={data}
                        layout={layout}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        {layout === 'horizontal' ? (
                            <>
                                <XAxis dataKey={xKey} tickFormatter={formatXAxis} />
                                <YAxis tickFormatter={formatYAxis} />
                            </>
                        ) : (
                            <>
                                <XAxis type="number" tickFormatter={formatXAxis} />
                                <YAxis type="category" dataKey={xKey} tickFormatter={formatYAxis} width={100} />
                            </>
                        )}
                        <Tooltip
                            formatter={formatTooltip}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #d9d9d9' }}
                        />
                        <Legend />
                        {bars.map((bar) => (
                            <Bar
                                key={bar.dataKey}
                                dataKey={bar.dataKey}
                                name={bar.name}
                                fill={bar.color}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
                    No data available
                </div>
            )}
        </Card>
    );
};

export default BarChartCard;
