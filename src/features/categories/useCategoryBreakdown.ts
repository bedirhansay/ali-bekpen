import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../shared/utils/firebase-config';
import { Transaction } from '../transactions/types';
import { useCategories } from './hooks';

export interface CategoryBreakdownItem {
    categoryId: string;
    categoryName: string;
    color: string;
    totalTRY: number;
}

export interface CategoryBreakdown {
    incomeByCategory: CategoryBreakdownItem[];
    expenseByCategory: CategoryBreakdownItem[];
}

export const useCategoryBreakdown = (year: number) => {
    const { data: categories } = useCategories();

    return useQuery<CategoryBreakdown>({
        queryKey: ['categoryBreakdown', year, categories],
        queryFn: async () => {
            if (!categories || categories.length === 0) {
                return { incomeByCategory: [], expenseByCategory: [] };
            }

            const start = new Date(year, 0, 1);
            const end = new Date(year + 1, 0, 1);

            const q = query(
                collection(db, 'transactions'),
                where('date', '>=', Timestamp.fromDate(start)),
                where('date', '<', Timestamp.fromDate(end))
            );

            const snapshot = await getDocs(q);
            const transactions = snapshot.docs.map(doc => doc.data() as Transaction);

            const incomeMap: Record<string, number> = {};
            const expenseMap: Record<string, number> = {};

            transactions.forEach(tx => {
                if (!tx.categoryId) return;
                if (tx.type === 'INCOME') {
                    incomeMap[tx.categoryId] = (incomeMap[tx.categoryId] || 0) + (tx.amountTRY || 0);
                } else {
                    expenseMap[tx.categoryId] = (expenseMap[tx.categoryId] || 0) + (tx.amountTRY || 0);
                }
            });

            const mapToItems = (map: Record<string, number>) => {
                return Object.entries(map)
                    .map(([categoryId, totalTRY]) => {
                        const cat = categories.find(c => c.id === categoryId);
                        return {
                            categoryId,
                            categoryName: cat?.name || 'Bilinmeyen',
                            color: cat?.color || '#ccc',
                            totalTRY
                        };
                    })
                    .sort((a, b) => b.totalTRY - a.totalTRY);
            };

            return {
                incomeByCategory: mapToItems(incomeMap),
                expenseByCategory: mapToItems(expenseMap),
            };
        },
        enabled: !!categories && categories.length > 0,
    });
};
