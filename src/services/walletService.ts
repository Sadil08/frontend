import apiClient from "@/utils/apiClient";
import { WalletTransaction } from "@/types/wallet";

import { Page } from "@/types";

export const walletService = {
    async getBalance(): Promise<number> {
        const response = await apiClient.get<number>("/api/wallet/balance");
        return response.data;
    },

    async getTransactions(page = 0, size = 10): Promise<Page<WalletTransaction>> {
        const response = await apiClient.get<any>("/api/wallet/transactions", {
            params: { page, size }
        });

        // Handle potential backward compatibility if backend returns array
        if (Array.isArray(response.data)) {
            return {
                content: response.data,
                totalElements: response.data.length,
                totalPages: 1,
                size: response.data.length,
                number: 0,
                first: true,
                last: true,
                numberOfElements: response.data.length,
                empty: response.data.length === 0
            };
        }

        return response.data;
    },

    async topUp(amount: number): Promise<void> {
        await apiClient.post("/api/wallet/topup", { amount });
    },

    async getReferralPercentage(): Promise<number> {
        const response = await apiClient.get<number>("/api/wallet/referral-percentage");
        return response.data;
    },

    async setReferralPercentage(percentage: number): Promise<void> {
        await apiClient.post("/api/wallet/referral-percentage", { percentage });
    }
};
