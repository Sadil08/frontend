import React, { useState } from 'react';
import { Upload, Button, message, Spin, Badge, Alert, Progress, Space } from 'antd';
import { UploadOutlined, DatabaseOutlined, SyncOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useUploadLimit } from '@/hooks/useUploadLimit';
import { compressImage, formatFileSize, COMPRESSION_PRESETS } from '@/utils/imageCompressor';

interface ImageUploadExtractorProps {
    endpoint: string;
    onExtractionComplete: (text: string, imageUrl: string) => void;
    onQueued?: (file: File) => void;
    label?: string;
    additionalData?: Record<string, any>;
    // New extraction tracking props
    attemptId?: number;  // Required for student extraction tracking
    questionId?: number; // Required for student extraction tracking
    extractionsUsed?: number;  // From backend response
    extractionsMax?: number;   // Default: 2
    onExtractionCountUpdate?: (used: number, remaining: number) => void;  // Callback for extraction count changes
    // Old props (keep for backward compatibility with admin)
    answerId?: number;
    uploadCount?: number;
    maxUploads?: number;
    allowBatch?: boolean;
    isQueued?: boolean;
}

export const ImageUploadExtractor: React.FC<ImageUploadExtractorProps> = ({
    endpoint,
    onExtractionComplete,
    onQueued,
    label = "Upload Image & Extract Text",
    additionalData = {},
    attemptId,
    questionId,
    extractionsUsed: initialExtractionsUsed = 0,
    extractionsMax = 2,
    onExtractionCountUpdate,
    answerId,
    uploadCount = 0,
    maxUploads = 2,
    allowBatch = false,
    isQueued: initialIsQueued = false
}) => {
    const [loading, setLoading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [compressedFile, setCompressedFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'compressed' | 'queued' | 'extracted'>(
        initialIsQueued ? 'queued' : 'idle'
    );

    // Track extractions (for new system)
    const [extractionsUsed, setExtractionsUsed] = useState(initialExtractionsUsed);
    const [extractionsRemaining, setExtractionsRemaining] = useState(extractionsMax - initialExtractionsUsed);

    // Legacy upload limit (for backward compatibility)
    const uploadLimit = useUploadLimit(uploadCount, maxUploads);

    // Sync extractionsUsed state with props when attempts change (e.g. new attempt started)
    React.useEffect(() => {
        setExtractionsUsed(initialExtractionsUsed);
        setExtractionsRemaining(extractionsMax - initialExtractionsUsed);
    }, [initialExtractionsUsed, extractionsMax]);

    // Determine if using new extraction tracking
    const isExtractionTracking = attemptId !== undefined && questionId !== undefined;
    const canExtract = isExtractionTracking ? extractionsUsed < extractionsMax : uploadLimit.canUpload;

    const handleFileSelect = async (options: any) => {
        const { file, onSuccess, onError } = options;

        // Reset state
        setCompressedFile(null);
        setStatus('idle');

        // Check extraction limit before proceeding
        if (isExtractionTracking && !canExtract) {
            message.error(`Extraction limit reached. Maximum ${extractionsMax} extractions allowed per question.`);
            onError(new Error('Extraction limit reached'));
            return;
        }

        // Legacy: Check upload limit for old system
        if (answerId && !isExtractionTracking && !uploadLimit.canUpload) {
            message.error(`Upload limit reached. Maximum ${maxUploads} uploads allowed per question.`);
            onError(new Error('Upload limit reached'));
            return;
        }

        try {
            // Step 1: Compress image
            setCompressing(true);
            setCompressionProgress(0);

            const originalSize = file.size;
            message.info(`Original size: ${formatFileSize(originalSize)}`);

            // Simulate progress during compression
            const progressInterval = setInterval(() => {
                setCompressionProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const compressionResult = await compressImage(file, COMPRESSION_PRESETS.ANSWER);

            clearInterval(progressInterval);
            setCompressionProgress(100);
            setCompressing(false);

            setCompressedFile(compressionResult.file);

            message.success(
                `Compressed by ${compressionResult.compressionRatio}%: ${formatFileSize(compressionResult.compressedSize)}`,
                1
            );

            if (!allowBatch) {
                // If batch not allowed, auto-extract immediately
                await performUpload(compressionResult.file, file, onSuccess);
            } else {
                setStatus('compressed');
                onSuccess("OK");
            }
        } catch (err: any) {
            console.error(err);
            onError(err);
            message.error(err.message || 'Failed to process image.');
        } finally {
            setCompressing(false);
            setCompressionProgress(0);
        }
    };

    const performUpload = async (cFile: File, originalFile: any, onSuccess?: (data: any) => void) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', cFile);

            // Add attemptId and questionId for extraction tracking
            if (attemptId) {
                formData.append('attemptId', attemptId.toString());
            }
            if (questionId) {
                formData.append('questionId', questionId.toString());
            }

            // Legacy: answerId for old system
            if (answerId) {
                formData.append('answerId', answerId.toString());
            }

            Object.keys(additionalData).forEach(key => {
                if (additionalData[key] !== undefined && additionalData[key] !== null) {
                    formData.append(key, additionalData[key]);
                }
            });

            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${endpoint}`, {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Handle extraction limit exceeded (HTTP 403)
                if (response.status === 403) {
                    if (errorData.extractionsUsed !== undefined) {
                        setExtractionsUsed(errorData.extractionsUsed);
                        setExtractionsRemaining(0);
                    }
                    throw new Error(errorData.message || 'Extraction limit reached');
                }

                throw new Error(errorData.error || 'Extraction failed');
            }

            const data = await response.json();

            // Update extraction tracking from response
            if (data.extractionsUsed !== undefined) {
                setExtractionsUsed(data.extractionsUsed);
                setExtractionsRemaining(data.extractionsRemaining || 0);

                // Notify parent component of the change
                if (onExtractionCountUpdate) {
                    onExtractionCountUpdate(data.extractionsUsed, data.extractionsRemaining || 0);
                }
            }

            onExtractionComplete(data.extractedText, data.imageUrl);
            setFileList([{ ...originalFile, status: 'done', url: data.imageUrl }]);
            if (onSuccess) onSuccess(data);
            setStatus('extracted');

            const remainingText = data.extractionsRemaining !== undefined
                ? ` (${data.extractionsRemaining} remaining)`
                : '';
            message.success(`Text extracted successfully!${remainingText}`);
        } catch (err: any) {
            message.error(err.message || 'Extraction failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleBatchQueue = () => {
        if (compressedFile && onQueued) {
            onQueued(compressedFile);
            setStatus('queued');
            message.info('Added to extraction batch queue');
        }
    };

    const isProcessing = loading || compressing;

    return (
        <div className="w-full space-y-3">
            {/* Compression Progress */}
            {compressing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-700 font-medium">Compressing...</span>
                        <span className="text-blue-600">{compressionProgress}%</span>
                    </div>
                    <Progress percent={compressionProgress} strokeColor="#3b82f6" showInfo={false} size="small" />
                </div>
            )}

            {/* Status Feedback */}
            {status === 'queued' && (
                <Alert
                    type="info"
                    message="Queued for Batch Extraction"
                    description="This image will be processed when you click 'Process Batch' in the paper editor."
                    icon={<DatabaseOutlined />}
                    showIcon
                />
            )}

            {/* Extraction Limit Warning (New System) */}
            {isExtractionTracking && extractionsRemaining === 1 && status === 'idle' && (
                <Alert
                    type="warning"
                    message="Last extraction remaining"
                    description={`You have 1 of ${extractionsMax} extractions left for this question.`}
                    showIcon
                    className="mb-2"
                />
            )}

            {/* Upload Limit Warning (Legacy System) */}
            {answerId && !isExtractionTracking && uploadLimit.isLastUpload && status === 'idle' && (
                <Alert
                    type="warning"
                    message="Last upload remaining"
                    description="Please review carefully before extracting."
                    showIcon
                    className="mb-2"
                />
            )}

            <div className="flex flex-wrap items-center gap-3">
                <Upload
                    customRequest={handleFileSelect}
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    maxCount={1}
                    listType="picture"
                    disabled={isProcessing || !canExtract}
                >
                    {isExtractionTracking ? (
                        <Badge count={`${extractionsUsed}/${extractionsMax}`} style={{ backgroundColor: canExtract ? '#52c41a' : '#ff4d4f' }}>
                            <Button icon={isProcessing ? <Spin size="small" /> : <UploadOutlined />} disabled={!canExtract || isProcessing}>
                                {label}
                            </Button>
                        </Badge>
                    ) : answerId ? (
                        <Badge count={`${uploadCount}/${maxUploads}`} style={{ backgroundColor: uploadLimit.canUpload ? '#52c41a' : '#ff4d4f' }}>
                            <Button icon={isProcessing ? <Spin size="small" /> : <UploadOutlined />} disabled={!uploadLimit.canUpload || isProcessing}>
                                {label}
                            </Button>
                        </Badge>
                    ) : (
                        <Button icon={isProcessing ? <Spin size="small" /> : <UploadOutlined />} disabled={isProcessing}>
                            {label}
                        </Button>
                    )}
                </Upload>

                {/* Counter text (New Extraction Tracking) */}
                {isExtractionTracking && (
                    <span className={`text-xs font-medium ${canExtract ? 'text-gray-600' : 'text-red-600'}`}>
                        {canExtract ? `${extractionsRemaining} extraction${extractionsRemaining !== 1 ? 's' : ''} remaining` : 'Extraction limit reached'}
                    </span>
                )}

                {/* Counter text (Legacy System) */}
                {answerId && !isExtractionTracking && (
                    <span className={`text-xs font-medium ${uploadLimit.canUpload ? 'text-gray-600' : 'text-red-600'}`}>
                        {uploadLimit.message}
                    </span>
                )}

                {/* Batch Options (Admin side) */}
                {allowBatch && status === 'compressed' && !isProcessing && (
                    <Space>
                        <Button
                            type="primary"
                            icon={<SyncOutlined />}
                            onClick={() => compressedFile && performUpload(compressedFile, fileList[0])}
                            loading={loading}
                        >
                            Extract Now
                        </Button>
                        <Button
                            icon={<DatabaseOutlined />}
                            onClick={handleBatchQueue}
                        >
                            Add to Batch
                        </Button>
                    </Space>
                )}
            </div>

            {loading && !compressing && (
                <div className="text-xs text-blue-600 font-medium flex items-center gap-2">
                    <Spin size="small" /> Extracting text with AI...
                </div>
            )}
        </div>
    );
};

export default ImageUploadExtractor;
