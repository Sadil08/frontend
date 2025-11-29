"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { ListTable } from '@/components/ListTable';


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
            okText: 'Delete',
            okType: 'danger',
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
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (text: string) => <span className="font-medium text-gray-900">{text}</span>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => <span className="text-gray-600">{text}</span>
        },
        {
            title: 'Subject',
            dataIndex: 'subjectId',
            key: 'subjectId',
            width: 150,
            render: (id: number) => {
                const subject = subjects.find(s => s.id === id);
                return subject ? <span className="text-primary-600 font-medium">{subject.name}</span> : id;
            }
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-slide-up">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Lesson Management</h1>
                        <p className="text-secondary-600 mt-1 text-lg">Manage lessons and their content</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                        className="bg-primary-600 hover:bg-primary-700 border-none shadow-md"
                    >
                        Add Lesson
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <ListTable
                        data={lessons}
                        columns={columns}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                <Modal
                    title={<span className="text-xl font-bold text-gray-900">{editingId ? 'Edit Lesson' : 'Add Lesson'}</span>}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={() => form.submit()}
                    okText={editingId ? 'Update' : 'Create'}
                    okButtonProps={{ className: "bg-primary-600 hover:bg-primary-700" }}
                    centered
                    className="rounded-xl overflow-hidden"
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
                        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                            <Input placeholder="e.g., Introduction to Algebra" className="rounded-lg" />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={4} placeholder="Description of the lesson..." className="rounded-lg" />
                        </Form.Item>
                        <Form.Item name="subjectId" label="Subject" rules={[{ required: true }]}>
                            <Select placeholder="Select a subject" className="rounded-lg">
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
