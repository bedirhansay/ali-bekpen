import { useQuery } from '@tanstack/react-query';
import { getDailyRates } from '../api';
import { RateMap } from '../types';

/**
 * Fetches all daily rates (USD + EUR) from the Cloud Function in one call.
 * Returns a RateMap: { TRY: 1, USD: <rate>, EUR: <rate> }
 *
 * Used in places where all rates are needed at once (e.g. the form's
 * currency selection auto-fill). For per-currency frozen-at-save semantics
 * use useDailyRate instead.
 */
export const useExchangeRates = () => {
    const today = new Date().toISOString().split('T')[0];

    return useQuery<RateMap>({
        queryKey: ['exchangeRates', today],
        queryFn: async (): Promise<RateMap> => {
            const response = await getDailyRates();
            return {
                TRY: 1,
                USD: response.rates.USD,
                EUR: response.rates.EUR,
            };
        },
        staleTime: 60 * 60 * 1000,   // 1 hour
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
        retry: 2,
    });
};
