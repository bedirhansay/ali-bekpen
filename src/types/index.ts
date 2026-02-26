import { Timestamp } from "firebase/firestore";

export type TransactionType = "income" | "expense";

export interface Transaction {
    id: string;
    vehicleId: string;
    type: TransactionType;
    currencyCode: string;
    amount: number;
    exchangeRateToTRY: number;
    amountTRY: number;
    date: Timestamp;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface MonthlySummary {
    month: number; // 1..12
    incomeTRY: number;
    expenseTRY: number;
}

export interface YearlySummary {
    monthly: MonthlySummary[];
    totals: {
        incomeTRY: number;
        expenseTRY: number;
        netTRY: number;
    };
}
