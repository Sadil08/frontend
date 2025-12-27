import React, { useState } from "react";
import { walletService } from "@/services/walletService";

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TopUpModal({ isOpen, onClose, onSuccess }: TopUpModalProps) {
    const [topUpAmount, setTopUpAmount] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const amount = parseFloat(topUpAmount);

        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        if (amount > 1000) {
            setError("For your safety, please do not top up more than $1000 at once.");
            return;
        }

        setLoading(true);
        try {
            await walletService.topUp(amount);
            setSuccess("Wallet topped up successfully!");
            setTopUpAmount("");
            setTimeout(() => {
                onSuccess();
                onClose();
                setSuccess(""); // Reset for next time
            }, 1000);
        } catch (err) {
            setError("Top up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <h3 className="text-2xl font-bold mb-2">Top Up Wallet</h3>
                <p className="text-gray-500 text-sm mb-6">Enter the amount you'd like to load into your wallet.</p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <p className="text-amber-800 text-xs flex items-start gap-2">
                        <span className="text-lg">⚠️</span>
                        <span><b>Warning:</b> To ensure the safety of your funds, please do not top up with too much cash at once.</span>
                    </p>
                </div>

                <form onSubmit={handleTopUp}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="0.00"
                                step="0.01"
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Confirm Top Up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
