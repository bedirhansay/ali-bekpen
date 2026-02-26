import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type CurrencyCode = 'TRY' | 'USD' | 'EUR';

export interface Transaction {
  id: string;
  vehicleId: string;
  type: TransactionType;
  date: Timestamp;
  description?: string | null;
  amount: number;
  currencyCode: CurrencyCode;
  tcmbExchangeRate: number;
  amountTRY: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateTransactionDTO = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTransactionDTO = Partial<CreateTransactionDTO>;

export interface TransactionFilters {
  type?: TransactionType | 'ALL';
  dateRange?: [Date, Date] | null;
}
