# Instagram Competitor Creative Intelligence Agent

This is a Next.js MVP for the Agent Rocket take-home plan in `plan.md`.

The current build focuses on the demo-safe Phase 1 path:

- setup form for brand, competitor handles, lookback, content type, and brand context
- SSE-powered live progress page
- deterministic public-metric scoring with relative views, engagement, velocity, comment rate, and like rate
- top reel report with competitor overview, winning patterns, suggested reel ideas, JSON export, and print-to-PDF
- Instagram web scraper adapter plus Meta Ads Library extension point isolated from analysis logic

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo Flow

1. Use the default setup values: Groww, Zerodha, Angel One, Upstox.
2. Click `Analyze competitors`.
3. Watch the SSE progress log.
4. Open the report.
5. Export JSON or use browser print for a PDF.

## Project Map

```txt
app/
  api/analyze/route.ts              POST /api/analyze
  api/jobs/[id]/stream/route.ts     SSE progress stream
  api/reports/[id]/route.ts         structured report
  jobs/[id]/page.tsx                live progress UI
  reports/[id]/page.tsx             dashboard/report UI
components/                         report and chart components
lib/
  sample-data.ts                    in-memory demo posts
  scoring.ts                        deterministic ranking math
  mock-ai.ts                        typed placeholder creative analysis
  report.ts                         report aggregation
  jobs.ts                           in-memory job store
scrapers/
  base-scraper.interface.ts         scraper contract
  instagram-web-scraper.ts          active Instagram public web scraper adapter
  meta-ads-scraper.ts               phase-two stub
```

## Next Production Steps

1. Replace `lib/mock-ai.ts` with OpenAI Responses API structured output calls.
2. Add media processing with `yt-dlp`, `ffmpeg`, and OpenAI transcription fallback flags.
3. Add Prisma models from `plan.md` and move the in-memory job store into PostgreSQL.
4. Add BullMQ/Redis for long-running media and AI jobs.
