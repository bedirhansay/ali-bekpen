import {
    aggregateCollection,
    COLLECTIONS,
    createDocument,
    deleteDocument,
    getDocument,
    queryWithPagination,
    updateDocument,
    getTypedCollection,
    type PaginationParams,
} from '@/shared/utils/firebase';
import { where, type QueryConstraint, query, getDocs } from 'firebase/firestore';
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

    // Frontend pagination uses AntD Table pagination which is page-based.
    // Converting cursor-based pagination to page-based is tricky with Firestore.
    // But here we'll use the cursor-based helper and let the UI handle it.
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

export const getYearlyTransactions = async (year: number) => {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const constraints = [
        where('date', '>=', startOfYear),
        where('date', '<=', endOfYear),
    ];

    // Since we need to group by month, we'll fetch all transactions for the year.
    // In a large production app, we'd use aggregation functions or a separate summary collection.
    // For this MVP, client-side grouping is requested for performance optimization.
    const q = query(getTypedCollection<Transaction>(COLLECTIONS.TRANSACTIONS), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
};
