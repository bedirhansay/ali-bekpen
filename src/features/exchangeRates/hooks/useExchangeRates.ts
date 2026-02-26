import { useQuery } from '@tanstack/react-query';
import { getTCMBRates } from '../api';

export const useExchangeRates = () => {
    const today = new Date().toISOString().split('T')[0];

    return useQuery({
        queryKey: ['tcmb-rates', today],
        queryFn: getTCMBRates,
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
        retry: 2,
    });
};
