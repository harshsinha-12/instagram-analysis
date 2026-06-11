import { buildPostAnalysisPrompt, postAnalysisSchema } from "@/__prompts__/prompt__post__analysis";
import { fallbackPostAnalysis } from "@/__tools__/tools__fallback__analysis";
import { logger } from "@/__tools__/tools__logger";
import { getOpenAIModels, requestStructuredJson } from "@/__tools__/tools__openai";
import { AGENT_CREATIVE_ANALYSIS, SCHEMA_POST_ANALYSIS } from "@/config";
import { AnalyzedPost, AnalysisInput, MediaArtifacts, PostAnalysis, ScoredPost } from "@/declaration";
import { getErrorMessage } from "@/fetcherUtils";

function countAnalyzedFrames(media?: MediaArtifacts) {
  return media?.frameDescriptions.filter((frame) => !frame.error).length ?? 0;
}

async function analyzePost(input: AnalysisInput, post: ScoredPost, media?: MediaArtifacts): Promise<AnalyzedPost> {
  const model = getOpenAIModels().reasoning;

  try {
    logger.info({ agent: AGENT_CREATIVE_ANALYSIS, shortcode: post.shortcode, model }, "analyzing post with openai");
    const analysis = await requestStructuredJson<PostAnalysis>({
      model,
      prompt: buildPostAnalysisPrompt(input, post, media?.transcript, media?.frameDescriptions),
      schemaName: SCHEMA_POST_ANALYSIS,
      schema: postAnalysisSchema
    });

    return {
      ...post,
      analysis: {
        ...analysis,
        transcriptAvailable: Boolean(media?.transcript?.text),
        framesAnalyzed: countAnalyzedFrames(media)
      },
      media
    };
  } catch (error) {
    const reason = getErrorMessage(error, "OpenAI analysis failed");
    logger.warn({ agent: AGENT_CREATIVE_ANALYSIS, shortcode: post.shortcode, error: reason }, "post analysis fallback used");

    return {
      ...post,
      analysis: fallbackPostAnalysis(post, input.brand, reason),
      media
    };
  }
}

export async function runCreativeAnalysisAgent(
  input: AnalysisInput,
  posts: ScoredPost[],
  mediaByPostId: Map<string, MediaArtifacts>
) {
  return Promise.all(
    posts.map((post) => {
      return analyzePost(input, post, mediaByPostId.get(post.id));
    })
  );
}
