import React, { useState, useEffect } from 'react';
import { QuestionAttemptDto } from '@/types';
import { ImageUploadExtractor } from './ImageUploadExtractor';

interface EssayQuestionProps {
    question: QuestionAttemptDto;
    questionNumber: number;
    answerText?: string;
    onAnswerChange: (questionId: number, answerText: string, imageUrl?: string, extractedText?: string) => void;
    disabled?: boolean;
}

export default function EssayQuestion({
    question,
    questionNumber,
    answerText = '',
    onAnswerChange,
    disabled = false
}: EssayQuestionProps) {

    const [localAnswer, setLocalAnswer] = useState(answerText);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [extractedText, setExtractedText] = useState<string>('');

    useEffect(() => {
        setLocalAnswer(answerText);
    }, [answerText]);

    // Determine if image upload is allowed
    const allowImageAnswer = question.allowImageAnswer !== false; // Default to true if not specified
    const recommendImage = question.answerTypeHint === 'diagram';
    const recommendText = question.answerTypeHint === 'short';

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setLocalAnswer(text);
        onAnswerChange(question.id, text, imageUrl, extractedText);
    };

    // DEBUG LOG
    useEffect(() => {
        console.log(`[EssayQuestion] Question ${question.id} props:`, {
            requiresImageDisplay: question.requiresImageDisplay,
            hideQuestionText: question.hideQuestionText,
            imageUrl: question.imageUrl,
            hasImage: !!question.imageUrl,
        });
    }, [question]);

    const handleImageExtract = (text: string, url: string) => {
        setExtractedText(text);
        setImageUrl(url);

        // Pass image and extracted text separately.
        // Do NOT append to localAnswer (which is for typed text).
        onAnswerChange(question.id, localAnswer, url, text);
    };

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
                        {recommendImage && (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                Diagram Recommended
                            </span>
                        )}
                    </div>

                    {/* Question Text - conditionally shown based on hideQuestionText */}
                    {!question.hideQuestionText && (
                        <p className="text-gray-900 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                            {question.text}
                        </p>
                    )}

                    {/* Display Question Image if required */}
                    {question.requiresImageDisplay && question.imageUrl && (
                        <div className="mt-4">
                            <img
                                src={getFullImageUrl(question.imageUrl)}
                                alt="Question Reference"
                                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                                style={{ maxHeight: '400px' }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Text Input Area */}
                <div className="p-1">
                    <textarea
                        value={localAnswer}
                        onChange={handleTextChange}
                        disabled={disabled}
                        className="w-full px-4 py-3 border-none focus:ring-0 min-h-[150px] resize-y text-gray-800 placeholder-gray-400"
                        placeholder={
                            recommendImage
                                ? "You can describe your diagram or process here, or upload an image below..."
                                : "Type your answer here..."
                        }
                    />
                </div>

                {/* Image Upload Section - Always visible if allowed */}
                {allowImageAnswer && !disabled && (
                    <div className="bg-gray-50 border-t border-gray-200 p-4">
                        {!imageUrl ? (
                            <div className="flex items-center gap-4">
                                <ImageUploadExtractor
                                    endpoint={`/api/student-answers/extract-from-image?questionId=${question.id}`}
                                    onExtractionComplete={handleImageExtract}
                                    label="Attach Handwritten Answer / Diagram"
                                />
                                <span className="text-xs text-gray-500">
                                    Upload a photo of your work. AI will extract and grade it.
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-start gap-4 animate-fade-in">
                                <div className="relative group">
                                    <img
                                        src={imageUrl}
                                        alt="Uploaded Answer"
                                        className="h-24 w-auto rounded border border-gray-300 shadow-sm"
                                    />
                                    <button
                                        onClick={() => { setImageUrl(''); setExtractedText(''); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                                        title="Remove Image"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-700 flex items-center gap-1 mb-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Image Uploaded & Processed
                                    </p>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        Extracted content added to your answer.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!allowImageAnswer && !disabled && (
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-400 italic">
                        Image uploads are disabled for this question.
                    </div>
                )}
            </div>
        </div>
    );
}
