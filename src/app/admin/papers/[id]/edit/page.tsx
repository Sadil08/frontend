"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Form, Input, Select, InputNumber, message, Modal, Tag, List, Switch, FloatButton, Badge as AntBadge, Alert, Space } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DatabaseOutlined, LoadingOutlined } from '@ant-design/icons';
import { adminService } from '@/services/adminService';
import { extractBatch } from '@/services/batchExtractionService';
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

    // Batch processing state
    const [batchQueue, setBatchQueue] = useState<Map<string, { file: File, questionId: number, field: 'question' | 'modelAnswer' }>>(new Map());
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);
    const [tempQueuedFiles, setTempQueuedFiles] = useState<Map<'question' | 'modelAnswer', File>>(new Map());

    // NEW: Local queue for questions not yet saved to database
    const [pendingQuestions, setPendingQuestions] = useState<Array<{
        formValues: any,
        files: Map<'question' | 'modelAnswer', File>,
        tempId: string
    }>>([]);

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
        setTempQueuedFiles(new Map());
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditQuestion = (question: AdminQuestionDto) => {
        setEditingQuestion(question);
        setTempQueuedFiles(new Map());
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

            let savedQuestionId;
            if (editingQuestion) {
                await adminService.updateQuestion(paperId, editingQuestion.id, questionData);
                savedQuestionId = editingQuestion.id;
                message.success('Question updated');
            } else {
                const response = await adminService.addQuestion(paperId, questionData);
                savedQuestionId = response.id;
                message.success('Question added');
            }

            // If there's files queued in the modal, add them to the parent batch queue for existing questions
            if (tempQueuedFiles.size > 0 && savedQuestionId) {
                const newQueue = new Map(batchQueue);
                tempQueuedFiles.forEach((file, field) => {
                    const key = `${savedQuestionId}_${field}`;
                    newQueue.set(key, {
                        file,
                        questionId: savedQuestionId,
                        field
                    });
                });
                setBatchQueue(newQueue);
            }

            setTempQueuedFiles(new Map());

            setIsModalOpen(false);
            form.resetFields();
            fetchPaper();
        } catch (error: any) {
            console.error('Failed to save question:', error);
            const errorMsg = error.response?.data?.message || 'Failed to save question';
            message.error(errorMsg);
        }
    };

    /**
     * QUEUE FOR BATCH (Does not save to database yet)
     */
    const handleQueueForBatch = async () => {
        try {
            const values = await form.validateFields();

            if (tempQueuedFiles.size === 0) {
                message.warning("No images queued for batch processing.");
                return;
            }

            setPendingQuestions([...pendingQuestions, {
                formValues: values,
                files: new Map(tempQueuedFiles),
                tempId: `pending-${Date.now()}`
            }]);

            message.success("Question queued locally for batch processing.");
            setIsModalOpen(false);
            form.resetFields();
            setTempQueuedFiles(new Map());
        } catch (error) {
            // Validation failed
            message.error("Please fill required fields before queuing.");
        }
    };

    /**
     * Process all items in the batch queue
     */
    const handleProcessBatch = async () => {
        if ((batchQueue.size === 0 && pendingQuestions.length === 0) || !paper) return;

        setIsProcessingBatch(true);
        const totalItems = batchQueue.size + pendingQuestions.reduce((acc, pq) => acc + pq.files.size, 0);
        const hideLoading = message.loading(`Processing batch of ${totalItems} extractions...`, 0);

        try {
            const batchItems: any[] = [];

            // 1. Add existing question items
            batchQueue.forEach((q, key) => {
                batchItems.push({
                    id: `existing_${key}`,
                    file: q.file
                });
            });

            // 2. Add pending question items
            pendingQuestions.forEach((pq, idx) => {
                pq.files.forEach((file, field) => {
                    batchItems.push({
                        id: `pending_${idx}_${field}`,
                        file: file
                    });
                });
            });

            // Use the batch service
            const response = await extractBatch(batchItems);

            // 3. Update existing questions
            const existingResults = response.results.filter(r => r.id.startsWith('existing_'));
            for (const result of existingResults) {
                const key = result.id.replace('existing_', '');
                const [qId, field] = key.split('_');
                const questionId = Number(qId);

                const q = paper.questions.find(q => q.id === questionId);
                if (q) {
                    const updateData: QuestionCreateDto = {
                        ...q,
                        text: field === 'question' ? result.extractedText : q.text,
                        imageUrl: field === 'question' ? result.imageUrl : q.imageUrl,
                        modelAnswerImageUrl: field === 'modelAnswer' ? result.imageUrl : q.modelAnswerImageUrl,
                        correctAnswerText: field === 'modelAnswer' ? result.extractedText : q.correctAnswerText
                    };
                    await adminService.updateQuestion(paperId, questionId, updateData);
                }
            }

            // 4. Create pending questions
            const pendingResultsByIdx = new Map<number, Map<string, any>>();
            response.results.filter(r => r.id.startsWith('pending_')).forEach(r => {
                const parts = r.id.split('_');
                const idx = Number(parts[1]);
                const field = parts[2];

                if (!pendingResultsByIdx.has(idx)) pendingResultsByIdx.set(idx, new Map());
                pendingResultsByIdx.get(idx)!.set(field, r);
            });

            for (const [idx, results] of pendingResultsByIdx.entries()) {
                const pq = pendingQuestions[idx];
                const qResult = results.get('question');
                const mResult = results.get('modelAnswer');

                // Sanitize options to only include necessary fields
                let options = pq.formValues.type === 'MCQ' ? (pq.formValues.options || []).map((opt: any) => ({
                    id: opt.id,
                    text: opt.text,
                    isCorrect: !!opt.isCorrect // Ensure boolean
                })) : [];

                let correctAnswerText = pq.formValues.correctAnswerText;
                if (mResult) {
                    correctAnswerText = mResult.extractedText;
                }

                // If MCQ, derive correct answer from options
                if (pq.formValues.type === 'MCQ') {
                    const correctOption = options.find((opt: any) => opt.isCorrect);
                    if (correctOption) {
                        correctAnswerText = correctOption.text;
                    }
                }

                const questionData: QuestionCreateDto = {
                    ...pq.formValues,
                    text: qResult ? qResult.extractedText : pq.formValues.text,
                    imageUrl: qResult ? qResult.imageUrl : pq.formValues.imageUrl,
                    correctAnswerText: correctAnswerText,
                    modelAnswerImageUrl: mResult ? mResult.imageUrl : pq.formValues.modelAnswerImageUrl,
                    options: options
                };

                await adminService.addQuestion(paperId, questionData);
            }

            message.success(`Batch processing complete! All questions saved and updated.`);
            setBatchQueue(new Map());
            setPendingQuestions([]);
            fetchPaper();
        } catch (error: any) {
            console.error('Batch extraction failed:', error);
            message.error(error.message || 'Batch extraction failed');
        } finally {
            setIsProcessingBatch(false);
            hideLoading();
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

                {batchQueue.size > 0 && (
                    <Alert
                        message={`You have ${batchQueue.size} items queued for AI extraction.`}
                        type="info"
                        showIcon
                        action={
                            <Button size="small" type="primary" onClick={handleProcessBatch} loading={isProcessingBatch}>
                                Process All Queued Items
                            </Button>
                        }
                        className="mb-4"
                    />
                )}

                <Card
                    title="Questions"
                    extra={
                        <Space>
                            {(batchQueue.size > 0 || pendingQuestions.length > 0) && (
                                <Button
                                    icon={<DatabaseOutlined />}
                                    onClick={handleProcessBatch}
                                    loading={isProcessingBatch}
                                    danger
                                >
                                    Process Batch ({batchQueue.size + pendingQuestions.length})
                                </Button>
                            )}
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddQuestion}
                            >
                                Add Question
                            </Button>
                        </Space>
                    }
                >
                    <List
                        dataSource={[
                            ...paper.questions,
                            ...pendingQuestions.map((pq, idx) => ({
                                id: -1 - idx, // Negative ID for pending
                                text: pq.formValues.text || `[Pending AI Extraction ${idx + 1}]`,
                                type: pq.formValues.type,
                                marks: pq.formValues.marks,
                                isPending: true,
                                options: pq.formValues.options || [],
                                correctAnswerText: pq.formValues.correctAnswerText
                            }))
                        ]}
                        renderItem={(question: any, index) => (
                            <List.Item
                                key={question.id}
                                className={question.isPending ? 'bg-orange-50 border-orange-200' : ''}
                                actions={question.isPending ? [
                                    <Tag color="orange" icon={<LoadingOutlined />}>Queued for Batch</Tag>
                                ] : [
                                    <Button
                                        key="edit"
                                        type="link"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditQuestion(question as AdminQuestionDto)}
                                    >
                                        Edit
                                    </Button>,
                                    <Button
                                        key="delete"
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteQuestion(question as AdminQuestionDto)}
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
                                        question.type === 'MCQ' && (question.options || []).length > 0 ? (
                                            <div className="ml-6 mt-2">
                                                {(question.options || []).map((opt: any, i: number) => (
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
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setIsModalOpen(false);
                            form.resetFields();
                        }}>
                            Cancel
                        </Button>,
                        (!editingQuestion && tempQueuedFiles.size > 0) && (
                            <Button key="queue" type="dashed" onClick={handleQueueForBatch} icon={<DatabaseOutlined />} className="border-orange-500 text-orange-600">
                                Queue for Batch
                            </Button>
                        ),
                        <Button key="submit" type="primary" onClick={() => form.submit()}>
                            {editingQuestion ? 'Update Question' : 'Add Question'}
                        </Button>
                    ]}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            name="text"
                            label="Question Text"
                            rules={[{
                                required: !tempQueuedFiles.has('question'),
                                message: 'Please enter question text or add an image to batch'
                            }]}
                        >
                            <Input.TextArea rows={3} placeholder={tempQueuedFiles.has('question') ? "Text will be extracted in batch..." : "Enter question text..."} />
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
                                    // Remove from temp queue if extracted immediately
                                    const newTemp = new Map(tempQueuedFiles);
                                    newTemp.delete('question');
                                    setTempQueuedFiles(newTemp);
                                }}
                                onQueued={(file) => {
                                    const newTemp = new Map(tempQueuedFiles);
                                    newTemp.set('question', file);
                                    setTempQueuedFiles(newTemp);
                                }}
                                allowBatch={true}
                                isQueued={tempQueuedFiles.has('question')}
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
                                                        form.setFieldsValue({
                                                            correctAnswerText: text,
                                                            modelAnswerImageUrl: url
                                                        });
                                                        // Remove from temp queue if extracted immediately
                                                        const newTemp = new Map(tempQueuedFiles);
                                                        newTemp.delete('modelAnswer');
                                                        setTempQueuedFiles(newTemp);
                                                    }}
                                                    onQueued={(file) => {
                                                        const newTemp = new Map(tempQueuedFiles);
                                                        newTemp.set('modelAnswer', file);
                                                        setTempQueuedFiles(newTemp);
                                                    }}
                                                    allowBatch={true}
                                                    isQueued={tempQueuedFiles.has('modelAnswer')}
                                                    label="Upload Model Answer Image"
                                                />
                                            </div>

                                            <Form.Item
                                                name="correctAnswerText"
                                                label="Model Answer Text / Explanation"
                                                rules={[{
                                                    required: !tempQueuedFiles.has('modelAnswer'),
                                                    message: 'Please enter model answer or add an image to batch'
                                                }]}
                                                tooltip="Used by AI for grading. Be descriptive."
                                            >
                                                <Input.TextArea rows={4} placeholder={tempQueuedFiles.has('modelAnswer') ? "Text will be extracted in batch..." : "Enter model answer..."} />
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

                {/* Batch Process Floating Button */}
                {(batchQueue.size > 0 || pendingQuestions.length > 0) && (
                    <FloatButton
                        icon={isProcessingBatch ? <LoadingOutlined /> : <DatabaseOutlined />}
                        type="primary"
                        onClick={handleProcessBatch}
                        tooltip={<div>Process {batchQueue.size + pendingQuestions.length} queued items</div>}
                        badge={{ count: batchQueue.size + pendingQuestions.length, color: 'orange' }}
                        style={{ right: 94, bottom: 24, width: 64, height: 64 }}
                    />
                )}
            </div>
        </div>
    );
}
