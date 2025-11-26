"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { ListTable } from '@/components/ListTable';
import Header from '@/components/Header';

export default function LessonManagementPage() {
    const [lessons, setLessons] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            const [lessonsData, subjectsData] = await Promise.all([
                adminService.getLessons(),
                adminService.getSubjects()
            ]);
            setLessons(lessonsData);
            setSubjects(subjectsData);
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
            title: 'Delete Lesson',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await adminService.deleteLesson(record.id);
                    message.success('Lesson deleted');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete lesson');
                }
            }
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingId) {
                await adminService.updateLesson(editingId, values);
                message.success('Lesson updated');
            } else {
                await adminService.createLesson(values);
                message.success('Lesson created');
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
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Subject',
            dataIndex: 'subjectId',
            key: 'subjectId',
            render: (id: number) => subjects.find(s => s.id === id)?.name || id
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Lesson Management</h1>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="btn-primary">
                        Add Lesson
                    </Button>
                </div>

                <ListTable
                    data={lessons}
                    columns={columns}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <Modal
                    title={editingId ? 'Edit Lesson' : 'Add Lesson'}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={() => form.submit()}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item name="subjectId" label="Subject" rules={[{ required: true }]}>
                            <Select>
                                {subjects.map(s => (
                                    <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}
