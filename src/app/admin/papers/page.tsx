"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, InputNumber, message, Tag, Statistic } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { AdminPaperDto, PaperCreateDto, AdminBundleDto } from '@/types/admin';
import { ListTable } from '@/components/ListTable';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function PaperManagementPage() {
    const router = useRouter();
    const [papers, setPapers] = useState<AdminPaperDto[]>([]);
    const [bundles, setBundles] = useState<AdminBundleDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [papersData, bundlesData] = await Promise.all([
                adminService.getPapers(),
                adminService.getBundles()
            ]);
            setPapers(papersData);
            setBundles(bundlesData);
        } catch (error) {
            console.error('Failed to load data:', error);
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

    const handleEdit = (record: AdminPaperDto) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
            type: record.type,
            maxFreeAttempts: record.maxFreeAttempts,
            bundleId: record.bundleId
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (record: AdminPaperDto) => {
        Modal.confirm({
            title: 'Delete Paper',
            content: `Are you sure you want to delete "${record.name}"? This will also delete all associated questions.`,
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await adminService.deletePaper(record.id);
                    message.success('Paper deleted successfully');
                    fetchData();
                } catch (error) {
                    console.error('Failed to delete paper:', error);
                    message.error('Failed to delete paper');
                }
            }
        });
    };

    const handleEditQuestions = (record: AdminPaperDto) => {
        router.push(`/admin/papers/${record.id}/edit`);
    };

    const handleSubmit = async (values: any) => {
        try {
            const paperData: PaperCreateDto = {
                name: values.name,
                description: values.description,
                type: values.type,
                maxFreeAttempts: values.maxFreeAttempts || 3,
                bundleId: values.bundleId || undefined
            };

            if (editingId) {
                await adminService.updatePaper(editingId, paperData);
                message.success('Paper updated successfully');
            } else {
                await adminService.createPaper(paperData);
                message.success('Paper created successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Operation failed:', error);
            message.error('Operation failed');
        }
    };

    const getBundleName = (bundleId: number | null) => {
        if (!bundleId) return <Tag>No Bundle</Tag>;
        const bundle = bundles.find(b => b.id === bundleId);
        return bundle ? bundle.name : `Bundle #${bundleId}`;
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
            width: 200
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type: string) => (
                <Tag color={type === 'MCQ' ? 'blue' : type === 'ESSAY' ? 'green' : 'purple'}>{type}</Tag>
            )
        },
        {
            title: 'Bundle',
            dataIndex: 'bundleId',
            key: 'bundleId',
            width: 150,
            render: (bundleId: number | null) => getBundleName(bundleId)
        },
        {
            title: 'Questions',
            key: 'questions',
            width: 100,
            render: (_: any, record: AdminPaperDto) => record.questions.length
        },
        {
            title: 'Max Attempts',
            dataIndex: 'maxFreeAttempts',
            key: 'maxFreeAttempts',
            width: 110
        },
        {
            title: 'Total Attempts',
            dataIndex: 'totalAttempts',
            key: 'totalAttempts',
            width: 120
        },
        {
            title: 'Avg Score',
            dataIndex: 'averageScore',
            key: 'averageScore',
            width: 100,
            render: (score: number) => (
                <Tag color={score >= 70 ? 'green' : score >= 50 ? 'orange' : 'red'}>
                    {score.toFixed(1)}%
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right' as const,
            width: 120,
            render: (_: any, record: AdminPaperDto) => (
                <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditQuestions(record)}
                    size="small"
                >
                    Questions
                </Button>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Paper Management</h1>
                        <p className="text-gray-600 mt-1">Manage papers and view statistics</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                    >
                        Add Paper
                    </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <Statistic
                            title="Total Papers"
                            value={papers.length}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <Statistic
                            title="Total Questions"
                            value={papers.reduce((sum, p) => sum + p.questions.length, 0)}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <Statistic
                            title="Total Attempts"
                            value={papers.reduce((sum, p) => sum + p.totalAttempts, 0)}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <Statistic
                            title="Avg Score"
                            value={
                                papers.length > 0
                                    ? (papers.reduce((sum, p) => sum + p.averageScore, 0) / papers.length).toFixed(1)
                                    : 0
                            }
                            suffix="%"
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </div>
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
                    width={600}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: 'Name is required' }]}
                        >
                            <Input placeholder="e.g., Algebra Test 1" />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Description is required' }]}
                        >
                            <Input.TextArea rows={3} placeholder="Describe the paper content..." />
                        </Form.Item>
                        <Form.Item
                            name="type"
                            label="Type"
                            rules={[{ required: true, message: 'Type is required' }]}
                        >
                            <Select placeholder="Select type">
                                <Select.Option value="MCQ">MCQ Only</Select.Option>
                                <Select.Option value="ESSAY">Essay Only</Select.Option>
                                <Select.Option value="MIXED">Mixed (MCQ + Essay)</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="bundleId" label="Assign to Bundle (Optional)">
                            <Select showSearch optionFilterProp="children" placeholder="Select a bundle" allowClear>
                                {bundles.map(b => (
                                    <Select.Option key={b.id} value={b.id}>
                                        {b.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="maxFreeAttempts"
                            label="Max Free Attempts"
                            initialValue={3}
                        >
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}
