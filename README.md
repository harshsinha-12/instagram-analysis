# Instagram Competitor Creative Intelligence Agent

A Next.js app that analyzes public Instagram competitor reels/posts and turns them into a brand-specific creative strategy report.

The product wedge is:

```txt
This worked for a competitor. Here is why. Here is how our brand can adapt the pattern without copying it.
```

The current implementation is focused on organic Instagram content. It fetches public post metrics, downloads available reel videos, scores posts mathematically, extracts audio/frames, transcribes audio with OpenAI, analyzes creative patterns with structured OpenAI prompts, and renders a report with recommendations.

## What It Does

- Accepts brand context from the frontend: brand, handle, competitors, lookback/date filters, content type, fetch count, top-post count, reels to analyze, industry, target audience, tone, and things to avoid.
- Fetches real public Instagram data through one scraper adapter, `InstagramWebScraper`.
- Downloads reel videos when Instagram exposes a playable video URL.
- Saves each run layer as JSON under `downloads/instagram/runs`.
- Scores posts using deterministic math before AI:
  - relative views
  - relative engagement
  - velocity
  - comment rate
  - like rate
- Selects a balanced AI/media analysis set so each fetched competitor can be represented before filling remaining slots by score.
- Extracts full local audio from downloaded videos with `ffmpeg`.
- Transcribes the complete extracted audio file with OpenAI.
- Extracts frames and describes them with a fast OpenAI model.
- Runs structured creative analysis per post.
- Aggregates cross-competitor patterns.
- Generates brand-specific reel ideas and action steps.
- Shows live job progress through Server-Sent Events.
- Renders a report with charts, top reels, transcript modal, JSON export, and print-to-PDF.

## Current Architecture

```txt
Frontend form
  -> POST /api/analyze
  -> in-memory job created
  -> /jobs/:id subscribes to GET /api/jobs/:id/stream
  -> report agent runs real pipeline
  -> run artifacts saved to downloads/instagram/runs
  -> /reports/:id renders completed report
```

Pipeline:

```txt
Data Collection Agent
  -> Instagram web scraper
  -> raw JSON

Scoring Agent
  -> deterministic ranking
  -> scored JSON

Media Processing Agent
  -> video duration probe
  -> full audio extraction
  -> frame extraction
  -> OpenAI transcription
  -> OpenAI frame descriptions
  -> media JSON

Creative Analysis Agent
  -> structured per-post OpenAI analysis
  -> AI JSON

Pattern Aggregation Agent
  -> cross-post pattern synthesis

Recommendation Agent
  -> brand-specific reel ideas and action plan

Report Agent
  -> final report JSON
```

## Project Structure

```txt
app/
  page.tsx                         Setup form
  jobs/[id]/page.tsx               Live progress page
  reports/[id]/page.tsx            Report dashboard
  api/analyze/route.ts             Creates analysis job
  api/jobs/[id]/route.ts           Reads job state
  api/jobs/[id]/stream/route.ts    SSE job execution/progress stream
  api/reports/[id]/route.ts        Reads report JSON
  api/reports/[id]/export/route.ts Exports report JSON

components/
  CompetitorChart.tsx              Competitor score chart
  MetricCard.tsx                   Report metric cards
  PrintButton.tsx                  Browser print/PDF action
  TopPostsTable.tsx                Top reels table + transcript modal

__agents__/
  data-collection-agent.ts         Fetches competitor posts
  scoring-agent.ts                 Filters and scores fetched posts
  media-processing-agent.ts        Extracts media artifacts and transcripts
  creative-analysis-agent.ts       Runs per-post creative analysis
  pattern-aggregation-agent.ts     Finds recurring patterns
  recommendation-agent.ts          Produces brand-specific ideas
  report-agent.ts                  Orchestrates the full report

__tools__/
  openai-client.ts                 Responses API and transcription calls
  media-processor.ts               ffmpeg/ffprobe audio, frame, duration work
  transcription.ts                 Audio file to transcript wrapper
  frame-describer.ts               Vision/frame description helper
  fallback-analysis.ts             Non-fatal AI fallback output
  logger.ts                        pino logger

__prompts__/
  post-analysis.ts                 Per-post prompt and JSON schema
  frame-description.ts             Frame description prompt/schema
  pattern-aggregation.ts           Pattern aggregation prompt/schema
  recommendations.ts               Recommendation prompt/schema

lib/
  analysis-config.ts               Default brand/config values
  jobs.ts                          In-memory job store
  report.ts                        Thin report-agent wrapper
  run-storage.ts                   Local JSON artifact writer
  scoring.ts                       Deterministic scoring math
  types.ts                         Shared TypeScript types

scrapers/
  base-scraper.interface.ts        Scraper contract
  instagram-web-scraper.ts         Active public web scraper
  meta-ads-scraper.ts              Placeholder for future paid-ad analysis

scripts/
  fetch-instagram-posts.mjs        Standalone Instagram fetch/download script
```

## Requirements

- Node.js 20+
- npm
- `ffmpeg` and `ffprobe` available on `PATH`
- OpenAI API key in `.env.local`

Check media tools:

```bash
ffmpeg -version
ffprobe -version
```

Install on macOS if needed:

```bash
brew install ffmpeg
```

## Environment

Create `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_REASONING_MODEL=gpt-5.5
OPENAI_FAST_MODEL=gpt-5.5-mini
OPENAI_TRANSCRIBE_MODEL=gpt-4o-transcribe
```

Optional:

```bash
IG_SESSIONID=your_instagram_sessionid
```

`IG_SESSIONID` can help when Instagram rate-limits anonymous public requests or withholds video URLs. Do not commit `.env.local`.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

Run checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Demo Flow

1. Start the dev server with `npm run dev`.
2. Open `http://localhost:3000`.
3. Use the default Groww setup or enter another brand and competitors.
4. Click `Analyze competitors`.
5. Watch the live progress page.
6. Open the report after the job completes.
7. Inspect top reels, transcript buttons, patterns, recommendations, and export JSON/print PDF.

## Frontend Inputs

The setup form sends this shape to `POST /api/analyze`:

```ts
type AnalysisInput = {
  brand: string;
  brandHandle: string;
  competitors: string[];
  platform: "Instagram";
  contentType: "reels" | "posts" | "both";
  lookbackDays: number;
  dateFrom?: string;
  dateTo?: string;
  postsToFetchPerCompetitor: number;
  topPostsToSelect: number;
  reelsToAnalyze: number;
  industry?: string;
  targetAudience?: string;
  brandTone?: string;
  brandAvoid?: string;
};
```

These values control fetching, filtering, scoring, media analysis, and recommendations.

## Saved Artifacts

Every app run creates a UUID and saves staged JSON files:

```txt
downloads/instagram/runs/<uuid>-run-1-raw.json
downloads/instagram/runs/<uuid>-run-2-scored.json
downloads/instagram/runs/<uuid>-run-3-media.json
downloads/instagram/runs/<uuid>-run-4-ai.json
downloads/instagram/runs/<uuid>-run-5-report.json
```

Downloaded videos are saved by account:

```txt
downloads/instagram/<username>/<shortcode>.mp4
```

Media artifacts are saved by run and shortcode:

```txt
downloads/instagram/media/<runId>/<shortcode>/audio.wav
downloads/instagram/media/<runId>/<shortcode>/frames/frame-001.jpg
```

`downloads/` is ignored by git because it contains generated run data and media.

## Transcript Behavior

The app transcribes the complete extracted local audio file:

```txt
downloaded MP4 -> ffmpeg extracts full audio.wav -> OpenAI transcribes audio.wav -> transcript saved in report
```

If the downloaded Instagram MP4 is only a short preview or partial stream, the transcript can only cover that local file. New runs store audio/video duration metadata so the report can show whether a transcript came from a 27-second reel or a longer reel.

## Standalone Instagram Fetch Script

`npm run play` fetches Groww's latest 5 posts by default:

```bash
npm run play
```

The script also accepts another account URL or handle:

```bash
node scripts/fetch-instagram-posts.mjs https://www.instagram.com/groww_official/ --limit 5
node scripts/fetch-instagram-posts.mjs @upstox.pro --limit 10
node scripts/fetch-instagram-posts.mjs @zerodhaonline --limit 5 --no-download
```

It saves:

```txt
downloads/instagram/<username>/last-5-posts.json
downloads/instagram/<username>/<shortcode>.mp4
```

This script is useful for quickly validating whether Instagram currently exposes public post and video data for an account.

## Scoring

Scoring happens before AI so the model only analyzes posts that matter. `lib/scoring.ts` computes:

- `viewRate`
- `likeRate`
- `commentRate`
- `engagementRate`
- `velocityPerDay`
- `relativeViews`
- `relativeEngagement`
- normalized velocity/comment/like scores
- final weighted score

The current weights are:

```txt
relativeViews: 0.35
relativeEngagement: 0.25
velocity: 0.20
commentRate: 0.12
likeRate: 0.08
```

## Important Limitations

- Instagram public web endpoints can change, rate-limit, or omit data.
- Competitor private metrics are not available:
  - reach
  - saves
  - shares
  - retention
  - watch time
  - demographics
- Comments are not deeply fetched yet; current scraping reliably captures comment counts.
- Jobs are stored in memory, so reports are not durable across server restarts except for saved JSON files.
- This is a local MVP. Production usage needs legal review, durable storage, retries, background queues, and a licensed/approved data source.

## Current Gaps / Next Work

- Read completed reports directly from saved run JSON instead of rebuilding if a job is missing.
- Move jobs from memory to persistent storage.
- Add retry/backoff and timeout handling around Instagram requests.
- Add richer scraper error categories and show them in the UI.
- Fetch top comments where public endpoints allow it.
- Add Meta Ads Library analysis for paid-vs-organic comparison.
- Add report history and saved run browser.
- Add background processing with Redis/BullMQ or equivalent queue.

## Notes on Data Collection

The active scraper is `scrapers/instagram-web-scraper.ts`. Apify, RapidAPI, and CSV import paths are intentionally not part of the current codebase. Scraping is isolated behind `scrapers/base-scraper.interface.ts` so a future provider can be added without changing the agent pipeline.

Use this project as public competitor creative intelligence, not full Instagram analytics.
