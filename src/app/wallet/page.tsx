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
    const [loading, setLoading] = useState(true);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [balanceData, transactionsData] = await Promise.all([
                walletService.getBalance(),
                walletService.getTransactions()
            ]);
            setBalance(balanceData);
            setTransactions(transactionsData);
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

            <TransactionHistory transactions={transactions} />

            <TopUpModal
                isOpen={isTopUpOpen}
                onClose={() => setIsTopUpOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
