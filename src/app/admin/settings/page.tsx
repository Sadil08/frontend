"use client";

import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { Button, InputNumber, Card, Typography, message, Space } from "antd";
import { SettingOutlined, PercentageOutlined, SaveOutlined } from "@ant-design/icons";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const { Title, Text } = Typography;

export default function AdminSettingsPage() {
    const [percentage, setPercentage] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPercentage = async () => {
            try {
                const res = await apiClient.get("/api/wallet/referral-percentage");
                setPercentage(res.data);
            } catch (err) {
                console.error("Failed to fetch referral percentage", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPercentage();
    }, []);

    const handleSave = async () => {
        if (percentage === null || percentage < 0) {
            message.error("Please enter a valid percentage");
            return;
        }

        setSaving(true);
        try {
            await apiClient.post("/api/wallet/referral-percentage", { percentage });
            message.success("Referral percentage updated successfully!");
        } catch (err) {
            console.error("Failed to update percentage", err);
            message.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

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
                    <Text className="text-gray-500">Configure global parameters and referral rules.</Text>
                </div>
            </div>

            <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="flex items-start gap-6 p-2">
                    <div className="bg-purple-50 p-4 rounded-xl">
                        <PercentageOutlined className="text-2xl text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <Title level={4} className="mb-2">Referral System</Title>
                        <Text className="text-gray-500 block mb-6">
                            Set the percentage of each transaction that will be credited to the referrer's wallet.
                            A higher percentage encourages more referrals but reduces the platform's cut.
                        </Text>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 max-w-sm">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Referral Reward Percentage (%)</label>
                            <Space direction="vertical" className="w-full">
                                <InputNumber
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    value={percentage}
                                    onChange={(val) => setPercentage(val)}
                                    className="w-full h-12 flex items-center text-lg font-bold"
                                    formatter={value => `${value}%`}
                                    parser={value => Number(value!.replace('%', ''))}
                                />
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSave}
                                    loading={saving}
                                    className="h-11 px-8 bg-blue-600 hover:bg-blue-700 border-none rounded-lg font-semibold mt-4"
                                >
                                    Save Changes
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <Text className="text-amber-800 flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <span>
                        <b>Tip:</b> Industry standard referral rates usually range from 0.5% to 2.0%.
                        Changes made here will apply immediately to all new transactions across the platform.
                    </span>
                </Text>
            </div>
        </div>
    );
}
