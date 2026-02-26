import { useQuery } from '@tanstack/react-query';
import { getLatestExchangeRates } from '../api';
import { RateMap } from '../types';

/**
 * Fetches all daily rates (USD + EUR) from the client-side API.
 * Returns a RateMap: { TRY: 1, USD: <rate>, EUR: <rate> }
 *
 * Implements a 1-hour Firestore cache to meet Spark plan requirements.
 */
export const useExchangeRates = () => {
    return useQuery<RateMap>({
        queryKey: ['exchangeRates'],
        queryFn: getLatestExchangeRates,
        staleTime: 60 * 60 * 1000,   // 1 hour
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
        retry: 2,
    });
};
