# Hospital Quality Lookup — CMS Star Ratings

Search U.S. hospitals by name or state and get their official CMS
overall quality star rating (1-5), ownership type, and how their
safety/readmission measures compare to the national average.

Built for patients and caregivers comparing options, benefits teams
evaluating a health plan's network, and researchers doing healthcare
quality analysis.

## Input

```json
{
  "name": "Mayo Clinic",
  "state": "MN",
  "minRating": 4,
  "maxResults": 25
}
```

| Field | Type | Description |
|---|---|---|
| `name` | string (optional) | Full or partial hospital name to search for. |
| `state` | string (optional) | Two-letter US state code to limit to hospitals located there. |
| `minRating` | number (optional) | Only return hospitals with at least this CMS overall rating (1-5 stars). |
| `maxResults` | number | Max hospitals to return. Default `25`, max `100`. |

## Output

One record per hospital:

```json
{
  "facilityId": "010001",
  "name": "SOUTHEAST HEALTH MEDICAL CENTER",
  "address": "1108 ROSS CLARK CIRCLE",
  "city": "DOTHAN",
  "state": "AL",
  "zipCode": "36301",
  "county": "HOUSTON",
  "phone": "(334) 793-8701",
  "hospitalType": "Acute Care Hospitals",
  "ownership": "Government - Hospital District or Authority",
  "emergencyServices": true,
  "overallRating": 4,
  "ratingFootnote": null,
  "safetyMeasuresBetterThanNational": 3,
  "safetyMeasuresWorseThanNational": 0,
  "readmissionMeasuresBetterThanNational": 1,
  "readmissionMeasuresWorseThanNational": 1
}
```

`overallRating` is `null` for hospitals CMS hasn't rated (too few
qualifying cases, too new, etc.) — check `ratingFootnote` for why.

A search with no matches returns no items but is still billed once for
the search.

## How it works

Direct calls to the official [CMS Provider Data
API](https://data.cms.gov/provider-data/) (`data.cms.gov`), querying
the Hospital General Information dataset — no proxy, no key, no
scraping. Public U.S. government data, refreshed quarterly by CMS.

## Pricing note

Billed per **search**, not per hospital returned — one charge whether
the search returns 0 hospitals or 100.

## Related products

- [Nursing Home Quality Lookup](https://github.com/timmKal01/nursing-home-quality-lookup) — the long-term care equivalent, same CMS rating system
