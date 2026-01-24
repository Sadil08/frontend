import React, { useState } from 'react';
import { Button, Modal, Tag, message } from 'antd';
import { ShoppingCartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { CustomBundleDto, customBundleService } from '@/services/customBundleService';
import { useRouter } from 'next/navigation';

interface PublicCustomBundleCardProps {
    bundle: CustomBundleDto;
}

export const PublicCustomBundleCard: React.FC<PublicCustomBundleCardProps> = ({ bundle }) => {
    const router = useRouter();
    const [purchasing, setPurchasing] = useState(false);

    const handlePurchase = async () => {
        Modal.confirm({
            title: 'Purchase Custom Bundle?',
            content: (
                <div>
                    <p>Are you sure you want to purchase <strong>{bundle.name}</strong>?</p>
                    <p>Price: <strong>${bundle.totalPrice?.toFixed(2)}</strong></p>
                    <p className="text-gray-500 text-sm mt-2">This amount will be deducted from your wallet immediately.</p>
                </div>
            ),
            okText: 'Buy Now',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    setPurchasing(true);
                    await customBundleService.purchaseBundle(bundle.id);
                    message.success('Bundle purchased successfully!');
                    router.push('/dashboard');
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Failed to purchase bundle');
                } finally {
                    setPurchasing(false);
                }
            }
        });
    };

    return (
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
                    className="bg-purple-600 hover:bg-purple-700 border-purple-600"
                    icon={<ShoppingCartOutlined />}
                    loading={purchasing}
                    onClick={handlePurchase}
                >
                    Buy Now
                </Button>
            </div>
        </div>
    );
};
