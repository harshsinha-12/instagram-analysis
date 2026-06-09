import { describeFrame } from "@/__tools__/frame-describer";
import { logger } from "@/__tools__/logger";
import { processPostMedia } from "@/__tools__/media-processor";
import { transcribeAudio } from "@/__tools__/transcription";
import { MediaArtifacts, ScoredPost } from "@/lib/types";

export async function runMediaProcessingAgent(posts: ScoredPost[], runId: string): Promise<Map<string, MediaArtifacts>> {
  const entries = await Promise.all(
    posts.map(async (post) => {
      logger.info({ shortcode: post.shortcode }, "processing media");
      const media = await processPostMedia(post, runId);
      media.transcript = await transcribeAudio(media.audioPath);

      const framesToDescribe = media.framePaths.slice(0, 5);
      media.frameDescriptions = await Promise.all(
        framesToDescribe.map((framePath, index) => describeFrame(framePath, index * 2))
      );

      logger.info(
        { shortcode: post.shortcode, frames: media.frameDescriptions.length, transcriptAvailable: Boolean(media.transcript?.text), errors: media.errors.length },
        "media processed"
      );
      return [post.id, media] as const;
    })
  );

  return new Map(entries);
}
