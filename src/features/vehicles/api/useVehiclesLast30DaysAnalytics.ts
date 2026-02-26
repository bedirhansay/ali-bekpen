import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/utils/firebase-config';
import { COLLECTIONS } from '@/shared/utils/firebase';
import { Transaction } from '@/features/transactions/types';
import dayjs from 'dayjs';

export type Vehicle30DaysAnalytics = {
    incomeTry: number;
    expenseTry: number;
    netTry: number;
    txCount: number;
};

export type Vehicles30DaysAnalyticsMap = Record<string, Vehicle30DaysAnalytics>;

export const useVehiclesLast30DaysAnalytics = (enabled: boolean = true) => {
    return useQuery<Vehicles30DaysAnalyticsMap>({
        queryKey: ['vehicles', 'analytics', 'last30days'],
        queryFn: async () => {
            const startDate = dayjs().subtract(30, 'day').startOf('day').toDate();

            const q = query(
                collection(db, COLLECTIONS.TRANSACTIONS),
                where('date', '>=', Timestamp.fromDate(startDate)),
                orderBy('date', 'desc')
            );

            const snapshot = await getDocs(q);
            const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));

            const map: Vehicles30DaysAnalyticsMap = {};

            transactions.forEach(tx => {
                const amount = tx.amountTRY ?? tx.amount ?? 0;

                if (!map[tx.vehicleId]) {
                    map[tx.vehicleId] = { incomeTry: 0, expenseTry: 0, netTry: 0, txCount: 0 };
                }

                if (tx.type === 'INCOME') {
                    map[tx.vehicleId].incomeTry += amount;
                    map[tx.vehicleId].netTry += amount;
                } else if (tx.type === 'EXPENSE') {
                    map[tx.vehicleId].expenseTry += amount;
                    map[tx.vehicleId].netTry -= amount;
                }

                map[tx.vehicleId].txCount += 1;
            });

            return map;
        },
        staleTime: 60 * 1000, // 60 seconds
        refetchOnWindowFocus: false,
        enabled
    });
};
