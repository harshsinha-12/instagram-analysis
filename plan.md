# Instagram Competitor Creative Intelligence Agent — Product + AI Plan

---

## 1. Problem Statement

Brands currently analyze competitor Instagram content manually. A social media intern or marketer goes through competitor accounts, records metrics like views, likes, comments, and engagement, then tries to understand why some reels worked better than others.

The goal is to build an **AI-powered Instagram Competitor Creative Intelligence Agent** where a brand enters its own account and competitor accounts, and the system automatically identifies top-performing organic content, analyzes the creative reasons behind performance, and suggests how the brand can replicate those patterns — without copying.

```txt
Brand: Groww
Competitors: Zerodha, Angel One, Upstox
Output: Top-performing reels + why they worked + actionable content ideas for Groww
```

The product's core wedge:

```txt
"This worked for Zerodha. Here is why. Here is how Groww can adapt it without copying."
```

Not analytics. Strategic creative intelligence.

---

## 2. Core Product Phases

### Phase 1 — Organic Content Analyzer

Analyze public Instagram reels/posts from competitor accounts.

1. Fetch recent reels/posts from competitor Instagram accounts (see Data Collection Layer).
2. Collect public metrics: views, likes, comments, caption, post date, media URL, thumbnail, content type.
3. Score posts mathematically — normalize for account size and recency.
4. Select top 20 high-performing posts.
5. Run AI analysis per post using: caption, audio transcript, frame images, and comments.
6. Aggregate patterns across all competitors.
7. Generate brand-specific recommendations and new reel ideas.

### Phase 2 — Meta Ads Library Analyzer

Analyze active ads being run by competitors using Meta Ads Library.

Meta Ads Library exposes all currently active ads across Meta properties (Instagram, Facebook, Messenger). For Indian brands, the public web interface is more useful than the official API, which is scoped mainly to political/social issue ads.

Workflow:
- Search by competitor brand name at `facebook.com/ads/library`
- Extract: ad creative type, copy, CTA, media format, start date, estimated reach (EU/UK only), platform placement
- Compare paid creative patterns against organic reel patterns
- Identify: what the brand is promoting vs. what's organically working — the gap is often where new ideas live

Output: side-by-side view of "organic winners" vs "what they're paying to promote."

---

## 3. Data Reality Check — What You Can and Cannot Get

This is where the assignment becomes impressive: showing product judgment, not just coding.

### What's publicly available

```txt
views, likes, comments count, caption, post date, media URL, thumbnail
```

### What's private (not available for competitors)

```txt
reach, saves, shares, profile visits, watch time, retention curve, follower demographics
```

Do not pitch this as "full Instagram analytics." Pitch it as **public competitor creative intelligence**. Saves and shares are private; competitor tools rely on public engagement formulas instead.

### Data Collection Options — Ranked by Reliability

| Option | Reliability | Cost | Notes |
|---|---|---|---|
| **Apify Instagram Scraper** | High | ~$0.50–2/run | Most stable, maintained actor, handles auth challenges |
| **RapidAPI (e.g. Instagram Scraper v3)** | Medium | ~$0.01/req | Multiple providers, check rate limits |
| **Bright Data / Oxylabs** | High | Higher | Enterprise-grade, residential proxies |
| **yt-dlp** | Medium | Free | Good for downloading reels, not for listing posts |
| **Manual CSV Import** | Guaranteed | Free | Demo fallback — always build this path first |

**Recommendation:** Build the Manual CSV Import path first so your demo is never blocked by scraping failures. Then add Apify as the production path. Isolate all scraping behind a data source adapter interface so you can swap providers.

```txt
/scrapers
  base-scraper.interface.ts     ← defines the contract
  apify-scraper.ts
  rapidapi-scraper.ts
  csv-import.ts                 ← always works, used for demos
  meta-ads-scraper.ts
```

Store data in three layers — never mix scraping logic with analysis logic:

```txt
raw_posts       ← exact scraper response, never mutated
processed_posts ← normalized, scored
ai_analysis     ← LLM output per post
```

### Legal / Ethical Note

Instagram's Terms of Service prohibit automated data collection. This is an assignment/demo context. In production, the recommended path is the official Instagram Graph API (requires account ownership or partnership) or licensed data providers. Do not ship this to real users without legal review.

---

## 4. Existing Tools / Market Gap

| Tool | What it does | Gap |
|---|---|---|
| VideoToTextAI | Pulls reels, scores hooks, analyzes comments, generates creative briefs | Single-post focus, no competitor-to-brand translation |
| CreatorFlow | Input metrics, get engagement/virality insights | No AI creative breakdown |
| Not Just Analytics | Instagram profile growth and follower analytics | No content intelligence |
| Meta Ads Library | Active ads across Meta platforms | Organic content not covered |

Your product does what none of these do: translate competitor success into brand-specific strategy with AI reasoning behind every recommendation.

---

## 5. MVP Scope

### Inputs

```json
{
  "brand": "Groww",
  "brand_handle": "@groww",
  "competitors": ["@zerodha", "@angelone_official", "@upstox"],
  "platform": "Instagram",
  "content_type": "reels",
  "lookback_days": 30
}
```

Optional context (significantly improves recommendations):

```json
{
  "industry": "Fintech / Investing",
  "target_audience": "Young Indian retail investors aged 22-35",
  "brand_tone": "Simple, trustworthy, beginner-friendly",
  "brand_avoid": "Jargon, aggressive CTAs, complexity"
}
```

### Outputs

1. Competitor leaderboard (normalized, not raw follower counts)
2. Top posts with scores
3. AI reel breakdown per post (hook, structure, why it worked)
4. Pattern analysis across competitors
5. Brand-specific recommendations
6. Suggested new reel ideas with full creative brief
7. Exportable report (PDF + JSON)

---

## 6. System Architecture

### High-Level Flow

```txt
User Input
   ↓
Input Validator + Account Resolver
   ↓
Data Collection Agent (parallel per competitor)
   ↓
Metrics Normalizer + Scorer
   ↓
Top Post Selector (Top 20 overall + Top 5 per competitor + Top 5 outliers)
   ↓
Media Processor (download → audio extract → transcribe → frame extract)
   ↓
Comment Fetcher (parallel with Media Processor)
   ↓
AI Content Analyzer (parallel per post, batched)
   ↓
Pattern Aggregator (cross-competitor synthesis)
   ↓
Brand Recommendation Engine
   ↓
Report Generator
   ↓
Dashboard / Export
```

### Real-Time Progress (Critical for UX)

Analysis takes 3–10 minutes. Users must see progress or they assume it broke.

Use **Server-Sent Events (SSE)** — simpler than WebSockets, one-directional, works with Next.js API routes.

```txt
Job created → "Fetching posts from Zerodha..."
             → "Fetching posts from Angel One..."
             → "Scoring 87 posts..."
             → "Analyzing reel 1/20..."
             → "Analyzing reel 2/20..."
             → "Generating strategy report..."
             → "Done. Report ready."
```

Frontend subscribes to `GET /api/jobs/:id/stream` (SSE endpoint). Each agent step emits a progress event. The loading page shows a live log of what's happening.

---

## 7. Post Scoring Logic

Score posts mathematically before touching AI. This matters because:
- Raw views favor big accounts
- Recency alone doesn't capture outlier performance
- You want posts that *overperformed for their account* — those are the true insights

### Step 1 — Per-Post Rates

```txt
view_rate        = views / followers
like_rate        = likes / views             (or likes / followers if views unavailable)
comment_rate     = comments / views          (or comments / followers)
engagement_rate  = (likes + comments) / views
```

### Step 2 — Velocity Score (Better than Raw Recency)

```txt
days_since_posted = (today - posted_at) in days
velocity          = views / max(days_since_posted, 1)
```

A reel with 500k views posted 3 days ago (velocity: 166k/day) beats one with 600k views posted 25 days ago (velocity: 24k/day). Velocity captures momentum.

### Step 3 — Relative Performance (Outlier Detection)

Compare each post against its account's own average. This normalizes for account size.

```txt
avg_views_of_account      = mean(all posts' views for this competitor)
avg_engagement_of_account = mean(all posts' engagement_rate for this competitor)

relative_views      = views / avg_views_of_account
relative_engagement = engagement_rate / avg_engagement_rate_of_account
```

A post with `relative_views = 3.2` means it got 3.2x the account's average — that is an outlier worth analyzing.

### Step 4 — Final Score

```txt
score =
  0.35 * relative_views +
  0.25 * relative_engagement +
  0.20 * velocity_normalized +
  0.12 * comment_rate_normalized +
  0.08 * like_rate_normalized
```

All normalized terms are min-max scaled to [0, 1] across all posts in the dataset before weighting.

Recency is captured via `velocity_normalized` — no separate recency_weight needed. A fast-growing new post scores higher on velocity without you needing to hardcode a time penalty.

### Step 5 — Post Selection

```txt
Top 20 posts overall (by final score)
Top 5 posts per competitor (ensures all competitors represented)
Top 5 outlier posts (highest relative_views, regardless of absolute size)
```

---

## 8. Video / Reel Processing Pipeline

```txt
Reel URL
   ↓
yt-dlp: download video file (mp4)
   ↓
ffmpeg: extract audio (mp3/wav)
   ↓
Deepgram / Whisper API: speech-to-text transcription
   ↓
ffmpeg: extract frames every 2 seconds (JPEG)
   ↓
Claude claude-haiku-4-5: describe each frame in 1-2 sentences (batched, cheap)
   ↓
Claude claude-opus-4-8: combine transcript + frame descriptions + caption + metrics → full analysis
```

### Tool choices

| Task | Tool | Why |
|---|---|---|
| Video download | yt-dlp | Handles Instagram reels, actively maintained |
| Audio/frame extract | ffmpeg | Standard, runs locally, no API cost |
| Transcription | Deepgram Nova-2 | Faster and cheaper than Whisper API, handles Hindi/English mix well |
| Frame description | Claude Haiku | Cheap vision model, good enough for "describe what's on screen" |
| Full analysis | Claude Opus | Best reasoning, long context for transcript + frames + caption + comments |

### Fallback (if video download fails)

Many scrapers provide thumbnail URLs. Use the thumbnail + caption + metrics alone. Analysis quality drops ~30% but the product still works. Flag posts where transcript was unavailable.

---

## 9. Comment Analysis

Comments reveal audience psychology — why the reel created a reaction.

### How to get comments

Instagram comments are partially public. Most scrapers (Apify, RapidAPI) can fetch the top 50–100 comments per post. This is sufficient for pattern analysis.

### What to analyze

```txt
questions         → "Does this work for NRI investors?"
confusion         → "What is ELSS exactly?"
praise            → "Best explanation I've seen"
objections        → "This is risky for beginners"
memes             → signal of emotional resonance
part 2 requests   → unmet demand — content opportunity
purchase intent   → "Sharing with my wife, we need to start SIP"
emotional hooks   → fear, aspiration, curiosity, relatability
```

### Comment Analysis Output

```json
{
  "total_comments_analyzed": 84,
  "sentiment": "overwhelmingly positive",
  "top_themes": ["tax confusion", "SIP curiosity", "part 2 demand"],
  "comment_patterns": [
    {
      "pattern": "53 users asked for follow-up content or Part 2",
      "insight": "The reel created educational demand — the topic is underexplained in the market",
      "recommendation": "Build a 3-part series. The demand already exists."
    },
    {
      "pattern": "12 users mentioned sharing with family members",
      "insight": "High shareability — resonates beyond the primary viewer",
      "recommendation": "Use similar relatable framing. Content that people share with family outperforms."
    }
  ]
}
```

---

## 10. AI Analysis Layer

Use AI for qualitative analysis only after mathematical scoring has selected the posts. Do not use AI to rank posts — use it to explain them.

### Model Strategy

| Task | Model | Reason |
|---|---|---|
| Frame description | Claude Haiku | ~$0.0005/frame, fast, good enough |
| Comment clustering | Claude Haiku | Cheap classification |
| Per-post deep analysis | Claude Opus | Best for multi-input synthesis (transcript + frames + caption + comments + metrics) |
| Cross-competitor pattern synthesis | Claude Opus | Needs to reason across 20 posts simultaneously |
| Brand recommendation generation | Claude Opus | Strategic reasoning, not just summarization |

Use the Anthropic SDK with structured output (tool_use / JSON mode) so every AI response is typed and validated before being stored.

### Per-Post Analysis Schema (6 dimensions)

**A. Content Metadata**
```json
{
  "topic": "tax saving under Section 80C",
  "content_pillar": "personal finance education",
  "format": "educational explainer",
  "target_audience": "first-time salaried investors",
  "funnel_stage": "awareness",
  "duration_seconds": 28
}
```

**B. Hook Analysis**
```json
{
  "hook_type": "fear / mistake avoidance",
  "hook_text": "Most people make this tax-saving mistake",
  "hook_strength": 8,
  "why_it_works": "Triggers loss aversion in the first 2 seconds — viewer can't scroll past without risking feeling like they made the mistake"
}
```

**C. Creative Structure**
```json
{
  "opening": "Bold mistake claim (0–3s)",
  "middle": "3-step breakdown with on-screen text (3–22s)",
  "ending": "CTA to save for later (22–28s)",
  "pacing": "fast — cut every 2-3 seconds",
  "visual_style": "talking head + bold text overlays + simple icons",
  "audio": "upbeat background + clear voiceover"
}
```

**D. Engagement Drivers**
```json
{
  "primary_driver": "financial anxiety / fear of missing deductions",
  "secondary_driver": "simplicity — makes a complex topic feel achievable",
  "shareability": "high — people share financial tips with partners",
  "comment_trigger": "implicit question: am I making this mistake?",
  "save_motivation": "reference content people will return to"
}
```

**E. Comment Intelligence**
```json
{
  "sentiment": "positive with high curiosity",
  "top_theme": "demand for Part 2",
  "audience_signal": "many viewers are first-time investors who didn't know about ELSS",
  "content_opportunity": "ELSS deep-dive reel has an existing audience"
}
```

**F. Brand Adaptation**
```json
{
  "adaptation_for_brand": "Groww can make a beginner-focused version: '3 tax-saving mistakes first-time investors make'. Same hook structure, different examples using Groww's own product (ELSS funds).",
  "what_to_keep": "fear hook, list format, save CTA, simple language",
  "what_to_change": "tone (more conversational, less corporate), examples (use relatable middle-class scenarios), avoid copying visual style",
  "suggested_reel_title": "3 mistakes beginners make while saving tax",
  "suggested_hook": "If you're salaried and haven't done this before March 31st, you're losing money"
}
```

---

## 11. Cross-Competitor Pattern Aggregation

After all posts are analyzed, run a synthesis pass that looks for patterns across all 20 analyzed posts.

### Pattern Types to Detect

```txt
Hook patterns         → What hook types appear in the top 20?
Topic clusters        → What topics recur in high-scoring posts?
Format patterns       → What visual formats dominate?
Duration patterns     → What length range performs best?
CTA patterns          → What CTAs appear most in top posts?
Comment patterns      → What audience signals appear across multiple posts?
Timing patterns       → Day of week / time of day correlations
```

### Pattern Aggregation Prompt (to Claude Opus)

```txt
You are analyzing 20 top-performing Instagram reels from competitors of [BRAND].

Below are the AI analyses for each reel (JSON):
[INSERT ALL 20 POST ANALYSES]

Identify 5-7 recurring patterns that explain why these posts outperformed.
For each pattern:
- Name it precisely
- Show which posts exhibit it
- Explain the psychology behind it
- Rate its replicability for [BRAND] (high / medium / low)

Then generate:
- 3 content pillars [BRAND] should build around
- 5 specific reel ideas with full creative brief
- 1 content calendar structure for the next 30 days

Brand context: [BRAND_TONE], [TARGET_AUDIENCE], [BRAND_AVOID]
```

---

## 12. Recommendation Engine

Final output should not say "this reel did well." It should say what pattern caused it to perform and exactly how the brand adapts it.

### Pattern Report Example

```txt
Pattern found across top 20 posts:

1. Mistake-framed hooks (appears in 14/20 top posts)
   Psychology: loss aversion is a stronger motivator than gain
   Replicability for Groww: HIGH

2. Sub-30-second format (appears in 17/20 top posts)
   Psychology: low commitment ask, high completion rate → signals algorithm
   Replicability for Groww: HIGH

3. Text-heavy overlay style (appears in 12/20 top posts)
   Psychology: viewers often watch without sound; text ensures retention
   Replicability for Groww: HIGH

4. Save/share CTAs over follow CTAs (appears in 11/20 top posts)
   Psychology: saves signal interest to algorithm; shares = earned distribution
   Replicability for Groww: HIGH

5. Tax + SIP + beginner topics dominate (11/20 top posts on these topics)
   Psychology: financially anxious audience, especially pre-March 31st
   Replicability for Groww: HIGH (Groww has products directly relevant here)
```

### Suggested Reel Ideas (Full Creative Brief)

```json
[
  {
    "title": "3 investing mistakes beginners make in their first year",
    "inspired_by": "Zerodha tax mistake reel (score: 4.2)",
    "pattern_reused": "Mistake-framed hook + list format + save CTA",
    "format": "Talking head + bold text overlays",
    "duration": "25–30 seconds",
    "hook": "Most beginners lose money in Year 1 — not from bad stocks, but from these 3 mistakes",
    "structure": "Hook (0–3s) → Mistake 1 (3–10s) → Mistake 2 (10–17s) → Mistake 3 (17–24s) → CTA (24–28s)",
    "cta": "Save this before you make your next investment",
    "brand_note": "Use Groww's beginner-friendly tone. Avoid jargon. Use relatable salary/SIP numbers."
  }
]
```

---

## 13. Dashboard Pages

### Page 1 — Setup

```txt
Brand handle (@ input)
Competitor handles (multi-add)
Lookback period (7 / 14 / 30 / 60 days)
Content type (Reels / Posts / Both)
Optional: Industry, Target audience, Brand tone, Brand avoid
→ [Analyze] button
```

On submit: create job, redirect to Page 1.5 (live progress).

### Page 1.5 — Live Progress (SSE-powered)

```txt
[Job created — analyzing 3 competitors]

✓ Fetched 31 reels from @zerodha
✓ Fetched 28 reels from @angelone_official
⟳ Fetching @upstox...
  Scoring 87 posts...
  Selecting top 20...
  Processing videos (12/20)...
  Analyzing content with AI (8/20)...
```

This page prevents users from thinking the app is broken during a 5-minute job.

### Page 2 — Competitor Overview

```txt
Competitor | Followers | Posts Analyzed | Avg Views | Avg Engagement | Best Score | Posting Frequency
```

Show a bar chart comparing average normalized engagement across competitors.

### Page 3 — Top Performing Reels

```txt
Thumbnail | Account | Score | Views | Relative Views | Engagement | Hook Type | Topic | [Deep Dive →]
```

Filterable by competitor. Sortable by score, views, engagement.

### Page 4 — Reel Deep Dive

```txt
Video preview (embedded or thumbnail)
Caption
Metrics bar (views, likes, comments, score, velocity)
AI Summary (2–3 sentences)
Hook Analysis
Creative Structure breakdown
Engagement Drivers
Comment Intelligence
How [Brand] can adapt this
```

### Page 5 — Strategy Report

```txt
Winning patterns (with post counts and psychology)
Content pillars (3 recommended)
30-day content calendar
Suggested reel ideas (5–10, full briefs)
Brand-specific action plan
[Export PDF] [Export JSON]
```

---

## 14. Tech Stack

### Frontend

```txt
Next.js 14 (App Router)
Tailwind CSS
shadcn/ui
Recharts (engagement charts)
EventSource API (SSE for live progress)
```

### Backend

```txt
Node.js / TypeScript
Next.js API Routes (keeps deployment simple)
Prisma ORM
PostgreSQL
BullMQ (job queue for async analysis)
Redis (queue state + response caching)
```

### AI Layer

```txt
Anthropic Claude API:
  - claude-haiku-4-5   → frame descriptions, comment classification (cheap, fast)
  - claude-opus-4-8    → per-post deep analysis, pattern synthesis, recommendations (best quality)

Deepgram Nova-2       → audio transcription (Hindi/English, fast, cheap)
ffmpeg                → frame extraction, audio extraction (local, no API cost)
yt-dlp                → reel download
```

Why Claude over GPT-4o here: Claude Opus has longer effective context (fits transcript + 15 frame descriptions + comments + caption in one call), better structured JSON output reliability, and strong reasoning for the "brand adaptation" step which requires nuanced judgment, not just summarization.

### Storage

```txt
PostgreSQL    → all metadata, scores, AI analysis
Cloudflare R2 → video files, extracted frames, thumbnails, exported PDFs (cheaper than S3)
Redis         → BullMQ queues, job state, API response cache (24-hour TTL per competitor)
```

### Caching Strategy

Cache raw scraped data per competitor handle with 24-hour TTL. If the same competitor was fetched in the last 24 hours, skip re-fetch. This saves API costs and speeds up repeat analyses for the same competitor set.

---

## 15. Database Schema

```prisma
model AnalysisJob {
  id            String        @id @default(uuid())
  brandId       String
  brand         Brand         @relation(fields: [brandId], references: [id])
  status        JobStatus     @default(PENDING)
  config        Json
  createdAt     DateTime      @default(now())
  completedAt   DateTime?
  competitors   Competitor[]
  report        Report?
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

model Brand {
  id            String        @id @default(uuid())
  name          String
  handle        String        @unique
  industry      String?
  targetAudience String?
  brandTone     String?
  brandAvoid    String?
  createdAt     DateTime      @default(now())
  jobs          AnalysisJob[]
}

model Competitor {
  id            String        @id @default(uuid())
  jobId         String
  job           AnalysisJob   @relation(fields: [jobId], references: [id])
  handle        String
  name          String?
  followers     Int?
  avgViews      Float?
  avgEngagement Float?
  postsAnalyzed Int           @default(0)
  scrapedAt     DateTime?
  posts         InstagramPost[]

  @@index([jobId])
}

model InstagramPost {
  id             String      @id @default(uuid())
  competitorId   String
  competitor     Competitor  @relation(fields: [competitorId], references: [id])
  shortcode      String
  url            String
  type           String
  caption        String?
  thumbnailUrl   String?
  videoUrl       String?
  postedAt       DateTime?
  views          Int?
  likes          Int?
  commentsCount  Int?
  rawData        Json?
  score          PostScore?
  analysis       AIAnalysis?
  createdAt      DateTime    @default(now())

  @@unique([competitorId, shortcode])
  @@index([competitorId])
}

model PostScore {
  id                    String        @id @default(uuid())
  postId                String        @unique
  post                  InstagramPost @relation(fields: [postId], references: [id])
  viewRate              Float?
  likeRate              Float?
  commentRate           Float?
  engagementRate        Float?
  velocityPerDay        Float?
  relativeViews         Float?
  relativeEngagement    Float?
  finalScore            Float
  isTopPost             Boolean       @default(false)
  isOutlier             Boolean       @default(false)
}

model AIAnalysis {
  id                 String        @id @default(uuid())
  postId             String        @unique
  post               InstagramPost @relation(fields: [postId], references: [id])
  topic              String?
  contentPillar      String?
  format             String?
  funnel             String?
  hookType           String?
  hookText           String?
  hookStrength       Int?
  visualStyle        String?
  pacing             String?
  primaryDriver      String?
  secondaryDriver    String?
  shareability       String?
  commentPattern     String?
  commentInsight     String?
  whyWorked          String
  brandAdaptation    String
  suggestedTitle     String?
  suggestedHook      String?
  transcriptAvailable Boolean      @default(false)
  framesAnalyzed     Int           @default(0)
  rawJson            Json
  createdAt          DateTime      @default(now())
}

model Report {
  id              String      @id @default(uuid())
  jobId           String      @unique
  job             AnalysisJob @relation(fields: [jobId], references: [id])
  patterns        Json
  contentPillars  Json
  reelIdeas       Json
  actionPlan      Json
  pdfUrl          String?
  createdAt       DateTime    @default(now())
}
```

---

## 16. API Routes

```txt
POST   /api/analyze
       Body: { brand, competitors, lookback_days, content_type, optional context }
       Returns: { jobId }

GET    /api/jobs/:id
       Returns: { status, progress_log, created_at }

GET    /api/jobs/:id/stream
       SSE stream of progress events

GET    /api/reports/:id
       Returns full structured report (patterns, ideas, action plan)

GET    /api/posts/:id/analysis
       Returns deep-dive AI analysis for one post

GET    /api/competitors/:id/posts
       Returns all posts for a competitor with scores

POST   /api/meta-ads/analyze
       Body: { competitor_names[] }
       Returns: ad creative patterns and comparison to organic content
```

---

## 17. Agent Workflow (Detailed)

Each step is a discrete function/class. Agents run in parallel where possible. BullMQ manages the queue.

### Agent 1 — Data Collection Agent

- **Input:** competitor handle, lookback_days, content_type
- **Action:** call scraper (Apify / RapidAPI / CSV import), fetch posts + metadata + top comments (50 per post)
- **Output:** raw post objects stored in `raw_posts` table / JSON files
- **Parallelism:** one sub-job per competitor, all run concurrently
- **Failure handling:** if one competitor fails, mark it as failed, continue with others, flag in report

### Agent 2 — Scoring Agent

- **Input:** all raw posts for a job
- **Action:** compute view_rate, like_rate, comment_rate, engagement_rate, velocity; compute per-competitor averages; compute relative scores; min-max normalize; apply weighted formula
- **Output:** PostScore records, `isTopPost` / `isOutlier` flags
- **No AI used** — pure math, fast, deterministic

### Agent 3 — Media Processor

- **Input:** top 20 posts with video URLs
- **Action per post:**
  1. yt-dlp download video
  2. ffmpeg extract audio + frames (every 2s)
  3. Deepgram transcribe audio
  4. Claude Haiku describe each frame (batched, 5 frames per call)
  5. Store transcript + frame descriptions
- **Parallelism:** process 5 posts concurrently to stay within API rate limits
- **Fallback:** if video download fails, use thumbnail only, set `transcriptAvailable = false`

### Agent 4 — Creative Analysis Agent

- **Input:** one post with caption + metrics + transcript + frame descriptions + top comments
- **Action:** call Claude Opus with structured prompt, validate JSON output, store in AIAnalysis
- **Output:** full 6-dimension analysis per post
- **Parallelism:** 5 posts concurrently (Opus rate limits are lower)
- **Cost:** ~$0.08–0.15 per post analyzed (Opus pricing, ~3k input + ~1k output tokens)

### Agent 5 — Pattern Aggregator

- **Input:** all 20 AIAnalysis records
- **Action:** call Claude Opus with all analyses concatenated, extract patterns, content pillars, timing data
- **Output:** patterns JSON stored in Report
- **Note:** this is the most expensive single call (~8k tokens input, ~2k output), runs once per job

### Agent 6 — Brand Recommendation Agent

- **Input:** patterns + brand context (tone, audience, avoid)
- **Action:** call Claude Opus to generate brand-adapted reel ideas and 30-day content calendar
- **Output:** reelIdeas + actionPlan stored in Report

### Agent 7 — Report Generator

- **Input:** all PostScores + AIAnalyses + patterns + recommendations
- **Action:** render final structured report, optionally generate PDF
- **Output:** Report record, trigger SSE "complete" event to frontend

---

## 18. Prompts

### Frame Description Prompt (Claude Haiku)

```txt
Describe what you see in this Instagram reel frame in 1-2 sentences.
Focus on: who is on screen, what text overlays appear, the visual style, and any graphics or animations.
Be concise and factual. Do not interpret meaning — just describe what's visible.
```

### Per-Post Deep Analysis Prompt (Claude Opus)

```txt
You are a senior social media strategist and creative director analyzing competitor Instagram reels for [BRAND].

BRAND CONTEXT:
- Brand: [BRAND_NAME] (@[BRAND_HANDLE])
- Industry: [INDUSTRY]
- Target audience: [TARGET_AUDIENCE]
- Brand tone: [BRAND_TONE]
- Brand must avoid: [BRAND_AVOID]

COMPETITOR POST DATA:
- Account: @[COMPETITOR_HANDLE] ([FOLLOWER_COUNT] followers)
- Posted: [POSTED_AT]
- Views: [VIEWS] | Likes: [LIKES] | Comments: [COMMENTS_COUNT]
- Performance score: [SCORE] (account avg: [AVG_SCORE])
- Relative performance: [RELATIVE_VIEWS]x the account average

CAPTION:
[CAPTION]

TRANSCRIPT (if available):
[TRANSCRIPT]

FRAME DESCRIPTIONS (every 2 seconds):
[FRAME_DESCRIPTIONS]

TOP COMMENTS:
[TOP_50_COMMENTS]

Analyze this post across these 6 dimensions and return valid JSON matching this schema exactly:
{
  "topic": string,
  "content_pillar": string,
  "format": string,
  "funnel_stage": "awareness" | "consideration" | "conversion",
  "hook_type": string,
  "hook_text": string,
  "hook_strength": number (1-10),
  "why_hook_works": string,
  "visual_style": string,
  "pacing": string,
  "creative_structure": { "opening": string, "middle": string, "ending": string },
  "primary_driver": string,
  "secondary_driver": string,
  "shareability": "low" | "medium" | "high",
  "comment_pattern": string,
  "comment_insight": string,
  "why_it_worked": string (2-3 sentences, be specific about the psychology),
  "adaptation_for_brand": string (how [BRAND] can use this pattern, not copy it),
  "what_to_keep": string,
  "what_to_change": string,
  "suggested_title": string,
  "suggested_hook": string
}

Rules:
- Do not suggest copying the competitor's content, style, or examples
- Suggest adaptation and inspiration only
- Be specific — reference actual timestamps, hook text, visual choices in your analysis
- If transcript was unavailable, work from caption and frame descriptions and note the limitation
```

### Pattern Synthesis Prompt (Claude Opus)

```txt
You are a strategic creative director synthesizing learnings from competitor Instagram analysis for [BRAND].

Below are AI analyses of the top 20 performing posts from [BRAND]'s competitors:
[ALL_20_ANALYSES_AS_JSON]

BRAND CONTEXT:
[BRAND_CONTEXT]

Tasks:
1. Identify 5-7 specific patterns that explain why these posts overperformed.
   For each pattern, include:
   - Pattern name (precise, not generic)
   - Which posts exhibit it (by shortcode)
   - Psychological mechanism behind it
   - Replicability for [BRAND]: HIGH / MEDIUM / LOW + reason

2. Identify 3 content pillars [BRAND] should build around based on competitor evidence.

3. Generate 5 specific reel ideas for [BRAND] with full creative briefs:
   - Title
   - Hook text
   - Structure (opening / middle / ending with timestamps)
   - Format / visual style
   - Duration
   - CTA
   - Which competitor pattern inspired it
   - What makes it distinctly [BRAND] and not a copy

4. Suggest a 30-day content calendar structure (not specific dates, just cadence and mix).

Return valid JSON.
```

---

## 19. Cost Estimation Per Analysis Run

| Step | Tool | Est. Cost |
|---|---|---|
| Scraping 90 posts (3 competitors × 30) | Apify | ~$1.00 |
| Video download (20 reels, ~15MB each) | yt-dlp + egress | ~$0.05 |
| Audio transcription (20 reels, ~90s avg) | Deepgram | ~$0.25 |
| Frame description (20 reels × 45 frames) | Claude Haiku | ~$0.18 |
| Comment classification (20 × 50 comments) | Claude Haiku | ~$0.10 |
| Per-post analysis (20 posts) | Claude Opus | ~$2.40 |
| Pattern synthesis (1 call) | Claude Opus | ~$0.30 |
| Brand recommendation (1 call) | Claude Opus | ~$0.25 |
| **Total per run** | | **~$4.50–6.00** |

For an MVP/demo, this is acceptable. For a product, cache aggressively — if a competitor was analyzed in the last 24h, reuse cached scores and analyses.

---

## 20. Final Report Structure

```md
# Instagram Competitor Intelligence Report

## Brand
Groww (@groww)

## Competitors Analyzed
Zerodha (@zerodha), Angel One (@angelone_official), Upstox (@upstox)

## Summary
Analyzed 87 reels across 3 competitors (last 30 days).
Selected top 20 by normalized performance score.
Processed 18/20 with video + transcript (2 failed download).

## Competitor Leaderboard
| Competitor | Followers | Posts | Avg Views | Avg Engagement | Best Score |
|---|---|---|---|---|---|
| Zerodha | 1.2M | 31 | 820K | 4.1% | 4.7 |
| Angel One | 890K | 28 | 510K | 3.2% | 3.8 |
| Upstox | 650K | 28 | 390K | 2.9% | 3.1 |

## Key Findings
- Mistake-framed hooks appear in 14/20 top posts
- Sub-30-second reels dominate (17/20)
- Tax, SIP, and beginner-investing topics drive the most comments
- Save/share CTAs outperform follow CTAs in top posts

## Top Performing Reels
| Rank | Account | Topic | Score | Relative Views | Hook Type | Why It Worked |
|---|---|---|---|---|---|---|

## Winning Patterns
[5-7 specific patterns with psychology and replicability ratings]

## Content Pillars for Groww
1. Beginner Mistake Series — high demand, high shareability
2. Tax & SIP Explainers — seasonal spikes, save-worthy content
3. Relatable Money Moments — emotional resonance, comment triggers

## Recommended Reel Ideas
[5 full creative briefs]

## 30-Day Content Calendar Structure
[Cadence and content mix]
```

---

## 21. Build Plan

### Day 1 — Foundation

```txt
- Create Next.js app (App Router)
- Set up PostgreSQL + Prisma + Redis
- Create Prisma schema (all models)
- Create BullMQ job queue
- Build manual CSV import path (demo-safe scraper)
- Seed mock dataset: 30 posts per competitor, realistic metrics
```

The mock dataset is built first. Your AI and product demo should never depend on scraping working.

### Day 2 — Scoring Engine

```txt
- Implement per-post metric computation
- Implement per-account average computation
- Implement velocity scoring
- Implement relative performance scoring
- Implement min-max normalization
- Implement final weighted score
- Build POST /api/analyze → job creation
- Build GET /api/jobs/:id and SSE stream endpoint
```

### Day 3 — AI Analysis Pipeline

```txt
- Integrate Claude API (haiku + opus)
- Build frame description pipeline (ffmpeg + haiku)
- Build transcription pipeline (Deepgram or Whisper)
- Build per-post analysis prompt + JSON validation
- Build comment analysis (haiku classification)
- Store all outputs in DB
```

### Day 4 — Dashboard UI

```txt
- Page 1: Setup form
- Page 1.5: Live progress (SSE consumer)
- Page 2: Competitor overview with charts
- Page 3: Top reels table
- Page 4: Reel deep-dive
- Page 5: Strategy report + reel ideas
```

### Day 5 — Pattern Synthesis + Recommendations

```txt
- Build Pattern Aggregator Agent (Claude Opus call across 20 analyses)
- Build Brand Recommendation Agent
- Build 30-day calendar generator
- Wire full job completion → Report page
```

### Day 6 — Meta Ads Extension

```txt
- Build Meta Ads Scraper (or manual input UI)
- Analyze ad creative patterns
- Compare paid vs organic patterns
- Add to Page 5 (strategy report)
```

### Day 7 — Polish

```txt
- PDF export (react-pdf or puppeteer)
- JSON export
- Error states (competitor not found, scrape failed, etc.)
- Loading skeletons
- README with architecture diagram
- Demo walkthrough video
```

---

## 22. Recommended MVP Demo Dataset

Seed this before anything else. If scraping fails during the demo, your app still works.

Use 3 competitors:

```txt
Zerodha      → 31 posts
Angel One    → 28 posts  
Upstox       → 28 posts
```

Each post should include:

```json
{
  "account": "Zerodha",
  "shortcode": "CxBk4a2IaAP",
  "url": "https://www.instagram.com/reel/CxBk4a2IaAP/",
  "caption": "Most investors make this tax-saving mistake every year. Here's what you should actually do before March 31st. Save this. 📌 #investing #tax #elss",
  "views": 1200000,
  "likes": 45000,
  "comments": 620,
  "posted_at": "2026-05-20T10:30:00Z",
  "thumbnail_description": "Founder speaking to camera, text overlay: '3 Tax Mistakes You're Making Right Now'",
  "transcript": "Most investors make this mistake every year. They wait until March to think about taxes...",
  "top_comments": [
    "Please make a Part 2 on ELSS vs PPF",
    "Sharing this with my wife, we've been doing this wrong",
    "What about NRI investors? Does this apply?"
  ]
}
```

Pre-run the AI analysis on this dataset and cache the results. The demo loads instantly and always works.

---

## 23. Assignment Differentiator

The average submission: "I scraped Instagram and made a table."

The strong submission:

```txt
I built a 7-agent AI pipeline that:
1. Collects and normalizes public competitor engagement data
2. Detects outlier posts using velocity + relative performance scoring
3. Processes video, audio, and comments per post
4. Analyzes 6 creative dimensions per reel using Claude Opus
5. Synthesizes cross-competitor patterns with psychological explanations
6. Converts patterns into brand-specific content strategy
7. Presents it all in a live-updating dashboard with exportable report
```

The business framing:

```txt
Not "Instagram Analytics."
"Competitor Creative Intelligence."

What worked → Why it worked → How we can use it.
```

---

## 24. Final Positioning

**Product name:**

```txt
Instagram Competitor Creative Intelligence Agent
```

**Tagline:**

```txt
What worked for your competitors, why it worked, and exactly how you can use it.
```

**One-line pitch:**

```txt
Groww enters three competitor handles. In 5 minutes, it gets a prioritized list
of their best-performing reels, the psychology behind each one, and five
ready-to-brief reel ideas tailored to Groww's audience and tone.
```


Based on the plan and what this project actually needs, here's my opinionated recommendation:

Frontend
Next.js 14 (App Router) + Tailwind + shadcn/ui + Recharts
- App Router gives you API routes + SSE streaming in one repo
- shadcn gives you good-looking components fast (critical for an assignment demo)

Backend — stay in Next.js, don't add Express
Next.js API Routes + Prisma + PostgreSQL + BullMQ + Redis
- BullMQ is non-negotiable here — analysis takes 3–10 min, you need a job queue
- Redis doubles as queue state + 24h competitor cache

AI
Claude claude-haiku-4-5  → frame descriptions, comment classification (~$0.0005/frame)
Claude claude-opus-4-8   → per-post analysis, pattern synthesis, recommendations
Deepgram Nova-2          → audio transcr mix, cheaper than Whisper)
Use the Anthropic SDK with tool_use / structured output so every response is typed JSON — no fragile parsing.

Media processing (local, no API cost)
yt-dlp   → download reels
ffmpeg   → extract audio + frames every 2s
Both run as child processes from your AP

Storage
PostgreSQL (Supabase free tier)  → metad
Cloudflare R2                    → frames, videos, exported PDFs (cheaper than S3, generous free tier)
Redis (Upstash free tier)        → queues + cache

The one decision that matters most: deploy on Vercel + Supabase + Upstash — all have free tiers, all work together without config friction. BullMQ workers can run on Vercel Edge Functions or a small Railway instance.

The stack in the plan matches this. The only thing to avoid: don't add Express as a separate backend — Next.js
API routes are sufficient and keep deplooy.

✻ Churned for 18s

❯ So I need a monorepo ig?

No, you don't need one. A single Next.js app handles everything here.

The only reason to use a monorepo is when you have multiple deployable services that need shared types/code — e.g., a separate Express backend + a React frontend. You don't have that.

Your folder structure inside one Next.js app:

/
├── app/                    ← Next.js pages + API routes
│   ├── api/
│   │   ├── analyze/
│   │   ├── jobs/[id]/
│   │   └── jobs/[id]/stream/   ← SSE endpoint
│   └── (pages)/
├── lib/
│   ├── scrapers/           ← apify, csv-import, etc.
│   ├── scoring/            ← scoring lo
│   ├── ai/                 ← Claude calls, prompts
│   ├── media/              ← yt-dlp, ffmpeg, Deepgram wrappers
│   └── queue/              ← BullMQ job definitions
├── workers/
│   └── analysis.worker.ts  ← BullMQ wor
├── prisma/
│   └── schema.prisma
└── types/                  ← shared TypeScript types

The workers/analysis.worker.ts file runsilway or a Procfile), but it lives in the same repo and imports directly from lib/ — no monorepo tooling needed.

Only add Turborepo if you later split thparate repo with its own package.json.For an assignment demo, that's overkill.