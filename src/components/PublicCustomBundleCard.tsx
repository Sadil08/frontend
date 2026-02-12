import React, { useState } from 'react';
import { Button, Tag, message } from 'antd';
import { ShoppingCartOutlined, InfoCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import { CustomBundleDto, customBundleService } from '@/services/customBundleService';
import { useRouter } from 'next/navigation';
import PayHereCheckout from '@/components/PayHereCheckout';

interface PublicCustomBundleCardProps {
    bundle: CustomBundleDto;
}

export const PublicCustomBundleCard: React.FC<PublicCustomBundleCardProps> = ({ bundle }) => {
    const router = useRouter();
    const [purchasing, setPurchasing] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const handlePaymentSuccess = async (paymentReference: string) => {
        setShowPayment(false);
        setPurchasing(true);
        try {
            await customBundleService.purchaseBundle(bundle.id, paymentReference);
            message.success('Bundle purchased successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to purchase bundle');
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>

                <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                        <Tag color="purple">Community Bundle</Tag>
                        <span className="text-xs text-gray-400">by {bundle.creatorName || 'Student'}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {bundle.name}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {bundle.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <Tag icon={<InfoCircleOutlined />} color="default">{bundle.paperIds.length} Papers</Tag>
                    </div>
                </div>

                <div className="px-6 py-4 bg-purple-50 border-t border-purple-100 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-purple-600 font-bold uppercase block">Price</span>
                        <span className="text-lg font-bold text-gray-900">
                            ${bundle.totalPrice?.toFixed(2)}
                        </span>
                    </div>

                    <Button
                        type="primary"
                        className="bg-purple-600 hover:bg-purple-700 border-purple-600 border-none"
                        icon={<CreditCardOutlined />}
                        loading={purchasing}
                        onClick={() => setShowPayment(true)}
                    >
                        {/* WALLET_DISABLED: Changed from 'Buy Now' to 'Pay with Card' */}
                        Pay with Card
                    </Button>
                </div>
            </div>

            <PayHereCheckout
                visible={showPayment}
                amount={bundle.totalPrice || 0}
                description={`Custom Bundle: ${bundle.name}`}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPayment(false)}
            />
        </>
    );
};
