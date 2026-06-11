import { describeFrame } from "@/__tools__/tools__frame__describer";
import { logger } from "@/__tools__/tools__logger";
import { processPostMedia } from "@/__tools__/tools__media_processor";
import { transcribeAudio } from "@/__tools__/tools__transcription";
import { MediaArtifacts, ScoredPost } from "@/declaration";
import { AGENT_MEDIA_PROCESSING, DEFAULT_FRAME_INTERVAL_SECONDS, MAX_FRAMES_TO_DESCRIBE } from "@/config";

async function describePostFrames(media: MediaArtifacts) {
  const framesToDescribe = media.framePaths.slice(0, MAX_FRAMES_TO_DESCRIBE);

  return Promise.all(
    framesToDescribe.map((framePath, index) => {
      return describeFrame(framePath, index * DEFAULT_FRAME_INTERVAL_SECONDS);
    })
  );
}

async function processPost(post: ScoredPost, runId: string) {
  logger.info({ agent: AGENT_MEDIA_PROCESSING, shortcode: post.shortcode }, "processing media");

  const media = await processPostMedia(post, runId);
  media.transcript = await transcribeAudio(media.audioPath);
  media.frameDescriptions = await describePostFrames(media);

  logger.info(
    {
      agent: AGENT_MEDIA_PROCESSING,
      shortcode: post.shortcode,
      frames: media.frameDescriptions.length,
      transcriptAvailable: Boolean(media.transcript?.text),
      errors: media.errors.length
    },
    "media processed"
  );

  return [post.id, media] as const;
}

export async function runMediaProcessingAgent(posts: ScoredPost[], runId: string): Promise<Map<string, MediaArtifacts>> {
  const entries = await Promise.all(
    posts.map((post) => processPost(post, runId))
  );

  return new Map(entries);
}
