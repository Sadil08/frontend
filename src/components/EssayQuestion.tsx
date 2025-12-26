import React, { useState, useEffect } from 'react';
import { QuestionAttemptDto } from '@/types';
import { ImageUploadExtractor } from './ImageUploadExtractor';
import { useAuth } from '@/context/AuthContext';
import * as paperStorage from '@/utils/paperAttemptStorage';

interface EssayQuestionProps {
    question: QuestionAttemptDto;
    questionNumber: number;
    answerText?: string;
    imageUrl?: string;
    extractedText?: string;
    paperId: number;
    onAnswerChange: (questionId: number, answerText: string, imageUrl?: string, extractedText?: string) => void;
    disabled?: boolean;
}

export default function EssayQuestion({
    question,
    questionNumber,
    answerText = '',
    imageUrl: initialImageUrl = '',
    extractedText: initialExtractedText = '',
    paperId,
    onAnswerChange,
    disabled = false
}: EssayQuestionProps) {
    const { user } = useAuth();
    const [localAnswer, setLocalAnswer] = useState(answerText);
    const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
    const [extractedText, setExtractedText] = useState<string>(initialExtractedText);
    const [uploadCount, setUploadCount] = useState(0);

    const MAX_UPLOADS = 2;

    // Load upload count from localStorage on mount
    useEffect(() => {
        if (user && paperId) {
            const count = paperStorage.getUploadCount(paperId, user.id, question.id);
            setUploadCount(count);
        }
    }, [paperId, user, question.id]);

    // Sync props with local state
    useEffect(() => {
        setLocalAnswer(answerText);
    }, [answerText]);

    useEffect(() => {
        if (initialImageUrl) setImageUrl(initialImageUrl);
    }, [initialImageUrl]);

    useEffect(() => {
        if (initialExtractedText) setExtractedText(initialExtractedText);
    }, [initialExtractedText]);

    // Determine if image upload is allowed
    const allowImageAnswer = question.allowImageAnswer !== false;
    const recommendImage = question.answerTypeHint === 'diagram';

    const canUploadMore = uploadCount < MAX_UPLOADS;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setLocalAnswer(text);
        onAnswerChange(question.id, text, imageUrl, extractedText);
    };

    const handleImageExtract = (text: string, url: string) => {
        setExtractedText(text);
        setImageUrl(url);

        // Increment upload count in localStorage
        if (user && paperId) {
            const newCount = paperStorage.incrementUploadCount(paperId, user.id, question.id);
            setUploadCount(newCount);
            console.log(`[EssayQuestion] Upload count for Q${question.id}: ${newCount}/${MAX_UPLOADS}`);
        }

        // Pass image and extracted text separately
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

                    {/* Question Text */}
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

                {/* Image Upload Section */}
                {allowImageAnswer && !disabled && (
                    <div className="bg-gray-50 border-t border-gray-200 p-4">
                        {!imageUrl ? (
                            <div className="space-y-3">
                                {canUploadMore ? (
                                    <>
                                        <ImageUploadExtractor
                                            endpoint={`/api/student-answers/extract-from-image?questionId=${question.id}`}
                                            onExtractionComplete={handleImageExtract}
                                            label="Attach Handwritten Answer / Diagram"
                                            uploadCount={uploadCount}
                                            maxUploads={MAX_UPLOADS}
                                        />
                                        <span className="text-xs text-gray-500">
                                            Upload a photo of your work. AI will extract and grade it.
                                        </span>
                                    </>
                                ) : (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                        <p className="text-red-700 font-medium">Upload limit reached</p>
                                        <p className="text-red-600 text-sm mt-1">
                                            You have used all {MAX_UPLOADS} uploads for this question.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-start gap-4 animate-fade-in">
                                <div className="relative group">
                                    <img
                                        src={getFullImageUrl(imageUrl)}
                                        alt="Uploaded Answer"
                                        className="h-24 w-auto rounded border border-gray-300 shadow-sm"
                                    />
                                    {/* Only show remove if student can re-upload */}
                                    {canUploadMore && (
                                        <button
                                            onClick={() => { setImageUrl(''); setExtractedText(''); }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                                            title="Remove Image (uses 1 upload when you re-upload)"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-700 flex items-center gap-1 mb-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Image Uploaded & Processed
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Uploads used: {uploadCount}/{MAX_UPLOADS}
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
