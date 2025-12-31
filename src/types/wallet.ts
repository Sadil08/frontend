export interface WalletTransaction {
    id: number;
    amount: number;
    type: "TOP_UP" | "DEBIT" | "REFERRAL_CREDIT";
    description: string;
    createdAt: string;
}
