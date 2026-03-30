import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Alert, Divider, Typography } from 'antd';
import { CreditCardOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface PayHereCheckoutProps {
    visible: boolean;
    amount: number;
    description: string;
    onSuccess: (paymentReference: string) => void;
    onClose: () => void;
}

/**
 * Mock PayHere Checkout Modal
 * Simulates the payment gateway experience. In a real application, 
 * this would initiate a redirect to PayHere or open their SDK modal.
 */
const PayHereCheckout: React.FC<PayHereCheckoutProps> = ({
    visible,
    amount,
    description,
    onSuccess,
    onClose
}) => {
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);

    // Mock payment processing
    const handlePay = async (values: any) => {
        setProcessing(true);

        // Simulate network delay
        setTimeout(() => {
            setProcessing(false);

            // Validate mock card (just check if it's not empty for this mock)
            if (values.cardNumber) {
                // Generate a mock payment reference
                const mockRef = `PAYHERE_MOCK_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                message.success("Payment approved by PayHere (Mock)");
                onSuccess(mockRef);
            } else {
                message.error("Payment failed: Invalid card details");
            }
        }, 1500);
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-primary-600">
                    <SafetyCertificateOutlined />
                    <span>Secure Checkout</span>
                </div>
            }
            open={visible}
            onCancel={!processing ? onClose : undefined}
            footer={null}
            maskClosable={!processing}
            width={480}
            className="top-8"
        >
            <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                    <Text className="text-gray-500">Merchant</Text>
                    <Text strong>EduApp Sri Lanka</Text>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <Text className="text-gray-500">Item</Text>
                    <Text strong>{description}</Text>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between items-center">
                    <Text className="text-lg">Total Amount</Text>
                    <Title level={3} className="m-0 text-primary-600">
                        LKR {amount.toFixed(2)}
                    </Title>
                </div>
            </div>

            <Alert
                message="PayHere Sandbox (Mock)"
                description="This is a simulation. No real money will be charged. You can use any card number."
                type="info"
                showIcon
                className="mb-6"
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handlePay}
                initialValues={{ cardHolder: 'Test User' }}
            >
                <Form.Item
                    label="Card Number"
                    name="cardNumber"
                    rules={[
                        { required: true, message: 'Please enter card number' },
                        { pattern: /^\d{16}$/, message: 'Card number must be 16 digits' }
                    ]}
                >
                    <Input
                        prefix={<CreditCardOutlined className="text-gray-400" />}
                        placeholder="0000 0000 0000 0000"
                        maxLength={16}
                        size="large"
                    />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label="Expiry Date"
                        name="expiry"
                        rules={[{ required: true, message: 'Required' }]}
                    >
                        <Input placeholder="MM / YY" size="large" maxLength={5} />
                    </Form.Item>
                    <Form.Item
                        label="CVC / CVV"
                        name="cvc"
                        rules={[{ required: true, message: 'Required' }]}
                    >
                        <Input
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="123"
                            maxLength={3}
                            type="password"
                            size="large"
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    label="Card Holder Name"
                    name="cardHolder"
                    rules={[{ required: true, message: 'Please enter card holder name' }]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item className="mb-0">
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        loading={processing}
                        className="h-12 bg-[#0056D2] hover:bg-[#0042a1] border-none font-semibold text-lg"
                    >
                        Pay LKR {amount.toFixed(2)}
                    </Button>
                </Form.Item>

                <div className="mt-4 text-center">
                    <Text type="secondary" className="text-xs flex items-center justify-center gap-1">
                        <LockOutlined /> Secured by PayHere
                    </Text>
                    <div className="flex justify-center gap-2 mt-2 opacity-50 grayscale">
                        <img src="https://www.payhere.lk/downloads/images/payhere_square_banner.png" alt="Visa" className="h-6" />
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default PayHereCheckout;
