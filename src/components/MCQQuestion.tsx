import React from 'react';
import { QuestionAttemptDto } from '@/types';

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
    return (
        <div className="space-y-4">
            {/* Question Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="badge-primary font-semibold">
                            Question {questionNumber}
                        </span>
                        <span className="badge-gray">
                            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                        </span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg">
                        {question.text}
                    </p>
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
                relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                                }
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
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
                flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200
                ${isSelected
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300 bg-white'
                                }
              `}>
                                {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>

                            {/* Option Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={`
                    font-semibold text-sm
                    ${isSelected ? 'text-blue-700' : 'text-gray-600'}
                  `}>
                                        {optionLetter}.
                                    </span>
                                    <span className={`
                    text-base
                    ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}
                  `}>
                                        {option.text}
                                    </span>
                                </div>
                            </div>

                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="flex-shrink-0 ml-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
