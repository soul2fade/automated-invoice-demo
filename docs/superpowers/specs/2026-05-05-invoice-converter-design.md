# Invoice Converter — Design Spec

**Date**: 2026-05-05
**Owner**: soul2fade (The Automated COO)
**Status**: Approved, ready for implementation plan

## 1. Overview

A second public-facing AI demo, parallel to the [quote generator](https://quotedemo.netlify.app). The visitor types what was actually done on a finished job in plain English, picks their trade, and the tool produces a customer-ready invoice with proper invoice fields (number, due date, payment instructions, status badge, "Bill To"). Same brand DNA, same Sacramento pricing reference, same four trades.

This is the second tool in a planned family of contractor demos, the first being the quote generator at `quotedemo.netlify.app`. A future "Contractor OS" wrapper may unify them; that decision is deferred.

### Two entry points

1. **Cold landing** at `invoicedemo.netlify.app` — canned HVAC invoice pre-rendered (status mix per trade), textarea + Generate Invoice button. Mirrors the quote tool's instant-gratification pattern.
2. **Deep link from quote tool** — a "Convert to invoice" link on the quote tool generates a URL with quote data encoded in the fragment. Invoice tool decodes and renders the converted invoice immediately, no AI call. Optional textarea below lets the visitor describe what changed and re-generate with AI.

## 2. Goals & non-goals

### Goals

- Stand alone on LinkedIn as a second Featured card with its own OG image and demo URL
- Reinforce the Contractor OS narrative: a *family* of tools, each useful on its own, that connect into a workflow
- Cap API costs at the same ~$20/year level shared with the quote tool (single Anthropic account, single spend cap)
- Re-use as much of the quote tool's infrastructure as possible (types, pricing data, components, streaming utilities) to keep build time tight

### Non-goals (v1)

- Saved invoices / contractor account / customer database
- Real payment integration (Stripe/ACH/bank links — payment instructions are layout-only with placeholder bank details)
- Status changes after generation (no "mark as paid" workflow, no edit-after-render UI beyond regenerating)
- Email / send / e-signature
- Conversion of an invoice back into something else
- Recurring invoices or subscriptions
- Multi-currency or non-US tax handling
- File upload / PDF ingestion of paper quotes

## 3. Architecture

### Repo & deploy

- **GitHub repo**: `soul2fade/automated-invoice-demo` (public, new)
- **Local path**: `C:/Users/zimme/automated-invoice-demo`
- **Live URL**: `invoicedemo.netlify.app` (rename Netlify subdomain after first deploy)
- **Deploy**: Netlify auto-deploy from `main` branch, same flow as the quote tool

### Stack

Identical to the quote tool — no surprises, no new dependencies:

- **Build**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS 3 (matches quote tool palette + tokens)
- **Tests**: Vitest + @testing-library/react
- **AI backend**: Single Netlify serverless function `netlify/functions/invoice.ts` calling Anthropic API server-side
- **Model**: `claude-haiku-4-5-20251001` (Claude Haiku 4.5)
- **Streaming**: SSE-style chunked text response from the Netlify function back to the client
- **Partial JSON parse**: `partial-json` library (with code-fence stripping baked in from day one — proven necessary on the quote tool)
- **Env var**: `ANTHROPIC_API_KEY` set in Netlify dashboard, never exposed to the client

### Code reuse from quote tool — copy-paste, not shared package

For a second tool, copying ~150 lines is preferable to setting up a monorepo. Migrating to a shared package is deferred until the third tool when the friction is real.

| File / pattern | Treatment |
|---|---|
| `src/types.ts` | Copy `Trade`, `LineItem`, `CustomerInfo`, `ContractorInfo`. Add `Invoice`, `InvoiceStatus`, `PaymentInstructions`. Also copy `Quote` (used for decoding the deep-link payload). |
| `src/pricing/sacramento.ts` | Copy verbatim. Same MSA reference values. |
| `src/lib/streaming.ts` | Copy `parsePartialQuote` → rename to `parsePartialInvoice`. Same code-fence stripping. New `streamInvoice` consumer hits `/api/invoice`. |
| `src/components/Header.tsx` | Copy. Tweak tagline to "AI invoice generator for trades · Sacramento, CA". |
| `src/components/TradeToggle.tsx` | Copy verbatim. |
| `src/components/PrintButton.tsx` | Copy verbatim. |
| `src/components/Toast.tsx` | Copy verbatim. |
| `src/components/CtaBanner.tsx` | Copy verbatim — same Calendly link, same copy. |
| New: `src/components/InvoiceDocument.tsx` | Build fresh. Inspired by `QuoteDocument` but with §4's invoice-specific structure. |
| New: `src/components/JobInput.tsx` | Mostly copy; tweak placeholder text to past-tense completion descriptions. |
| New: `src/components/StatusBadge.tsx` | Pill rendering UNPAID / PAID / OVERDUE per §4. |
| New: `src/lib/quoteToInvoice.ts` | Pure function for the deterministic transformation in §6. |
| New: `src/lib/encoding.ts` | base64url encode/decode helpers + `isValidQuote` structural guard. |

Total scope estimate: roughly 60-70% the size of the quote-generator implementation. Probably 10-12 plan tasks instead of 15.

### Visual design DNA

- Same color palette as the quote tool (slate-50 page background, navy/blue brand accents, status badge colors per §4)
- Same typography (default Tailwind sans-serif for chrome, serif for the invoice document letterhead)
- Same card / border patterns (rounded-2xl, subtle border, soft shadow)
- Invoice document itself uses the same "document-like" internal style (serif headers, structured table, ample whitespace) — visitors should feel the two tools come from the same family

## 4. Invoice document structure

The 11-section document, top to bottom. Sections marked **[new]** are invoice-specific; the rest mirror the quote document with adjusted labels.

1. **Letterhead** — contractor name, license, address, phone, email, website. Same `Your HVAC Company` / `Your Plumbing Company` / etc. placeholders.

2. **Invoice metadata block (right side)** **[new]**
   - Big bold "INVOICE" label
   - Invoice number (e.g. `INV-2026-0142`)
   - Issued: today
   - Due: today + 30 days (Net 30 default, overridable in description)
   - **Status badge** — pill below the dates:
     - `UNPAID` — slate-100 bg, slate-700 text
     - `PAID` — emerald-100 bg, emerald-700 text, with checkmark icon
     - `OVERDUE` — rose-100 bg, rose-700 text

3. **Bill To block** — customer name, address, email, phone (replaces "Prepared for" label)

4. **Quote reference** **[new, conditional]** — only shown when arrived via deep link. Small line under Bill To: *"Per quote Q-SAMPLE-HVAC issued May 4, 2026"*

5. **Job summary** — 1–2 paragraph description of what was done in past tense ("Replaced the…" not "Will replace the…"). For canned invoices, pre-written. For AI-generated, the model rephrases user input professionally.

6. **Line items table** — same Labor / Materials split, columns Description / Qty / Unit / Rate / Total. Same shape as quote.

7. **Totals block** — Subtotal / Sacramento County tax 7.75% on materials / **Total** (the final amount due). When status is PAID, render an additional row "Amount Paid" equal to total, with `Balance Due: $0.00` underneath.

8. **Payment instructions** **[new]** — boxed grey card, two-column layout:
   ```
   Pay by check to:           Pay by ACH:
   Your HVAC Company          Routing: SAMPLE
   1234 Sample St             Account: SAMPLE
   Sacramento, CA 95814       Memo: INV-2026-0142
   ```
   Bank details are placeholder strings (`SAMPLE`, same pattern as the contractor license number) — purely shows the layout.

9. **Invoice terms** **[new boilerplate]** — replaces quote terms with invoice-specific language:
   - "Payment due within 30 days of invoice date."
   - "Late payments accrue 1.5% interest per month."
   - "Returned check fee: $35."
   - "Disputes must be raised within 7 days of invoice date."
   - "By paying this invoice, customer acknowledges work was completed satisfactorily."

10. **Acceptance block** — for invoices, simpler than the quote's: "Customer payment / signature" line + date line. When status is PAID, this block is replaced with a centered "Thank you for your business" line.

11. **Footer** — *"Generated by The Automated COO"* with link, same pattern.

### Status-specific rendering rules

| Status | Visible changes |
|---|---|
| UNPAID | Default. Slate status pill, full payment instructions block, acceptance line. |
| PAID | Green pill with check, "Amount Paid" + "Balance Due: $0.00" rows in totals, "Thank you" replaces signature block. |
| OVERDUE | Red pill, banner above totals: *"This invoice is X days past due."* (X computed from `dueDate`) |

### Status mix across canned invoices

To make the trade-toggle demo visually punchy, each trade's canned invoice has a different default status. A visitor toggling between trades sees all three states without doing anything:

- HVAC: **UNPAID** (recent invoice)
- Plumbing: **UNPAID**
- Electrical: **PAID** (done a week ago)
- Roofing: **OVERDUE** (past due date)

The PAID/OVERDUE canned summaries include a small *"Sample invoice — not a real bill"* line in the `summary` text to prevent visitor confusion.

## 5. UX flow

### Page layout (top to bottom)

1. **Header** — brand mark, logo, tagline: *"AI invoice generator for trades · Sacramento, CA"*
2. **Hero copy** — *"AI invoice generator for trades. Type what you finished — get a customer-ready invoice."*
3. **Trade toggle** — same 4 buttons (HVAC / Plumbing / Electrical / Roofing) (hidden in deep-link mode)
4. **Input area** — textarea + Generate Invoice button
5. **Cross-link affordance** (only when no `#q=` in URL) — small text: *"Have a quote already? Generate it on the [quote tool](https://quotedemo.netlify.app), then click 'Convert to invoice'."*
6. **Output** — InvoiceDocument
7. **CTA banner** — same "Book a 20-min consult" Calendly link as the quote tool (`https://cal.com/benchcoo/20min`)
8. **Footer**

### Cold-landing interaction states

Identical pattern to the quote tool, with "invoice" swapped for "quote":

- **On page load:** trade defaults to HVAC, canned HVAC invoice pre-rendered, textarea empty
- **On trade toggle click:** swap to that trade's canned invoice (with its trade-specific status). Any in-progress generation is aborted.
- **On Generate Invoice click (with non-empty textarea):**
  - Button enters loading state ("Generating invoice…" with spinner)
  - Output area transitions: existing canned example fades, new invoice streams in
  - Document renders progressively as JSON arrives
  - Total perceived time: 3–5 seconds end-to-end with Haiku + streaming
- **On error (API failure, timeout, malformed output):**
  - Output area falls back to the canned example for the current trade
  - Toast at bottom: *"Couldn't generate live — showing a sample instead. Try again?"*

### Deep-link interaction states

When URL contains `#q=<base64>`:

1. **Page load:** decode the quote, run the deterministic transformation (see §6), render invoice immediately. Visible in <1 second, no AI call.
2. **Hero copy swaps** to: *"Converting your quote to an invoice…"* (briefly, while transform runs) → then settles to *"Your invoice. Edit and re-generate if anything changed."*
3. **Status badge** defaults to UNPAID (just generated)
4. **Textarea label changes** to: *"What changed since the quote? (optional)"* with placeholder *"e.g. Job took 14 hr instead of 12. Customer added a 4th return vent."*
5. **Trade toggle is hidden** — trade is determined by the source quote
6. **Small "Start fresh →" link** below the input clears the URL fragment and switches back to cold-landing mode
7. **On Generate click:** AI re-runs in Mode 2 (see §7) with both the original quote AND the change description as context, producing a delta-aware invoice

### Print mode

Same as quote tool. `window.print()` triggers, print CSS hides everything `.no-print`. Status badge prints, payment instructions print, "Thank you" line prints when status is PAID.

## 6. Cross-link mechanism

### Encoding format

The quote tool's "Convert to invoice" button produces a URL like:

```
https://invoicedemo.netlify.app/#q=eyJ0cmFkZSI6Imh2YWMiLCJxdW90ZU51bWJl…
```

Where the fragment value is **base64url-encoded JSON** of the current `Quote` state object:

```ts
// quote tool side
const url = `https://invoicedemo.netlify.app/#q=${btoa(JSON.stringify(currentQuote))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
window.open(url, '_blank');
```

Fragment chosen over query string: fragments aren't sent to the server (Netlify never sees the data), and fragments don't appear in server access logs.

A typical Quote serializes to ~2–3 KB JSON → ~3–4 KB base64url. Well under the 8 KB practical URL limit.

### Decoding + validation

On invoice tool page load:

```ts
function readQuoteFromFragment(): Quote | null {
  const frag = window.location.hash.slice(1);
  const params = new URLSearchParams(frag);
  const encoded = params.get('q');
  if (!encoded) return null;
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded + '=='.slice(0, (4 - padded.length % 4) % 4));
    const parsed = JSON.parse(json);
    if (!isValidQuote(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
```

If decode fails or `isValidQuote` rejects the shape (basic structural check: has `trade`, `lineItems` array, `customer` object, etc.), the page falls back to cold-landing mode silently. A toast appears: *"Couldn't read the quote — showing a fresh invoice instead."*

### Deterministic Quote → Invoice transformation

Pure function, no AI. Lives in `src/lib/quoteToInvoice.ts`:

```ts
function quoteToInvoice(quote: Quote): Invoice {
  return {
    trade: quote.trade,
    invoiceNumber: `INV-${new Date().getFullYear()}-${randomDigits(4)}`,
    dateIssued: today(),
    dueDate: addDays(today(), 30),
    status: 'unpaid',
    contractor: quote.contractor,
    customer: quote.customer,
    sourceQuoteNumber: quote.quoteNumber,
    summary: rephraseToCompletedTense(quote.summary),
    lineItems: quote.lineItems,
    subtotal: quote.subtotal,
    tax: quote.tax,
    total: quote.total,
    paymentInstructions: PLACEHOLDER_PAYMENT_INSTRUCTIONS[quote.trade],
    terms: STANDARD_INVOICE_TERMS,
    acceptanceLine: 'Customer payment / signature',
  };
}
```

`rephraseToCompletedTense` is a small string-replacement helper: swaps "will replace" → "replaced", "is to be installed" → "was installed", etc. Crude but works for the canned summaries; the AI handles real summaries in Mode 2 if the user clicks Generate.

### "Convert to invoice" button on quote tool

A small modification to the **existing** quote-tool repo (`soul2fade/automated-quotes-demo`) — one new component, one App.tsx wiring change.

- **Placement:** under the quote document, next to (or below) the existing "Print quote" link. Same affordance level — a small text link, not a primary button.
- **Behavior:** on click, encode the current `quote` state and open `https://invoicedemo.netlify.app/#q=<encoded>` in a new tab (`window.open(url, '_blank')`). Stays on the quote page in the original tab.
- **Disabled state:** if the quote is mid-generation (`isGenerating === true`), the link is disabled with greyed text. Re-enables when streaming completes.

This change is part of the invoice-converter implementation plan (a task that touches the quote-tool repo).

### Failure modes

| Scenario | Behavior |
|---|---|
| Fragment is missing or empty | Cold-landing mode (default) |
| Fragment isn't valid base64 | Silent fallback to cold-landing + toast |
| Decoded JSON doesn't match Quote shape | Same — fallback + toast |
| Quote is from an old/future schema | `isValidQuote` rejects → fallback + toast |
| User shares the URL | Works — invoice tool only needs the encoded fragment, doesn't fetch from quote-tool origin |
| Decoded quote is huge (>10 KB) | Still works — base64 decode is fast; render unaffected |
| Visitor opens deep link with Anthropic API down | Still renders — deterministic transformation doesn't need AI; only the optional regen does |

## 7. AI integration

### Endpoint

**Netlify function**: `POST /api/invoice`

### Two AI call modes

The function handles two request shapes via a `mode` field, disambiguated server-side:

**Mode 1 — Cold-landing generation:**

```ts
{ mode: 'cold', trade: 'hvac', description: '...what was done...' }
```

AI generates an invoice from scratch using the description + Sacramento pricing reference. Output schema is `Invoice`. Used by cold-landing visitors who type in the textarea.

**Mode 2 — Deep-link delta regeneration:**

```ts
{ mode: 'delta', trade: 'hvac', sourceQuote: <Quote>, changes: '...what changed...' }
```

AI re-emits a full invoice using the source quote as anchor and the changes as override hints. Output schema is `Invoice`. Used when a deep-link visitor types in the textarea and clicks Generate.

Output schema is identical between modes; both stream identically.

### System prompt assembly

Mirrors the quote tool's `buildSystemPrompt` with three structural changes:

1. **Identity tweak** — *"You are an expert invoice generator for {trade} contractors operating in the Sacramento, CA metropolitan statistical area. You produce realistic, regionally-accurate invoices for completed work."* All instructions in past tense ("the work that was done", not "the work to be done").

2. **Output schema** — Invoice JSON shape. Same fields as the quote schema for the shared portions (`summary`, `lineItems`, `subtotal`, `tax`, `total`, `customer`), plus invoice-specific:
   - `invoiceNumber: "INV-YYYY-NNNN"`
   - `dateIssued`, `dueDate`
   - `status: "unpaid" | "paid" | "overdue"` (default `"unpaid"` unless explicitly stated otherwise in the description)
   - `paymentInstructions: { check: { ... }, ach: { routing, account, memo } }`
   - `terms: string[]` (5 invoice-specific lines)
   - Quote-only fields like `validUntil` are absent.

3. **Quality constraints adapted:**
   - Default status: `"unpaid"` — model only sets `paid`/`overdue` if user explicitly says so in the description
   - Default due date: today + 30 days (Net 30) — overridable via description
   - Invoice number format: `INV-{currentYear}-{random4digits}`
   - Terms: invoice boilerplate per §4 #9
   - **Mode 2 additional instruction:** *"The customer is converting an existing quote. Preserve customer info and contractor info exactly. Adjust line item quantities only if the user's change description warrants it. Add new line items only if mentioned. Recompute totals after any changes. Use a NEW invoice number, not the quote number."*

### User message

For Mode 1:
> *"Trade: {trade}. Job description: {visitor's text}"*

For Mode 2:
> *"Trade: {trade}. Source quote: <wrapped JSON>. Changes since the quote: {visitor's text}"*

The source quote is wrapped in `<source_quote>...</source_quote>` XML tags to signal to the model that it's reference data, not instructions (same prompt-injection mitigation pattern as the quote tool).

### Streaming

Same pattern as quote tool — `messages.stream()` server-side, SSE-style chunked text response, `partial-json` consumer client-side, abort signal forwarded to the Anthropic SDK, UTF-8 decoder flush + dedupe-final-yield handling. All the lessons from the quote tool's review/fix passes apply from day one.

### Code-fence stripping

Already proven necessary on the quote tool — Haiku wraps responses in markdown code fences (```` ```json ```` ) despite instructions. The invoice tool's `parsePartialInvoice` includes the same opening/closing fence stripping from day one — saves debugging this twice.

### Error handling

- 30-second timeout on the upstream Anthropic call
- On timeout, rate limit, network error, or malformed JSON: fall back to the trade's canned invoice with a toast message
- Mid-stream failures: server uses `controller.error()` (per the quote tool's final-review fix) so the client cleanly hits its catch path
- Cold-landing errors fall back to the trade's canned invoice. Deep-link errors keep the deterministic-transformation result intact (the AI just couldn't add the delta) and show a toast.
- Errors are logged server-side (Netlify function logs) but never surfaced verbatim to the client (generic error message to the client per the quote tool's pattern)

### Cost expectations

- Mode 1 (cold-landing): ~2k input tokens, ~1k output tokens → ~$0.007 per call. Same as quote tool.
- Mode 2 (delta regeneration): ~3k input tokens (system + source quote JSON + changes), ~1k output tokens → ~$0.011 per call.
- Deep-link visitors who don't click Generate (just print/share the auto-converted invoice) cost **$0** — the structural transformation is client-side only.
- Annual estimate at 500 visitors/year, 30% trying Mode 1, 5% trying Mode 2: ~$1–3/year.
- Anthropic spend cap on the user's account is shared across both tools.

## 8. Sacramento pricing reference

Same `sacramentoPricing` data as the quote tool, copy-pasted into this repo's `src/pricing/sacramento.ts`. Same labor rates, materials, regional notes. Used in the system prompt the same way (injects realistic pricing context for AI output).

If the quote tool's pricing data is updated in the future, this repo's copy needs to be updated in parallel. Acceptable cost for v1; would migrate to a shared package when a third tool reaches the same need.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| AI returns malformed JSON | Same try-parse + fallback to canned invoice with toast (proven on quote tool) |
| Anthropic API outage | Same fallback; canned invoices and deterministic deep-link transformation always available |
| Mode 2 AI "fixes" line items unexpectedly | System prompt is explicit about preserving contractor/customer; user reviews output before doing anything with it |
| Cross-link URL gets tampered with | No auth, no money flow — worst case visitor sees a nonsense pre-filled invoice. `isValidQuote` structural check catches malformed shapes; visitor falls back to cold-landing + toast. |
| Decoded quote exceeds practical URL length | Won't happen at our schema size (~3 KB). If it ever does, the encoder truncates the description before encoding. |
| Visitor types offensive / non-job content | System prompt instructs the model to politely refuse and ask for a job description. Same `{"error": "..."}` fallback as quote tool. |
| Demo gets viral attention, costs spike | Existing $20/year Anthropic spend cap covers BOTH tools (single account) |
| Status badge `PAID` confuses visitor into thinking it's a real paid invoice | Footer attribution + canned-quote-style placeholder names (`Your HVAC Company`, `Diana Chen`) signal demo-ness. PAID/OVERDUE canned invoices include a *"Sample invoice — not a real bill"* line in the summary. |
| Deep-link visitors expect to "edit and send" | Out of scope per non-goals. CTA banner pushes them to book a call instead. |

## 10. Success criteria

- Live at `invoicedemo.netlify.app` with the four-trade toggle working
- Canned invoice renders within 1 second of cold-page load (each trade)
- Cold-landing AI generation completes within 8 seconds for typical input, with streaming progress
- Deep-link arrival renders the converted invoice in under 1 second (no AI call), with the optional textarea ready for delta regen
- Print-to-PDF produces a clean, standalone invoice document
- Status badges visible across all three states (UNPAID / PAID / OVERDUE) when toggling between trades
- "Convert to invoice" link on the quote tool opens a new tab and the invoice arrives pre-filled
- Cross-link works regardless of which subdomain quotedemo lives on (encoding is origin-agnostic)
- LinkedIn Post Inspector renders a proper preview card with OG image
- Visual cohesion with `quotedemo.netlify.app` is obvious to anyone visiting both — same brand DNA, same letterhead style, same canned-customer feel

## 11. Open questions

These decisions are intentionally deferred to implementation time, not blocking the spec:

- **Exact copy for canned-invoice `summary` strings** (past tense, sample-flavored). Will write during the canned-data task.
- **Canned line items** — whether they reuse the canned quotes' line items verbatim or have small variations (e.g. one extra "added at customer's request" item in the OVERDUE roofing one to make it feel more real). Decide at canned-data task.
- **LinkedIn caption copy** for the second Featured card. Decide at deploy time.

## 12. What's NOT in this design (deferred)

- Anything in the §2 non-goals list
- Migrating shared types/utilities into a monorepo or shared npm package — defer until a third tool when triple-pasting actually hurts
- Retroactive renames or rebrand work on the existing quote tool
- A "back to quote" link on the deep-link page (YAGNI for v1)
