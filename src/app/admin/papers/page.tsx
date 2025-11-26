"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { bundleService } from '@/services/bundleService';
import { paperService } from '@/services/paperService'; // Reuse public service for get
import { ListTable } from '@/components/ListTable';
import Header from '@/components/Header';

export default function PaperManagementPage() {
    const [papers, setPapers] = useState<any[]>([]);
    const [bundles, setBundles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            const [bundlesData] = await Promise.all([
                bundleService.getBundles()
            ]);

            setBundles(bundlesData);

            // Fetch papers for all bundles (inefficient but works for now)
            const allPapers = await Promise.all(
                bundlesData.map((b: any) => paperService.getBundlePapers(b.id))
            );
            setPapers(allPapers.flat());

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
            title: 'Delete Paper',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await adminService.deletePaper(record.id);
                    message.success('Paper deleted');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete paper');
                }
            }
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingId) {
                await adminService.updatePaper(editingId, values);
                message.success('Paper updated');
            } else {
                await adminService.createPaper(values);
                message.success('Paper created');
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
        { title: 'Type', dataIndex: 'type', key: 'type' },
        {
            title: 'Bundle',
            dataIndex: 'bundleId',
            key: 'bundleId',
            render: (id: number) => bundles.find(b => b.id === id)?.name || id
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Paper Management</h1>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="btn-primary">
                        Add Paper
                    </Button>
                </div>

                <ListTable
                    data={papers}
                    columns={columns}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <Modal
                    title={editingId ? 'Edit Paper' : 'Add Paper'}
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
                        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="MCQ">MCQ</Select.Option>
                                <Select.Option value="ESSAY">Essay</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="bundleId" label="Bundle" rules={[{ required: true }]}>
                            <Select showSearch optionFilterProp="children">
                                {bundles.map(b => <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="maxFreeAttempts" label="Max Free Attempts">
                            <InputNumber min={0} className="w-full" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}
