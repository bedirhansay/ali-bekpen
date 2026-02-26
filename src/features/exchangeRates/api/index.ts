import { ExchangeRates } from '../types';

/**
 * Fetches live exchange rates relative to TRY using open.er-api.com.
 * Base: TRY — so we invert the rates to get "1 unit = X TRY".
 * Data is sourced from the European Central Bank (ECB) and updated daily.
 */
export const getTCMBRates = async (): Promise<ExchangeRates> => {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/TRY', {
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`Exchange rate API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.result !== 'success') {
            throw new Error('Exchange rate API returned failure result');
        }

        const rates = data.rates as Record<string, number>;

        // Rates are X TRY per 1 unit → invert to get "1 unit = X TRY"
        const usdRate = rates['USD'] ? 1 / rates['USD'] : null;
        const eurRate = rates['EUR'] ? 1 / rates['EUR'] : null;
        const gbpRate = rates['GBP'] ? 1 / rates['GBP'] : null;

        if (!usdRate || !eurRate) {
            throw new Error('Missing required rates in response');
        }

        return {
            date: data.time_last_update_utc ?? new Date().toISOString(),
            USD: parseFloat(usdRate.toFixed(4)),
            EUR: parseFloat(eurRate.toFixed(4)),
            GBP: gbpRate ? parseFloat(gbpRate.toFixed(4)) : undefined,
            TRY: 1,
        };
    } catch (error) {
        console.error('Exchange rate fetch error:', error);

        // Hardcoded fallback as of Feb 2026 — update periodically
        return {
            date: new Date().toISOString(),
            USD: 43.85,
            EUR: 51.65,
            GBP: 55.20,
            TRY: 1,
        };
    }
};
