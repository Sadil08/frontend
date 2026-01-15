"use client";

import React, { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import ReferralSection from "@/components/ReferralSection";
import WalletBalanceCard from "@/components/wallet/WalletBalanceCard";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import TopUpModal from "@/components/wallet/TopUpModal";
import { walletService } from "@/services/walletService";
import { WalletTransaction } from "@/types/wallet";

export default function WalletPage() {
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [loading, setLoading] = useState(true);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    const fetchData = async (page = 1, size = 10) => {
        try {
            // Fetch balance only on initial load or if needed
            if (balance === null) {
                const bal = await walletService.getBalance();
                setBalance(bal);
            }

            // Backend pages are 0-indexed
            const txData = await walletService.getTransactions(page - 1, size);

            // txData is a Page object now
            setTransactions(txData.content);
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: size,
                total: txData.totalElements
            }));
        } catch (err) {
            console.error("Failed to fetch wallet data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wallet</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <WalletBalanceCard
                    balance={balance}
                    onTopUpClick={() => setIsTopUpOpen(true)}
                />
                <ReferralSection />
            </div>

            <TransactionHistory
                transactions={transactions}
                pagination={{
                    ...pagination,
                    onChange: (page, size) => fetchData(page, size)
                }}
            />

            <TopUpModal
                isOpen={isTopUpOpen}
                onClose={() => setIsTopUpOpen(false)}
                onSuccess={() => fetchData(pagination.current, pagination.pageSize)}
            />
        </div>
    );
}
