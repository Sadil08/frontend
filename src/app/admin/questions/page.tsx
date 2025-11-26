"use client";

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { bundleService } from '@/services/bundleService';
import { paperService } from '@/services/paperService';
import { ListTable } from '@/components/ListTable';
import Header from '@/components/Header';

export default function QuestionManagementPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [questionType, setQuestionType] = useState('MCQ');

    const fetchData = async () => {
        try {
            // Similar logic to papers, fetch all bundles then papers then questions
            // This is getting heavy, ideally backend supports better filtering
            const bundles = await bundleService.getBundles();
            const allPapers = (await Promise.all(
                bundles.map((b: any) => paperService.getBundlePapers(b.id))
            )).flat();
            setPapers(allPapers);

            const allQuestions = (await Promise.all(
                allPapers.map((p: any) => paperService.getQuestions(p.id))
            )).flat();
            setQuestions(allQuestions);

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
        setQuestionType('MCQ');
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setQuestionType(record.type);
        setIsModalOpen(true);
    };

    const handleDelete = async (record: any) => {
        Modal.confirm({
            title: 'Delete Question',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await adminService.deleteQuestion(record.id);
                    message.success('Question deleted');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete question');
                }
            }
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingId) {
                await adminService.updateQuestion(editingId, values);
                message.success('Question updated');
            } else {
                await adminService.createQuestion(values);
                message.success('Question created');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Text', dataIndex: 'text', key: 'text', ellipsis: true },
        { title: 'Type', dataIndex: 'type', key: 'type' },
        {
            title: 'Paper',
            dataIndex: 'paperId',
            key: 'paperId',
            render: (id: number) => papers.find(p => p.id === id)?.name || id
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="btn-primary">
                        Add Question
                    </Button>
                </div>

                <ListTable
                    data={questions}
                    columns={columns}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <Modal
                    title={editingId ? 'Edit Question' : 'Add Question'}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={() => form.submit()}
                    width={800}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item name="paperId" label="Paper" rules={[{ required: true }]}>
                            <Select showSearch optionFilterProp="children">
                                {papers.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="text" label="Question Text" rules={[{ required: true }]}>
                            <Input.TextArea rows={3} />
                        </Form.Item>
                        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                            <Select onChange={setQuestionType}>
                                <Select.Option value="MCQ">MCQ</Select.Option>
                                <Select.Option value="ESSAY">Essay</Select.Option>
                            </Select>
                        </Form.Item>

                        {questionType === 'ESSAY' && (
                            <Form.Item name="correctAnswerText" label="Model Answer">
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        )}

                        {/* MCQ Options management would go here - simplified for now */}
                        {questionType === 'MCQ' && (
                            <div className="bg-blue-50 p-4 rounded mb-4">
                                <p className="text-sm text-blue-800 mb-2">Options management is simplified in this view. Please use separate endpoint or detailed view to manage options.</p>
                            </div>
                        )}
                    </Form>
                </Modal>
            </div>
        </div>
    );
}
