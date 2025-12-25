"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Form, Input, Select, InputNumber, message, Modal, Tag, List, Switch } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { AdminPaperDto, QuestionCreateDto, AdminQuestionDto } from '@/types/admin';

import { MarksSummary } from '@/components/admin/MarksSummary';
import { ImageUploadExtractor } from '@/components/ImageUploadExtractor';

const BooleanButton = ({ value, onChange }: { value?: boolean; onChange?: (val: boolean) => void }) => (
    <Button
        type={value ? 'primary' : 'default'}
        onClick={() => onChange?.(!value)}
    >
        ✓ Correct
    </Button>
);

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
            options: question.options,
            imageUrl: question.imageUrl,
            requiresImageDisplay: question.requiresImageDisplay,
            hideQuestionText: question.hideQuestionText,
            allowImageAnswer: question.allowImageAnswer,
            answerTypeHint: question.answerTypeHint,
            modelAnswerImageUrl: question.modelAnswerImageUrl
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
            let correctAnswerText = values.correctAnswerText;

            // Sanitize options to only include necessary fields
            let options = values.type === 'MCQ' ? (values.options || []).map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                isCorrect: !!opt.isCorrect // Ensure boolean
            })) : [];

            // For MCQs, derive correctAnswerText from the correct option
            if (values.type === 'MCQ') {
                const correctOption = options.find((opt: any) => opt.isCorrect);
                if (correctOption) {
                    correctAnswerText = correctOption.text;
                }
            }

            const questionData: QuestionCreateDto = {
                text: values.text,
                type: values.type,
                correctAnswerText: correctAnswerText,
                marks: values.marks,
                options: options,
                imageUrl: values.imageUrl,
                requiresImageDisplay: values.requiresImageDisplay,
                hideQuestionText: values.hideQuestionText,
                allowImageAnswer: values.allowImageAnswer,
                answerTypeHint: values.answerTypeHint,
                modelAnswerImageUrl: values.modelAnswerImageUrl
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
        } catch (error: any) {
            console.error('Failed to save question:', error);
            // Try to show more specific error from backend if available
            const errorMsg = error.response?.data?.message || 'Failed to save question';
            message.error(errorMsg);
        }
    };

    if (loading || !paper) {
        return (
            <div className="min-h-screen bg-gray-50">

                <div className="max-w-7xl mx-auto p-6">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

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

                {/* Marks Allocation Summary */}
                <MarksSummary paper={paper} />

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

                        <Form.Item name="imageUrl" hidden>
                            <Input />
                        </Form.Item>

                        <div className="mb-4">
                            <ImageUploadExtractor
                                endpoint="/api/questions/extract-from-image"
                                onExtractionComplete={(text, url) => {
                                    form.setFieldsValue({
                                        text: text,
                                        imageUrl: url
                                    });
                                }}
                                label="Upload Question Image"
                            />
                        </div>

                        <Form.Item
                            name="type"
                            label="Type"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Select.Option value="MCQ">Multiple Choice</Select.Option>
                                <Select.Option value="ESSAY">Essay / Short Answer</Select.Option>
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
                                    <>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <Form.Item
                                                name="requiresImageDisplay"
                                                valuePropName="checked"
                                                initialValue={false}
                                                label="Display Image With Question?"
                                                tooltip="If checked, the uploaded image will be shown to students alongside the text."
                                            >
                                                <Switch checkedChildren="Yes" unCheckedChildren="No" />
                                            </Form.Item>

                                            <Form.Item
                                                name="hideQuestionText"
                                                valuePropName="checked"
                                                initialValue={false}
                                                label="Hide Question Text?"
                                                tooltip="If checked, only the image will be shown to students (useful for image-based questions)."
                                            >
                                                <Switch checkedChildren="Yes" unCheckedChildren="No" />
                                            </Form.Item>

                                            <Form.Item
                                                name="allowImageAnswer"
                                                valuePropName="checked"
                                                initialValue={true}
                                                label="Allow Image Answers?"
                                                tooltip="If checked, students can upload images as answers."
                                            >
                                                <Switch checkedChildren="Yes" unCheckedChildren="No" />
                                            </Form.Item>
                                        </div>

                                        <Form.Item
                                            name="answerTypeHint"
                                            label="Answer Type Hint"
                                            initialValue="essay"
                                            tooltip="Helps UI suggest the best input method to students"
                                        >
                                            <Select>
                                                <Select.Option value="short">Short Answer (Text recommended)</Select.Option>
                                                <Select.Option value="essay">Essay (Both allowed)</Select.Option>
                                                <Select.Option value="diagram">Diagram (Image recommended)</Select.Option>
                                            </Select>
                                        </Form.Item>

                                        <div className="border-t pt-4 mt-4">
                                            <h3 className="font-medium mb-3">Model Answer (Grading Reference)</h3>

                                            <Form.Item name="modelAnswerImageUrl" hidden>
                                                <Input />
                                            </Form.Item>

                                            <div className="mb-4">
                                                <ImageUploadExtractor
                                                    endpoint="/api/questions/extract-from-image"
                                                    additionalData={{ paperId: paperId }}
                                                    onExtractionComplete={(text, url) => {
                                                        const currentText = form.getFieldValue('correctAnswerText') || '';
                                                        const newText = currentText ? `${currentText}\n\n[Extracted from Image]: ${text}` : text;

                                                        form.setFieldsValue({
                                                            correctAnswerText: newText,
                                                            modelAnswerImageUrl: url
                                                        });
                                                    }}
                                                    label="Upload Model Answer Image"
                                                />
                                            </div>

                                            <Form.Item
                                                name="correctAnswerText"
                                                label="Model Answer Text / Explanation"
                                                rules={[{ required: true }]}
                                                tooltip="Used by AI for grading. Be descriptive."
                                            >
                                                <Input.TextArea rows={4} />
                                            </Form.Item>
                                        </div>
                                    </>
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
                                                            className="mb-0"
                                                        >
                                                            <BooleanButton />
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
