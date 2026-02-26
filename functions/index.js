const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const xml2js = require('xml2js');

admin.initializeApp();
const db = admin.firestore();

/**
 * getDailyRates — HTTPS Callable Firebase Cloud Function
 *
 * Returns USD and EUR exchange rates sourced from TCMB.
 * Caches results in Firestore under exchangeRates/{YYYY-MM-DD} to avoid
 * fetching TCMB more than once per calendar day.
 *
 * Return shape: { date: string, rates: { USD: number, EUR: number } }
 */
exports.getDailyRates = functions.https.onCall(async (_data, _context) => {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const cacheRef = db.collection('exchangeRates').doc(today);

    // ── 1. Check Firestore cache ──────────────────────────────────────────────
    const cached = await cacheRef.get();
    if (cached.exists) {
        const data = cached.data();
        return {
            date: today,
            rates: {
                USD: data.USD,
                EUR: data.EUR,
            },
        };
    }

    // ── 2. Fetch from TCMB ───────────────────────────────────────────────────
    let tcmbXml;
    try {
        const response = await axios.get('https://www.tcmb.gov.tr/kurlar/today.xml', {
            timeout: 10000,
            headers: { 'Accept': 'application/xml, text/xml, */*' },
        });
        tcmbXml = response.data;
    } catch (fetchError) {
        throw new functions.https.HttpsError(
            'unavailable',
            'Kur bilgisi alınamadı: TCMB servisine ulaşılamadı.'
        );
    }

    // ── 3. Parse XML ─────────────────────────────────────────────────────────
    let parsedRates;
    try {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(tcmbXml);
        const currencies = result.Tarih_Date.Currency;

        const rates = {};
        currencies.forEach((curr) => {
            const code = curr.$.CurrencyCode;
            if (['USD', 'EUR'].includes(code)) {
                const selling = parseFloat(curr.ForexSelling[0]);
                if (!isNaN(selling) && selling > 0) {
                    rates[code] = selling;
                }
            }
        });

        if (!rates.USD || !rates.EUR) {
            throw new Error('USD veya EUR kuru bulunamadı.');
        }

        parsedRates = rates;
    } catch (parseError) {
        throw new functions.https.HttpsError(
            'internal',
            'Kur bilgisi parse edilemedi.'
        );
    }

    // ── 4. Save to Firestore cache ───────────────────────────────────────────
    try {
        await cacheRef.set({
            USD: parsedRates.USD,
            EUR: parsedRates.EUR,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (_saveError) {
        // Non-fatal: cache write failure should not block the response
    }

    return {
        date: today,
        rates: {
            USD: parsedRates.USD,
            EUR: parsedRates.EUR,
        },
    };
});
