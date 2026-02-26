import { useQuery } from '@tanstack/react-query';
import { getMonthlySummary } from '../api';

const getMonthBounds = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return { firstDay, lastDay, monthKey };
};

export const useMonthlySummary = (vehicleId: string) => {
    const { firstDay, lastDay, monthKey } = getMonthBounds();

    const { data, isLoading } = useQuery({
        queryKey: ['monthlySummary', vehicleId, monthKey],
        queryFn: () => getMonthlySummary(vehicleId, firstDay, lastDay),
        enabled: !!vehicleId,
    });

    return {
        totalIncomeTRY: data?.totalIncomeTRY ?? 0,
        totalExpenseTRY: data?.totalExpenseTRY ?? 0,
        netTRY: data?.netTRY ?? 0,
        isLoading,
    };
};
