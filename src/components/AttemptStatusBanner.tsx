'use client';

import { Alert, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import answerService from '@/services/answerService';

interface Props {
    attempt: {
        id: number;
        analysisCompleted: boolean;
        analysisError?: string;
        submissionCount: number;
    };
    onRetrySuccess?: () => void;
}

export const AttemptStatusBanner: React.FC<Props> = ({ attempt, onRetrySuccess }) => {
    const [retrying, setRetrying] = useState(false);

    // Only show if there's an error and analysis is not completed
    if (!attempt.analysisError || attempt.analysisCompleted) return null;

    const canRetry = attempt.submissionCount < 3;
    const remainingAttempts = 3 - attempt.submissionCount;

    const handleRetry = async () => {
        setRetrying(true);
        try {
            await answerService.retryAnalysis(attempt.id);
            message.success('Analysis resubmitted successfully');
            if (onRetrySuccess) {
                onRetrySuccess();
            }
        } catch (error: any) {
            console.error('Retry failed:', error);
            message.error(error.response?.data?.message || 'Failed to retry analysis');
        } finally {
            setRetrying(false);
        }
    };

    return (
        <div className="mb-6 animate-slide-up">
            <Alert
                type="error"
                message={
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="font-bold text-lg">Analysis Failed</span>
                            <p className="mt-1 text-sm opacity-90">{attempt.analysisError}</p>
                        </div>

                        {canRetry ? (
                            <Button
                                type="primary"
                                danger
                                icon={<ReloadOutlined spin={retrying} />}
                                loading={retrying}
                                onClick={handleRetry}
                                className="shrink-0"
                            >
                                Retry Analysis ({remainingAttempts} attempts left)
                            </Button>
                        ) : (
                            <div className="text-red-700 font-medium shrink-0 bg-red-100 px-3 py-1 rounded">
                                Max retries reached
                            </div>
                        )}
                    </div>
                }
                showIcon
            />
        </div>
    );
};
