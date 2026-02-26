import { useQuery } from '@tanstack/react-query';
import { getDailyRates } from '../api';
import { SupportedCurrency } from '../types';

/**
 * Returns the exchange rate (in TRY) for a given currency on a given date.
 *
 * - If currency is "TRY", returns 1 immediately without a network call.
 * - Otherwise, fetches from the Cloud Function (which caches in Firestore).
 * - Uses TanStack Query for client-side caching across the session.
 *
 * Query key: ["exchangeRate", currency, date]
 */
export const useDailyRate = (currency: SupportedCurrency, date: string) => {
    return useQuery({
        queryKey: ['exchangeRate', currency, date],
        queryFn: async () => {
            const response = await getDailyRates();
            if (currency === 'TRY') return 1;
            const rate = response.rates[currency as keyof typeof response.rates];
            if (!rate) throw new Error(`${currency} için kur bulunamadı.`);
            return rate;
        },
        enabled: currency !== 'TRY',
        // If TRY, return 1 as placeholder data — query is disabled anyway
        placeholderData: currency === 'TRY' ? 1 : undefined,
        staleTime: 60 * 60 * 1000,       // 1 hour — cloud fn already caches daily
        gcTime: 24 * 60 * 60 * 1000,     // 24 hours in client memory
        retry: 2,
    });
};
