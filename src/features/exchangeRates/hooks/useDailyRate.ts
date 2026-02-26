import { useQuery } from '@tanstack/react-query';
import { getLatestExchangeRates } from '../api';
import { SupportedCurrency } from '../types';

/**
 * Returns the exchange rate (in TRY) for a given currency.
 *
 * - If currency is "TRY", returns 1 immediately.
 * - Otherwise, fetches from client-side API (with 1-hour Firestore cache).
 */
export const useDailyRate = (currency: SupportedCurrency) => {
    return useQuery({
        queryKey: ['exchangeRate', currency],
        queryFn: async () => {
            if (currency === 'TRY') return 1;
            const rates = await getLatestExchangeRates();
            const rate = rates[currency];
            if (!rate) throw new Error(`${currency} için kur bulunamadı.`);
            return rate;
        },
        enabled: currency !== 'TRY',
        placeholderData: currency === 'TRY' ? 1 : undefined,
        staleTime: 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
        retry: 2,
    });
};
