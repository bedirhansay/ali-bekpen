import { useQuery } from '@tanstack/react-query';
import { getLatestExchangeRates } from '@/features/exchangeRates/api';
import { SupportedCurrency, RateMap } from '@/features/exchangeRates/types';
import toast from 'react-hot-toast';

/**
 * Returns the exchange rate for a given currency (USD or EUR) in TRY.
 * If currency is "TRY", returns 1 immediately.
 * Uses Frankfurter API with 1-hour Firestore caching.
 */
export function useExchangeRate(currency: SupportedCurrency) {
    const query = useQuery<RateMap>({
        queryKey: ['exchangeRates'],
        queryFn: async () => {
            try {
                return await getLatestExchangeRates();
            } catch (error) {
                toast.error('Kur bilgisi alınamadı.');
                throw error;
            }
        },
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 24 * 60 * 60 * 1000,
    });

    if (currency === 'TRY') {
        return {
            data: 1,
            isLoading: false,
            isError: false,
            error: null,
            refetch: query.refetch
        };
    }

    return {
        ...query,
        data: query.data ? query.data[currency] : undefined,
    };
}
