"use client";

import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    InputNumber,
    Select,
    Switch,
    message,
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    LoadingOutlined,
    PlusOutlined,
    DeleteOutlined,
    FilePdfOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { adminService } from '@/services/adminService';

// ─── Types ────────────────────────────────────────────────────────────────────

type PaperType = 'MCQ' | 'ESSAY' | 'MIXED';
type PairStatus = 'idle' | 'extracting' | 'creating' | 'saving' | 'done' | 'failed';

interface PaperPair {
    id: string;
    questionPaper: File | null;
    answerPaper: File | null;
    // runtime state
    status: PairStatus;
    progress: { current: number; total: number } | null;
    error: string | null;
    result: { paperId: number; paperName: string; questionCount: number } | null;
}

interface BatchConfig {
    subject: string;
    lesson: string;
    defaultMarks: number;
    maxFreeAttempts: number;
    bundleIds: number[];
    paperTypeOverride: PaperType | '';
    autoHide: boolean;
}

const DEFAULT_CONFIG: BatchConfig = {
    subject: '',
    lesson: '',
    defaultMarks: 5,
    maxFreeAttempts: 3,
    bundleIds: [],
    paperTypeOverride: '',
    autoHide: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2);

const STATUS_META: Record<PairStatus, { label: string; color: string; icon?: React.ReactNode }> = {
    idle:       { label: 'Waiting',              color: 'text-gray-400' },
    extracting: { label: 'Extracting from PDF…', color: 'text-blue-600',   icon: <LoadingOutlined spin /> },
    creating:   { label: 'Creating paper…',      color: 'text-indigo-600', icon: <LoadingOutlined spin /> },
    saving:     { label: 'Saving questions…',    color: 'text-purple-600', icon: <LoadingOutlined spin /> },
    done:       { label: 'Done',                 color: 'text-emerald-600', icon: <CheckCircleFilled /> },
    failed:     { label: 'Failed',               color: 'text-red-500',    icon: <CloseCircleFilled /> },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BatchImportPage() {
    const router = useRouter();

    const [pairs, setPairs] = useState<PaperPair[]>([
        { id: uid(), questionPaper: null, answerPaper: null, status: 'idle', progress: null, error: null, result: null },
    ]);
    const [config, setConfig] = useState<BatchConfig>(DEFAULT_CONFIG);
    const [running, setRunning] = useState(false);

    // ref so processPair always sees current pairs without stale closure
    const pairsRef = useRef(pairs);
    pairsRef.current = pairs;

    // ── Pair management ───────────────────────────────────────────────────────

    const addPair = () =>
        setPairs(p => [...p, { id: uid(), questionPaper: null, answerPaper: null, status: 'idle', progress: null, error: null, result: null }]);

    const removePair = (id: string) =>
        setPairs(p => p.filter(x => x.id !== id));

    const resetPair = (id: string) =>
        setPairs(p => p.map(x => x.id === id ? { ...x, status: 'idle', error: null, result: null, progress: null } : x));

    const updatePair = useCallback((id: string, patch: Partial<PaperPair>) => {
        setPairs(p => p.map(x => x.id === id ? { ...x, ...patch } : x));
    }, []);

    const setFile = (id: string, field: 'questionPaper' | 'answerPaper', file: File | null) => {
        // reset status when files change
        setPairs(p => p.map(x => x.id === id
            ? { ...x, [field]: file, status: 'idle', error: null, result: null, progress: null }
            : x
        ));
    };

    // ── Pipeline ──────────────────────────────────────────────────────────────

    const processPair = async (pair: PaperPair): Promise<void> => {
        if (!pair.questionPaper) {
            updatePair(pair.id, { status: 'failed', error: 'No question paper uploaded' });
            return;
        }

        try {
            // ── Step 1: Extract ──────────────────────────────────────────────
            updatePair(pair.id, { status: 'extracting', error: null, result: null, progress: null });

            const extraction = await adminService.importFromPdf({
                questionPaper: pair.questionPaper,
                answerPaper:   pair.answerPaper ?? undefined,
                subject:       config.subject   || undefined,
                lesson:        config.lesson    || undefined,
                paperType:     config.paperTypeOverride || undefined,
                defaultMarks:  config.defaultMarks,
            });

            const { questions, questionImages, paperTitle, totalQuestions } = extraction;

            if (!questions || questions.length === 0) {
                throw new Error('No questions could be extracted from the PDF');
            }

            // ── Step 2: Create paper ─────────────────────────────────────────
            updatePair(pair.id, { status: 'creating' });

            // Auto-detect paper type if not overridden
            let derivedType: PaperType = config.paperTypeOverride || 'ESSAY';
            if (!config.paperTypeOverride) {
                const types = new Set(questions.map(q => q.type));
                derivedType = types.size > 1 ? 'MIXED' : (types.has('MCQ') ? 'MCQ' : 'ESSAY');
            }

            const paperName = paperTitle?.trim() ||
                `${pair.questionPaper.name.replace(/\.pdf$/i, '')} – ${new Date().toLocaleDateString('en-GB')}`;

            const paper = await adminService.createPaper({
                name:            paperName,
                description:     `Auto-imported from PDF. ${totalQuestions} question${totalQuestions !== 1 ? 's' : ''}.`,
                type:            derivedType,
                maxFreeAttempts: config.maxFreeAttempts,
                totalMarks:      100,
                bundleIds:       config.bundleIds.length > 0 ? config.bundleIds : undefined,
            });

            // ── Step 3: Save questions one by one ────────────────────────────
            updatePair(pair.id, { status: 'saving', progress: { current: 0, total: questions.length } });

            for (let i = 0; i < questions.length; i++) {
                const q     = questions[i];
                const imgUrl = (questionImages ?? [])[i] ?? undefined;

                await adminService.addQuestion(paper.id, {
                    text:               q.text,
                    type:               q.type as 'MCQ' | 'ESSAY',
                    marks:              q.marks ?? config.defaultMarks,
                    correctAnswerText:  q.modelAnswer ?? '',
                    imageUrl:           imgUrl,
                    requiresImageDisplay: !!imgUrl,
                    // Hide question text automatically when an image exists (image-based question)
                    hideQuestionText:   config.autoHide && !!imgUrl,
                    options:            q.type === 'MCQ' && q.options ? q.options : [],
                    allowImageAnswer:   q.type === 'ESSAY',
                    answerTypeHint:     q.type === 'ESSAY' ? 'essay' : undefined,
                });

                updatePair(pair.id, { progress: { current: i + 1, total: questions.length } });
            }

            // ── Done ─────────────────────────────────────────────────────────
            updatePair(pair.id, {
                status:   'done',
                progress: null,
                result:   { paperId: paper.id, paperName: paperName, questionCount: questions.length },
            });

        } catch (err: any) {
            updatePair(pair.id, {
                status: 'failed',
                error:  err?.message || 'Unknown error',
                progress: null,
            });
            // rethrow so the batch runner knows to stop
            throw err;
        }
    };

    const runBatch = async () => {
        const targets = pairsRef.current.filter(p => p.status === 'idle' || p.status === 'failed');
        if (targets.length === 0) {
            message.info('No papers to process. Add pairs or reset failed ones.');
            return;
        }
        if (targets.some(p => !p.questionPaper)) {
            message.error('One or more pairs are missing a question paper PDF');
            return;
        }

        setRunning(true);
        let successCount = 0;
        let failCount    = 0;

        for (const pair of targets) {
            try {
                await processPair(pair);
                successCount++;
            } catch {
                failCount++;
                // Continue with next pair even if one fails
            }
        }

        setRunning(false);

        if (failCount === 0) {
            message.success(`All ${successCount} paper${successCount !== 1 ? 's' : ''} imported successfully!`);
        } else {
            message.warning(`${successCount} succeeded, ${failCount} failed. Retry the failed ones.`);
        }
    };

    // ── Counts ────────────────────────────────────────────────────────────────

    const counts = {
        idle:   pairs.filter(p => p.status === 'idle').length,
        done:   pairs.filter(p => p.status === 'done').length,
        failed: pairs.filter(p => p.status === 'failed').length,
        active: pairs.filter(p => ['extracting','creating','saving'].includes(p.status)).length,
    };
    const pendingCount = counts.idle + counts.failed;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Top bar ── */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <ArrowLeftOutlined />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Batch Paper Import</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Upload question paper + marking scheme pairs — zero human interaction after start
                            </p>
                        </div>
                    </div>

                    {/* Run button */}
                    <button
                        onClick={runBatch}
                        disabled={running || pendingCount === 0}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                            running || pendingCount === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                        }`}
                    >
                        {running ? <LoadingOutlined spin /> : <PlayCircleOutlined />}
                        {running
                            ? `Processing… (${counts.active} active)`
                            : `Start Import (${pendingCount} pair${pendingCount !== 1 ? 's' : ''})`}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* ── Progress summary bar ── */}
                {(counts.done > 0 || counts.failed > 0) && (
                    <div className="flex items-center gap-6 bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4">
                        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                            <CheckCircleFilled /> {counts.done} done
                        </div>
                        {counts.failed > 0 && (
                            <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                                <CloseCircleFilled /> {counts.failed} failed
                            </div>
                        )}
                        {counts.idle > 0 && (
                            <div className="text-gray-400 text-sm">{counts.idle} waiting</div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── LEFT: Paper pairs ── */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Paper Pairs</h2>
                            <button
                                onClick={addPair}
                                disabled={running}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-indigo-300 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <PlusOutlined /> Add Pair
                            </button>
                        </div>

                        {pairs.map((pair, index) => (
                            <PairRow
                                key={pair.id}
                                pair={pair}
                                index={index}
                                running={running}
                                onSetFile={setFile}
                                onRemove={removePair}
                                onRetry={resetPair}
                                onEdit={(paperId) => router.push(`/admin/papers/${paperId}/edit`)}
                            />
                        ))}

                        <button
                            onClick={addPair}
                            disabled={running}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <PlusOutlined /> Add Another Pair
                        </button>
                    </div>

                    {/* ── RIGHT: Config ── */}
                    <div className="space-y-4">
                        <h2 className="font-bold text-gray-900">Extraction Settings</h2>
                        <ConfigPanel config={config} onChange={setConfig} disabled={running} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── PairRow ──────────────────────────────────────────────────────────────────

function PairRow({
    pair, index, running,
    onSetFile, onRemove, onRetry, onEdit,
}: {
    pair: PaperPair;
    index: number;
    running: boolean;
    onSetFile: (id: string, field: 'questionPaper' | 'answerPaper', file: File | null) => void;
    onRemove: (id: string) => void;
    onRetry:  (id: string) => void;
    onEdit:   (paperId: number) => void;
}) {
    const qRef = useRef<HTMLInputElement>(null);
    const aRef = useRef<HTMLInputElement>(null);
    const isActive = ['extracting', 'creating', 'saving'].includes(pair.status);
    const isDone   = pair.status === 'done';
    const isFailed = pair.status === 'failed';
    const meta = STATUS_META[pair.status];

    // Drag-and-drop
    const handleDrop = (field: 'questionPaper' | 'answerPaper') =>
        (e: React.DragEvent) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') onSetFile(pair.id, field, file);
            else message.error('Please drop a PDF file');
        };

    return (
        <div className={`bg-white rounded-xl border shadow-sm transition-all ${
            isDone   ? 'border-emerald-200 shadow-emerald-50' :
            isFailed ? 'border-red-200 shadow-red-50' :
            isActive ? 'border-indigo-200 shadow-indigo-50' :
                       'border-gray-100'
        }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                    </span>
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${meta.color}`}>
                        {meta.icon} {meta.label}
                        {pair.status === 'saving' && pair.progress && (
                            <span className="text-xs text-gray-400 font-normal ml-1">
                                {pair.progress.current} / {pair.progress.total} questions
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {isFailed && (
                        <button
                            onClick={() => onRetry(pair.id)}
                            disabled={running}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors text-sm disabled:opacity-40"
                            title="Reset and retry"
                        >
                            <ReloadOutlined />
                        </button>
                    )}
                    {isDone && pair.result && (
                        <button
                            onClick={() => onEdit(pair.result!.paperId)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                            title="Open in editor"
                        >
                            <EditOutlined />
                        </button>
                    )}
                    <button
                        onClick={() => onRemove(pair.id)}
                        disabled={isActive}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm disabled:opacity-30"
                        title="Remove pair"
                    >
                        <DeleteOutlined />
                    </button>
                </div>
            </div>

            {/* File drop zones */}
            <div className="grid grid-cols-2 gap-3 p-4">
                <FileDropZone
                    label="Question Paper *"
                    hint="PDF only"
                    file={pair.questionPaper}
                    disabled={isActive || isDone}
                    inputRef={qRef}
                    accentColor="indigo"
                    onDrop={handleDrop('questionPaper')}
                    onSelect={f => onSetFile(pair.id, 'questionPaper', f)}
                    onClear={() => onSetFile(pair.id, 'questionPaper', null)}
                />
                <FileDropZone
                    label="Marking Scheme"
                    hint="Optional PDF"
                    file={pair.answerPaper}
                    disabled={isActive || isDone}
                    inputRef={aRef}
                    accentColor="emerald"
                    onDrop={handleDrop('answerPaper')}
                    onSelect={f => onSetFile(pair.id, 'answerPaper', f)}
                    onClear={() => onSetFile(pair.id, 'answerPaper', null)}
                />
            </div>

            {/* Progress bar */}
            {pair.status === 'saving' && pair.progress && (
                <div className="px-4 pb-3">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${(pair.progress.current / pair.progress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Result banner */}
            {isDone && pair.result && (
                <div className="mx-4 mb-4 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-700 line-clamp-1">{pair.result.paperName}</p>
                        <p className="text-xs text-emerald-500">{pair.result.questionCount} questions saved · ID #{pair.result.paperId}</p>
                    </div>
                    <button
                        onClick={() => onEdit(pair.result!.paperId)}
                        className="text-xs font-semibold text-emerald-700 hover:underline ml-3 flex-shrink-0"
                    >
                        Open →
                    </button>
                </div>
            )}

            {/* Error banner */}
            {isFailed && pair.error && (
                <div className="mx-4 mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-xs text-red-600 font-medium">{pair.error}</p>
                </div>
            )}
        </div>
    );
}

// ─── FileDropZone ─────────────────────────────────────────────────────────────

function FileDropZone({
    label, hint, file, disabled, inputRef, accentColor,
    onDrop, onSelect, onClear,
}: {
    label: string;
    hint: string;
    file: File | null;
    disabled: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
    accentColor: 'indigo' | 'emerald';
    onDrop: (e: React.DragEvent) => void;
    onSelect: (f: File) => void;
    onClear: () => void;
}) {
    const [dragging, setDragging] = useState(false);
    const accent = accentColor === 'indigo'
        ? { border: 'border-indigo-400 bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-400' }
        : { border: 'border-emerald-400 bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-400' };

    return (
        <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">{label}</p>
            {file ? (
                <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${accent.border} ${disabled ? 'opacity-70' : ''}`}>
                    <FilePdfOutlined className={`text-lg flex-shrink-0 ${accent.icon}`} />
                    <span className="text-xs font-medium text-gray-700 truncate flex-1">{file.name}</span>
                    {!disabled && (
                        <button onClick={onClear} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 text-base leading-none">×</button>
                    )}
                </div>
            ) : (
                <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                        disabled ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50' :
                        dragging  ? `${accent.border} scale-[1.01]` :
                                    'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { setDragging(false); onDrop(e); }}
                    onClick={() => !disabled && inputRef.current?.click()}
                >
                    <FilePdfOutlined className={`text-2xl mb-1 ${disabled ? 'text-gray-300' : accent.icon}`} />
                    <p className="text-xs text-gray-400">{hint}</p>
                    <p className="text-xs text-gray-300 mt-0.5">click or drag & drop</p>
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) onSelect(f);
                    e.target.value = '';
                }}
            />
        </div>
    );
}

// ─── ConfigPanel ──────────────────────────────────────────────────────────────

function ConfigPanel({
    config, onChange, disabled,
}: {
    config: BatchConfig;
    onChange: (c: BatchConfig) => void;
    disabled: boolean;
}) {
    const set = <K extends keyof BatchConfig>(key: K, val: BatchConfig[K]) =>
        onChange({ ...config, [key]: val });

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">

            {/* Auto-hide — prominent toggle */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <Switch
                    checked={config.autoHide}
                    onChange={v => set('autoHide', v)}
                    disabled={disabled}
                    size="small"
                />
                <div>
                    <p className="text-sm font-semibold text-indigo-900">Auto-hide question text</p>
                    <p className="text-xs text-indigo-600 mt-0.5">
                        When ON, question text is hidden for students — only the image is shown.
                        Applies to every question that has an extracted image.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Default Marks / Q</label>
                    <InputNumber
                        min={1} max={100}
                        value={config.defaultMarks}
                        onChange={v => set('defaultMarks', v ?? 5)}
                        className="w-full"
                        disabled={disabled}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Free Attempts</label>
                    <InputNumber
                        min={0} max={99}
                        value={config.maxFreeAttempts}
                        onChange={v => set('maxFreeAttempts', v ?? 3)}
                        className="w-full"
                        disabled={disabled}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Paper Type Override</label>
                <Select
                    value={config.paperTypeOverride || undefined}
                    onChange={v => set('paperTypeOverride', v || '')}
                    placeholder="Auto-detect from questions"
                    allowClear
                    className="w-full"
                    disabled={disabled}
                >
                    <Select.Option value="MCQ">MCQ (Multiple Choice)</Select.Option>
                    <Select.Option value="ESSAY">Essay</Select.Option>
                    <Select.Option value="MIXED">Mixed</Select.Option>
                </Select>
                <p className="text-xs text-gray-400 mt-1">Leave blank to detect automatically</p>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Subject context <span className="text-gray-400 font-normal">(improves AI accuracy)</span>
                </label>
                <input
                    type="text"
                    value={config.subject}
                    onChange={e => set('subject', e.target.value)}
                    placeholder="e.g., Chemistry, Physics, Biology"
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Lesson / Topic context <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                    type="text"
                    value={config.lesson}
                    onChange={e => set('lesson', e.target.value)}
                    placeholder="e.g., Organic Chemistry"
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
            </div>

            <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 leading-relaxed">
                    <strong className="text-gray-600">Pipeline per pair:</strong><br />
                    ① Extract questions + answers from PDFs via AI<br />
                    ② Create paper (name auto-derived from PDF)<br />
                    ③ Save all questions (with images + answers)<br />
                    Pairs are processed one at a time — a failure never affects the next pair.
                </p>
            </div>
        </div>
    );
}
