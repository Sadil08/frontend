import React from 'react';
import { QuestionAttemptDto } from '@/types';
import { ImageLightbox } from './ImageLightbox';

/**
 * Props for MCQQuestion component
 */
interface MCQQuestionProps {
    /** Question data with options */
    question: QuestionAttemptDto;
    /** Question number for display */
    questionNumber: number;
    /** Currently selected option ID */
    selectedOptionId?: number;
    /** Callback when option is selected */
    onAnswerChange: (questionId: number, selectedOptionId: number) => void;
    /** Whether the question is disabled (e.g., after submission) */
    disabled?: boolean;
}

/**
 * MCQQuestion Component
 * Renders a multiple choice question with radio button options
 * Features:
 * - Visual feedback for selected option
 * - Accessible keyboard navigation
 * - Hover effects for better UX
 * - Disabled state support
 */
export const MCQQuestion: React.FC<MCQQuestionProps> = ({
    question,
    questionNumber,
    selectedOptionId,
    onAnswerChange,
    disabled = false
}) => {
    const getFullImageUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-2.5 py-0.5 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Question {questionNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                        </span>
                    </div>
                    {/* Question Text */}
                    {!question.hideQuestionText && (
                        <p className="text-gray-900 font-medium text-lg leading-relaxed">
                            {question.text}
                        </p>
                    )}

                    {/* Display Question Image if required */}
                    {/* Display Question Image if required */}
                    {question.requiresImageDisplay && question.imageUrl && (
                        <div className="mt-4">
                            <ImageLightbox
                                src={getFullImageUrl(question.imageUrl)}
                                alt="Question Reference"
                                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                                style={{ maxHeight: '400px' }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mt-4">
                {question.options.map((option, index) => {
                    const isSelected = selectedOptionId === option.id;
                    const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...

                    return (
                        <label
                            key={option.id}
                            className={`
                relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                ${isSelected
                                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'
                                }
                ${disabled ? 'opacity-60 cursor-not-allowed hover:border-gray-200 hover:bg-white' : ''}
              `}
                        >
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.id}
                                checked={isSelected}
                                onChange={() => !disabled && onAnswerChange(question.id, option.id)}
                                disabled={disabled}
                                className="sr-only"
                            />

                            {/* Custom Radio Button */}
                            <div className={`
                flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-200
                ${isSelected
                                    ? 'border-primary-600 bg-primary-600'
                                    : 'border-gray-300 bg-white group-hover:border-primary-400'
                                }
              `}>
                                {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                                )}
                            </div>

                            {/* Option Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className={`
                    font-bold text-sm w-6 h-6 flex items-center justify-center rounded-md
                    ${isSelected ? 'bg-primary-200 text-primary-800' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}
                  `}>
                                        {optionLetter}
                                    </span>
                                    <span className={`
                    text-base leading-snug
                    ${isSelected ? 'text-primary-900 font-medium' : 'text-gray-700'}
                  `}>
                                        {option.text}
                                    </span>
                                </div>
                            </div>

                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="flex-shrink-0 ml-3 animate-fade-in">
                                    <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </label>
                    );
                })}
            </div>
        </div>
    );
};
