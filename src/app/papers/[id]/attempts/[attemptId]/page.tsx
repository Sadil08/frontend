"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AttemptResults } from '@/components/AttemptResults';

/**
 * Attempt Details Page
 * Displays comprehensive results for a specific paper attempt with weighted scoring
 */
export default function AttemptDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const bundleId = searchParams.get('bundleId');
    const getLink = (path: string) => bundleId ? `${path}?bundleId=${bundleId}` : path;
    const attemptId = Number(params.attemptId);
    const paperId = Number(params.id);

    return (
        <ProtectedRoute role="STUDENT">
            <div className="min-h-screen bg-gray-50">

                <div className="max-w-7xl mx-auto p-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push(getLink(`/papers/${paperId}/past-attempts`))}
                        className="mb-4"
                        size="large"
                    >
                        Back to Past Attempts
                    </Button>

                    <AttemptResults attemptId={attemptId} />
                </div>
            </div>
        </ProtectedRoute>
    );
}