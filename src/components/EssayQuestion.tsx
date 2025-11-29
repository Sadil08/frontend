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
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                            Essay
                        </span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg leading-relaxed">
                        {question.text}
                    </p>
                </div>
            </div>

            {/* Textarea */}
            <div className="mt-4">
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={answerText}
                        onChange={handleChange}
                        disabled={disabled}
                        placeholder="Type your answer here..."
                        className={`
              w-full px-5 py-4 border-2 rounded-xl resize-none transition-all duration-200 text-base leading-relaxed
              focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500
              ${disabled
                                ? 'bg-gray-50 cursor-not-allowed opacity-70 text-gray-500 border-gray-200'
                                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                            }
            `}
                        rows={8}
                        style={{ minHeight: '200px' }}
                    />
                    {!disabled && (
                        <div className="absolute bottom-4 right-4 pointer-events-none opacity-10">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Character and Word Count */}
                <div className="flex items-center justify-between mt-3 px-1 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            <span className="font-medium text-gray-700">{wordCount}</span> {wordCount === 1 ? 'word' : 'words'}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="font-medium text-gray-700">{charCount}</span> {charCount === 1 ? 'character' : 'characters'}
                        </span>
                    </div>

                    {/* Helpful hint */}
                    {!disabled && answerText.length === 0 && (
                        <span className="text-primary-500 font-medium animate-pulse">
                            Start typing...
                        </span>
                    )}
                </div>
            </div>

            {/* Writing Tips (optional) */}
            {!disabled && answerText.length === 0 && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-4 flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                        <h4 className="text-sm font-bold text-blue-800 mb-1">Writing Tip</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Structure your answer clearly with an introduction, main points, and conclusion. Use paragraphs to separate ideas.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
