"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Form, Input, Select, InputNumber, message, Modal, Tag, List } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { AdminPaperDto, QuestionCreateDto, AdminQuestionDto } from '@/types/admin';
import Header from '@/components/Header';

export default function PaperEditPage() {
    const params = useParams();
    const router = useRouter();
    const paperId = Number(params.id);
    const [paper, setPaper] = useState<AdminPaperDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<AdminQuestionDto | null>(null);
    const [form] = Form.useForm();

    const fetchPaper = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPaper(paperId);
            setPaper(data);
        } catch (error) {
            console.error('Failed to load paper:', error);
            message.error('Failed to load paper');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaper();
    }, [paperId]);

    const handleAddQuestion = () => {
        setEditingQuestion(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditQuestion = (question: AdminQuestionDto) => {
        setEditingQuestion(question);
        form.setFieldsValue({
            text: question.text,
            type: question.type,
            correctAnswerText: question.correctAnswerText,
            marks: question.marks,
            options: question.options
        });
        setIsModalOpen(true);
    };

    const handleDeleteQuestion = (question: AdminQuestionDto) => {
        Modal.confirm({
            title: 'Delete Question',
            content: 'Are you sure you want to delete this question?',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await adminService.deleteQuestion(paperId, question.id);
                    message.success('Question deleted');
                    fetchPaper();
                } catch (error) {
                    console.error('Failed to delete question:', error);
                    message.error('Failed to delete question');
                }
            }
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            const questionData: QuestionCreateDto = {
                text: values.text,
                type: values.type,
                correctAnswerText: values.correctAnswerText,
                marks: values.marks,
                options: values.type === 'MCQ' ? values.options || [] : []
            };

            if (editingQuestion) {
                await adminService.updateQuestion(paperId, editingQuestion.id, questionData);
                message.success('Question updated');
            } else {
                await adminService.addQuestion(paperId, questionData);
                message.success('Question added');
            }
            setIsModalOpen(false);
            form.resetFields();
            fetchPaper();
        } catch (error) {
            console.error('Failed to save question:', error);
            message.error('Failed to save question');
        }
    };

    if (loading || !paper) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto p-6">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/admin/papers')}
                    className="mb-4"
                >
                    Back to Papers
                </Button>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{paper.name}</h1>
                    <p className="text-gray-600 mt-1">{paper.description}</p>
                    <div className="flex gap-2 mt-3">
                        <Tag color={paper.type === 'MCQ' ? 'blue' : paper.type === 'ESSAY' ? 'green' : 'purple'}>{paper.type}</Tag>
                        <Tag>{paper.questions.length} Questions</Tag>
                        <Tag color="green">{paper.totalAttempts} Attempts</Tag>
                        <Tag color="orange">Avg Score: {paper.averageScore.toFixed(1)}%</Tag>
                    </div>
                </div>

                <Card
                    title="Questions"
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddQuestion}
                        >
                            Add Question
                        </Button>
                    }
                >
                    <List
                        dataSource={paper.questions}
                        renderItem={(question, index) => (
                            <List.Item
                                key={question.id}
                                actions={[
                                    <Button
                                        key="edit"
                                        type="link"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditQuestion(question)}
                                    >
                                        Edit
                                    </Button>,
                                    <Button
                                        key="delete"
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteQuestion(question)}
                                    >
                                        Delete
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Q{index + 1}.</span>
                                            <span>{question.text}</span>
                                            <Tag color={question.type === 'MCQ' ? 'blue' : 'green'}>
                                                {question.type}
                                            </Tag>
                                            <Tag>{question.marks} marks</Tag>
                                        </div>
                                    }
                                    description={
                                        question.type === 'MCQ' && question.options.length > 0 ? (
                                            <div className="ml-6 mt-2">
                                                {question.options.map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-2 mb-1">
                                                        <span className={opt.isCorrect ? 'text-green-600 font-semibold' : ''}>
                                                            {String.fromCharCode(65 + i)}. {opt.text}
                                                            {opt.isCorrect && ' ✓'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="ml-6 mt-2 text-gray-600">
                                                Correct Answer: {question.correctAnswerText}
                                            </div>
                                        )
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>

                <Modal
                    title={editingQuestion ? 'Edit Question' : 'Add Question'}
                    open={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                        form.resetFields();
                    }}
                    onOk={() => form.submit()}
                    width={700}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            name="text"
                            label="Question Text"
                            rules={[{ required: true }]}
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>
                        <Form.Item
                            name="type"
                            label="Type"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Select.Option value="MCQ">Multiple Choice</Select.Option>
                                <Select.Option value="ESSAY">Essay</Select.Option>
                                <Select.Option value="SHORT_ANSWER">Short Answer</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="marks"
                            label="Marks"
                            rules={[{ required: true }]}
                            initialValue={1}
                        >
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>
                        <Form.Item
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.type !== currentValues.type
                            }
                            noStyle
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('type') !== 'MCQ' ? (
                                    <Form.Item
                                        name="correctAnswerText"
                                        label="Correct Answer"
                                        rules={[{ required: true }]}
                                    >
                                        <Input.TextArea rows={2} />
                                    </Form.Item>
                                ) : (
                                    <Form.List name="options">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map((field) => (
                                                    <div key={field.key} className="flex gap-2 mb-2">
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, 'text']}
                                                            className="flex-1 mb-0"
                                                            rules={[{ required: true, message: 'Option text required' }]}
                                                        >
                                                            <Input placeholder="Option text" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, 'isCorrect']}
                                                            valuePropName="checked"
                                                            className="mb-0"
                                                        >
                                                            <Button type={form.getFieldValue(['options', field.name, 'isCorrect']) ? 'primary' : 'default'}>
                                                                ✓ Correct
                                                            </Button>
                                                        </Form.Item>
                                                        <Button danger onClick={() => remove(field.name)}>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button type="dashed" onClick={() => add()} block>
                                                    Add Option
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>
                                )
                            }
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}
