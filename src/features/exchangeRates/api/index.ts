import { httpsCallable } from 'firebase/functions';
import { functions } from '@/shared/utils/firebase-config';
import { DailyRatesResponse } from '../types';

const getDailyRatesCallable = httpsCallable<void, DailyRatesResponse>(functions, 'getDailyRates');

/**
 * Calls the getDailyRates Cloud Function.
 * The function fetches from TCMB once per day and caches the result in Firestore.
 * No CORS issues — all communication goes through Firebase.
 */
export const getDailyRates = async (): Promise<DailyRatesResponse> => {
    const result = await getDailyRatesCallable();
    return result.data;
};
