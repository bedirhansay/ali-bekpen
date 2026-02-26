import { doc, getDoc, setDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/utils/firebase-config';
import { COLLECTIONS } from '@/shared/utils/firebase';
import { RateMap } from '../types';

const EXCHANGE_RATES_DOC = 'latest';

/**
 * Fetches latest exchange rates for USD and EUR to TRY.
 * Implements a 1-hour client-side cache stored in Firestore.
 */
export const getLatestExchangeRates = async (): Promise<RateMap> => {
    let docSnap: any = null;

    // Try to get cached data from Firestore
    try {
        const docRef = doc(db, COLLECTIONS.EXCHANGE_RATES, EXCHANGE_RATES_DOC);
        docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const updatedAt = data.updatedAt as Timestamp;

            if (updatedAt) {
                const now = Timestamp.now();
                // If less than 1 hour old, return cached data
                if (now.seconds - updatedAt.seconds < 3600) {
                    return {
                        TRY: 1,
                        USD: data.USD,
                        EUR: data.EUR,
                    };
                }
            }
        }
    } catch (e) {
        console.warn('Firestore exchange rate read failed, falling back to API', e);
    }

    // Fetch fresh rates from Frankfurter API
    try {
        const [usdRes, eurRes] = await Promise.all([
            fetch('https://api.frankfurter.app/latest?from=USD&to=TRY'),
            fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY')
        ]);

        if (!usdRes.ok || !eurRes.ok) throw new Error('Frankfurter API fetch failed');

        const usdData = await usdRes.json();
        const eurData = await eurRes.json();

        const rates = {
            USD: usdData.rates.TRY,
            EUR: eurData.rates.TRY,
        };

        // Update Firestore cache for other clients - don't block if Firestore fails
        try {
            const docRef = doc(db, COLLECTIONS.EXCHANGE_RATES, EXCHANGE_RATES_DOC);
            await setDoc(docRef, {
                ...rates,
                updatedAt: serverTimestamp(),
            });
        } catch (e) {
            console.warn('Could not save exchange rate to Firestore', e);
        }

        return {
            TRY: 1,
            ...rates,
        };
    } catch (error) {
        console.error('Failed to fetch fresh exchange rates:', error);

        // Fallback to stale cache if API fails
        if (docSnap && docSnap.exists()) {
            const data = docSnap.data();
            return {
                TRY: 1,
                USD: data.USD,
                EUR: data.EUR,
            };
        }

        throw new Error('Kur bilgisi şu an alınamıyor. Lütfen internetinizi kontrol edin.');
    }
};
