"use client";

import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { Button, InputNumber, Card, Typography, message, Space } from "antd";
import { SettingOutlined, PercentageOutlined, SaveOutlined, StopOutlined } from "@ant-design/icons";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const { Title, Text } = Typography;

/**
 * WALLET_DISABLED: Referral percentage configuration is disabled.
 * 
 * When re-enabling:
 * 1. Remove the "disabled" card and restore the original referral settings form
 * 2. Restore the useEffect to fetch /api/wallet/referral-percentage
 * 3. Restore the save handler to POST /api/wallet/referral-percentage
 */
export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // WALLET_DISABLED: No need to fetch referral percentage
        setLoading(false);
    }, []);

    if (loading) return (
        <div className="max-w-4xl mx-auto p-8">
            <LoadingSkeleton variant="title" className="mb-8" />
            <LoadingSkeleton variant="card" count={2} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-100 p-3 rounded-2xl">
                    <SettingOutlined className="text-2xl text-blue-600" />
                </div>
                <div>
                    <Title level={2} className="m-0 font-bold">Application Settings</Title>
                    <Text className="text-gray-500">Configure global parameters.</Text>
                </div>
            </div>

            {/* WALLET_DISABLED: Referral system settings disabled */}
            <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="flex items-start gap-6 p-2">
                    <div className="bg-gray-100 p-4 rounded-xl">
                        <StopOutlined className="text-2xl text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <Title level={4} className="mb-2 text-gray-500">Referral System</Title>
                        <Text className="text-gray-400 block mb-4">
                            The referral system is currently disabled. Payments are now processed
                            directly via PayHere payment gateway instead of the wallet system.
                        </Text>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 max-w-sm">
                            <Text className="text-gray-500 text-sm">
                                Referral percentage configuration will be available again when the
                                wallet feature is re-enabled.
                            </Text>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <Text className="text-blue-800 flex items-start gap-3">
                    <span className="text-xl">💳</span>
                    <span>
                        <b>Current Payment Method:</b> All payments are now processed directly via
                        PayHere payment gateway. Users pay with their credit/debit card during checkout.
                    </span>
                </Text>
            </div>
        </div>
    );
}
