export function formatAmountForStripe(amount, currency) {
    let numberFormat = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol",
    });

    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency = true;

    for (const part of parts) {
        if (part.type === "decimal") {
            zeroDecimalCurrency = false;
            break;
        }
    }

    return zeroDecimalCurrency ? amount : Math.round(amount * 100);
  
}