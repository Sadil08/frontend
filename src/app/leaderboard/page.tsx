"use client";

import { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import { leaderboardService } from '@/services/leaderboardService';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import Header from '@/components/Header';

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await leaderboardService.getLeaderboard();
                setEntries(data);
            } catch (error) {
                message.error('Failed to load leaderboard');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Leaderboard</h1>
                <div className="card">
                    {loading ? (
                        <div className="flex justify-center p-8"><Spin /></div>
                    ) : (
                        <LeaderboardTable data={entries} />
                    )}
                </div>
            </div>
        </div>
    );
}
