import React, { useState } from 'react';
import { Upload, Button, message, Spin, Badge, Alert, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useUploadLimit } from '@/hooks/useUploadLimit';
import { compressImage, formatFileSize, COMPRESSION_PRESETS } from '@/utils/imageCompressor';

interface ImageUploadExtractorProps {
    endpoint: string;
    onExtractionComplete: (text: string, imageUrl: string) => void;
    label?: string;
    additionalData?: Record<string, any>;
    answerId?: number;
    uploadCount?: number;
    maxUploads?: number;
}

export const ImageUploadExtractor: React.FC<ImageUploadExtractorProps> = ({
    endpoint,
    onExtractionComplete,
    label = "Upload Image & Extract Text",
    additionalData = {},
    answerId,
    uploadCount = 0,
    maxUploads = 2
}) => {
    const [loading, setLoading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const uploadLimit = useUploadLimit(uploadCount, maxUploads);

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;

        // Check upload limit before proceeding
        if (!uploadLimit.canUpload) {
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

            message.success(
                `Compressed by ${compressionResult.compressionRatio}%: ${formatFileSize(compressionResult.compressedSize)}`,
                3
            );

            // Step 2: Upload compressed file
            setLoading(true);

            const formData = new FormData();
            formData.append('file', compressionResult.file);

            // Add answerId to track upload count
            if (answerId) {
                formData.append('answerId', answerId.toString());
            }

            // Append additional data (e.g., paperId, subject)
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

                // Handle upload limit error
                if (errorData.type === 'UPLOAD_LIMIT_EXCEEDED' ||
                    errorData.error?.includes('Upload limit')) {
                    throw new Error(errorData.error || 'Upload limit reached');
                }

                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();

            onExtractionComplete(data.extractedText, data.imageUrl);
            setFileList([{ ...file, status: 'done', url: data.imageUrl }]);
            onSuccess(data);
            message.success('Image uploaded and text extracted!');
        } catch (err: any) {
            console.error(err);
            onError(err);
            message.error(err.message || 'Failed to process image.');
        } finally {
            setLoading(false);
            setCompressing(false);
            setCompressionProgress(0);
        }
    };

    const isProcessing = loading || compressing;

    return (
        <div className="w-full space-y-2">
            {/* Compression Progress */}
            {compressing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-700 font-medium">Compressing image...</span>
                        <span className="text-blue-600">{compressionProgress}%</span>
                    </div>
                    <Progress
                        percent={compressionProgress}
                        strokeColor="#3b82f6"
                        showInfo={false}
                        size="small"
                    />
                </div>
            )}

            {/* Upload Limit Warning */}
            {uploadLimit.isLastUpload && (
                <Alert
                    type="warning"
                    message="Last upload remaining"
                    description="This is your final upload for this question. Please review your answer carefully before uploading."
                    showIcon
                    className="mb-2"
                />
            )}

            <div className="flex items-center gap-3">
                <Upload
                    customRequest={handleUpload}
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    maxCount={1}
                    listType="picture"
                    disabled={!uploadLimit.canUpload || isProcessing}
                >
                    <Badge
                        count={`${uploadCount}/${maxUploads}`}
                        style={{
                            backgroundColor: uploadLimit.canUpload ? '#52c41a' : '#ff4d4f'
                        }}
                    >
                        <Button
                            icon={isProcessing ? <Spin size="small" /> : <UploadOutlined />}
                            disabled={!uploadLimit.canUpload || isProcessing}
                        >
                            {label}
                        </Button>
                    </Badge>
                </Upload>

                {/* Upload Counter Text */}
                <span className={`text-xs font-medium ${uploadLimit.canUpload ? 'text-gray-600' : 'text-red-600'
                    }`}>
                    {uploadLimit.message}
                </span>
            </div>

            {loading && !compressing && (
                <div className="text-xs text-gray-500">
                    Extracting text with AI...
                </div>
            )}
        </div>
    );
};

export default ImageUploadExtractor;
