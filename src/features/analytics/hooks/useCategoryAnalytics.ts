import { useQuery } from '@tanstack/react-query';
import { getFilteredTransactions } from '../api';
import { AnalyticsFilters, CategoryAnalyticItem } from '../types';
import { useCategories } from '../../categories/hooks';
import { TransactionType } from '../../transactions/types';

export const useCategoryAnalytics = (filters: AnalyticsFilters) => {
    const { data: categories, isLoading: isCategoriesLoading } = useCategories();

    return useQuery({
        queryKey: ['analytics', 'categories', filters, categories?.length],
        enabled: !isCategoriesLoading && !!categories,
        queryFn: async () => {
            const transactions = await getFilteredTransactions(filters);
            const safeCategories = categories || [];

            // Group by both categoryId AND type to handle edge cases and missing categories correctly
            const grouped: Record<string, { total: number; type: TransactionType; categoryId: string }> = {};
            let incomeTotal = 0;
            let expenseTotal = 0;

            transactions.forEach(t => {
                const catId = t.categoryId || 'unknown';
                const key = `${catId}_${t.type}`;

                if (!grouped[key]) {
                    grouped[key] = { total: 0, type: t.type, categoryId: catId };
                }
                grouped[key].total += t.amountTRY;

                if (t.type === 'INCOME') {
                    incomeTotal += t.amountTRY;
                } else {
                    expenseTotal += t.amountTRY;
                }
            });

            const results: CategoryAnalyticItem[] = Object.values(grouped).map(group => {
                const category = safeCategories.find(c => c.id === group.categoryId);
                const grandTotal = group.type === 'INCOME' ? incomeTotal : expenseTotal;

                let name = category?.name;
                if (!name) {
                    if (group.categoryId === 'unknown') {
                        name = group.type === 'INCOME' ? 'Kategorisiz Gelir' : 'Kategorisiz Gider';
                    } else {
                        name = `Bilinmeyen (${group.categoryId})`;
                    }
                }

                return {
                    id: `${group.categoryId}_${group.type}`,
                    name,
                    color: category?.color || (group.type === 'INCOME' ? '#22c55e' : '#ef4444'),
                    type: group.type,
                    total: group.total,
                    percentage: grandTotal > 0 ? (group.total / grandTotal) * 100 : 0
                };
            });

            return results.sort((a, b) => b.total - a.total);
        },
    });
};
