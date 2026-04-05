"use client";

import React, { useState, useRef } from 'react';
import { Modal, Button, Upload, Select, InputNumber, message, Steps, Table, Input, Tag, Alert, Spin, Space, Popconfirm, Tooltip } from 'antd';
import { UploadOutlined, FileTextOutlined, CheckCircleOutlined, EditOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { adminService } from '@/services/adminService';
import { QuestionCreateDto } from '@/types/admin';
import { SubjectDto, LessonDto } from '@/types';

interface ParsedQuestion {
    questionNumber: number;
    text: string;
    type: 'MCQ' | 'ESSAY';
    marks: number | null;
    options: Array<{ text: string; isCorrect: boolean }> | null;
    modelAnswer: string | null;
    startPage: number | null;
    endPage: number | null;
}

interface PdfImportModalProps {
    open: boolean;
    onClose: () => void;
    onImportComplete: (questions: QuestionCreateDto[]) => void;
    paperId: number;
    paperType?: string;
    subjects: SubjectDto[];
    lessons: LessonDto[];
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({
    open,
    onClose,
    onImportComplete,
    paperId,
    paperType,
    subjects,
    lessons
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Step 1: Upload state
    const [questionPdf, setQuestionPdf] = useState<File | null>(null);
    const [answerPdf, setAnswerPdf] = useState<File | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
    const [selectedLesson, setSelectedLesson] = useState<string | undefined>();
    const [selectedPaperType, setSelectedPaperType] = useState<string>(paperType || 'MIXED');
    const [defaultMarks, setDefaultMarks] = useState<number>(1);

    // Step 2: Results state
    const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
    const [paperTitle, setPaperTitle] = useState<string | null>(null);
    const [questionImageUrls, setQuestionImageUrls] = useState<string[]>([]);
    const [editingKey, setEditingKey] = useState<number | null>(null);
    const [editingField, setEditingField] = useState<string | null>(null);

    const handleReset = () => {
        setCurrentStep(0);
        setQuestionPdf(null);
        setAnswerPdf(null);
        setSelectedSubject(undefined);
        setSelectedLesson(undefined);
        setSelectedPaperType(paperType || 'MIXED');
        setDefaultMarks(1);
        setParsedQuestions([]);
        setPaperTitle(null);
        setQuestionImageUrls([]);
        setEditingKey(null);
        setEditingField(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    // Step 1 -> Step 2: Process PDFs
    const handleProcess = async () => {
        if (!questionPdf) {
            message.error('Please upload a question paper PDF');
            return;
        }

        setLoading(true);
        setCurrentStep(1);

        try {
            const result = await adminService.importFromPdf({
                questionPaper: questionPdf,
                answerPaper: answerPdf || undefined,
                subject: selectedSubject,
                lesson: selectedLesson,
                paperType: selectedPaperType,
                defaultMarks
            });

            setParsedQuestions(result.questions);
            setPaperTitle(result.paperTitle);
            setQuestionImageUrls(result.questionImages || []);
            setCurrentStep(2);
            message.success(`Successfully extracted ${result.totalQuestions} questions!`);
        } catch (err: any) {
            message.error(err.message || 'Failed to process PDF');
            setCurrentStep(0);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Save all questions
    const handleSaveAll = async () => {
        if (parsedQuestions.length === 0) {
            message.error('No questions to save');
            return;
        }

        setSaving(true);
        const hideLoading = message.loading(`Saving ${parsedQuestions.length} questions...`, 0);

        try {
            const questionDtos: QuestionCreateDto[] = parsedQuestions.map((q, index) => {
                // Direct 1:1 mapping: questionImageUrls[i] is the stitched image for question[i]
                const imageUrl = questionImageUrls[index] || undefined;

                return {
                    text: q.text,
                    type: q.type as 'MCQ' | 'ESSAY',
                    marks: q.marks || defaultMarks,
                    correctAnswerText: q.modelAnswer || '',
                    imageUrl: imageUrl,
                    requiresImageDisplay: !!imageUrl,
                    options: q.type === 'MCQ' && q.options
                        ? q.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect }))
                        : [],
                    allowImageAnswer: q.type === 'ESSAY',
                    answerTypeHint: q.type === 'ESSAY' ? 'essay' as const : undefined,
                };
            });

            // Save questions one by one (using existing API)
            for (const dto of questionDtos) {
                await adminService.addQuestion(paperId, dto);
            }

            hideLoading();
            message.success(`All ${questionDtos.length} questions saved successfully!`);
            onImportComplete(questionDtos);
            handleClose();
        } catch (err: any) {
            hideLoading();
            message.error(err.message || 'Failed to save questions');
        } finally {
            setSaving(false);
        }
    };

    // Edit a question field inline
    const handleEditQuestion = (index: number, field: string, value: any) => {
        const updated = [...parsedQuestions];
        (updated[index] as any)[field] = value;
        setParsedQuestions(updated);
    };

    // Delete a question
    const handleDeleteQuestion = (index: number) => {
        const updated = parsedQuestions.filter((_, i) => i !== index);
        // Renumber
        updated.forEach((q, i) => q.questionNumber = i + 1);
        setParsedQuestions(updated);
    };

    // Toggle question type
    const handleToggleType = (index: number) => {
        const updated = [...parsedQuestions];
        const q = updated[index];
        if (q.type === 'MCQ') {
            q.type = 'ESSAY';
            q.options = null;
        } else {
            q.type = 'MCQ';
            q.options = q.options || [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ];
        }
        setParsedQuestions(updated);
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'questionNumber',
            key: 'questionNumber',
            width: 50,
            render: (num: number, record: ParsedQuestion) => (
                <div className="text-center">
                    <span className="font-semibold text-gray-500">Q{num}</span>
                    {record.startPage && (
                        <div className="text-[10px] text-gray-400">p.{record.startPage}</div>
                    )}
                </div>
            )
        },
        {
            title: 'Question Text',
            dataIndex: 'text',
            key: 'text',
            render: (text: string, _: any, index: number) => (
                editingKey === index && editingField === 'text' ? (
                    <Input.TextArea
                        autoFocus
                        defaultValue={text}
                        rows={3}
                        onBlur={(e) => {
                            handleEditQuestion(index, 'text', e.target.value);
                            setEditingKey(null);
                            setEditingField(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setEditingKey(null);
                                setEditingField(null);
                            }
                        }}
                    />
                ) : (
                    <div
                        className="cursor-pointer hover:bg-blue-50 rounded p-1 -m-1 transition-colors"
                        onClick={() => { setEditingKey(index); setEditingField('text'); }}
                    >
                        <span className="text-sm whitespace-pre-wrap">{text || <span className="text-gray-400 italic">Click to edit...</span>}</span>
                    </div>
                )
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 90,
            render: (type: string, _: any, index: number) => (
                <Tag
                    color={type === 'MCQ' ? 'blue' : 'green'}
                    className="cursor-pointer"
                    onClick={() => handleToggleType(index)}
                >
                    {type}
                </Tag>
            )
        },
        {
            title: 'Marks',
            dataIndex: 'marks',
            key: 'marks',
            width: 80,
            render: (marks: number | null, _: any, index: number) => (
                <InputNumber
                    min={1}
                    max={100}
                    size="small"
                    value={marks || defaultMarks}
                    onChange={(val) => handleEditQuestion(index, 'marks', val)}
                    className="w-16"
                />
            )
        },
        {
            title: 'Answer / Options',
            key: 'answer',
            width: 280,
            render: (_: any, record: ParsedQuestion, index: number) => {
                if (record.type === 'MCQ' && record.options) {
                    return (
                        <div className="space-y-1">
                            {record.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-1 text-xs">
                                    <span className={`font-medium ${opt.isCorrect ? 'text-green-600' : 'text-gray-500'}`}>
                                        {String.fromCharCode(65 + oi)}.
                                    </span>
                                    <span className={opt.isCorrect ? 'text-green-600 font-medium' : ''}>
                                        {opt.text}
                                    </span>
                                    {opt.isCorrect && <CheckCircleOutlined className="text-green-500 text-xs" />}
                                </div>
                            ))}
                        </div>
                    );
                }
                return (
                    editingKey === index && editingField === 'modelAnswer' ? (
                        <Input.TextArea
                            autoFocus
                            defaultValue={record.modelAnswer || ''}
                            rows={2}
                            onBlur={(e) => {
                                handleEditQuestion(index, 'modelAnswer', e.target.value);
                                setEditingKey(null);
                                setEditingField(null);
                            }}
                        />
                    ) : (
                        <div
                            className="cursor-pointer hover:bg-blue-50 rounded p-1 -m-1 transition-colors"
                            onClick={() => { setEditingKey(index); setEditingField('modelAnswer'); }}
                        >
                            <span className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3">
                                {record.modelAnswer || <span className="text-gray-400 italic">Click to add answer...</span>}
                            </span>
                        </div>
                    )
                );
            }
        },
        {
            title: '',
            key: 'actions',
            width: 50,
            render: (_: any, __: any, index: number) => (
                <Popconfirm
                    title="Delete this question?"
                    onConfirm={() => handleDeleteQuestion(index)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }
    ];

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <FilePdfOutlined className="text-red-500" />
                    <span>Import Questions from PDF</span>
                </div>
            }
            open={open}
            onCancel={handleClose}
            width={currentStep === 2 ? 1000 : 600}
            footer={null}
            destroyOnClose
        >
            <Steps
                current={currentStep}
                className="mb-6"
                size="small"
                items={[
                    { title: 'Upload PDFs' },
                    { title: 'Processing' },
                    { title: 'Review & Save' }
                ]}
            />

            {/* ===== Step 0: Upload ===== */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    {/* Question Paper Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Paper PDF <span className="text-red-500">*</span>
                        </label>
                        <Upload
                            accept=".pdf"
                            maxCount={1}
                            beforeUpload={(file) => {
                                setQuestionPdf(file);
                                return false; // Prevent auto-upload
                            }}
                            onRemove={() => setQuestionPdf(null)}
                            fileList={questionPdf ? [{
                                uid: '-1',
                                name: questionPdf.name,
                                status: 'done',
                                size: questionPdf.size
                            } as UploadFile] : []}
                        >
                            <Button icon={<UploadOutlined />} block>
                                Select Question Paper PDF
                            </Button>
                        </Upload>
                    </div>

                    {/* Answer Paper Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Answer / Mark Scheme PDF <span className="text-gray-400">(optional)</span>
                        </label>
                        <Upload
                            accept=".pdf"
                            maxCount={1}
                            beforeUpload={(file) => {
                                setAnswerPdf(file);
                                return false;
                            }}
                            onRemove={() => setAnswerPdf(null)}
                            fileList={answerPdf ? [{
                                uid: '-2',
                                name: answerPdf.name,
                                status: 'done',
                                size: answerPdf.size
                            } as UploadFile] : []}
                        >
                            <Button icon={<UploadOutlined />} block>
                                Select Answer/Mark Scheme PDF
                            </Button>
                        </Upload>
                    </div>

                    {/* Context Options */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <Select
                                placeholder="Select subject"
                                allowClear
                                className="w-full"
                                value={selectedSubject}
                                onChange={setSelectedSubject}
                                showSearch
                                optionFilterProp="children"
                            >
                                {subjects.map(s => (
                                    <Select.Option key={s.id} value={s.name}>{s.name}</Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paper Type</label>
                            <Select
                                value={selectedPaperType}
                                onChange={setSelectedPaperType}
                                className="w-full"
                            >
                                <Select.Option value="MCQ">MCQ Only</Select.Option>
                                <Select.Option value="ESSAY">Essay Only</Select.Option>
                                <Select.Option value="MIXED">Mixed (Auto-detect)</Select.Option>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson (Optional)</label>
                            <Select
                                placeholder="Select lesson"
                                allowClear
                                className="w-full"
                                value={selectedLesson}
                                onChange={setSelectedLesson}
                                showSearch
                                optionFilterProp="children"
                            >
                                {lessons.map(l => (
                                    <Select.Option key={l.id} value={l.name}>{l.name}</Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Default Marks</label>
                            <InputNumber
                                min={1}
                                value={defaultMarks}
                                onChange={(val) => setDefaultMarks(val || 1)}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={handleClose} className="mr-2">Cancel</Button>
                        <Button
                            type="primary"
                            onClick={handleProcess}
                            disabled={!questionPdf}
                            icon={<FileTextOutlined />}
                        >
                            Process with AI
                        </Button>
                    </div>
                </div>
            )}

            {/* ===== Step 1: Processing ===== */}
            {currentStep === 1 && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Spin size="large" />
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-700">Processing PDFs with AI...</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Gemini is reading your paper and extracting questions.
                            <br />This may take 15-30 seconds depending on the paper length.
                        </p>
                    </div>
                </div>
            )}

            {/* ===== Step 2: Review & Edit ===== */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    {paperTitle && (
                        <Alert
                            message={`Detected Paper: ${paperTitle}`}
                            type="info"
                            showIcon
                        />
                    )}

                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm text-gray-600">
                                {parsedQuestions.length} questions extracted
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                                (Click any cell to edit • Click type tag to toggle MCQ/Essay)
                            </span>
                        </div>
                        <Space>
                            <Button onClick={() => { setCurrentStep(0); setParsedQuestions([]); setQuestionImageUrls([]); }}>
                                Re-upload
                            </Button>
                        </Space>
                    </div>

                    <Table
                        dataSource={parsedQuestions}
                        columns={columns}
                        rowKey="questionNumber"
                        pagination={false}
                        size="small"
                        scroll={{ y: 400 }}
                        className="border rounded-lg"
                    />

                    <div className="flex justify-between pt-4 border-t">
                        <span className="text-sm text-gray-500 self-center">
                            Total: {parsedQuestions.length} questions •
                            {parsedQuestions.reduce((sum, q) => sum + (q.marks || defaultMarks), 0)} marks
                            {questionImageUrls.length > 0 && (
                                <span className="text-green-600 ml-1">• {questionImageUrls.length} question images</span>
                            )}
                        </span>
                        <Space>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button
                                type="primary"
                                onClick={handleSaveAll}
                                loading={saving}
                                disabled={parsedQuestions.length === 0}
                                icon={<CheckCircleOutlined />}
                            >
                                Save All {parsedQuestions.length} Questions
                            </Button>
                        </Space>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default PdfImportModal;
