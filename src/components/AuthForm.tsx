"use client";

import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { login, register } from '@/services/authService';

interface AuthFormProps {
  isRegister: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isRegister }) => {
  const { login: setAuth } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      if (isRegister) {
        const userResponse = await register(values.email, values.password, values.name);
        // For register, assume login after
        const jwtResponse = await login(values.email, values.password);
        setAuth(jwtResponse.token, { id: userResponse.id, role: userResponse.role, email: userResponse.email });
        // Redirect based on role
        router.push(userResponse.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        const jwtResponse = await login(values.email, values.password);
        // Decode user from token
        const payload = JSON.parse(atob(jwtResponse.token.split('.')[1]));
        setAuth(jwtResponse.token, { id: payload.id, role: payload.role, email: payload.email });
        // Redirect based on role
        router.push(payload.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      message.error('Authentication failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="bg-white shadow-lg">
        <Form form={form} onFinish={onFinish} layout="vertical">
          {isRegister && (
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input className="border-gray-300 focus:border-blue-500" />
            </Form.Item>
          )}
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input className="border-gray-300 focus:border-blue-500" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password className="border-gray-300 focus:border-blue-500" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-blue-500 hover:bg-blue-600">
              {isRegister ? 'Register' : 'Login'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AuthForm;