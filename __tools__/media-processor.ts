import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { MediaArtifacts, ScoredPost } from "@/lib/types";

const execFileAsync = promisify(execFile);

async function runFfmpeg(args: string[]) {
  await execFileAsync("ffmpeg", ["-y", ...args], { maxBuffer: 1024 * 1024 * 10 });
}

async function getMediaDuration(filePath: string) {
  const { stdout } = await execFileAsync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath]);
  const duration = Number(stdout.trim());
  return Number.isFinite(duration) ? duration : undefined;
}

export async function processPostMedia(post: ScoredPost, runId: string): Promise<MediaArtifacts> {
  const baseDir = path.join(process.cwd(), "downloads", "instagram", "media", runId, post.shortcode);
  const artifacts: MediaArtifacts = {
    postId: post.id,
    shortcode: post.shortcode,
    videoPath: post.downloadedVideoPath,
    framePaths: [],
    frameDescriptions: [],
    errors: []
  };

  if (!post.downloadedVideoPath) {
    artifacts.errors.push("Video file unavailable; using thumbnail/caption-only analysis.");
    return artifacts;
  }

  await mkdir(path.join(baseDir, "frames"), { recursive: true });

  const audioPath = path.join(baseDir, "audio.wav");
  const framePattern = path.join(baseDir, "frames", "frame-%03d.jpg");

  try {
    artifacts.videoDurationSeconds = await getMediaDuration(post.downloadedVideoPath);
  } catch (error) {
    artifacts.errors.push(`Video duration probe failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  try {
    await runFfmpeg(["-i", post.downloadedVideoPath, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audioPath]);
    artifacts.audioPath = audioPath;
    artifacts.audioDurationSeconds = await getMediaDuration(audioPath);
  } catch (error) {
    artifacts.errors.push(`Audio extraction failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  try {
    await runFfmpeg(["-i", post.downloadedVideoPath, "-vf", "fps=1/2", "-frames:v", "10", framePattern]);
    for (let index = 1; index <= 10; index += 1) {
      artifacts.framePaths.push(path.join(baseDir, "frames", `frame-${String(index).padStart(3, "0")}.jpg`));
    }
  } catch (error) {
    artifacts.errors.push(`Frame extraction failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  return artifacts;
}
