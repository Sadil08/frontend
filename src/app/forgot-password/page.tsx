"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { forgotPassword, resetPassword } from '@/services/authService';
import { MailOutlined, LockOutlined, NumberOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const onEmailFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            await forgotPassword(values.email);
            setEmail(values.email);
            setStep(2);
            setTimer(60); // Start 60s cooldown
            message.success('OTP sent to your email!');
        } catch (error) {
            message.error('Failed to send OTP. Please check your email and try again.');
        } finally {
            setLoading(false);
        }
    };

    const onResetFinish = async (values: { otp: string; newPassword: string }) => {
        setLoading(true);
        try {
            await resetPassword(email, values.otp, values.newPassword);
            message.success('Password reset successfully! Please login.');
            router.push('/login');
        } catch (error) {
            message.error('Failed to reset password. Invalid OTP or expired.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        setLoading(true);
        try {
            await forgotPassword(email);
            setTimer(60);
            message.success('OTP resent successfully!');
        } catch (error) {
            message.error('Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-4">
                        <ArrowLeftOutlined className="mr-2" /> Back to Login
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1
                            ? 'Enter your email address and we\'ll send you an OTP.'
                            : `Enter the OTP sent to ${email} and your new password.`}
                    </p>
                </div>

                <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
                    {step === 1 ? (
                        <Form
                            onFinish={onEmailFinish}
                            layout="vertical"
                            size="large"
                            className="p-4"
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined className="text-gray-400" />}
                                    placeholder="Email Address"
                                    className="rounded-lg"
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full h-12 text-lg font-medium rounded-lg bg-primary-600 hover:bg-primary-700 border-none"
                                >
                                    Send OTP
                                </Button>
                            </Form.Item>
                        </Form>
                    ) : (
                        <Form
                            onFinish={onResetFinish}
                            layout="vertical"
                            size="large"
                            className="p-4"
                        >
                            <Form.Item
                                name="otp"
                                rules={[
                                    { required: true, message: 'Please input the OTP!' },
                                    { len: 6, message: 'OTP must be 6 digits' }
                                ]}
                            >
                                <Input
                                    prefix={<NumberOutlined className="text-gray-400" />}
                                    placeholder="Enter 6-digit OTP"
                                    className="rounded-lg text-center tracking-widest font-mono text-lg"
                                    maxLength={6}
                                />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Please input your new password!' },
                                    { min: 6, message: 'Password must be at least 6 characters' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400" />}
                                    placeholder="New Password"
                                    className="rounded-lg"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full h-12 text-lg font-medium rounded-lg bg-primary-600 hover:bg-primary-700 border-none mb-4"
                                >
                                    Reset Password
                                </Button>

                                <div className="text-center">
                                    <Button
                                        type="link"
                                        onClick={handleResendOtp}
                                        disabled={timer > 0 || loading}
                                        className="text-primary-600"
                                    >
                                        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    )}
                </Card>
            </div>
        </div>
    );
}
