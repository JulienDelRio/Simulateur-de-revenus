---
name: scraping-patterns
description: Web scraping structure, rate limiting, error handling, and data normalization for real estate data
---

# Skill: Scraping Patterns

Data collection patterns for gathering real estate listings from external sources.

## Scraper Structure

- One scraper per source site (e.g., `LeboncoinScraper`, `SeLogerScraper`)
- Each scraper implements a common interface:
  - `scrape()` — run the collection
  - `parse(rawData)` — extract structured data from raw HTML/JSON
  - `normalize(parsed)` — map to the internal data model

```
scrapers/
  leboncoin/
    scraper.py
    parser.py
    test_scraper.py
  seloger/
    scraper.py
    parser.py
    test_scraper.py
  shared/
    normalizer.py
    models.py
```

## Rate Limiting and Politeness

- Respect `robots.txt` directives
- Add a delay between requests (minimum 1-2 seconds between requests to the same host)
- Use exponential backoff on rate-limit responses (429)
- Set a meaningful `User-Agent` header
- Run scrapers during off-peak hours when possible

## Error Handling and Retries

- Retry transient failures (network errors, 5xx) up to 3 times with exponential backoff
- Log and skip permanent failures (404, parsing errors) — do not halt the entire run
- Track error rates per source; alert if a source exceeds a threshold (structure may have changed)

## Data Normalization

Map all sources to a unified internal model:

```
{
  sourceId: string,       // unique ID from the source site
  sourceName: string,     // "leboncoin", "seloger", etc.
  title: string,
  priceCents: number,     // always in cents
  surfaceM2: number,      // always in square meters
  rooms: number,
  location: {
    city: string,
    postalCode: string,
    latitude?: number,
    longitude?: number
  },
  url: string,            // original listing URL
  scrapedAt: Date
}
```

<!-- TODO: align with the SQLAlchemy property model when database schema is defined -->

## Deduplication

- Deduplicate by `sourceId + sourceName` (same listing from same source)
- Detect cross-source duplicates by matching on address + price + surface (fuzzy)
- On duplicate: update existing record, track price history

## Legal Considerations

- Only collect publicly available data
- Do not store personal contact information (phone numbers, emails)
- Comply with the source site's terms of service
