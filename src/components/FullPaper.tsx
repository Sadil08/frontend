"use client";

import React, { useState } from 'react';
import { PaperAttemptDto, AnswerSubmissionDto } from '@/types';
import { MCQQuestion } from './MCQQuestion';
import { EssayQuestion } from './EssayQuestion';
import { Modal } from 'antd';

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
    const [answers, setAnswers] = useState<Map<number, AnswerSubmissionDto>>(new Map());
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

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
    };

    /**
     * Handle answer change for Essay questions
     */
    const handleEssayAnswer = (questionId: number, answerText: string) => {
        const newAnswers = new Map(answers);
        newAnswers.set(questionId, {
            questionId,
            selectedOptionId: undefined,
            answerText
        });
        setAnswers(newAnswers);
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
            <div className="card-elevated mb-6 sticky top-0 z-10 bg-white">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {paperData.name}
                        </h1>
                        {paperData.description && (
                            <p className="text-gray-600">
                                {paperData.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Paper Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {totalQuestions} Questions
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {paperData.type}
                    </span>
                </div>

                {/* Progress Indicator */}
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">
                            Progress: {answeredQuestions}/{totalQuestions} answered
                        </span>
                        <span className="text-gray-600">
                            {progressPercentage.toFixed(0)}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {paperData.questions.map((question, index) => (
                    <div key={question.id} className="card-base p-6 animate-slide-up">
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
                                onAnswerChange={handleEssayAnswer}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 mt-8 -mx-4 sm:mx-0 sm:rounded-lg shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                        {answeredQuestions === totalQuestions ? (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                All questions answered!
                            </span>
                        ) : (
                            <span>
                                {totalQuestions - answeredQuestions} question{totalQuestions - answeredQuestions !== 1 ? 's' : ''} remaining
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleSubmitClick}
                        disabled={isSubmitting || answeredQuestions === 0}
                        className="btn-primary px-8 py-3 text-lg font-semibold"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="spinner w-5 h-5" />
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
                    className="fixed bottom-24 right-6 btn-primary w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover-lift z-20"
                    aria-label="Scroll to top"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            )}

            {/* Submit Confirmation Modal */}
            <Modal
                title="Confirm Submission"
                open={showSubmitModal}
                onOk={handleConfirmSubmit}
                onCancel={() => setShowSubmitModal(false)}
                okText="Yes, Submit"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p className="text-gray-700 mb-4">
                    Are you sure you want to submit your paper? You won&apos;t be able to change your answers after submission.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">📊 Summary:</span>
                    </p>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• Total Questions: {totalQuestions}</li>
                        <li>• Answered: {answeredQuestions}</li>
                        <li>• Unanswered: {totalQuestions - answeredQuestions}</li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
};
