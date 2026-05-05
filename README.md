# Automated COO — Invoice Converter Demo

Public demo of an AI-powered invoice generator for trades contractors in the Sacramento metro area. Visitors describe what was done on a finished job in plain English; the tool produces a customer-ready invoice. Also accepts a deep link from the quote generator (`quotedemo.netlify.app`) that converts a quote into an invoice deterministically.

## Stack
Vite + React + TypeScript + Tailwind + Anthropic Claude Haiku 4.5 (via Netlify function).

## Develop
```bash
npm install
npm run dev
```

## Deploy
Auto-deploys from `main` branch via Netlify. Requires `ANTHROPIC_API_KEY` env var set in Netlify dashboard.

See `docs/superpowers/specs/` for the design spec and `docs/superpowers/plans/` for the implementation plan.
