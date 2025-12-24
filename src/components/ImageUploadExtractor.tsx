import React, { useState } from 'react';
import { Upload, Button, message, Spin } from 'antd';
import { UploadOutlined, FileImageOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface ImageUploadExtractorProps {
    endpoint: string;
    onExtractionComplete: (text: string, imageUrl: string) => void;
    label?: string;
    additionalData?: Record<string, any>;
}

export const ImageUploadExtractor: React.FC<ImageUploadExtractorProps> = ({
    endpoint,
    onExtractionComplete,
    label = "Upload Image & Extract Text",
    additionalData = {}
}) => {
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        // Append additional data (e.g., paperId, subject)
        Object.keys(additionalData).forEach(key => {
            if (additionalData[key] !== undefined && additionalData[key] !== null) {
                formData.append(key, additionalData[key]);
            }
        });

        try {
            // Use fetch or axios. Assuming fetch for simplicity without knowing axios config
            // Note: endpoint should be full path like '/api/questions/extract-from-image'
            // We need to prepend BASE_URL if configured, but relative path might work if proxy is set up.
            // Assuming Next.js rewrites or same domain.

            // Checking if we need auth token. Ideally use a configured axios instance from services.
            // But for this component self-containment, I'll try fetch with token from localStorage if needed?
            // Better: use a service method passed in?
            // For now: fetch generic.

            const token = localStorage.getItem('token'); // Simplistic auth

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${endpoint}`, {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            // Expected data: { extractedText: string, imageUrl: string }

            onExtractionComplete(data.extractedText, data.imageUrl);
            setFileList([{ ...file, status: 'done', url: data.imageUrl }]);
            onSuccess(data);
            message.success('Image uploaded and text extracted!');
        } catch (err) {
            console.error(err);
            onError(err);
            message.error('Failed to extract text from image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-4">
            <Upload
                customRequest={handleUpload}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                maxCount={1}
                listType="picture"
            >
                <Button icon={loading ? <Spin size="small" /> : <UploadOutlined />}>
                    {label}
                </Button>
            </Upload>
            {loading && <div className="text-xs text-gray-500 mt-1">Extracting text with AI...</div>}
        </div>
    );
};

export default ImageUploadExtractor;
