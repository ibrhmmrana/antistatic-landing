/**
 * OpenAI Client Configuration
 */

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    const orgId = process.env.OPENAI_ORG_ID;
    const baseURL = process.env.OPENAI_BASE_URL;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    openaiClient = new OpenAI({
      apiKey,
      organization: orgId || undefined,
      baseURL: baseURL || undefined,
    });
  }

  return openaiClient;
}

export type AnalysisResult = {
  score: number; // 0-100
  summary: string;
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    issue: string;
    recommendation: string;
  }>;
  highlights: string[];
};

export type ConsistencyResult = {
  isConsistent: boolean;
  score: number; // 0-100
  inconsistencies: Array<{
    field: string;
    platforms: string[];
    values: Record<string, string | null>;
    recommendation: string;
  }>;
  missingInfo: Array<{
    field: string;
    missingFrom: string[];
  }>;
};

export type ReviewAnalysisResult = {
  overallSentiment: 'positive' | 'mixed' | 'negative';
  sentimentScore: number; // 0-100
  totalReviews: number;
  painPoints: Array<{
    topic: string;
    frequency: number;
    severity: 'high' | 'medium' | 'low';
    exampleReviews: string[];
    recommendation: string;
  }>;
  strengths: Array<{
    topic: string;
    frequency: number;
    exampleReviews: string[];
  }>;
  summary: string;
};
