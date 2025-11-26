"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, InputNumber, Checkbox, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { bundleService } from '@/services/bundleService'; // Reuse public service for get
import { ListTable } from '@/components/ListTable';
import Header from '@/components/Header';

export default function BundleManagementPage() {
    const [bundles, setBundles] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            const [bundlesData, subjectsData, lessonsData] = await Promise.all([
                bundleService.getBundles(), // Assuming this gets all for admin or similar
                adminService.getSubjects(),
                adminService.getLessons()
            ]);
            setBundles(bundlesData);
            setSubjects(subjectsData);
            setLessons(lessonsData);
        } catch (error) {
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (record: any) => {
        Modal.confirm({
            title: 'Delete Bundle',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await adminService.deleteBundle(record.id);
                    message.success('Bundle deleted');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete bundle');
                }
            }
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingId) {
                await adminService.updateBundle(editingId, values);
                message.success('Bundle updated');
            } else {
                await adminService.createBundle(values);
                message.success('Bundle created');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Price', dataIndex: 'price', key: 'price', render: (val: number) => `$${val}` },
        { title: 'Type', dataIndex: 'type', key: 'type' },
        { title: 'Exam', dataIndex: 'examType', key: 'examType' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Bundle Management</h1>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="btn-primary">
                        Add Bundle
                    </Button>
                </div>

                <ListTable
                    data={bundles}
                    columns={columns}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <Modal
                    title={editingId ? 'Edit Bundle' : 'Add Bundle'}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={() => form.submit()}
                    width={800}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                                <InputNumber min={0} className="w-full" />
                            </Form.Item>
                            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="MCQ">MCQ</Select.Option>
                                    <Select.Option value="ESSAY">Essay</Select.Option>
                                    <Select.Option value="BOTH">Both</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="examType" label="Exam Type" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="subjectId" label="Subject">
                                <Select allowClear>
                                    {subjects.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="lessonId" label="Lesson">
                                <Select allowClear>
                                    {lessons.map(l => <Select.Option key={l.id} value={l.id}>{l.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </div>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item name="isPastPaper" valuePropName="checked">
                            <Checkbox>Is Past Paper</Checkbox>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}
