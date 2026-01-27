/**
 * Content Refiner Library
 * Multi-pass content refinement with quality scoring
 * 
 * Workflow: Generate → Score → Refine (if needed)
 * 
 * Quality Dimensions:
 * - Clarity (1-10): Is the message clear and easy to understand?
 * - Persuasion (1-10): Does it compel action?
 * - Brand Voice (1-10): Is it consistent with brand tone?
 * - StoryBrand Adherence (1-10): Does it follow the framework?
 */

import { aiComplete, parseAIJson } from './ai-utils.mjs';

// Quality threshold - content scoring below this will be refined
const QUALITY_THRESHOLD = 7;

// Maximum refinement iterations
const MAX_REFINEMENTS = 2;

/**
 * Quality scoring rubric
 */
const SCORING_RUBRIC = {
  clarity: {
    weight: 0.25,
    criteria: [
      'Uses simple, direct language (8th-grade reading level)',
      'Main message is immediately clear',
      'No jargon or buzzwords without explanation',
      'Logical flow from headline to CTA'
    ]
  },
  persuasion: {
    weight: 0.25,
    criteria: [
      'Leads with customer benefit, not feature',
      'Creates emotional resonance',
      'Has a clear, compelling CTA',
      'Uses social proof effectively when present'
    ]
  },
  brandVoice: {
    weight: 0.20,
    criteria: [
      'Consistent tone throughout',
      'Matches specified brand personality',
      'Appropriate formality level',
      'Authentic, not forced or salesy'
    ]
  },
  storybrand: {
    weight: 0.30,
    criteria: [
      'Customer is positioned as the hero',
      'Brand is positioned as the guide',
      'Clear problem-solution-transformation arc',
      'Addresses both external and internal problems'
    ]
  }
};

/**
 * Score content quality
 * @param {Object} content - Generated content object
 * @param {Object} context - Business context for brand voice evaluation
 * @returns {Object} Scores and recommendations
 */
export async function scoreContent(content, context = {}) {
  const prompt = `You are a content quality evaluator specializing in the StoryBrand framework.

Score the following content on these dimensions (1-10 each):

1. **Clarity** (weight: 25%)
   - ${SCORING_RUBRIC.clarity.criteria.join('\n   - ')}

2. **Persuasion** (weight: 25%)
   - ${SCORING_RUBRIC.persuasion.criteria.join('\n   - ')}

3. **Brand Voice** (weight: 20%)
   - ${SCORING_RUBRIC.brandVoice.criteria.join('\n   - ')}

4. **StoryBrand Adherence** (weight: 30%)
   - ${SCORING_RUBRIC.storybrand.criteria.join('\n   - ')}

Content to evaluate:
${JSON.stringify(content, null, 2)}

${context.brandScript ? `Brand Context:\n${JSON.stringify(context.brandScript, null, 2)}` : ''}
${context.brandVoice ? `Brand Voice: ${context.brandVoice}` : ''}

Respond with JSON:
{
  "scores": {
    "clarity": <1-10>,
    "persuasion": <1-10>,
    "brandVoice": <1-10>,
    "storybrand": <1-10>
  },
  "overall": <weighted average>,
  "strengths": ["list", "of", "strengths"],
  "weaknesses": ["areas", "needing", "improvement"],
  "recommendations": ["specific", "actionable", "suggestions"]
}`;

  const response = await aiComplete([
    { role: 'system', content: 'You are a content quality evaluator. Be objective and constructive.' },
    { role: 'user', content: prompt }
  ], {
    tier: 'fast',
    temperature: 0.3,
    json: true,
    cache: true
  });

  return parseAIJson(response);
}

/**
 * Refine content based on quality scores
 * @param {Object} content - Original content
 * @param {Object} scores - Quality scores from scoreContent()
 * @param {Object} context - Business context
 * @returns {Object} Refined content
 */
export async function refineContent(content, scores, context = {}) {
  // Identify areas needing improvement
  const areasToImprove = [];
  
  if (scores.scores.clarity < QUALITY_THRESHOLD) {
    areasToImprove.push('clarity - simplify language and make the message clearer');
  }
  if (scores.scores.persuasion < QUALITY_THRESHOLD) {
    areasToImprove.push('persuasion - strengthen benefit-focused messaging and CTA');
  }
  if (scores.scores.brandVoice < QUALITY_THRESHOLD) {
    areasToImprove.push('brand voice - align tone with brand personality');
  }
  if (scores.scores.storybrand < QUALITY_THRESHOLD) {
    areasToImprove.push('StoryBrand - better position customer as hero, brand as guide');
  }

  const prompt = `You are an expert copywriter refining content based on quality feedback.

ORIGINAL CONTENT:
${JSON.stringify(content, null, 2)}

QUALITY SCORES:
- Clarity: ${scores.scores.clarity}/10
- Persuasion: ${scores.scores.persuasion}/10
- Brand Voice: ${scores.scores.brandVoice}/10
- StoryBrand: ${scores.scores.storybrand}/10
- Overall: ${scores.overall}/10

WEAKNESSES IDENTIFIED:
${scores.weaknesses.map(w => `- ${w}`).join('\n')}

SPECIFIC RECOMMENDATIONS:
${scores.recommendations.map(r => `- ${r}`).join('\n')}

AREAS TO IMPROVE:
${areasToImprove.map(a => `- ${a}`).join('\n')}

${context.brandVoice ? `TARGET BRAND VOICE: ${context.brandVoice}` : ''}

TASK: Refine the content to address the weaknesses while preserving what's working well.
Return the refined content in the exact same JSON structure as the original.

Strengths to preserve:
${scores.strengths.map(s => `- ${s}`).join('\n')}`;

  const response = await aiComplete([
    { role: 'system', content: 'You are a professional copywriter specializing in StoryBrand methodology. Refine content to improve quality scores while maintaining the original structure.' },
    { role: 'user', content: prompt }
  ], {
    tier: 'standard',
    temperature: 0.7,
    json: true,
    cache: false // Don't cache refinements
  });

  return parseAIJson(response);
}

/**
 * Full refinement workflow: Generate → Score → Refine
 * @param {Function} generateFn - Function that generates initial content
 * @param {Object} context - Business context
 * @param {Object} options - Options (maxIterations, threshold)
 * @returns {Object} Final content with quality report
 */
export async function refineUntilQuality(generateFn, context = {}, options = {}) {
  const maxIterations = options.maxIterations || MAX_REFINEMENTS;
  const threshold = options.threshold || QUALITY_THRESHOLD;
  
  const report = {
    iterations: 0,
    initialScore: null,
    finalScore: null,
    improvements: [],
    content: null
  };

  // Generate initial content
  let content = await generateFn();
  report.iterations++;

  // Score initial content
  let scores = await scoreContent(content, context);
  report.initialScore = scores.overall;

  // Refine if below threshold
  while (scores.overall < threshold && report.iterations < maxIterations + 1) {
    const previousScore = scores.overall;
    
    // Refine content
    content = await refineContent(content, scores, context);
    report.iterations++;
    
    // Re-score
    scores = await scoreContent(content, context);
    
    // Track improvement
    report.improvements.push({
      iteration: report.iterations,
      previousScore,
      newScore: scores.overall,
      delta: scores.overall - previousScore
    });

    // Break if not improving
    if (scores.overall <= previousScore) {
      break;
    }
  }

  report.finalScore = scores.overall;
  report.content = content;
  report.finalScores = scores;

  return report;
}

/**
 * Score multiple content variants and pick the best
 * @param {Object[]} variants - Array of content variants
 * @param {Object} context - Business context
 * @returns {Object} Best variant with scores
 */
export async function selectBestVariant(variants, context = {}) {
  const scored = await Promise.all(
    variants.map(async (variant, index) => {
      const scores = await scoreContent(variant, context);
      return {
        index,
        variant,
        scores,
        overall: scores.overall
      };
    })
  );

  // Sort by overall score (descending)
  scored.sort((a, b) => b.overall - a.overall);

  return {
    best: scored[0],
    all: scored,
    comparison: scored.map(s => ({
      index: s.index,
      overall: s.overall,
      clarity: s.scores.scores.clarity,
      persuasion: s.scores.scores.persuasion
    }))
  };
}

/**
 * Calculate weighted overall score
 */
function calculateWeightedScore(scores) {
  return (
    scores.clarity * SCORING_RUBRIC.clarity.weight +
    scores.persuasion * SCORING_RUBRIC.persuasion.weight +
    scores.brandVoice * SCORING_RUBRIC.brandVoice.weight +
    scores.storybrand * SCORING_RUBRIC.storybrand.weight
  );
}

export {
  QUALITY_THRESHOLD,
  MAX_REFINEMENTS,
  SCORING_RUBRIC
};
