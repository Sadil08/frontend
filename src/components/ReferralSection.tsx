"use client";

import { useAuth } from "@/context/AuthContext";
import { CopyOutlined, ShareAltOutlined } from "@ant-design/icons";
import { message } from "antd";

export default function ReferralSection() {
    const { user } = useAuth();
    const referralCode = (user as any)?.referralCode || "Generating...";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        message.success("Referral code copied!");
    };

    return (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <ShareAltOutlined className="text-blue-500" />
                    Refer & Earn
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                    Share your code with friends. When they buy a bundle, you get <span className="font-bold text-blue-600">0.5%</span> of their transaction back in your wallet!
                </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Your Referral Code</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-black text-gray-800 tracking-wider">
                        {referralCode}
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-blue-600"
                        title="Copy code"
                    >
                        <CopyOutlined style={{ fontSize: '20px' }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
