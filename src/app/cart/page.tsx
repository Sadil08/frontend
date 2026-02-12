"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button, List, Typography, Empty, message, Divider } from 'antd';
import { DeleteOutlined, ShoppingOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import apiClient from '@/utils/apiClient';
import PayHereCheckout from '@/components/PayHereCheckout';

const { Title, Text } = Typography;

const CartPage: React.FC = () => {
    const { items, removeFromCart, total, clearCart } = useCart();
    const [processing, setProcessing] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const router = useRouter();

    // WALLET_DISABLED: Wallet balance fetching removed.
    // When re-enabling wallet, restore the useEffect here to fetch wallet balance.

    const handlePaymentSuccess = async (paymentReference: string) => {
        setShowPayment(false);
        setProcessing(true);
        try {
            await apiClient.post('/api/purchase/checkout', { paymentReference });

            message.success("Purchase successful! You can now access your bundles.");
            clearCart();
            router.push('/dashboard');
        } catch (error) {
            console.error("Checkout failed", error);
            message.error("Checkout failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div className="flex flex-col gap-2">
                                <Text className="text-lg font-medium text-gray-600">Your cart is empty</Text>
                                <Text className="text-gray-400">Looks like you haven't added any bundles yet.</Text>
                            </div>
                        }
                    >
                        <Button
                            type="primary"
                            size="large"
                            icon={<ShoppingOutlined />}
                            onClick={() => router.push('/bundles')}
                            className="mt-4 bg-primary-600 hover:bg-primary-700 border-none h-12 px-8 text-lg"
                        >
                            Browse Bundles
                        </Button>
                    </Empty>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Title level={2} className="mb-8 font-bold text-gray-800">Shopping Cart</Title>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <List
                            itemLayout="horizontal"
                            dataSource={items}
                            className="p-0"
                            renderItem={(item) => (
                                <List.Item
                                    className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                    actions={[
                                        <Button
                                            key="delete"
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeFromCart(item.id)}
                                            className="hover:bg-red-50 rounded-full h-10 w-10 flex items-center justify-center"
                                        />
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={<Text className="text-lg font-semibold text-gray-800">{item.name}</Text>}
                                        description={
                                            <div className="mt-1">
                                                <Text className="text-gray-500 line-clamp-2">{item.description}</Text>
                                            </div>
                                        }
                                    />
                                    <div className="ml-8 text-right">
                                        <Text className="text-xl font-bold text-primary-600 block">
                                            ${item.price.toFixed(2)}
                                        </Text>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 sticky top-24">
                        <Title level={4} className="mb-6 text-gray-800">Order Summary</Title>

                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <Text>Subtotal ({items.length} items)</Text>
                                <Text className="font-medium">${total.toFixed(2)}</Text>
                            </div>
                            <Divider className="my-4" />
                            <div className="flex justify-between items-end">
                                <Text className="text-lg font-semibold text-gray-800">Total</Text>
                                <Text className="text-3xl font-bold text-primary-600">${total.toFixed(2)}</Text>
                            </div>
                        </div>

                        {/* WALLET_DISABLED: Wallet balance section removed.
                            When re-enabling wallet, restore the wallet balance display and
                            conditional buttons (Pay with Wallet / Top Up Wallet First) here. */}

                        <div className="mt-6">
                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={() => setShowPayment(true)}
                                loading={processing}
                                icon={<CreditCardOutlined />}
                                className="h-14 text-lg font-semibold bg-primary-600 hover:bg-primary-700 border-none shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all font-outfit"
                            >
                                Pay with Card
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <Text type="secondary" className="text-xs">
                                Secure checkout powered by PayHere
                            </Text>
                        </div>
                    </div>
                </div>
            </div>

            {/* PayHere Checkout Modal */}
            <PayHereCheckout
                visible={showPayment}
                amount={total}
                description={`${items.length} bundle${items.length !== 1 ? 's' : ''} purchase`}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPayment(false)}
            />
        </div>
    );
};

export default CartPage;
