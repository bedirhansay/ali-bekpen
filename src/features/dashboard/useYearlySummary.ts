import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/shared/utils/firebase-config';
import { dashboardKeys } from './api/keys';
import { MonthlySummary, Transaction, YearlySummary } from '@/types';

export function useYearlySummary(year: number) {
    return useQuery<YearlySummary>({
        queryKey: dashboardKeys.yearlySummary(year),
        queryFn: async () => {
            // Start and end of year as JavaScript Date objects, then converting to Firestore Timestamp
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

            const q = query(
                collection(db, 'transactions'),
                where('date', '>=', Timestamp.fromDate(startOfYear)),
                where('date', '<=', Timestamp.fromDate(endOfYear)),
                orderBy('date', 'asc')
            );

            const querySnapshot = await getDocs(q);

            // Initialize monthly array (1 to 12)
            const monthlyData: Record<number, MonthlySummary> = {};
            for (let i = 1; i <= 12; i++) {
                monthlyData[i] = { month: i, incomeTRY: 0, expenseTRY: 0 };
            }

            let totalIncomeTRY = 0;
            let totalExpenseTRY = 0;

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data() as Transaction;

                // Month index (0-11) + 1 => (1-12)
                const dateObj = data.date.toDate();
                const monthIndex = dateObj.getMonth() + 1;

                if (data.type === 'income') {
                    monthlyData[monthIndex].incomeTRY += data.amountTRY;
                    totalIncomeTRY += data.amountTRY;
                } else if (data.type === 'expense') {
                    monthlyData[monthIndex].expenseTRY += data.amountTRY;
                    totalExpenseTRY += data.amountTRY;
                }
            });

            return {
                monthly: Object.values(monthlyData),
                totals: {
                    incomeTRY: totalIncomeTRY,
                    expenseTRY: totalExpenseTRY,
                    netTRY: totalIncomeTRY - totalExpenseTRY
                }
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}
