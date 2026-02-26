import {
    aggregateCollection,
    COLLECTIONS,
    createDocument,
    deleteDocument,
    getDocument,
    queryWithPagination,
    updateDocument,
    type PaginationParams,
} from '@/shared/utils/firebase';
import { collection, where, orderBy, type QueryConstraint, query, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/utils/firebase-config';
import { CreateTransactionDTO, Transaction, TransactionFilters, UpdateTransactionDTO } from '../types';

export const getTransactions = async (
    vehicleId: string,
    pagination: PaginationParams,
    filters: TransactionFilters = {}
) => {
    const constraints: QueryConstraint[] = [where('vehicleId', '==', vehicleId)];

    if (filters.type && filters.type !== 'ALL') {
        constraints.push(where('type', '==', filters.type));
    }

    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        constraints.push(where('date', '>=', filters.dateRange[0]));
        constraints.push(where('date', '<=', filters.dateRange[1]));
    }

    return queryWithPagination<Transaction>(COLLECTIONS.TRANSACTIONS, constraints, pagination, 'date', 'desc');
};

/** Fetch transactions belonging to a specific sefer (paginated) */
export const getSeferTransactions = async (
    seferId: string,
    pagination: PaginationParams,
    filters: TransactionFilters = {}
) => {
    const constraints: QueryConstraint[] = [where('seferId', '==', seferId)];

    if (filters.type && filters.type !== 'ALL') {
        constraints.push(where('type', '==', filters.type));
    }

    if (filters.status && filters.status !== 'ALL') {
        constraints.push(where('status', '==', filters.status));
    }

    return queryWithPagination<Transaction>(COLLECTIONS.TRANSACTIONS, constraints, pagination, 'date', 'desc');
};

export const getTransaction = async (id: string) => {
    return getDocument<Transaction>(COLLECTIONS.TRANSACTIONS, id);
};

export const createTransaction = async (data: CreateTransactionDTO) => {
    return createDocument<Transaction>(COLLECTIONS.TRANSACTIONS, data);
};

export const updateTransaction = async (id: string, data: UpdateTransactionDTO) => {
    return updateDocument<Transaction>(COLLECTIONS.TRANSACTIONS, id, data);
};

export const deleteTransaction = async (id: string) => {
    return deleteDocument(COLLECTIONS.TRANSACTIONS, id);
};

export const getMonthlySummary = async (vehicleId: string, firstDay: Date, lastDay: Date) => {
    const baseConstraints = [
        where('vehicleId', '==', vehicleId),
        where('date', '>=', firstDay),
        where('date', '<=', lastDay),
    ];

    const incomeConstraints = [...baseConstraints, where('type', '==', 'INCOME')];
    const expenseConstraints = [...baseConstraints, where('type', '==', 'EXPENSE')];

    const [incomeResult, expenseResult] = await Promise.all([
        aggregateCollection<Transaction>(COLLECTIONS.TRANSACTIONS, incomeConstraints, { sum: 'amountTRY' }),
        aggregateCollection<Transaction>(COLLECTIONS.TRANSACTIONS, expenseConstraints, { sum: 'amountTRY' }),
    ]);

    const totalIncomeTRY = incomeResult.sum ?? 0;
    const totalExpenseTRY = expenseResult.sum ?? 0;

    return {
        totalIncomeTRY,
        totalExpenseTRY,
        netTRY: totalIncomeTRY - totalExpenseTRY,
    };
};

export const getVehicleSummary = async (vehicleId: string) => {
    const incomeConstraints = [
        where('vehicleId', '==', vehicleId),
        where('type', '==', 'INCOME')
    ];

    const expenseConstraints = [
        where('vehicleId', '==', vehicleId),
        where('type', '==', 'EXPENSE')
    ];

    const incomeResult = await aggregateCollection<Transaction>(COLLECTIONS.TRANSACTIONS, incomeConstraints, { sum: 'amountTRY' });
    const expenseResult = await aggregateCollection<Transaction>(COLLECTIONS.TRANSACTIONS, expenseConstraints, { sum: 'amountTRY' });

    const totalIncomeTRY = incomeResult.sum || 0;
    const totalExpenseTRY = expenseResult.sum || 0;
    const netTRY = totalIncomeTRY - totalExpenseTRY;

    return {
        totalIncomeTRY,
        totalExpenseTRY,
        netTRY
    };
};

/** Compute income/expense/net for a single sefer via Firestore aggregation */
export const getSeferSummary = async (seferId: string) => {
    const incomeConstraints = [
        where('seferId', '==', seferId),
        where('type', '==', 'INCOME'),
    ];
    const expenseConstraints = [
        where('seferId', '==', seferId),
        where('type', '==', 'EXPENSE'),
    ];

    const [incomeResult, expenseResult] = await Promise.all([
        aggregateCollection<Transaction>(COLLECTIONS.TRANSACTIONS, incomeConstraints, { sum: 'amountTRY' }),
        aggregateCollection<Transaction>(COLLECTIONS.TRANSACTIONS, expenseConstraints, { sum: 'amountTRY' }),
    ]);

    const totalIncomeTRY = incomeResult.sum || 0;
    const totalExpenseTRY = expenseResult.sum || 0;

    return {
        totalIncomeTRY,
        totalExpenseTRY,
        netTRY: totalIncomeTRY - totalExpenseTRY,
    };
};

export const getYearlyTransactions = async (year: number) => {
    const startOfYear = Timestamp.fromDate(new Date(year, 0, 1));
    const endOfYear = Timestamp.fromDate(new Date(year, 11, 31, 23, 59, 59, 999));

    const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where('date', '>=', startOfYear),
        where('date', '<=', endOfYear),
        orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
};
