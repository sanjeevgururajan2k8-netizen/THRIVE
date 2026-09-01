# PhishShield Frontend

This project is a React + Vite SOC dashboard for a phishing investigation workflow. It currently operates as a frontend-only prototype with mocked API responses, which matches the project’s existing architecture.

## Email Investigation Module

The email investigation workflow implements a lightweight parser that accepts raw email text or `.eml` content, extracts structural indicators, and surfaces the data through a mock API layer for the SOC dashboard.

### Supported inputs

- Raw email text
- `.eml` content
- Plain-text and multipart messages

### Extracted fields

- Message metadata: subject, sender, recipients, reply-to, return path, date, message ID
- Sender and domain analysis
- URL and domain extraction
- Attachment metadata and hash placeholders
- Structural indicators such as reply-to mismatches, visible destination mismatches, and suspicious executable attachments
- HTML sanitization for safe preview rendering

### API contract used by the frontend

- `api.analyzeEmail(rawEmailText, fileName)`
- `api.getEmailInvestigation()`

### Data flow

1. Upload or sample email text
2. Parse the raw content
3. Build a structured object representing metadata, sender, body, URLs, attachments, and indicators
4. Surface the analysis in the Email Investigation page
5. Prepare the object for downstream AI/risk/threat-intel consumers

### Security notes

- Uploaded content is treated as untrusted input.
- HTML is sanitized before preview rendering.
- No attachment is executed or downloaded.
- URLs are parsed statically without making outbound requests.

### How to run

```bash
npm install
npm run dev
```

Then open the app and navigate to the Email Investigation page from the sidebar.
