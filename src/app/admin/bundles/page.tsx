"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, InputNumber, Checkbox, message, Tag, Space } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { AdminBundleDto, BundleCreateDto } from '@/types/admin';
import { SubjectDto, LessonDto, ExamType } from '@/types';
import { ListTable } from '@/components/ListTable';

import { useRouter } from 'next/navigation';

export default function BundleManagementPage() {
    const router = useRouter();
    const [bundles, setBundles] = useState<AdminBundleDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [lessons, setLessons] = useState<LessonDto[]>([]);
    const [examTypes, setExamTypes] = useState<ExamType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bundlesData, subjectsData, lessonsData, examTypesData] = await Promise.all([
                adminService.getBundles(),
                adminService.getSubjects(),
                adminService.getLessons(),
                adminService.getExamTypes()
            ]);
            setBundles(bundlesData);
            setSubjects(subjectsData);
            setLessons(lessonsData);
            setExamTypes(examTypesData);
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
            examTypeId: record.examTypeId,
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
                examTypeId: values.examTypeId,
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
            width: 200,
            render: (text: string) => <span className="font-medium text-gray-900">{text}</span>
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 100,
            render: (val: number) => <span className="font-semibold text-green-600">${val.toFixed(2)}</span>
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
            title: 'Exam Type',
            dataIndex: 'examTypeName',
            key: 'examTypeName',
            width: 120,
            render: (text: string) => <Tag className="rounded-md">{text}</Tag>
        },
        {
            title: 'Papers',
            key: 'papers',
            width: 80,
            render: (_: any, record: AdminBundleDto) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <span className="font-medium">{record.stats.totalPapers}</span>
                </div>
            )
        },
        {
            title: 'Questions',
            key: 'questions',
            width: 100,
            render: (_: any, record: AdminBundleDto) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <span className="font-medium">{record.stats.totalQuestions}</span>
                </div>
            )
        },
        {
            title: 'Students',
            key: 'students',
            width: 100,
            render: (_: any, record: AdminBundleDto) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <span className="font-medium">{record.stats.totalStudentsWithAccess}</span>
                </div>
            )
        },
        {
            title: 'Attempts',
            key: 'attempts',
            width: 100,
            render: (_: any, record: AdminBundleDto) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <span className="font-medium">{record.stats.totalAttempts}</span>
                </div>
            )
        },
        {
            title: 'Past Paper',
            dataIndex: 'isPastPaper',
            key: 'isPastPaper',
            width: 100,
            render: (val: boolean) => val ? <Tag color="orange" className="rounded-full">Yes</Tag> : <Tag className="rounded-full">No</Tag>
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
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Stats
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-slide-up">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Bundle Management</h1>
                        <p className="text-secondary-600 mt-1 text-lg">Manage paper bundles and view statistics</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                        className="bg-primary-600 hover:bg-primary-700 border-none shadow-md"
                    >
                        Add Bundle
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <ListTable
                        data={bundles}
                        columns={columns}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                <Modal
                    title={<span className="text-xl font-bold text-gray-900">{editingId ? 'Edit Bundle' : 'Add Bundle'}</span>}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={() => form.submit()}
                    width={800}
                    okText={editingId ? 'Update' : 'Create'}
                    okButtonProps={{ className: "bg-primary-600 hover:bg-primary-700" }}
                    centered
                    className="rounded-xl overflow-hidden"
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[{ required: true, message: 'Name is required' }]}
                            >
                                <Input placeholder="e.g., Math Bundle 2024" className="rounded-lg" />
                            </Form.Item>
                            <Form.Item
                                name="price"
                                label="Price"
                                rules={[{ required: true, message: 'Price is required' }]}
                            >
                                <InputNumber
                                    min={0}
                                    step={0.01}
                                    className="w-full rounded-lg"
                                    placeholder="0.00"
                                    prefix="$"
                                />
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
                            <Form.Item
                                name="examTypeId"
                                label="Exam Type"
                                rules={[{ required: true, message: 'Exam type is required' }]}
                            >
                                <Select placeholder="Select exam type" className="rounded-lg">
                                    {examTypes.map(et => (
                                        <Select.Option key={et.id} value={et.id}>
                                            {et.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="subjectId" label="Subject">
                                <Select allowClear placeholder="Select subject" className="rounded-lg">
                                    {subjects.map(s => (
                                        <Select.Option key={s.id} value={s.id}>
                                            {s.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="lessonId" label="Lesson">
                                <Select allowClear placeholder="Select lesson" className="rounded-lg">
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
                            <Input.TextArea rows={4} placeholder="Describe the bundle content..." className="rounded-lg" />
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
