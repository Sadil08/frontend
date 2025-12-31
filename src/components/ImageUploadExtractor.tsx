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

    const uploadLimit = useUploadLimit(uploadCount, maxUploads);

    const handleFileSelect = async (options: any) => {
        const { file, onSuccess, onError } = options;

        // Reset state
        setCompressedFile(null);
        setStatus('idle');

        // Check upload limit before proceeding (only for student answers)
        if (answerId && !uploadLimit.canUpload) {
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
                throw new Error(errorData.error || 'Extraction failed');
            }

            const data = await response.json();
            onExtractionComplete(data.extractedText, data.imageUrl);
            setFileList([{ ...originalFile, status: 'done', url: data.imageUrl }]);
            if (onSuccess) onSuccess(data);
            setStatus('extracted');
            message.success('Text extracted successfully!');
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

            {/* Upload Limit Warning (Student side) */}
            {answerId && uploadLimit.isLastUpload && status === 'idle' && (
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
                    disabled={isProcessing || (!!answerId && !uploadLimit.canUpload)}
                >
                    {answerId ? (
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

                {/* Counter text (Student side) */}
                {answerId && (
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
