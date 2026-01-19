/**
 * AI-powered presence analysis functions
 */

import { getOpenAIClient, AnalysisResult, ConsistencyResult, ReviewAnalysisResult } from './openaiClient';

interface SocialMediaProfile {
  platform: 'instagram' | 'facebook' | 'website';
  biography?: string | null;
  description?: string | null;
  website?: string | null;
  category?: string | null;
  phone?: string | null;
  address?: string | null;
  hours?: string | null;
  followerCount?: number | null;
  postCount?: number | null;
}

interface Review {
  text: string;
  rating: number;
  authorName?: string;
  relativeTime?: string;
}

/**
 * Analyze social media profile in business context
 */
export async function analyzeSocialProfile(
  businessName: string,
  businessCategory: string,
  profile: SocialMediaProfile
): Promise<AnalysisResult> {
  const openai = getOpenAIClient();

  const prompt = `You are an expert social media analyst for local businesses. Analyze this ${profile.platform} profile for "${businessName}" (${businessCategory}).

Profile Data:
- Biography/Description: ${profile.biography || profile.description || 'Not set'}
- Website Link: ${profile.website || 'Not set'}
- Category: ${profile.category || 'Not set'}
- Phone: ${profile.phone || 'Not set'}
- Address: ${profile.address || 'Not set'}
- Hours: ${profile.hours || 'Not set'}
${profile.followerCount ? `- Followers: ${profile.followerCount}` : ''}
${profile.postCount ? `- Posts: ${profile.postCount}` : ''}

Analyze:
1. Is the biography/description compelling and relevant to the business type?
2. Does it include relevant keywords for discoverability?
3. Is contact information complete and professional?
4. Are there any red flags or missed opportunities?

Respond in JSON format:
{
  "score": <0-100>,
  "summary": "<2-3 sentence summary>",
  "issues": [
    {
      "severity": "critical|warning|info",
      "category": "<category>",
      "issue": "<specific issue>",
      "recommendation": "<actionable fix>"
    }
  ],
  "highlights": ["<positive aspect 1>", "<positive aspect 2>"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as AnalysisResult;
  } catch (error) {
    console.error('Error analyzing social profile:', error);
    return {
      score: 50,
      summary: 'Unable to analyze profile at this time.',
      issues: [],
      highlights: [],
    };
  }
}

/**
 * Analyze cross-platform consistency
 */
export async function analyzeConsistency(
  businessName: string,
  profiles: SocialMediaProfile[]
): Promise<ConsistencyResult> {
  const openai = getOpenAIClient();

  // Build comparison data
  const platformData = profiles.map(p => ({
    platform: p.platform,
    name: businessName,
    description: p.biography || p.description || null,
    website: p.website || null,
    phone: p.phone || null,
    address: p.address || null,
    hours: p.hours || null,
  }));

  const prompt = `You are a business consistency analyst. Check if "${businessName}" has consistent information across platforms.

Platform Data:
${JSON.stringify(platformData, null, 2)}

Analyze:
1. Are phone numbers consistent (if present)?
2. Are addresses consistent (if present)?
3. Are business hours consistent (if present)?
4. Are website URLs consistent (if present)?
5. Are descriptions/bios aligned in messaging?
6. What critical information is missing from each platform?

Respond in JSON format:
{
  "isConsistent": <true|false>,
  "score": <0-100>,
  "inconsistencies": [
    {
      "field": "<field name>",
      "platforms": ["<platform1>", "<platform2>"],
      "values": {"<platform>": "<value>"},
      "recommendation": "<how to fix>"
    }
  ],
  "missingInfo": [
    {
      "field": "<field name>",
      "missingFrom": ["<platform1>", "<platform2>"]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as ConsistencyResult;
  } catch (error) {
    console.error('Error analyzing consistency:', error);
    return {
      isConsistent: true,
      score: 50,
      inconsistencies: [],
      missingInfo: [],
    };
  }
}

/**
 * Analyze Google reviews and identify pain points
 */
export async function analyzeReviews(
  businessName: string,
  businessCategory: string,
  reviews: Review[]
): Promise<ReviewAnalysisResult> {
  const openai = getOpenAIClient();

  if (reviews.length === 0) {
    return {
      overallSentiment: 'mixed',
      sentimentScore: 50,
      totalReviews: 0,
      painPoints: [],
      strengths: [],
      summary: 'No reviews available for analysis.',
    };
  }

  // Limit to most recent 50 reviews for analysis
  const reviewsToAnalyze = reviews.slice(0, 50);
  const reviewTexts = reviewsToAnalyze.map((r, i) => 
    `Review ${i + 1} (${r.rating}★): "${r.text}"`
  ).join('\n\n');

  const prompt = `You are a customer feedback analyst for local businesses. Analyze these Google reviews for "${businessName}" (${businessCategory}).

Reviews (${reviewsToAnalyze.length} of ${reviews.length} total):
${reviewTexts}

Identify:
1. Common pain points customers mention (service issues, wait times, quality, staff, etc.)
2. Patterns in negative feedback
3. Strengths that customers consistently praise
4. Actionable recommendations for improvement

Respond in JSON format:
{
  "overallSentiment": "positive|mixed|negative",
  "sentimentScore": <0-100>,
  "totalReviews": ${reviews.length},
  "painPoints": [
    {
      "topic": "<pain point topic>",
      "frequency": <number of mentions>,
      "severity": "high|medium|low",
      "exampleReviews": ["<quote 1>", "<quote 2>"],
      "recommendation": "<actionable fix>"
    }
  ],
  "strengths": [
    {
      "topic": "<strength topic>",
      "frequency": <number of mentions>,
      "exampleReviews": ["<quote 1>", "<quote 2>"]
    }
  ],
  "summary": "<2-3 sentence overall summary>"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as ReviewAnalysisResult;
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    return {
      overallSentiment: 'mixed',
      sentimentScore: 50,
      totalReviews: reviews.length,
      painPoints: [],
      strengths: [],
      summary: 'Unable to analyze reviews at this time.',
    };
  }
}

/**
 * Analyze social media comments for engagement insights
 */
export async function analyzeComments(
  businessName: string,
  platform: 'instagram' | 'facebook',
  comments: Array<{ text: string; postContext?: string }>
): Promise<AnalysisResult> {
  const openai = getOpenAIClient();

  if (comments.length === 0) {
    return {
      score: 50,
      summary: 'No comments available for analysis.',
      issues: [],
      highlights: [],
    };
  }

  const commentTexts = comments.slice(0, 30).map((c, i) => 
    `Comment ${i + 1}: "${c.text}"${c.postContext ? ` (on: ${c.postContext})` : ''}`
  ).join('\n');

  const prompt = `You are a social media engagement analyst. Analyze these ${platform} comments for "${businessName}".

Comments:
${commentTexts}

Analyze:
1. What are customers asking about most? (unanswered questions)
2. What complaints or concerns appear in comments?
3. What positive feedback patterns emerge?
4. Are there engagement opportunities being missed?
5. What should the business respond to or address?

Respond in JSON format:
{
  "score": <0-100 engagement quality score>,
  "summary": "<2-3 sentence summary>",
  "issues": [
    {
      "severity": "critical|warning|info",
      "category": "<category like 'Unanswered Questions', 'Complaints', 'Missed Opportunities'>",
      "issue": "<specific issue>",
      "recommendation": "<actionable fix>"
    }
  ],
  "highlights": ["<positive engagement pattern 1>", "<positive pattern 2>"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as AnalysisResult;
  } catch (error) {
    console.error('Error analyzing comments:', error);
    return {
      score: 50,
      summary: 'Unable to analyze comments at this time.',
      issues: [],
      highlights: [],
    };
  }
}

/**
 * Full presence analysis combining all sources
 */
export interface FullPresenceAnalysis {
  instagram?: AnalysisResult;
  facebook?: AnalysisResult;
  consistency: ConsistencyResult;
  reviews: ReviewAnalysisResult;
  instagramComments?: AnalysisResult;
  facebookComments?: AnalysisResult;
  overallScore: number;
  topPriorities: Array<{
    priority: number;
    source: string;
    issue: string;
    recommendation: string;
  }>;
}

export async function analyzeFullPresence(
  businessName: string,
  businessCategory: string,
  data: {
    instagram?: SocialMediaProfile;
    facebook?: SocialMediaProfile;
    website?: SocialMediaProfile;
    reviews?: Review[];
    instagramComments?: Array<{ text: string; postContext?: string }>;
    facebookComments?: Array<{ text: string; postContext?: string }>;
  }
): Promise<FullPresenceAnalysis> {
  const results: FullPresenceAnalysis = {
    consistency: {
      isConsistent: true,
      score: 100,
      inconsistencies: [],
      missingInfo: [],
    },
    reviews: {
      overallSentiment: 'mixed',
      sentimentScore: 50,
      totalReviews: 0,
      painPoints: [],
      strengths: [],
      summary: 'No reviews provided.',
    },
    overallScore: 0,
    topPriorities: [],
  };

  // Run analyses in parallel
  const promises: Promise<void>[] = [];

  // Instagram profile analysis
  if (data.instagram) {
    promises.push(
      analyzeSocialProfile(businessName, businessCategory, data.instagram)
        .then(r => { results.instagram = r; })
    );
  }

  // Facebook profile analysis
  if (data.facebook) {
    promises.push(
      analyzeSocialProfile(businessName, businessCategory, data.facebook)
        .then(r => { results.facebook = r; })
    );
  }

  // Consistency analysis
  const profiles = [data.instagram, data.facebook, data.website].filter(Boolean) as SocialMediaProfile[];
  if (profiles.length >= 2) {
    promises.push(
      analyzeConsistency(businessName, profiles)
        .then(r => { results.consistency = r; })
    );
  }

  // Reviews analysis
  if (data.reviews && data.reviews.length > 0) {
    promises.push(
      analyzeReviews(businessName, businessCategory, data.reviews)
        .then(r => { results.reviews = r; })
    );
  }

  // Comments analysis
  if (data.instagramComments && data.instagramComments.length > 0) {
    promises.push(
      analyzeComments(businessName, 'instagram', data.instagramComments)
        .then(r => { results.instagramComments = r; })
    );
  }

  if (data.facebookComments && data.facebookComments.length > 0) {
    promises.push(
      analyzeComments(businessName, 'facebook', data.facebookComments)
        .then(r => { results.facebookComments = r; })
    );
  }

  await Promise.allSettled(promises);

  // Calculate overall score
  const scores: number[] = [];
  if (results.instagram) scores.push(results.instagram.score);
  if (results.facebook) scores.push(results.facebook.score);
  scores.push(results.consistency.score);
  scores.push(results.reviews.sentimentScore);

  results.overallScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 50;

  // Compile top priorities
  const allIssues: Array<{
    priority: number;
    source: string;
    issue: string;
    recommendation: string;
  }> = [];

  // Add issues from each source
  const severityWeight = { critical: 3, warning: 2, info: 1 };

  if (results.instagram?.issues) {
    results.instagram.issues.forEach(i => {
      allIssues.push({
        priority: severityWeight[i.severity],
        source: 'Instagram',
        issue: i.issue,
        recommendation: i.recommendation,
      });
    });
  }

  if (results.facebook?.issues) {
    results.facebook.issues.forEach(i => {
      allIssues.push({
        priority: severityWeight[i.severity],
        source: 'Facebook',
        issue: i.issue,
        recommendation: i.recommendation,
      });
    });
  }

  // Add consistency issues
  results.consistency.inconsistencies.forEach(i => {
    allIssues.push({
      priority: 3,
      source: 'Cross-platform',
      issue: `Inconsistent ${i.field} across ${i.platforms.join(', ')}`,
      recommendation: i.recommendation,
    });
  });

  // Add review pain points
  results.reviews.painPoints.forEach(p => {
    const priority = p.severity === 'high' ? 3 : p.severity === 'medium' ? 2 : 1;
    allIssues.push({
      priority,
      source: 'Google Reviews',
      issue: p.topic,
      recommendation: p.recommendation,
    });
  });

  // Sort by priority and take top 5
  results.topPriorities = allIssues
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);

  return results;
}
