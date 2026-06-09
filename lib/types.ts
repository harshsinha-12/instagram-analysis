export type ContentType = "reels" | "posts" | "both";

export type AnalysisInput = {
  brand: string;
  brandHandle: string;
  competitors: string[];
  platform: "Instagram";
  contentType: ContentType;
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

export type RawPost = {
  id: string;
  shortcode: string;
  account: string;
  accountName: string;
  followers: number;
  url: string;
  thumbnailUrl: string;
  videoUrl?: string;
  downloadedVideoPath?: string;
  caption: string;
  postedAt: string;
  views: number;
  likes: number;
  commentsCount: number;
  contentType: "reel" | "post";
  comments: string[];
};

export type ScoredPost = RawPost & {
  viewRate: number;
  likeRate: number;
  commentRate: number;
  engagementRate: number;
  velocityPerDay: number;
  relativeViews: number;
  relativeEngagement: number;
  velocityNormalized: number;
  commentRateNormalized: number;
  likeRateNormalized: number;
  finalScore: number;
  isTopPost: boolean;
  isOutlier: boolean;
};

export type PostAnalysis = {
  topic: string;
  contentPillar: string;
  format: string;
  funnelStage: string;
  hookType: string;
  hookText: string;
  hookStrength: number;
  opening: string;
  middle: string;
  ending: string;
  pacing: string;
  visualStyle: string;
  primaryDriver: string;
  secondaryDriver: string;
  shareability: string;
  commentPattern: string;
  whyWorked: string;
  brandAdaptation: string;
  suggestedTitle: string;
  suggestedHook: string;
  transcriptAvailable: boolean;
  framesAnalyzed: number;
};

export type AnalyzedPost = ScoredPost & {
  analysis: PostAnalysis;
};

export type Pattern = {
  name: string;
  count: number;
  psychology: string;
  replicability: "High" | "Medium" | "Low";
};

export type ReelIdea = {
  title: string;
  inspiredBy: string;
  patternReused: string;
  format: string;
  duration: string;
  hook: string;
  structure: string;
  cta: string;
  brandNote: string;
};

export type Report = {
  id: string;
  input: AnalysisInput;
  createdAt: string;
  rawDataPath?: string;
  fetchErrors?: Array<{ handle: string; error: string }>;
  competitors: Array<{
    handle: string;
    name: string;
    followers: number;
    postsAnalyzed: number;
    avgViews: number;
    avgEngagement: number;
    bestScore: number;
    postingFrequency: string;
  }>;
  topPosts: AnalyzedPost[];
  patterns: Pattern[];
  contentPillars: string[];
  reelIdeas: ReelIdea[];
  actionPlan: string[];
};

export type JobStatus = "pending" | "running" | "completed" | "failed";

export type ProgressEvent = {
  status: JobStatus;
  message: string;
  step: number;
  totalSteps: number;
  reportId?: string;
};
