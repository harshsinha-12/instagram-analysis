import { Report } from "@/declaration";

export interface ExecutiveInsight {
  finding: string;
  whyItMatters: string;
  recommendedAction: string;
}

export interface StrategicTakeaway {
  title: string;
  confidence: "High" | "Medium" | "Low";
  evidenceCount: number;
  implication: string;
  response: string;
}

export interface MatrixPoint {
  handle: string;
  name: string;
  x: number; // 0 to 100 (Entertainment -> Education)
  y: number; // 0 to 100 (Low Trust -> High Trust)
}

export interface Opportunity {
  title: string;
  priority: "Immediate" | "Test-and-learn" | "Long-term";
  rationale: string;
  effort: "Low" | "Medium" | "High";
  impact: "High" | "Medium";
  experiment: string;
  metric: string;
}

export function generateExecutiveSummary(report: Report): ExecutiveInsight[] {
  // If we had real AI backend, this would come from the API.
  // For now, we generate contextual mock insights based on the brand.
  const brand = report.input.brand;
  return [
    {
      finding: "Competitors are winning by lowering the intimidation barrier around finance education.",
      whyItMatters: "Beginner investors engage more when financial concepts are introduced through familiar daily-life situations rather than institutional jargon.",
      recommendedAction: `Build recurring reel formats around relatable ${brand} use cases like salary day, SIP dates, and office routines.`
    },
    {
      finding: "Contradiction hooks are driving the highest relative view velocity.",
      whyItMatters: "The tension between expected market behavior and actual outcomes creates a curiosity gap that forces retention through the explanation.",
      recommendedAction: "Test 'Expectation vs Reality' hooks for market dips, FD vs Mutual Fund comparisons, and trending stock news."
    },
    {
      finding: "Hinglish meme-native formats face less scroll resistance.",
      whyItMatters: "Audiences consume Instagram for entertainment first. Hiding a finance lesson inside a familiar meme format increases shareability.",
      recommendedAction: `Use soft humor in the first 3 seconds, but pivot to clear, brand-safe ${brand} UI walk-throughs for the payoff.`
    }
  ];
}

export function generateStrategicTakeaways(report: Report): StrategicTakeaway[] {
  return [
    {
      title: "Everyday-life framing beats technical education",
      confidence: "High",
      evidenceCount: report.patterns[0]?.count || 3,
      implication: "Content that feels like 'studying' gets scrolled past. Content that feels like 'my life' gets saved.",
      response: "Anchor every educational script in a specific physical scenario (e.g., Metro commute, group chat)."
    },
    {
      title: "Self-aware investing mistakes build trust",
      confidence: "High",
      evidenceCount: 2,
      implication: "Retail investors feel shame about market losses. Acknowledging common behavioral mistakes calmly reduces this anxiety.",
      response: "Create a 'Money Mistakes' series that normalizes the error before providing the checklist solution."
    },
    {
      title: "Macro optimism requires micro proof points",
      confidence: "Medium",
      evidenceCount: 1,
      implication: "Broad claims about 'India's growth' feel abstract. Viewers need to see how it affects their immediate wallet.",
      response: "Always pair macro economic news with a specific action item for the retail investor's portfolio."
    },
    {
      title: "Visual pacing must match cognitive load",
      confidence: "High",
      evidenceCount: 4,
      implication: "Dense charts combined with fast talking causes drop-off. Complex topics require slower visual pacing.",
      response: "Use simple analogy props (jars, pizza slices) instead of screen-recorded line charts for beginner topics."
    }
  ];
}

export function generateCompetitorMatrix(report: Report): { points: MatrixPoint[], target: MatrixPoint } {
  // Mock positioning based on handle strings for deterministic feeling output
  const points = report.competitors.map((c, i) => {
    // Spread them out pseudo-randomly but deterministically based on index
    const isEd = i % 2 === 0;
    return {
      handle: c.handle,
      name: c.name || c.handle,
      x: isEd ? 60 + (i * 10) : 30 + (i * 15),
      y: 40 + (i * 12),
    };
  });

  return {
    points,
    target: {
      handle: report.input.brandHandle,
      name: report.input.brand,
      x: 75, // Aiming for high education
      y: 85  // Aiming for high trust
    }
  };
}

export function generateOpportunityMap(_report: Report): Opportunity[] {
  return [
    {
      title: "Simple Money Myth Series",
      priority: "Immediate",
      rationale: "Contradiction hooks are proven winners in this niche with low production overhead.",
      effort: "Low",
      impact: "High",
      experiment: "Test 3 'Myth vs Reality' scripts using talking-head + green screen format.",
      metric: "3-second hold rate & Saves"
    },
    {
      title: "Hinglish Office Skits",
      priority: "Test-and-learn",
      rationale: "High shareability potential, but carries brand-tone risk if humor overwrites trust.",
      effort: "Medium",
      impact: "Medium",
      experiment: "Produce 2 creator-led skits comparing 'Trader friend' vs 'SIP friend'.",
      metric: "Share rate & Comments"
    },
    {
      title: "Macro Explainer Animations",
      priority: "Long-term",
      rationale: "Builds deep institutional trust and captures high-intent audience looking for serious guidance.",
      effort: "High",
      impact: "High",
      experiment: "Invest in 1 high-quality animated explainer per month on structural market topics.",
      metric: "Completion rate & Follows"
    }
  ];
}

export function generateFinalRecommendation(report: Report): string {
  const brand = report.input.brand;
  return `${brand} should prioritize beginner-friendly, everyday-life investing education with soft humor and simple checklists. The strongest immediate opportunity is to build a repeatable 'Simple Money Myth' reel series that turns common investor confusion into save-worthy mental models. Avoid purely technical chart analysis, as competitors are already saturating that space with diminishing returns.`;
}
