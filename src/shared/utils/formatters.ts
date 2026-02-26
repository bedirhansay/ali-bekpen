export const formatCurrency = (amount: number, currencyCode: string = 'TRY', showSymbol: boolean = true) => {
    try {
        return new Intl.NumberFormat('tr-TR', {
            style: showSymbol ? 'currency' : 'decimal',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (e) {
        // Fallback for invalid currency codes
        return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;
    }
};
