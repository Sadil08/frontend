"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, message, Table, Space, Tooltip } from 'antd';
import { PlusOutlined, BookOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { ListTable } from '@/components/ListTable';
import { SubjectDto, LessonDto } from '@/types';

export default function SubjectManagementPage() {
    // Subject State
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
    const [subjectForm] = Form.useForm();

    // Lesson State
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<SubjectDto | null>(null);
    const [lessons, setLessons] = useState<LessonDto[]>([]);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
    const [lessonForm] = Form.useForm();

    // ============================================================================
    // Subject Management
    // ============================================================================

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

    const handleAddSubject = () => {
        setEditingSubjectId(null);
        subjectForm.resetFields();
        setIsSubjectModalOpen(true);
    };

    const handleEditSubject = (record: SubjectDto) => {
        setEditingSubjectId(record.id);
        subjectForm.setFieldsValue(record);
        setIsSubjectModalOpen(true);
    };

    const handleDeleteSubject = async (record: SubjectDto) => {
        Modal.confirm({
            title: 'Delete Subject',
            content: 'Are you sure? This may affect related bundles.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await adminService.deleteSubject(record.id);
                    message.success('Subject deleted');
                    fetchSubjects();
                } catch (error: any) {
                    // Display specific error message from backend if available
                    if (error.response && error.response.data && error.response.data.message) {
                        message.error(error.response.data.message);
                    } else {
                        message.error('Failed to delete subject. It may be in use.');
                    }
                }
            }
        });
    };

    const handleSubjectSubmit = async (values: any) => {
        try {
            if (editingSubjectId) {
                await adminService.updateSubject(editingSubjectId, values);
                message.success('Subject updated');
            } else {
                await adminService.createSubject(values);
                message.success('Subject created');
            }
            setIsSubjectModalOpen(false);
            fetchSubjects();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    // ============================================================================
    // Lesson Management
    // ============================================================================

    const fetchLessons = async () => {
        if (!currentSubject) return;
        setLessonsLoading(true);
        try {
            const allLessons = await adminService.getLessons();
            // Filter lessons for the current subject
            const subjectLessons = allLessons.filter(l => l.subjectId === currentSubject.id);
            setLessons(subjectLessons);
        } catch (error) {
            message.error('Failed to load lessons');
        } finally {
            setLessonsLoading(false);
        }
    };

    const handleManageLessons = (subject: SubjectDto) => {
        setCurrentSubject(subject);
        setIsLessonModalOpen(true);
        // Fetch lessons will be triggered by useEffect when currentSubject changes
    };

    useEffect(() => {
        if (isLessonModalOpen && currentSubject) {
            fetchLessons();
        }
    }, [isLessonModalOpen, currentSubject]);

    const handleAddLesson = () => {
        setEditingLessonId(null);
        lessonForm.resetFields();
        // Pre-fill subject ID if needed, but we handle it in submit
    };

    const handleEditLesson = (record: LessonDto) => {
        setEditingLessonId(record.id);
        lessonForm.setFieldsValue(record);
    };

    const handleDeleteLesson = async (id: number) => {
        try {
            await adminService.deleteLesson(id);
            message.success('Lesson deleted');
            fetchLessons();
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Failed to delete lesson. It may be in use.');
            }
        }
    };

    const handleLessonSubmit = async (values: any) => {
        if (!currentSubject) return;

        try {
            const lessonData = { ...values, subjectId: currentSubject.id };

            if (editingLessonId) {
                await adminService.updateLesson(editingLessonId, lessonData);
                message.success('Lesson updated');
            } else {
                await adminService.createLesson(lessonData);
                message.success('Lesson created');
            }
            lessonForm.resetFields();
            setEditingLessonId(null);
            fetchLessons();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    // ============================================================================
    // Columns & Render
    // ============================================================================

    const subjectColumns = [
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
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_: any, record: SubjectDto) => (
                <Space>
                    <Tooltip title="Manage Lessons">
                        <Button
                            icon={<BookOutlined />}
                            onClick={() => handleManageLessons(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEditSubject(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteSubject(record)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const lessonColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="font-medium">{text}</span>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: LessonDto) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditLesson(record)}
                    />
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteLesson(record.id)}
                    />
                </Space>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-slide-up">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Subject Management</h1>
                        <p className="text-secondary-600 mt-1 text-lg">Manage subjects and their lessons</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddSubject}
                        size="large"
                        className="bg-primary-600 hover:bg-primary-700 border-none shadow-md"
                    >
                        Add Subject
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Table
                        dataSource={subjects}
                        columns={subjectColumns}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </div>

                {/* Subject Modal */}
                <Modal
                    title={<span className="text-xl font-bold text-gray-900">{editingSubjectId ? 'Edit Subject' : 'Add Subject'}</span>}
                    open={isSubjectModalOpen}
                    onCancel={() => setIsSubjectModalOpen(false)}
                    onOk={() => subjectForm.submit()}
                    okText={editingSubjectId ? 'Update' : 'Create'}
                    okButtonProps={{ className: "bg-primary-600 hover:bg-primary-700" }}
                    centered
                    className="rounded-xl overflow-hidden"
                >
                    <Form form={subjectForm} layout="vertical" onFinish={handleSubjectSubmit} className="mt-4">
                        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                            <Input placeholder="e.g., Mathematics" className="rounded-lg" />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={4} placeholder="Description of the subject..." className="rounded-lg" />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Lessons Modal */}
                <Modal
                    title={
                        <div className="flex justify-between items-center pr-8">
                            <span className="text-xl font-bold text-gray-900">
                                Lessons for {currentSubject?.name}
                            </span>
                        </div>
                    }
                    open={isLessonModalOpen}
                    onCancel={() => setIsLessonModalOpen(false)}
                    footer={null}
                    width={800}
                    centered
                    className="rounded-xl overflow-hidden"
                >
                    <div className="mt-4">
                        {/* Add/Edit Lesson Form */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
                            </h4>
                            <Form
                                form={lessonForm}
                                layout="inline"
                                onFinish={handleLessonSubmit}
                                className="w-full"
                            >
                                <Form.Item
                                    name="name"
                                    rules={[{ required: true, message: 'Required' }]}
                                    className="flex-1 mb-2 sm:mb-0"
                                >
                                    <Input placeholder="Lesson Name" />
                                </Form.Item>
                                <Form.Item
                                    name="description"
                                    className="flex-1 mb-2 sm:mb-0"
                                >
                                    <Input placeholder="Description (optional)" />
                                </Form.Item>
                                <Form.Item className="mb-0">
                                    <Space>
                                        <Button type="primary" htmlType="submit" icon={editingLessonId ? <EditOutlined /> : <PlusOutlined />}>
                                            {editingLessonId ? 'Update' : 'Add'}
                                        </Button>
                                        {editingLessonId && (
                                            <Button onClick={() => {
                                                setEditingLessonId(null);
                                                lessonForm.resetFields();
                                            }}>
                                                Cancel
                                            </Button>
                                        )}
                                    </Space>
                                </Form.Item>
                            </Form>
                        </div>

                        {/* Lessons List */}
                        <Table
                            dataSource={lessons}
                            columns={lessonColumns}
                            loading={lessonsLoading}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="small"
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
}
