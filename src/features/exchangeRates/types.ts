export interface ExchangeRates {
    date: string;
    USD: number;
    EUR: number;
    GBP?: number;
    TRY: number;
}

export interface TCMBRatesResponse {
    date: string;
    rates: {
        USD: number;
        EUR: number;
        [key: string]: number;
    };
}
