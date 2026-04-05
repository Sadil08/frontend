"use client";

import React, { useEffect, useState } from 'react';
import { Card, Statistic, message } from 'antd';
import { DollarCircleOutlined, ArrowUpOutlined } from '@ant-design/icons';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const RevenueCard: React.FC = () => {
    const [revenue, setRevenue] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get(`${API_URL}/api/admin/dashboard/revenue`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && typeof response.data.totalRevenue === 'number') {
                    setRevenue(response.data.totalRevenue);
                }
            } catch (error) {
                console.error("Failed to fetch revenue", error);
                // message.error("Failed to load revenue data"); // Optional: suppress error to avoid noise
            } finally {
                setLoading(false);
            }
        };

        fetchRevenue();
    }, []);

    return (
        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
                title={<span className="text-gray-500 font-medium">Total Revenue</span>}
                value={revenue}
                precision={2}
                valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                prefix={<DollarCircleOutlined />}
                suffix=""
                loading={loading}
            />
            <div className="mt-2 text-xs text-gray-400">
                Lifetime earnings from bundle sales
            </div>
        </Card>
    );
};
