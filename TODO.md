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
