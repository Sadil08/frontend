"use client";

import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { login, register } from '@/services/authService';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

interface AuthFormProps {
  isRegister: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isRegister }) => {
  const { login: setAuth } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isRegister) {
        const userResponse = await register(values.email, values.password, values.name, values.referralCode);
        const jwtResponse = await login(values.email, values.password);
        setAuth(jwtResponse.token, { id: userResponse.id, role: userResponse.role, email: userResponse.email });
        message.success('Registration successful! Welcome to EduApp.');
        router.push(userResponse.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        const jwtResponse = await login(values.email, values.password);
        const payload = JSON.parse(atob(jwtResponse.token.split('.')[1]));
        setAuth(jwtResponse.token, { id: payload.id, role: payload.role, email: payload.sub });
        message.success('Welcome back!');
        router.push(payload.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      message.error('Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegister ? 'Already have an account? ' : 'Or '}
            <Link href={isRegister ? '/login' : '/register'} className="font-medium text-primary-600 hover:text-primary-500">
              {isRegister ? 'Sign in' : 'create a new account'}
            </Link>
          </p>
        </div>
        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="p-4"
          >
            {isRegister && (
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Full Name"
                  className="rounded-lg"
                />
              </Form.Item>
            )}
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
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Password"
                className="rounded-lg"
              />
            </Form.Item>
            {!isRegister && (
              <div className="flex justify-end -mt-4 mb-4">
                <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </Link>
              </div>
            )}
            {isRegister && (
              <Form.Item
                name="referralCode"
                rules={[
                  { pattern: /^[A-Z0-9]{8}$/, message: 'Code must be 8 alphanumeric characters' }
                ]}
              >
                <Input
                  prefix={<span className="text-gray-400 font-bold text-xs mt-1">REF</span>}
                  placeholder="Referral Code (Optional)"
                  className="rounded-lg"
                  maxLength={8}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    form.setFieldValue('referralCode', val);
                  }}
                />
              </Form.Item>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-lg font-medium rounded-lg bg-primary-600 hover:bg-primary-700 border-none shadow-md hover:shadow-lg transition-all"
              >
                {isRegister ? 'Create Account' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;