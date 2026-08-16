import { Actor, log } from 'apify';
import { fetchHospitals } from './cms.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { name, state, minRating, maxResults = 25 } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const HOSPITAL_SEARCH_EVENT = 'hospital-search';

const hospitals = await fetchHospitals({
    name,
    state,
    minRating,
    maxResults: Math.min(maxResults, 100),
});

for (const hospital of hospitals) {
    await Actor.pushData(hospital);
}

await Actor.charge({ eventName: HOSPITAL_SEARCH_EVENT });

log.info(`Pushed ${hospitals.length} hospital(s)`);

await Actor.exit();
