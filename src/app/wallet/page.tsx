"use client";

import React from 'react';
import { Button, Typography, Result } from 'antd';
import { useRouter } from 'next/navigation';
import { StopOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * WALLET_DISABLED: Wallet page is temporarily disabled.
 * 
 * When re-enabling:
 * 1. Restore the original wallet page with balance display, transaction history, top-up modal
 * 2. Import and use: WalletBalanceCard, TransactionHistory, TopUpModal, ReferralSection
 * 3. Restore wallet balance fetching from /api/wallet/balance
 * 4. Restore transaction history fetching from /api/wallet/transactions
 */
const WalletPage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Result
                icon={<StopOutlined className="text-gray-400" />}
                title="Wallet Feature Temporarily Unavailable"
                subTitle="We've switched to direct card payments via PayHere for a smoother experience. You can now pay directly during checkout without needing to top up a wallet."
                extra={[
                    <Button
                        key="bundles"
                        type="primary"
                        size="large"
                        onClick={() => router.push('/bundles')}
                        className="bg-primary-600 hover:bg-primary-700 border-none"
                    >
                        Browse Bundles
                    </Button>,
                    <Button
                        key="dashboard"
                        size="large"
                        onClick={() => router.push('/dashboard')}
                    >
                        Go to Dashboard
                    </Button>,
                ]}
            />
        </div>
    );
};

export default WalletPage;
