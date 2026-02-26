import { useQuery } from '@tanstack/react-query';
import { getFilteredTransactions } from '../api';
import { AnalyticsFilters, VehicleAnalyticItem } from '../types';
import { useVehicles } from '../../vehicles/hooks';

export const useVehicleAnalytics = (filters: AnalyticsFilters) => {
    const { data: vehiclesData } = useVehicles();

    return useQuery({
        queryKey: ['analytics', 'vehicles', filters, vehiclesData?.items.length],
        queryFn: async () => {
            const vehicles = vehiclesData?.items || [];
            const transactions = await getFilteredTransactions({ ...filters, type: 'ALL' });

            const grouped: Record<string, { income: number, expense: number }> = {};

            transactions.forEach(t => {
                if (!grouped[t.vehicleId]) {
                    grouped[t.vehicleId] = { income: 0, expense: 0 };
                }

                if (t.type === 'INCOME') {
                    grouped[t.vehicleId].income += t.amountTRY;
                } else {
                    grouped[t.vehicleId].expense += t.amountTRY;
                }
            });

            const results: VehicleAnalyticItem[] = vehicles.map(v => {
                const perf = grouped[v.id] || { income: 0, expense: 0 };
                return {
                    vehicleId: v.id,
                    vehicleName: v.name,
                    vehiclePlate: v.plate,
                    totalIncome: perf.income,
                    totalExpense: perf.expense,
                    net: perf.income - perf.expense
                };
            });

            return results.sort((a, b) => b.net - a.net);
        },
        enabled: !!vehiclesData?.items
    });
};
