"use client";

import React, { useState } from 'react';
import { Modal, Button, InputNumber, message } from 'antd';
import { ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import axios from 'axios';

interface ExtraAttemptsModalProps {
    visible: boolean;
    onClose: () => void;
    paperId: number;
    onPurchaseSuccess: () => void;
}

export const ExtraAttemptsModal: React.FC<ExtraAttemptsModalProps> = ({
    visible,
    onClose,
    paperId,
    onPurchaseSuccess
}) => {
    const [quantity, setQuantity] = useState(1);
    const [purchasing, setPurchasing] = useState(false);

    const pricePerAttempt = 5.00;
    const totalPrice = quantity * pricePerAttempt;

    const handlePurchase = async () => {
        try {
            setPurchasing(true);
            const token = localStorage.getItem('token')?.trim();

            if (!token) {
                message.error('Please login to purchase extra attempts');
                return;
            }

            await axios.post(
                `http://localhost:8080/api/papers/${paperId}/extra-attempts/purchase`,
                { attemptsCount: quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            message.success(`Successfully purchased ${quantity} extra attempt${quantity > 1 ? 's' : ''}!`);
            onPurchaseSuccess();
            onClose();
            setQuantity(1);
        } catch (error) {
            console.error('Purchase failed:', error);
            message.error('Failed to purchase extra attempts. Please try again.');
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <ThunderboltOutlined className="text-primary-600" />
                    <span>Purchase Extra Attempts</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            <div className="py-4">
                {/* Info Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShoppingCartOutlined className="text-blue-600 text-lg" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Get More Attempts</h4>
                            <p className="text-sm text-gray-600">
                                Purchase additional attempts to continue practicing this paper.
                                Each attempt gives you another chance to improve your score.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Attempts
                    </label>
                    <InputNumber
                        min={1}
                        max={10}
                        value={quantity}
                        onChange={(value) => setQuantity(value || 1)}
                        className="w-full"
                        size="large"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        You can purchase up to 10 extra attempts at a time
                    </p>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Price per attempt</span>
                        <span className="font-medium">${pricePerAttempt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Quantity</span>
                        <span className="font-medium">×{quantity}</span>
                    </div>
                    <div className="border-t border-gray-300 my-2"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-primary-600">${totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                {/* Mock Payment Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> This is a mock payment. In production, this will integrate with PayHere payment gateway.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        onClick={onClose}
                        size="large"
                        className="flex-1"
                        disabled={purchasing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handlePurchase}
                        loading={purchasing}
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        className="flex-1 bg-primary-600 hover:bg-primary-700"
                    >
                        Purchase Now
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
