"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
// import { paperService } from '@/services/paperService'; // removed, papers are fetched from bundle data
import { bundleService } from '@/services/bundleService';
import { PaperCard } from '@/components/PaperCard';
import { PaperDto, PaperBundleDetailDto } from '@/types';
import Header from '@/components/Header';
import { Button } from 'antd';

export default function BundlePapers() {
    const { id } = useParams();
    const router = useRouter();
    const [papers, setPapers] = useState<PaperDto[]>([]);
    const [bundle, setBundle] = useState<PaperBundleDetailDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bundleData = await bundleService.getBundle(Number(id));
                setBundle(bundleData);
                setPapers(bundleData.papers || []);
            } catch (error) {
                message.error('Failed to load papers');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const handleAttempt = (paperId: number) => {
        router.push(`/papers/${paperId}/attempt`);
    };

    if (loading) return <div className="flex justify-center p-12"><Spin size="large" /></div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/dashboard')}
                    className="mb-4"
                >
                    Back to Dashboard
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{bundle?.name} - Papers</h1>
                    <p className="text-gray-600 mt-2">Select a paper to attempt</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {papers.map((paper) => (
                        <PaperCard
                            key={paper.id}
                            paper={paper}
                            attemptsRemaining={paper.maxFreeAttempts}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

