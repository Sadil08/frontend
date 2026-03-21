import React from 'react';
import { Card, Radio, Input, Space } from 'antd';
import { ImageLightbox } from './ImageLightbox';

interface Option {
    id: number;
    text: string;
}

interface Question {
    id: number;
    text: string;
    type: 'MCQ' | 'ESSAY';
    options?: Option[];
    imageUrl?: string;
    requiresImageDisplay?: boolean;
    hideQuestionText?: boolean;
}

interface QuestionComponentProps {
    question: Question;
    value?: any;
    onChange: (value: any) => void;
    index: number;
}

export const QuestionComponent: React.FC<QuestionComponentProps> = ({
    question,
    value,
    onChange,
    index
}) => {
    const getFullImageUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 transition-all hover:shadow-md">
            <div className="flex gap-4 mb-6">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-50 text-primary-700 rounded-full font-bold text-sm border border-primary-100">
                    {index + 1}
                </span>
                <div className="flex-1">
                    {!question.hideQuestionText && (
                        <div className="text-lg font-medium text-secondary-900 pt-0.5 leading-relaxed">
                            {question.text}
                        </div>
                    )}
                    {question.requiresImageDisplay && question.imageUrl && (
                        <div className="mt-4">
                            <ImageLightbox
                                src={getFullImageUrl(question.imageUrl)}
                                alt="Question Reference"
                                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                                style={{ maxHeight: '300px' }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="pl-12">
                {question.type === 'MCQ' ? (
                    <Radio.Group onChange={(e) => onChange(e.target.value)} value={value} className="w-full">
                        <Space direction="vertical" className="w-full gap-3">
                            {question.options?.map((option) => (
                                <Radio
                                    key={option.id}
                                    value={option.id}
                                    className={`w-full p-4 border rounded-xl transition-all duration-200 flex items-center ${value === option.id
                                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    <span className={`text-base ${value === option.id ? 'text-primary-900 font-medium' : 'text-secondary-700'}`}>
                                        {option.text}
                                    </span>
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                ) : (
                    <Input.TextArea
                        rows={8}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-4 text-base border-gray-300 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 hover:border-gray-400 transition-colors resize-y min-h-[150px]"
                    />
                )}
            </div>
        </div>
    );
};
