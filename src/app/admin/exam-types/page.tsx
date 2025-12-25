'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { ExamType } from '@/types';

const ExamTypesPage: React.FC = () => {
    const [examTypes, setExamTypes] = useState<ExamType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchExamTypes = async () => {
        setLoading(true);
        try {
            const data = await adminService.getExamTypes();
            setExamTypes(data);
        } catch (error) {
            message.error('Failed to fetch exam types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExamTypes();
    }, []);

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: ExamType) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await adminService.deleteExamType(id);
            message.success('Exam type deleted successfully');
            fetchExamTypes();
        } catch (error) {
            message.error('Failed to delete exam type');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingId) {
                await adminService.updateExamType(editingId, values);
                message.success('Exam type updated successfully');
            } else {
                await adminService.createExamType(values);
                message.success('Exam type created successfully');
            }
            setIsModalVisible(false);
            fetchExamTypes();
        } catch (error) {
            message.error('Failed to save exam type');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_: any, record: ExamType) => (
                <div className="flex space-x-2">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this exam type?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Exam Types</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Add Exam Type
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={examTypes}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingId ? "Edit Exam Type" : "Add Exam Type"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter a name' }]}
                    >
                        <Input placeholder="e.g., Edexcel, Cambridge" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea placeholder="Optional description" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ExamTypesPage;
