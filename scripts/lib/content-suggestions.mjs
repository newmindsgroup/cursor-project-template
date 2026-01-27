/**
 * Content Suggestions Library
 * Context-aware AI suggestions for improving website content
 * 
 * Usage:
 *   import { analyzeSuggestions, getSuggestionRules } from './lib/content-suggestions.mjs';
 *   const suggestions = await analyzeSuggestions(content, context);
 */

import { aiComplete, parseAIJson } from './ai-utils.mjs';

// =============================================================================
// RULE-BASED SUGGESTIONS (Fast, no AI)
// =============================================================================

/**
 * Rule-based suggestion checks
 */
const SUGGESTION_RULES = [
  // Headline rules
  {
    id: 'headline-length',
    category: 'headlines',
    check: (content) => {
      const headlines = extractHeadlines(content);
      return headlines.filter(h => h.length > 65);
    },
    message: (matches) => `${matches.length} headline(s) exceed 65 characters. Consider shortening for mobile display.`,
    suggestion: 'Shorten to 65 characters or less for better mobile readability.',
    priority: 'medium'
  },
  {
    id: 'headline-power-words',
    category: 'headlines',
    check: (content) => {
      const powerWords = ['discover', 'proven', 'guaranteed', 'instant', 'free', 'save', 'new', 'exclusive', 'limited'];
      const headlines = extractHeadlines(content);
      return headlines.filter(h => {
        const lower = h.toLowerCase();
        return !powerWords.some(pw => lower.includes(pw));
      });
    },
    message: (matches) => `${matches.length} headline(s) could benefit from power words to increase engagement.`,
    suggestion: 'Add power words like "Proven", "Guaranteed", "Free", or "Exclusive" to headlines.',
    priority: 'low'
  },
  
  // Numbers & specificity
  {
    id: 'vague-numbers',
    category: 'credibility',
    check: (content) => {
      const vaguePatterns = [
        /many (customers|clients|users|people)/gi,
        /hundreds of/gi,
        /thousands of/gi,
        /lots of/gi,
        /numerous/gi
      ];
      const text = JSON.stringify(content);
      const matches = [];
      vaguePatterns.forEach(pattern => {
        const found = text.match(pattern);
        if (found) matches.push(...found);
      });
      return matches;
    },
    message: (matches) => `Found ${matches.length} vague number reference(s). Specific numbers are more credible.`,
    suggestion: 'Replace "many customers" with specific numbers like "500+ customers" or "89% of clients".',
    priority: 'high'
  },
  
  // CTA rules
  {
    id: 'weak-cta',
    category: 'conversion',
    check: (content) => {
      const weakCTAs = ['click here', 'submit', 'learn more', 'read more'];
      const ctas = extractCTAs(content);
      return ctas.filter(cta => {
        const lower = cta.toLowerCase();
        return weakCTAs.some(weak => lower.includes(weak));
      });
    },
    message: (matches) => `${matches.length} CTA(s) use weak action words.`,
    suggestion: 'Use action-oriented CTAs like "Get Your Free Quote", "Start Saving Today", or "Schedule My Consultation".',
    priority: 'high'
  },
  {
    id: 'missing-secondary-cta',
    category: 'conversion',
    check: (content) => {
      const sections = ['hero', 'cta'];
      const missing = [];
      sections.forEach(section => {
        if (content[section]) {
          if (!content[section].secondaryCta || !content[section].secondaryCta.text) {
            missing.push(section);
          }
        }
      });
      return missing;
    },
    message: (matches) => `${matches.length} section(s) missing secondary CTA. Not all visitors are ready to commit.`,
    suggestion: 'Add a transitional CTA like "See How It Works" or "View Pricing" for visitors not ready for the primary action.',
    priority: 'medium'
  },
  
  // SEO rules
  {
    id: 'meta-description-length',
    category: 'seo',
    check: (content) => {
      if (content.meta?.description) {
        const len = content.meta.description.length;
        if (len > 160) return [{ issue: 'too long', length: len }];
        if (len < 120) return [{ issue: 'too short', length: len }];
      }
      return [];
    },
    message: (matches) => matches[0]?.issue === 'too long' 
      ? `Meta description is ${matches[0].length} characters. Google truncates at 160.`
      : `Meta description is ${matches[0]?.length || 0} characters. Aim for 120-160 for best SEO.`,
    suggestion: 'Keep meta descriptions between 120-160 characters for optimal search display.',
    priority: 'medium'
  },
  
  // Readability rules
  {
    id: 'long-paragraphs',
    category: 'readability',
    check: (content) => {
      const text = JSON.stringify(content);
      const paragraphs = text.split(/[.!?]+/).filter(p => p.trim().length > 200);
      return paragraphs;
    },
    message: (matches) => `${matches.length} sentence(s) are very long. This can hurt readability.`,
    suggestion: 'Break long sentences into shorter ones. Aim for 15-20 words per sentence.',
    priority: 'low'
  },
  
  // StoryBrand rules
  {
    id: 'missing-problem-statement',
    category: 'storybrand',
    check: (content) => {
      const problemIndicators = ['struggle', 'frustrated', 'tired of', 'problem', 'challenge', 'difficult'];
      const text = JSON.stringify(content).toLowerCase();
      const hasProblems = problemIndicators.some(p => text.includes(p));
      return hasProblems ? [] : ['No clear problem statement found'];
    },
    message: () => 'Content may not clearly identify the customer\'s problem.',
    suggestion: 'Add language that acknowledges the customer\'s pain: "Tired of...", "Struggling with...", or "Frustrated by..."',
    priority: 'high'
  },
  {
    id: 'missing-transformation',
    category: 'storybrand',
    check: (content) => {
      const transformIndicators = ['transform', 'achieve', 'become', 'finally', 'dream', 'success', 'results'];
      const text = JSON.stringify(content).toLowerCase();
      const hasTransform = transformIndicators.some(t => text.includes(t));
      return hasTransform ? [] : ['No transformation language found'];
    },
    message: () => 'Content doesn\'t paint a picture of the customer\'s success.',
    suggestion: 'Describe the transformation: "Finally achieve...", "Become the... you\'ve always wanted", or "See results like..."',
    priority: 'medium'
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract headlines from content
 */
function extractHeadlines(content) {
  const headlines = [];
  
  const extract = (obj, path = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if ((key === 'headline' || key === 'title') && typeof value === 'string') {
        headlines.push(value);
      } else if (key === 'headlines' && Array.isArray(value)) {
        value.forEach(h => {
          if (typeof h === 'string') headlines.push(h);
          if (h?.text) headlines.push(h.text);
        });
      } else if (typeof value === 'object') {
        extract(value, currentPath);
      }
    }
  };
  
  extract(content);
  return headlines;
}

/**
 * Extract CTAs from content
 */
function extractCTAs(content) {
  const ctas = [];
  
  const extract = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    for (const [key, value] of Object.entries(obj)) {
      if ((key.toLowerCase().includes('cta') || key === 'buttonText') && typeof value === 'string') {
        ctas.push(value);
      } else if (typeof value === 'object' && value?.text) {
        if (key.toLowerCase().includes('cta')) {
          ctas.push(value.text);
        }
      } else if (typeof value === 'object') {
        extract(value);
      }
    }
  };
  
  extract(content);
  return ctas;
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Run rule-based suggestions (fast, no AI)
 */
export function getQuickSuggestions(content) {
  const suggestions = [];
  
  for (const rule of SUGGESTION_RULES) {
    const matches = rule.check(content);
    if (matches && matches.length > 0) {
      suggestions.push({
        id: rule.id,
        category: rule.category,
        priority: rule.priority,
        message: rule.message(matches),
        suggestion: rule.suggestion,
        matches: matches.slice(0, 3) // Limit examples
      });
    }
  }
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return suggestions;
}

/**
 * Get AI-powered suggestions (slower, more nuanced)
 */
export async function getAISuggestions(content, context = {}) {
  const prompt = `You are a conversion copywriting expert. Analyze this website content and provide specific, actionable suggestions for improvement.

CONTENT:
${JSON.stringify(content, null, 2)}

${context.brandVoice ? `BRAND VOICE: ${context.brandVoice}` : ''}
${context.targetAudience ? `TARGET AUDIENCE: ${context.targetAudience}` : ''}

Analyze for:
1. Headline effectiveness (clarity, benefit-focused, emotional appeal)
2. CTA strength (action-oriented, urgency, value proposition)
3. Social proof (specificity, credibility)
4. StoryBrand adherence (customer as hero, brand as guide)
5. Mobile-friendliness (length, scanability)

Return JSON array of suggestions:
[
  {
    "category": "headlines|ctas|credibility|storybrand|readability|seo",
    "priority": "high|medium|low",
    "issue": "Brief description of the issue",
    "suggestion": "Specific actionable suggestion",
    "example": "Optional improved version of the text"
  }
]

Only include suggestions where there's clear room for improvement. Limit to 5-8 most impactful suggestions.`;

  const response = await aiComplete([
    { role: 'system', content: 'You are a conversion copywriting expert. Provide specific, actionable suggestions.' },
    { role: 'user', content: prompt }
  ], {
    tier: 'fast',
    temperature: 0.5,
    json: true,
    cache: true
  });

  return parseAIJson(response);
}

/**
 * Combine rule-based and AI suggestions
 */
export async function analyzeSuggestions(content, context = {}, options = {}) {
  const results = {
    quickSuggestions: [],
    aiSuggestions: [],
    summary: {
      total: 0,
      highPriority: 0,
      categories: {}
    }
  };

  // Always run quick suggestions (rule-based)
  results.quickSuggestions = getQuickSuggestions(content);

  // Optionally run AI suggestions
  if (options.includeAI !== false) {
    try {
      results.aiSuggestions = await getAISuggestions(content, context);
    } catch (error) {
      console.warn('AI suggestions failed:', error.message);
    }
  }

  // Calculate summary
  const allSuggestions = [...results.quickSuggestions, ...results.aiSuggestions];
  results.summary.total = allSuggestions.length;
  results.summary.highPriority = allSuggestions.filter(s => s.priority === 'high').length;

  allSuggestions.forEach(s => {
    results.summary.categories[s.category] = (results.summary.categories[s.category] || 0) + 1;
  });

  return results;
}

/**
 * Get list of all suggestion rules
 */
export function getSuggestionRules() {
  return SUGGESTION_RULES.map(rule => ({
    id: rule.id,
    category: rule.category,
    priority: rule.priority,
    description: rule.suggestion
  }));
}

/**
 * Generate improvement report
 */
export async function generateImprovementReport(content, context = {}) {
  const analysis = await analyzeSuggestions(content, context);
  
  let report = `# Content Improvement Report\n\n`;
  report += `**Total Suggestions:** ${analysis.summary.total}\n`;
  report += `**High Priority:** ${analysis.summary.highPriority}\n\n`;
  
  report += `## Categories\n`;
  for (const [category, count] of Object.entries(analysis.summary.categories)) {
    report += `- ${category}: ${count}\n`;
  }
  
  report += `\n## Quick Fixes (Rule-Based)\n\n`;
  for (const suggestion of analysis.quickSuggestions) {
    report += `### ${suggestion.message}\n`;
    report += `**Priority:** ${suggestion.priority}\n`;
    report += `**Suggestion:** ${suggestion.suggestion}\n\n`;
  }
  
  if (analysis.aiSuggestions.length > 0) {
    report += `\n## AI Suggestions\n\n`;
    for (const suggestion of analysis.aiSuggestions) {
      report += `### ${suggestion.issue}\n`;
      report += `**Priority:** ${suggestion.priority}\n`;
      report += `**Suggestion:** ${suggestion.suggestion}\n`;
      if (suggestion.example) {
        report += `**Example:** ${suggestion.example}\n`;
      }
      report += `\n`;
    }
  }
  
  return report;
}

export { SUGGESTION_RULES };
