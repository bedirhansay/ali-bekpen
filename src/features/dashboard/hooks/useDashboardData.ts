import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/shared/utils/firebase-config';
import { Transaction } from '@/features/transactions/types';
import { useCategories } from '@/features/categories/hooks';

export interface DashboardData {
    monthly: {
        month: number;
        incomeTRY: number;
        expenseTRY: number;
    }[];
    totals: {
        incomeTRY: number;
        expenseTRY: number;
        netTRY: number;
    };
    categoryBreakdown: {
        incomeByCategory: {
            categoryId: string;
            categoryName: string;
            color: string;
            totalTRY: number;
            percentage: number;
        }[];
        expenseByCategory: {
            categoryId: string;
            categoryName: string;
            color: string;
            totalTRY: number;
            percentage: number;
        }[];
    };
}

export const useDashboardData = (year: number) => {
    const { data: categories } = useCategories();

    return useQuery<DashboardData>({
        queryKey: ['dashboardData', year, categories?.length],
        queryFn: async () => {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

            const q = query(
                collection(db, 'transactions'),
                where('date', '>=', Timestamp.fromDate(startOfYear)),
                where('date', '<=', Timestamp.fromDate(endOfYear)),
                orderBy('date', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));

            // Initialize monthly array (1 to 12)
            const monthlyData: Record<number, { month: number; incomeTRY: number; expenseTRY: number }> = {};
            for (let i = 1; i <= 12; i++) {
                monthlyData[i] = { month: i, incomeTRY: 0, expenseTRY: 0 };
            }

            let totalIncomeTRY = 0;
            let totalExpenseTRY = 0;

            const incomeMap: Record<string, number> = {};
            const expenseMap: Record<string, number> = {};

            transactions.forEach((tx) => {
                const dateObj = tx.date.toDate();
                const monthIndex = dateObj.getMonth() + 1;
                const amount = tx.amountTRY || tx.amount || 0;

                if (tx.type === 'INCOME') {
                    monthlyData[monthIndex].incomeTRY += amount;
                    totalIncomeTRY += amount;
                    if (tx.categoryId) {
                        incomeMap[tx.categoryId] = (incomeMap[tx.categoryId] || 0) + amount;
                    }
                } else if (tx.type === 'EXPENSE') {
                    monthlyData[monthIndex].expenseTRY += amount;
                    totalExpenseTRY += amount;
                    if (tx.categoryId) {
                        expenseMap[tx.categoryId] = (expenseMap[tx.categoryId] || 0) + amount;
                    }
                }
            });

            const mapToCategories = (map: Record<string, number>, grandTotal: number) => {
                if (!categories) return [];
                return Object.entries(map)
                    .map(([catId, total]) => {
                        const cat = categories.find(c => c.id === catId);
                        return {
                            categoryId: catId,
                            categoryName: cat?.name || 'Bilinmeyen',
                            color: cat?.color || '#ccc',
                            totalTRY: total,
                            percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0
                        };
                    })
                    .sort((a, b) => b.totalTRY - a.totalTRY);
            };

            return {
                monthly: Object.values(monthlyData),
                totals: {
                    incomeTRY: totalIncomeTRY,
                    expenseTRY: totalExpenseTRY,
                    netTRY: totalIncomeTRY - totalExpenseTRY
                },
                categoryBreakdown: {
                    incomeByCategory: mapToCategories(incomeMap, totalIncomeTRY),
                    expenseByCategory: mapToCategories(expenseMap, totalExpenseTRY),
                }
            };
        },
        staleTime: 60 * 1000, // 60 seconds
        enabled: !!categories
    });
};
