import React, { useState, useEffect, useRef } from 'react';
import { QuestionAttemptDto } from '@/types';

/**
 * Props for EssayQuestion component
 */
interface EssayQuestionProps {
    /** Question data */
    question: QuestionAttemptDto;
    /** Question number for display */
    questionNumber: number;
    /** Current answer text */
    answerText?: string;
    /** Callback when answer changes */
    onAnswerChange: (questionId: number, answerText: string) => void;
    /** Whether the question is disabled (e.g., after submission) */
    disabled?: boolean;
}

/**
 * EssayQuestion Component
 * Renders an essay-type question with auto-resizing textarea
 * Features:
 * - Auto-resize textarea based on content
 * - Character and word count
 * - Visual feedback for focus state
 * - Disabled state support
 */
export const EssayQuestion: React.FC<EssayQuestionProps> = ({
    question,
    questionNumber,
    answerText = '',
    onAnswerChange,
    disabled = false
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [answerText]);

    // Update counts
    useEffect(() => {
        setCharCount(answerText.length);
        const words = answerText.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
    }, [answerText]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onAnswerChange(question.id, newValue);
    };

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
                        <span className="badge-success">Essay</span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg">
                        {question.text}
                    </p>
                </div>
            </div>

            {/* Textarea */}
            <div className="mt-4">
                <textarea
                    ref={textareaRef}
                    value={answerText}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="Type your answer here..."
                    className={`
            w-full px-4 py-3 border-2 rounded-lg resize-none transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${disabled
                            ? 'bg-gray-100 cursor-not-allowed opacity-60'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }
          `}
                    rows={6}
                    style={{ minHeight: '150px' }}
                />

                {/* Character and Word Count */}
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <span>
                            <span className="font-medium text-gray-700">{wordCount}</span> {wordCount === 1 ? 'word' : 'words'}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>
                            <span className="font-medium text-gray-700">{charCount}</span> {charCount === 1 ? 'character' : 'characters'}
                        </span>
                    </div>

                    {/* Helpful hint */}
                    {!disabled && answerText.length === 0 && (
                        <span className="text-gray-400 italic">
                            Start typing to see your answer
                        </span>
                    )}
                </div>
            </div>

            {/* Writing Tips (optional) */}
            {!disabled && answerText.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">💡 Tip:</span> Structure your answer clearly with an introduction, main points, and conclusion for better marks.
                    </p>
                </div>
            )}
        </div>
    );
};
