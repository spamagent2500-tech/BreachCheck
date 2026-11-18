# BreachCheck implementation outcomes

## Responsive privacy-first exposure dashboard
- Build a browser-based BreachCheck utility that feels like a professional cybersecurity tool, works responsively, and clearly distinguishes safe educational lab behavior from real breach services.
- Provide an overview summarizing the local demo workflow, privacy guarantees, exposure status, severity, and recommended next steps.

## Local email exposure lookup and dataset parsing
- Validate an email address and search clearly labeled local sample breach records without sending the address to an external service.
- Include useful invalid, loading, empty, cached, rate-limit/error, and no-live-data messaging states.
- Explain the local dataset source limitations and support loading a small CSV or JSON fixture locally in the browser.

## Password k-anonymity demonstration
- Accept an optional lab-only password through a concealed field, hash it locally with SHA-1, show only safe comparison metadata, and never display or transmit the password or full hash.
- Demonstrate a k-anonymity-style prefix/suffix comparison and report the locally matched count.

## Merged findings, severity, and actions
- Merge overlapping API-style and local findings by breach, preserve source context, union exposed data classes, and retain the earliest date.
- Score findings from exposed data classes with accessible risk labels and understandable rationale.
- Show concrete actions such as changing reused passwords, enabling MFA, monitoring accounts, and reviewing recovery details.

## Exportable sample report and safety boundaries
- Export a JSON sample exposure report containing merged findings, severity rationale, recommended actions, timestamp, and an explicit non-production disclaimer.
- Keep all demo fixtures local, avoid real credentials or live breach data, and repeat the lab-only safety boundary throughout the workflow.

## PDF-compliant Python command-line tool
- Provide Python files that run from the command line and produce a per-address exposure report with breach name, date, data classes, severity, recommended action, check date, and sources.
- Hash lab-only passwords locally with SHA-1, send only the first five characters to the password range API, compare returned suffixes locally, and never print, store, or send the full password or full hash.
- Query the email breach API with an API key read from `HIBP_API_KEY`, parse JSON breach name/date/data classes, and report missing keys and API failures clearly.
- Load CSV, JSON, or JSONL lab datasets locally, normalize addresses to lowercase, stream records where supported, and return only records matching the requested address.
- Merge duplicate breaches across API and local sources, preserve the earliest date, union data classes, record sources, score High/Medium/Low severity, and provide a concrete action for every finding.
- Honor HTTP 429 with backoff/retry, handle timeouts and API errors, and cache API results locally to avoid repeated calls.
- Provide stretch workflows for batch addresses, re-checking against a previous report, and text/JSON/CSV export.
- Include README instructions, fictional lab data, sample report output, environment-key guidance, unit tests, and lab-only safety rules.
