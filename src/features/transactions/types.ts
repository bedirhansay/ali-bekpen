import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type CurrencyCode = 'TRY' | 'USD' | 'EUR';
export type TransactionStatus = 'PENDING' | 'PAID';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CREDIT_CARD';

export interface Transaction {
  id: string;
  vehicleId: string;
  seferId?: string | null;
  categoryId: string;
  type: TransactionType;
  date: Timestamp;
  description?: string | null;
  amount: number;
  currencyCode: CurrencyCode;
  tcmbExchangeRate: number;
  amountTRY: number;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateTransactionDTO = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTransactionDTO = Partial<CreateTransactionDTO>;

export interface TransactionFilters {
  type?: TransactionType | 'ALL';
  status?: TransactionStatus | 'ALL';
  dateRange?: [Date, Date] | null;
}
