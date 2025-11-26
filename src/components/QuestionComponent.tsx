import React from 'react';
import { Card, Radio, Input, Space } from 'antd';

interface Option {
    id: number;
    text: string;
}

interface Question {
    id: number;
    text: string;
    type: 'MCQ' | 'ESSAY';
    options?: Option[];
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
    return (
        <div className="card mb-6">
            <div className="flex gap-4 mb-4">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-bold">
                    {index + 1}
                </span>
                <div className="text-lg font-medium text-gray-800 pt-1">
                    {question.text}
                </div>
            </div>

            <div className="pl-12">
                {question.type === 'MCQ' ? (
                    <Radio.Group onChange={(e) => onChange(e.target.value)} value={value} className="w-full">
                        <Space direction="vertical" className="w-full">
                            {question.options?.map((option) => (
                                <Radio
                                    key={option.id}
                                    value={option.id}
                                    className="w-full p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    {option.text}
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                ) : (
                    <Input.TextArea
                        rows={6}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                )}
            </div>
        </div>
    );
};
