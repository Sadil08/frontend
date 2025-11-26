"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, InputNumber, Checkbox, message, Tag, Space } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { AdminBundleDto, BundleCreateDto } from '@/types/admin';
import { SubjectDto, LessonDto } from '@/types';
import { ListTable } from '@/components/ListTable';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function BundleManagementPage() {
    const router = useRouter();
    const [bundles, setBundles] = useState<AdminBundleDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [lessons, setLessons] = useState<LessonDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bundlesData, subjectsData, lessonsData] = await Promise.all([
                adminService.getBundles(),
                adminService.getSubjects(),
                adminService.getLessons()
            ]);
            setBundles(bundlesData);
            setSubjects(subjectsData);
            setLessons(lessonsData);
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

    const handleEdit = (record: AdminBundleDto) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
            price: record.price,
            type: record.type,
            examType: record.examType,
            subjectId: record.subjectId,
            lessonId: record.lessonId,
            isPastPaper: record.isPastPaper
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (record: AdminBundleDto) => {
        Modal.confirm({
            title: 'Delete Bundle',
            content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await adminService.deleteBundle(record.id);
                    message.success('Bundle deleted successfully');
                    fetchData();
                } catch (error) {
                    console.error('Failed to delete bundle:', error);
                    message.error('Failed to delete bundle');
                }
            }
        });
    };

    const handleViewStats = (record: AdminBundleDto) => {
        router.push(`/admin/bundles/${record.id}/stats`);
    };

    const handleSubmit = async (values: any) => {
        try {
            const bundleData: BundleCreateDto = {
                name: values.name,
                description: values.description,
                price: values.price,
                type: values.type,
                examType: values.examType,
                isPastPaper: values.isPastPaper || false,
                subjectId: values.subjectId,
                lessonId: values.lessonId
            };

            if (editingId) {
                await adminService.updateBundle(editingId, bundleData);
                message.success('Bundle updated successfully');
            } else {
                await adminService.createBundle(bundleData);
                message.success('Bundle created successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Operation failed:', error);
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
            width: 200
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 100,
            render: (val: number) => `$${val.toFixed(2)}`
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
            title: 'Exam Type',
            dataIndex: 'examType',
            key: 'examType',
            width: 120
        },
        {
            title: 'Papers',
            key: 'papers',
            width: 80,
            render: (_: any, record: AdminBundleDto) => record.stats.totalPapers
        },
        {
            title: 'Questions',
            key: 'questions',
            width: 100,
            render: (_: any, record: AdminBundleDto) => record.stats.totalQuestions
        },
        {
            title: 'Students',
            key: 'students',
            width: 100,
            render: (_: any, record: AdminBundleDto) => record.stats.totalStudentsWithAccess
        },
        {
            title: 'Attempts',
            key: 'attempts',
            width: 100,
            render: (_: any, record: AdminBundleDto) => record.stats.totalAttempts
        },
        {
            title: 'Past Paper',
            dataIndex: 'isPastPaper',
            key: 'isPastPaper',
            width: 100,
            render: (val: boolean) => val ? <Tag color="orange">Yes</Tag> : <Tag>No</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right' as const,
            width: 100,
            render: (_: any, record: AdminBundleDto) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewStats(record)}
                        size="small"
                    >
                        Stats
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bundle Management</h1>
                        <p className="text-gray-600 mt-1">Manage paper bundles and view statistics</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                    >
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
                    okText={editingId ? 'Update' : 'Create'}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[{ required: true, message: 'Name is required' }]}
                            >
                                <Input placeholder="e.g., Math Bundle 2024" />
                            </Form.Item>
                            <Form.Item
                                name="price"
                                label="Price"
                                rules={[{ required: true, message: 'Price is required' }]}
                            >
                                <InputNumber
                                    min={0}
                                    step={0.01}
                                    className="w-full"
                                    placeholder="0.00"
                                    prefix="$"
                                />
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
                            <Form.Item
                                name="examType"
                                label="Exam Type"
                                rules={[{ required: true, message: 'Exam type is required' }]}
                            >
                                <Input placeholder="e.g., MIDTERM, FINAL" />
                            </Form.Item>
                            <Form.Item name="subjectId" label="Subject">
                                <Select allowClear placeholder="Select subject">
                                    {subjects.map(s => (
                                        <Select.Option key={s.id} value={s.id}>
                                            {s.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="lessonId" label="Lesson">
                                <Select allowClear placeholder="Select lesson">
                                    {lessons.map(l => (
                                        <Select.Option key={l.id} value={l.id}>
                                            {l.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Description is required' }]}
                        >
                            <Input.TextArea rows={4} placeholder="Describe the bundle content..." />
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
