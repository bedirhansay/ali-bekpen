import { useQuery } from '@tanstack/react-query';
import { getYearlyTransactions } from '@/features/transactions/api';
import { Transaction } from '@/features/transactions/types';
import dayjs from 'dayjs';

export const useYearlySummary = (year: number) => {
    return useQuery({
        queryKey: ['yearlySummary', year],
        queryFn: async () => {
            const transactions = await getYearlyTransactions(year);

            const months = [
                { name: 'Ocak', income: 0, expense: 0 },
                { name: 'Şubat', income: 0, expense: 0 },
                { name: 'Mart', income: 0, expense: 0 },
                { name: 'Nisan', income: 0, expense: 0 },
                { name: 'Mayıs', income: 0, expense: 0 },
                { name: 'Haziran', income: 0, expense: 0 },
                { name: 'Temmuz', income: 0, expense: 0 },
                { name: 'Ağustos', income: 0, expense: 0 },
                { name: 'Eylül', income: 0, expense: 0 },
                { name: 'Ekim', income: 0, expense: 0 },
                { name: 'Kasım', income: 0, expense: 0 },
                { name: 'Aralık', income: 0, expense: 0 },
            ];

            let totalIncomeTRY = 0;
            let totalExpenseTRY = 0;

            transactions.forEach((tx: Transaction) => {
                const txDate = (tx.date as any).toDate ? (tx.date as any).toDate() : tx.date;
                const monthIdx = dayjs(txDate).month();

                if (tx.type === 'INCOME') {
                    months[monthIdx].income += tx.amountTRY;
                    totalIncomeTRY += tx.amountTRY;
                } else {
                    months[monthIdx].expense += tx.amountTRY;
                    totalExpenseTRY += tx.amountTRY;
                }
            });

            return {
                months,
                totalIncomeTRY,
                totalExpenseTRY,
                netTRY: totalIncomeTRY - totalExpenseTRY
            };
        }
    });
};
