"use client";

import React, { useState, useEffect } from 'react';
import { PaperAttemptDto, AnswerSubmissionDto } from '@/types';
import { MCQQuestion } from './MCQQuestion';
import EssayQuestion from './EssayQuestion';
import { Modal } from 'antd';
import { useAuth } from '@/context/AuthContext';
import * as paperStorage from '@/utils/paperAttemptStorage';

/**
 * Props for FullPaper component
 */
interface FullPaperProps {
    /** Paper attempt data with all questions */
    paperData: PaperAttemptDto;
    /** Callback when paper is submitted */
    onSubmit: (answers: AnswerSubmissionDto[]) => void;
    /** Whether submission is in progress */
    isSubmitting?: boolean;
}

/**
 * FullPaper Component
 * Displays complete paper with all questions for student attempt
 * Features:
 * - Renders all questions (MCQ and Essay)
 * - Tracks answers in state
 * - Progress indicator
 * - Confirmation modal before submission
 * - Scroll-to-top button
 * - Submit button at bottom
 */
export const FullPaper: React.FC<FullPaperProps> = ({
    paperData,
    onSubmit,
    isSubmitting = false
}) => {
    const { user } = useAuth();
    const [answers, setAnswers] = useState<Map<number, AnswerSubmissionDto>>(new Map());
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Load saved answers from localStorage on mount
    useEffect(() => {
        if (!paperData || !user) return;

        const savedAnswers = paperStorage.loadPaperAttempt(paperData.id, user.id);
        if (savedAnswers && savedAnswers.size > 0) {
            // Convert StoredAnswer to AnswerSubmissionDto
            const converted = new Map<number, AnswerSubmissionDto>();
            savedAnswers.forEach((stored, questionId) => {
                converted.set(questionId, {
                    questionId: stored.questionId,
                    answerText: stored.answerText,
                    imageUrl: stored.imageUrl,
                    extractedText: stored.extractedText,
                    selectedOptionId: stored.selectedOptionId
                });
            });
            setAnswers(converted);
            console.log(`[FullPaper] Restored ${converted.size} answers from localStorage`);
        }
    }, [paperData, user]);

    // Handle scroll to show/hide scroll-to-top button
    React.useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /**
     * Handle answer change for MCQ questions
     */
    const handleMCQAnswer = (questionId: number, selectedOptionId: number) => {
        const newAnswers = new Map(answers);
        newAnswers.set(questionId, {
            questionId,
            selectedOptionId,
            answerText: undefined
        });
        setAnswers(newAnswers);

        // Save to localStorage
        if (user && paperData) {
            paperStorage.updateAnswer(paperData.id, user.id, questionId, {
                questionId,
                selectedOptionId
            });
        }
    };

    /**
     * Handle answer change for Essay questions
     */
    const handleEssayAnswer = (questionId: number, answerText: string, imageUrl?: string, extractedText?: string) => {
        const newAnswers = new Map(answers);
        const existing = newAnswers.get(questionId);

        const updated = {
            questionId,
            selectedOptionId: undefined,
            answerText,
            // Preserve existing image/extracted text if not provided (e.g. typing update)
            imageUrl: imageUrl || existing?.imageUrl,
            extractedText: extractedText || existing?.extractedText
        };

        newAnswers.set(questionId, updated);
        setAnswers(newAnswers);

        // Save to localStorage
        if (user && paperData) {
            paperStorage.updateAnswer(paperData.id, user.id, questionId, {
                questionId,
                answerText: updated.answerText,
                imageUrl: updated.imageUrl,
                extractedText: updated.extractedText
            });
        }
    };

    /**
     * Calculate progress
     */
    const totalQuestions = paperData.questions.length;
    const answeredQuestions = answers.size;
    const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    /**
     * Handle submit button click
     */
    const handleSubmitClick = () => {
        if (answeredQuestions < totalQuestions) {
            Modal.confirm({
                title: 'Incomplete Submission',
                content: `You have answered ${answeredQuestions} out of ${totalQuestions} questions. Are you sure you want to submit?`,
                okText: 'Yes, Submit',
                cancelText: 'Continue Answering',
                onOk: () => setShowSubmitModal(true)
            });
        } else {
            setShowSubmitModal(true);
        }
    };

    /**
     * Confirm submission
     */
    const handleConfirmSubmit = () => {
        const answerArray = Array.from(answers.values());
        onSubmit(answerArray);
        setShowSubmitModal(false);

        // Clear localStorage after successful submission
        if (user && paperData) {
            paperStorage.clearPaperAttempt(paperData.id, user.id);
            console.log('[FullPaper] Cleared localStorage after submission');
        }
    };

    /**
     * Scroll to top
     */
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Paper Header */}
            <div className="bg-white rounded-xl shadow-card border border-gray-200 mb-8 sticky top-4 z-20 transition-all duration-300">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2 leading-tight">
                                {paperData.name}
                            </h1>
                            {paperData.description && (
                                <p className="text-secondary-600 text-base">
                                    {paperData.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Paper Info */}
                    <div className="flex items-center gap-4 text-sm text-secondary-500 mb-4">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-medium">{totalQuestions} Questions</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="font-medium">{paperData.type}</span>
                        </span>
                    </div>

                    {/* Progress Indicator */}
                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-semibold text-secondary-700">
                                Progress: <span className="text-primary-600">{answeredQuestions}</span>/{totalQuestions} answered
                            </span>
                            <span className="text-secondary-600 font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {progressPercentage.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-primary-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
                {paperData.questions.map((question, index) => (
                    <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-slide-up hover:shadow-md transition-shadow duration-300">
                        {question.type === 'MCQ' ? (
                            <MCQQuestion
                                question={question}
                                questionNumber={index + 1}
                                selectedOptionId={answers.get(question.id)?.selectedOptionId}
                                onAnswerChange={handleMCQAnswer}
                            />
                        ) : (
                            <EssayQuestion
                                question={question}
                                questionNumber={index + 1}
                                answerText={answers.get(question.id)?.answerText || ''}
                                imageUrl={answers.get(question.id)?.imageUrl || ''}
                                extractedText={answers.get(question.id)?.extractedText || ''}
                                paperId={paperData.id}
                                onAnswerChange={handleEssayAnswer}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-6 mt-12 -mx-4 sm:mx-0 sm:rounded-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 font-medium">
                        {answeredQuestions === totalQuestions ? (
                            <span className="text-green-600 flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                All questions answered!
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {totalQuestions - answeredQuestions} question{totalQuestions - answeredQuestions !== 1 ? 's' : ''} remaining
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleSubmitClick}
                        disabled={isSubmitting || answeredQuestions === 0}
                        className={`
                            px-8 py-3 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5
                            ${isSubmitting || answeredQuestions === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-600/30'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            'Submit Paper'
                        )}
                    </button>
                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-28 right-6 bg-white text-secondary-600 w-12 h-12 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:text-primary-600 hover:shadow-xl transition-all duration-300 z-30 group"
                    aria-label="Scroll to top"
                >
                    <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            )}

            {/* Submit Confirmation Modal */}
            <Modal
                title={<span className="text-xl font-bold text-gray-900">Confirm Submission</span>}
                open={showSubmitModal}
                onOk={handleConfirmSubmit}
                onCancel={() => setShowSubmitModal(false)}
                okText="Yes, Submit Paper"
                cancelText="Keep Working"
                okButtonProps={{
                    className: "bg-primary-600 hover:bg-primary-700 border-none h-10 px-6 rounded-lg font-semibold shadow-md",
                    danger: false
                }}
                cancelButtonProps={{
                    className: "border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 h-10 px-6 rounded-lg font-medium"
                }}
                centered
                width={500}
                className="rounded-2xl overflow-hidden"
            >
                <div className="py-4">
                    <p className="text-gray-600 text-base mb-6 leading-relaxed">
                        Are you sure you want to submit your paper? You won&apos;t be able to change your answers after submission.
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                        <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Submission Summary
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white rounded-lg p-2 shadow-sm border border-blue-100">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Total</div>
                                <div className="text-lg font-bold text-blue-900">{totalQuestions}</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 shadow-sm border border-green-100">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Answered</div>
                                <div className="text-lg font-bold text-green-600">{answeredQuestions}</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 shadow-sm border border-amber-100">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Left</div>
                                <div className="text-lg font-bold text-amber-600">{totalQuestions - answeredQuestions}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
