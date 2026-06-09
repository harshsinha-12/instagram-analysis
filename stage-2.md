# Stage 2 Plan

This document lists what is left after the current MVP and orders the next work against `plan.md`.

## Current State

The app already has the Phase 1 shell:

- Setup page with brand, competitor handles, content type, lookback, date range, fetch count, top-post count, and analysis count.
- `InstagramWebScraper` fetching public Instagram post/reel metadata, thumbnail URLs, video URLs where available, and downloadable videos.
- Raw run JSON saved under `downloads/instagram/runs/<uuid>-run-1.json`.
- Deterministic scoring in `lib/scoring.ts`.
- SSE progress UI.
- Report dashboard with competitor overview, top posts, generic placeholder analysis, JSON export, and print-to-PDF.

The product is still not a real creative intelligence agent yet. It fetches and ranks real public data, but the qualitative reasoning is mocked.

## OpenAI Model Stack

Use OpenAI only. The user has already added `OPENAI_API_KEY` in `.env.local`.

Recommended defaults:

```txt
OPENAI_REASONING_MODEL=gpt-5.5
OPENAI_FAST_MODEL=gpt-5.5-mini
OPENAI_TRANSCRIBE_MODEL=gpt-4o-transcribe
```

Usage:

- `gpt-5.5` for per-post deep analysis, cross-competitor pattern aggregation, and brand recommendation generation.
- `gpt-5.5-mini` for cheaper frame descriptions, comment clustering, and fallback quick summaries.
- `gpt-4o-transcribe` for audio transcription from extracted reel audio.

Implementation should use the OpenAI Responses API with structured outputs for analysis JSON. Keep model names in environment variables so they can be changed without touching code.

## Stage 2 Goal

Turn the current MVP into a real organic creative analyzer:

```txt
Fetch real competitor posts
→ score posts mathematically
→ process selected videos/images
→ extract transcript, frames, and comments
→ run structured AI analysis
→ aggregate patterns
→ generate brand-specific recommendations
→ persist every layer for repeatable reports
```

## 1. Data Layer Cleanup

Remove remaining demo-only data paths.

- Delete `lib/sample-data.ts` once no import references remain.
- Keep `downloads/instagram/runs` as the local raw artifact store for now.
- Add a clear saved run shape:

```json
{
  "runId": "uuid",
  "step": 1,
  "input": {},
  "scraperResults": [],
  "fetchErrors": [],
  "createdAt": "iso"
}
```

Next implementation:

- Make `saveRunJson` return both `runId` and `filePath`, not only `filePath`.
- Store the run id on the report.
- Add separate files later:
  - `<uuid>-run-1-raw.json`
  - `<uuid>-run-2-scored.json`
  - `<uuid>-run-3-media.json`
  - `<uuid>-run-4-ai.json`
  - `<uuid>-run-5-report.json`

## 2. Scraper Hardening

Current scraper works for public web data, but it is not hardened.

Needed:

- Preserve exact raw Instagram node per post as `rawData`.
- Add retry/backoff for temporary Instagram failures.
- Add timeout handling per competitor so one handle does not block the whole run.
- Distinguish fetch failures:
  - private account
  - no posts in lookback
  - rate-limited
  - malformed/changed Instagram response
  - video URL unavailable
- Add a scraper result summary for the UI:
  - posts fetched
  - reels fetched
  - videos downloaded
  - failures

Do not add Apify/RapidAPI back unless the assignment explicitly requires a provider fallback.

## 3. Real Job Execution

`lib/jobs.ts` is still an in-memory job store and the SSE messages are mostly scripted. Stage 2 should make the progress log reflect actual work.

Needed:

- Change jobs to track:
  - `status`
  - `currentStep`
  - `progressLog`
  - `rawDataPath`
  - `reportId`
  - `error`
- Emit progress after each real step:
  - fetching each competitor
  - scoring posts
  - downloading selected videos
  - extracting frames/audio
  - transcribing
  - analyzing posts
  - aggregating patterns
  - generating report
- Avoid rebuilding reports when opening `/reports/:id`; the report should be created once during the job and then read.

For local MVP, this can remain in memory. For production, move to Prisma/Postgres and BullMQ/Redis as described in `plan.md`.

## 4. Media Processor

This is the biggest missing Phase 1 piece.

Plan requirement:

```txt
video download → audio extract → transcript → frame extract → frame descriptions
```

Current state:

- Video download exists when Instagram exposes `videoUrl`.
- No audio extraction.
- No frame extraction.
- No transcript.
- No frame descriptions.

Needed implementation:

- Add `lib/media/processor.ts`.
- Use downloaded video path when available.
- Use `ffmpeg` to:
  - extract audio to `downloads/instagram/media/<runId>/<shortcode>/audio.wav`
  - extract frames every 2 seconds to `frames/frame-%03d.jpg`
- Add graceful fallback:
  - if video unavailable, use thumbnail only
  - mark `transcriptAvailable: false`
  - mark `framesAnalyzed: 0`
- Save media artifact metadata into run JSON.

## 5. Transcription

Use OpenAI transcription so the project has a single AI provider.

Needed:

- Use `OPENAI_API_KEY` from `.env.local`.
- Add `OPENAI_TRANSCRIBE_MODEL=gpt-4o-transcribe` to `.env.example`.
- Add `lib/ai/transcribe.ts`.
- Input: audio file path.
- Output:

```json
{
  "text": "...",
  "language": "hi-en",
  "durationSeconds": 42,
  "provider": "openai",
  "model": "gpt-4o-transcribe"
}
```

Fallback:

- If transcription fails, continue with caption, thumbnail/frame info, and metrics.

## 6. Comment Fetching

Current public scraper only gets comment counts. The plan expects top comments where possible.

Needed:

- Investigate whether current Instagram web endpoints can fetch top comments for a shortcode/media id.
- Add `comments` to `RawPost` when available.
- Save comment fetch errors separately from post fetch errors.
- If comments are unavailable, continue with `comments: []` and make the report explicit that only counts were available.

Comment analysis should not block the report.

## 7. Replace `mock-ai.ts`

`lib/mock-ai.ts` is intentionally generic placeholder logic. Stage 2 should replace it with a real structured AI analyzer.

Needed:

- Add the official `openai` npm package.
- Add `lib/ai/openai-client.ts` that reads `OPENAI_API_KEY` and model env vars.
- Add `lib/ai/schemas.ts` for the 6-dimension per-post schema from `plan.md`.
- Add `lib/ai/post-analyzer.ts`.
- Input:
  - post metrics
  - caption
  - transcript
  - frame descriptions
  - top comments
  - brand context
- Output:
  - typed `PostAnalysis`
  - raw model JSON
  - validation errors if malformed

Use OpenAI Responses API structured outputs and validate before saving. If the model fails, keep the post in the report with an error state rather than crashing the job.

## 8. Frame Description

Use `gpt-5.5-mini` for cheap vision/frame descriptions before deep analysis.

Needed:

- Add `lib/ai/frame-describer.ts`.
- Batch frames per post.
- Store short factual descriptions only.
- Avoid interpretation here; interpretation belongs in post analysis.
- Use `OPENAI_FAST_MODEL` for this task.

Output:

```json
{
  "framePath": "...",
  "timestampSeconds": 6,
  "description": "..."
}
```

## 9. Pattern Aggregator

Current `lib/report.ts` generates generic static pattern text. It should become a real aggregation step.

Needed:

- Add `lib/ai/pattern-aggregator.ts`.
- Use `OPENAI_REASONING_MODEL`.
- Input: all selected post analyses.
- Output:
  - 5-7 recurring patterns
  - posts exhibiting each pattern
  - psychology
  - replicability for brand
  - content pillars
  - timing observations if enough data exists

This should be AI-generated from actual analyzed posts, not hardcoded.

## 10. Brand Recommendation Engine

Current reel ideas are generic. Stage 2 should make them brand-specific.

Needed:

- Add `lib/ai/recommendation-engine.ts`.
- Use `OPENAI_REASONING_MODEL`.
- Input:
  - patterns
  - brand context
  - top post summaries
- Output:
  - 5-10 reel ideas
  - full creative brief per idea
  - what to keep/change
  - why it fits brand tone
  - what not to copy
  - 30-day content calendar

This is the core wedge:

```txt
This worked for competitor X.
Here is why.
Here is how Groww adapts it without copying.
```

## 11. Database and Persistence

The plan includes Prisma/PostgreSQL. Current app uses memory and JSON files.

Recommended Stage 2.5, after AI flow works locally:

- Add Prisma schema matching `plan.md`.
- Store:
  - `AnalysisJob`
  - `Brand`
  - `Competitor`
  - `InstagramPost`
  - `PostScore`
  - `AIAnalysis`
  - `Report`
- Keep JSON files as debug artifacts, not the primary app state.

Do this after the real analysis pipeline is stable; otherwise schema churn will slow the demo.

## 12. Dashboard Improvements

Current dashboard is a single report page. Plan expects more useful drill-down.

Needed:

- Add top post filters:
  - competitor
  - content type
  - score
  - date
- Add sorting:
  - final score
  - views
  - engagement
  - relative views
  - comment rate
- Add reel deep-dive page:
  - video preview when downloaded
  - caption
  - metrics bar
  - transcript
  - frame summary
  - AI breakdown
  - brand adaptation
- Show fetch/analysis warnings:
  - unavailable videos
  - unavailable comments
  - failed competitor handles
  - fallback analysis used

## 13. Meta Ads Library Phase

This is Phase 2 in `plan.md`. Do not start until organic analysis is credible.

Needed later:

- Build `scrapers/meta-ads-scraper.ts`.
- Fetch active ads by competitor brand name.
- Store:
  - ad copy
  - creative type
  - CTA
  - start date
  - platform placement
- Compare paid patterns with organic winners.
- Add report section:

```txt
Organic winners vs paid creative direction
```

## 14. Immediate Next Task Order

Recommended next sequence:

1. Remove `lib/sample-data.ts` and any obsolete sample-data references.
2. Make saved run files structured as `uuid-run-1-raw.json`, `uuid-run-2-scored.json`, etc.
3. Make SSE progress reflect actual fetch/scoring/report steps.
4. Add media processor with `ffmpeg` frame/audio extraction.
5. Add OpenAI transcription fallback.
6. Add real OpenAI post analyzer and schema validation.
7. Replace static pattern/reel idea generation with AI aggregation.
8. Add reel deep-dive page.
9. Add persistent database only after the local pipeline is stable.
10. Add Meta Ads Library analyzer as Phase 2.

## Current Highest-Risk Gaps

- Instagram public endpoints can break or rate-limit; scraper errors need to be visible and non-fatal.
- Live report generation happens inside request flow; long AI/media work needs background jobs.
- `mock-ai.ts` is not real analysis; the product value is blocked until this is replaced.
- No transcript/frame/comment intelligence yet, so the system cannot truly explain creative performance.
- No persistent DB; reports can disappear on server restart except for raw JSON artifacts.
