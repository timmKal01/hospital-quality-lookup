const BASE_URL = 'https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retries transient failures (rate limits, upstream 5xx) instead of failing the whole run on one hiccup. */
async function fetchWithRetry(url) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let res;
        try {
            res = await fetch(url, { headers: { Connection: 'close' } });
        } catch (err) {
            lastError = err;
            if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
            continue;
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`CMS API request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`CMS API request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

export async function fetchHospitals({ name, state, minRating, maxResults }) {
    const conditions = [];
    if (name) conditions.push({ property: 'facility_name', value: `%${name}%`, operator: 'like' });
    if (state) conditions.push({ property: 'state', value: state.toUpperCase(), operator: '=' });
    if (minRating) conditions.push({ property: 'hospital_overall_rating', value: String(minRating), operator: '>=' });

    const url = new URL(BASE_URL);
    conditions.forEach((c, idx) => {
        url.searchParams.set(`conditions[${idx}][property]`, c.property);
        url.searchParams.set(`conditions[${idx}][value]`, c.value);
        url.searchParams.set(`conditions[${idx}][operator]`, c.operator);
    });
    url.searchParams.set('limit', String(maxResults));

    const res = await fetchWithRetry(url);
    const body = await res.json();

    return (body.results ?? []).map((h) => ({
        facilityId: h.facility_id,
        name: h.facility_name,
        address: h.address,
        city: h.citytown,
        state: h.state,
        zipCode: h.zip_code,
        county: h.countyparish,
        phone: h.telephone_number,
        hospitalType: h.hospital_type,
        ownership: h.hospital_ownership,
        emergencyServices: h.emergency_services === 'Yes',
        overallRating: h.hospital_overall_rating ? Number(h.hospital_overall_rating) : null,
        ratingFootnote: h.hospital_overall_rating_footnote || null,
        safetyMeasuresBetterThanNational: h.count_of_safety_measures_better ? Number(h.count_of_safety_measures_better) : null,
        safetyMeasuresWorseThanNational: h.count_of_safety_measures_worse ? Number(h.count_of_safety_measures_worse) : null,
        readmissionMeasuresBetterThanNational: h.count_of_readm_measures_better ? Number(h.count_of_readm_measures_better) : null,
        readmissionMeasuresWorseThanNational: h.count_of_readm_measures_worse ? Number(h.count_of_readm_measures_worse) : null,
    }));
}
