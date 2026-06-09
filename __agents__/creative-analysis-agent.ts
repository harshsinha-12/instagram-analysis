import { buildPostAnalysisPrompt, postAnalysisSchema } from "@/__prompts__/post-analysis";
import { fallbackPostAnalysis } from "@/__tools__/fallback-analysis";
import { logger } from "@/__tools__/logger";
import { getOpenAIModels, requestStructuredJson } from "@/__tools__/openai-client";
import { AnalysisInput, MediaArtifacts, PostAnalysis, ScoredPost } from "@/lib/types";

export async function runCreativeAnalysisAgent(input: AnalysisInput, posts: ScoredPost[], mediaByPostId: Map<string, MediaArtifacts>) {
  const analyzed = await Promise.all(
    posts.map(async (post) => {
      const media = mediaByPostId.get(post.id);

      try {
        logger.info({ shortcode: post.shortcode, model: getOpenAIModels().reasoning }, "analyzing post with openai");
        const analysis = await requestStructuredJson<PostAnalysis>({
          model: getOpenAIModels().reasoning,
          prompt: buildPostAnalysisPrompt(input, post, media?.transcript, media?.frameDescriptions),
          schemaName: "post_analysis",
          schema: postAnalysisSchema
        });

        return {
          ...post,
          analysis: {
            ...analysis,
            transcriptAvailable: Boolean(media?.transcript?.text),
            framesAnalyzed: media?.frameDescriptions.filter((frame) => !frame.error).length ?? 0
          },
          media
        };
      } catch (error) {
        logger.warn({ shortcode: post.shortcode, error: error instanceof Error ? error.message : error }, "post analysis fallback used");
        return {
          ...post,
          analysis: fallbackPostAnalysis(post, input.brand, error instanceof Error ? error.message : "OpenAI analysis failed"),
          media
        };
      }
    })
  );

  return analyzed;
}
