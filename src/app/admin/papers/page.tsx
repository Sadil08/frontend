"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, InputNumber, message, Tag, Statistic } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { AdminPaperDto, PaperCreateDto, AdminBundleDto } from '@/types/admin';
import { ListTable } from '@/components/ListTable';

import { useRouter } from 'next/navigation';
import { SubjectDto } from '@/types';

export default function PaperManagementPage() {
    const router = useRouter();
    const [papers, setPapers] = useState<AdminPaperDto[]>([]);
    const [bundles, setBundles] = useState<AdminBundleDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [papersData, bundlesData, subjectsData] = await Promise.all([
                adminService.getPapers(),
                adminService.getBundles(),
                adminService.getSubjects()
            ]);
            setPapers(papersData);
            setBundles(bundlesData);
            setSubjects(subjectsData);
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
            totalMarks: record.totalMarks,
            bundleId: record.bundleId,
            subjectId: record.subjectId
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
                totalMarks: values.totalMarks || undefined,
                bundleId: values.bundleId || undefined,
                subjectId: values.subjectId || undefined
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
        if (!bundleId) return <Tag className="rounded-full">No Bundle</Tag>;
        const bundle = bundles.find(b => b.id === bundleId);
        return bundle ? <span className="text-primary-600 font-medium">{bundle.name}</span> : `Bundle #${bundleId}`;
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
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type: string) => (
                <Tag color={type === 'MCQ' ? 'blue' : type === 'ESSAY' ? 'green' : 'purple'} className="rounded-full px-2">
                    {type}
                </Tag>
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
            render: (_: any, record: AdminPaperDto) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <span className="font-medium">{record.questions.length}</span>
                </div>
            )
        },
        {
            title: 'Total Marks',
            dataIndex: 'totalMarks',
            key: 'totalMarks',
            width: 110,
            render: (marks: number | null | undefined) =>
                marks ? <Tag color="blue" className="rounded-full">{marks}</Tag> : <Tag color="orange" className="rounded-full">Not Set</Tag>
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
                <Tag color={score >= 70 ? 'green' : score >= 50 ? 'orange' : 'red'} className="rounded-full">
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
                    className="text-primary-600 hover:text-primary-800"
                >
                    Questions
                </Button>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-slide-up">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Paper Management</h1>
                        <p className="text-secondary-600 mt-1 text-lg">Manage papers and view statistics</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                        className="bg-primary-600 hover:bg-primary-700 border-none shadow-md"
                    >
                        Add Paper
                    </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-500 font-medium">Total Papers</span>}
                            value={papers.length}
                            valueStyle={{ color: '#2563eb', fontWeight: 'bold', fontSize: '2rem' }}
                        />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-500 font-medium">Total Questions</span>}
                            value={papers.reduce((sum, p) => sum + p.questions.length, 0)}
                            valueStyle={{ color: '#16a34a', fontWeight: 'bold', fontSize: '2rem' }}
                        />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-500 font-medium">Total Attempts</span>}
                            value={papers.reduce((sum, p) => sum + p.totalAttempts, 0)}
                            valueStyle={{ color: '#9333ea', fontWeight: 'bold', fontSize: '2rem' }}
                        />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-500 font-medium">Avg Score</span>}
                            value={
                                papers.length > 0
                                    ? (papers.reduce((sum, p) => sum + p.averageScore, 0) / papers.length).toFixed(1)
                                    : 0
                            }
                            suffix="%"
                            valueStyle={{ color: '#ea580c', fontWeight: 'bold', fontSize: '2rem' }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <ListTable
                        data={papers}
                        columns={columns}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                <Modal
                    title={<span className="text-xl font-bold text-gray-900">{editingId ? 'Edit Paper' : 'Add Paper'}</span>}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={() => form.submit()}
                    width={600}
                    okText={editingId ? 'Update' : 'Create'}
                    okButtonProps={{ className: "bg-primary-600 hover:bg-primary-700" }}
                    centered
                    className="rounded-xl overflow-hidden"
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: 'Name is required' }]}
                        >
                            <Input placeholder="e.g., Algebra Test 1" className="rounded-lg" />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Description is required' }]}
                        >
                            <Input.TextArea rows={3} placeholder="Describe the paper content..." className="rounded-lg" />
                        </Form.Item>
                        <Form.Item
                            name="type"
                            label="Type"
                            rules={[{ required: true, message: 'Type is required' }]}
                        >
                            <Select placeholder="Select type" className="rounded-lg">
                                <Select.Option value="MCQ">MCQ Only</Select.Option>
                                <Select.Option value="ESSAY">Essay Only</Select.Option>
                                <Select.Option value="MIXED">Mixed (MCQ + Essay)</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="bundleId" label="Assign to Bundle (Optional)">
                            <Select showSearch optionFilterProp="children" placeholder="Select a bundle" allowClear className="rounded-lg">
                                {bundles.map(b => (
                                    <Select.Option key={b.id} value={b.id}>
                                        {b.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="subjectId" label="Subject (Optional)" tooltip="Used for AI extraction context">
                            <Select showSearch optionFilterProp="children" placeholder="Select subject" allowClear className="rounded-lg">
                                {subjects.map(s => (
                                    <Select.Option key={s.id} value={s.id}>
                                        {s.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="totalMarks"
                            label="Total Marks"
                            rules={[
                                { required: true, message: 'Total marks is required' },
                                { type: 'number', min: 1, message: 'Total marks must be at least 1' }
                            ]}
                            initialValue={100}
                            tooltip="Total marks for this paper. Final scores will be scaled to this value based on question marks."
                        >
                            <InputNumber min={1} className="w-full rounded-lg" placeholder="e.g., 100" />
                        </Form.Item>
                        <Form.Item
                            name="maxFreeAttempts"
                            label="Max Free Attempts"
                            initialValue={3}
                        >
                            <InputNumber min={1} className="w-full rounded-lg" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}
