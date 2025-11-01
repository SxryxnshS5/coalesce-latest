# Coalesce

A modern single-page app for human–AI collaboration and trait visualization.

## Tech Stack

- Vite + React + TypeScript
- Chakra UI (dark theme)
- Framer Motion (animated transitions)
- Recharts (radar + bar charts)
- Zustand (global state)
- OpenAI API (gpt-4o-mini by default)

## Setup

1. Create a `.env` file based on `.env.example`:

```
VITE_OPENAI_API_KEY=your_api_key_here
```

2. Install dependencies and start the dev server (Windows PowerShell):

```
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Notes on API keys

This app demo calls the OpenAI API directly from the browser using `VITE_OPENAI_API_KEY`. In production, you should proxy these requests through a server to avoid exposing secrets.

## Project Structure

- `src/App.tsx` — Main SPA shell with animated step flow
- `src/sections/Step1..Step5.tsx` — The five steps of the flow
- `src/components/` — Shared UI: editors, charts, loader, stepper, layout card
- `src/store/app.ts` — Zustand store for steps, data, and analysis
- `src/lib/openai.ts` — Helpers for AI answer, trait analysis, and insight
- `src/styles/theme.ts` — Chakra dark theme and colors
- `src/animations/variants.ts` — Framer Motion variants

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check and build for production
- `npm run preview` — Preview production build

## License

MIT
