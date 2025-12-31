import React from "react";

interface WalletBalanceCardProps {
    balance: number | null;
    onTopUpClick: () => void;
}

export default function WalletBalanceCard({ balance, onTopUpClick }: WalletBalanceCardProps) {
    return (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-2">Available Balance</p>
                <h2 className="text-5xl font-extrabold mb-6">${(balance ?? 0).toFixed(2)}</h2>
                <button
                    onClick={onTopUpClick}
                    className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg"
                >
                    Top Up Wallet
                </button>
            </div>
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        </div>
    );
}
