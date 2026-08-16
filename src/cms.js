const BASE_URL = 'https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0';

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

    const res = await fetch(url, { headers: { Connection: 'close' } });
    if (!res.ok) {
        throw new Error(`CMS API request failed: ${res.status} ${res.statusText}`);
    }
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
