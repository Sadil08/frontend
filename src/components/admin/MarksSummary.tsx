import React from 'react';
import { Card } from 'antd';
import { AdminPaperDto } from '@/types/admin';

interface MarksSummaryProps {
    paper: AdminPaperDto;
}

/**
 * Marks Allocation Summary Component
 * Shows total allocated marks from questions vs paper's total marks
 * Displays color-coded alerts for different scaling scenarios
 */
export const MarksSummary: React.FC<MarksSummaryProps> = ({ paper }) => {
    const totalAllocated = paper.questions.reduce((sum, q) => sum + q.marks, 0);
    const paperTotal = paper.totalMarks;

    const renderScalingAlert = () => {
        if (!paperTotal) {
            return (
                <div className="bg-orange-100 border-l-4 border-orange-500 p-3 rounded">
                    <div className="flex items-start gap-2">
                        <span className="text-orange-600 text-lg">⚠️</span>
                        <div>
                            <p className="font-semibold text-orange-800">Total Marks Not Set</p>
                            <p className="text-sm text-orange-700">
                                Please set the paper&apos;s total marks in the paper settings.
                                Without this, final scores cannot be calculated properly.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (totalAllocated > paperTotal) {
            const scaleFactor = ((paperTotal / totalAllocated) * 100).toFixed(1);
            return (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
                    <div className="flex items-start gap-2">
                        <span className="text-yellow-600 text-lg">⚠️</span>
                        <div>
                            <p className="font-semibold text-yellow-800">Scores Will Scale Down</p>
                            <p className="text-sm text-yellow-700">
                                Allocated marks ({totalAllocated}) exceed paper total ({paperTotal}).
                                Final scores will be scaled to {scaleFactor}% of raw scores.
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                Example: Student scoring {totalAllocated}/{totalAllocated} will get {paperTotal}/{paperTotal}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (totalAllocated < paperTotal) {
            const scaleFactor = ((paperTotal / totalAllocated) * 100).toFixed(1);
            return (
                <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                    <div className="flex items-start gap-2">
                        <span className="text-blue-600 text-lg">ℹ️</span>
                        <div>
                            <p className="font-semibold text-blue-800">Scores Will Scale Up</p>
                            <p className="text-sm text-blue-700">
                                Allocated marks ({totalAllocated}) are less than paper total ({paperTotal}).
                                Final scores will be scaled to {scaleFactor}% of raw scores.
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Example: Student scoring {totalAllocated}/{totalAllocated} will get {paperTotal}/{paperTotal}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
                <div className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✅</span>
                    <div>
                        <p className="font-semibold text-green-800">Perfect Match - No Scaling</p>
                        <p className="text-sm text-green-700">
                            Allocated marks equal paper total marks. Student scores will not be scaled.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-sm font-semibold text-gray-600 uppercase">Total Allocated Marks</span>
                        <div className="text-3xl font-bold text-blue-600">
                            {totalAllocated}
                        </div>
                        <span className="text-xs text-gray-500">Sum of all question marks</span>
                    </div>
                    <div className="text-center px-4">
                        <div className="text-4xl text-gray-400">→</div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold text-gray-600 uppercase">Paper Total Marks</span>
                        <div className="text-3xl font-bold text-purple-600">
                            {paperTotal ?? <span className="text-orange-500">Not Set</span>}
                        </div>
                        <span className="text-xs text-gray-500">Final score scale</span>
                    </div>
                </div>

                {/* Scaling Alerts */}
                {renderScalingAlert()}
            </div>
        </Card>
    );
};
