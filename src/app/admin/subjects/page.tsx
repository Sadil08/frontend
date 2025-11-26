"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { ListTable } from '@/components/ListTable';
import Header from '@/components/Header';

export default function SubjectManagementPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchSubjects = async () => {
        try {
            const data = await adminService.getSubjects();
            setSubjects(data);
        } catch (error) {
            message.error('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
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
            title: 'Delete Subject',
            content: 'Are you sure? This may affect related lessons and bundles.',
            onOk: async () => {
                try {
                    await adminService.deleteSubject(record.id);
                    message.success('Subject deleted');
                    fetchSubjects();
                } catch (error) {
                    message.error('Failed to delete subject');
                }
            }
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingId) {
                await adminService.updateSubject(editingId, values);
                message.success('Subject updated');
            } else {
                await adminService.createSubject(values);
                message.success('Subject created');
            }
            setIsModalOpen(false);
            fetchSubjects();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="btn-primary">
                        Add Subject
                    </Button>
                </div>

                <ListTable
                    data={subjects}
                    columns={columns}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <Modal
                    title={editingId ? 'Edit Subject' : 'Add Subject'}
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
                    </Form>
                </Modal>
            </div>
        </div>
    );
}
