export type SupportedCurrency = 'USD' | 'EUR' | 'TRY';

/** Response shape returned by the getDailyRates Cloud Function */
export interface DailyRatesResponse {
    date: string; // "YYYY-MM-DD"
    rates: {
        USD: number;
        EUR: number;
    };
}

/** Firestore exchangeRates/{date} document shape */
export interface ExchangeRateDoc {
    USD: number;
    EUR: number;
    createdAt: unknown; // Firestore Timestamp (server-side)
}

/** Convenience map used in the UI: currency → rate in TRY */
export type RateMap = Record<SupportedCurrency, number>;
