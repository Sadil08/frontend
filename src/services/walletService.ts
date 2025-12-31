import apiClient from "@/utils/apiClient";
import { WalletTransaction } from "@/types/wallet";

export const walletService = {
    async getBalance(): Promise<number> {
        const response = await apiClient.get<number>("/api/wallet/balance");
        return response.data;
    },

    async getTransactions(): Promise<WalletTransaction[]> {
        const response = await apiClient.get<WalletTransaction[]>("/api/wallet/transactions");
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
