/**
 * Impact Estimates Module
 * Translates SEO issues into business impact estimates
 */

import type { QueryResult } from './searchVisibility';
import type { CompetitorPlace } from './competitors';

// Types
export interface ImpactAssumptions {
  est_monthly_searches_per_query: number;
  est_ctr_if_top3: number;
  est_site_conversion_rate: number;
  est_lead_value: number;
}

export interface BiggestWin {
  query: string;
  competitor_domain: string;
  competitor_position: number;
  potential_impact: string;
}

export interface ImpactEstimates {
  missed_visibility_queries: number;
  total_queries_analyzed: number;
  biggest_wins: BiggestWin[];
  assumptions: ImpactAssumptions;
  est_monthly_leads_if_top3_range: { low: number; high: number };
  est_value_range: { low: number; high: number };
  is_editable: boolean;
  competitor_insights: string[];
}

// Default assumptions
export const DEFAULT_ASSUMPTIONS: ImpactAssumptions = {
  est_monthly_searches_per_query: 100,
  est_ctr_if_top3: 0.15,
  est_site_conversion_rate: 0.02,
  est_lead_value: 500,
};

// Calculate impact estimates
export function calculateImpactEstimates(params: {
  queryResults: QueryResult[];
  competitors?: CompetitorPlace[];
  yourRating?: number | null;
  yourReviews?: number;
  assumptions?: Partial<ImpactAssumptions>;
}): ImpactEstimates {
  const {
    queryResults,
    competitors = [],
    yourRating = null,
    yourReviews = 0,
    assumptions: customAssumptions = {},
  } = params;
  
  // Merge with default assumptions
  const assumptions: ImpactAssumptions = {
    ...DEFAULT_ASSUMPTIONS,
    ...customAssumptions,
  };
  
  // Count missed visibility (non-branded queries where not ranking in organic top 10)
  const nonBrandedQueries = queryResults.filter(qr => qr.intent === 'non_branded');
  const missedVisibilityQueries = nonBrandedQueries.filter(qr => qr.organic.rank === null).length;
  
  // Find biggest wins (queries where competitors rank but you don't)
  const biggestWins: BiggestWin[] = [];
  
  for (const qr of queryResults) {
    if (qr.organic.rank === null && qr.organic.results && qr.organic.results.length > 0) {
      // Find first business competitor (not directory)
      const businessComp = qr.organic.results.find(r => {
        const domain = r.domain.toLowerCase();
        return !domain.includes('tripadvisor') && 
               !domain.includes('yelp') && 
               !domain.includes('facebook') &&
               !domain.includes('google.com');
      });
      
      if (businessComp) {
        biggestWins.push({
          query: qr.query,
          competitor_domain: businessComp.domain,
          competitor_position: businessComp.position,
          potential_impact: businessComp.position <= 3 ? 'High' : 'Medium',
        });
      }
    }
  }
  
  // Sort by potential impact and limit to top 3
  biggestWins.sort((a, b) => a.competitor_position - b.competitor_position);
  const topBiggestWins = biggestWins.slice(0, 3);
  
  // Calculate lead/value estimates
  // Conservative: assume only 50% of assumed searches, optimistic: 150%
  const baseMonthlyTraffic = missedVisibilityQueries * assumptions.est_monthly_searches_per_query * assumptions.est_ctr_if_top3;
  const baseMonthlyLeads = baseMonthlyTraffic * assumptions.est_site_conversion_rate;
  
  const estMonthlyLeadsLow = Math.round(baseMonthlyLeads * 0.5);
  const estMonthlyLeadsHigh = Math.round(baseMonthlyLeads * 1.5);
  
  const estValueLow = estMonthlyLeadsLow * assumptions.est_lead_value;
  const estValueHigh = estMonthlyLeadsHigh * assumptions.est_lead_value;
  
  // Generate competitor insights
  const competitorInsights: string[] = [];
  
  if (competitors.length > 0) {
    // Rating comparison
    const competitorRatings = competitors.filter(c => c.rating !== null).map(c => c.rating as number);
    if (competitorRatings.length > 0) {
      const avgCompRating = competitorRatings.reduce((a, b) => a + b, 0) / competitorRatings.length;
      
      if (yourRating !== null) {
        if (yourRating < avgCompRating - 0.3) {
          competitorInsights.push(`Your rating (${yourRating}) is below competitor average (${avgCompRating.toFixed(1)})`);
        } else if (yourRating > avgCompRating + 0.3) {
          competitorInsights.push(`Your rating (${yourRating}) is above competitor average (${avgCompRating.toFixed(1)}) - highlight this!`);
        }
      }
    }
    
    // Review volume comparison
    const competitorReviews = competitors.map(c => c.user_ratings_total);
    if (competitorReviews.length > 0) {
      const avgCompReviews = competitorReviews.reduce((a, b) => a + b, 0) / competitorReviews.length;
      const topCompReviews = Math.max(...competitorReviews);
      
      if (yourReviews < avgCompReviews * 0.5) {
        competitorInsights.push(`You have ${yourReviews} reviews vs competitor avg of ${Math.round(avgCompReviews)} - consider a review generation campaign`);
      }
      
      if (topCompReviews > yourReviews * 3) {
        const topReviewer = competitors.find(c => c.user_ratings_total === topCompReviews);
        competitorInsights.push(`Top competitor "${topReviewer?.name}" has ${topCompReviews} reviews - significant social proof advantage`);
      }
    }
    
    // Website presence
    const withWebsite = competitors.filter(c => c.website).length;
    const withoutWebsite = competitors.filter(c => !c.website).length;
    
    if (withoutWebsite > withWebsite) {
      competitorInsights.push(`${withoutWebsite} of ${competitors.length} competitors lack websites - your online presence is an advantage`);
    }
  }
  
  // Add SERP-based insights
  if (missedVisibilityQueries > 0) {
    competitorInsights.push(`Not ranking for ${missedVisibilityQueries} non-branded queries - significant opportunity gap`);
  }
  
  const strongPositions = queryResults.filter(qr => 
    (qr.mapPack.rank !== null && qr.mapPack.rank <= 3) || 
    (qr.organic.rank !== null && qr.organic.rank <= 3)
  ).length;
  if (strongPositions > 0) {
    competitorInsights.push(`Strong positions (#1-3) for ${strongPositions} queries - protect these rankings`);
  }
  
  return {
    missed_visibility_queries: missedVisibilityQueries,
    total_queries_analyzed: queryResults.length,
    biggest_wins: topBiggestWins,
    assumptions,
    est_monthly_leads_if_top3_range: {
      low: estMonthlyLeadsLow,
      high: estMonthlyLeadsHigh,
    },
    est_value_range: {
      low: estValueLow,
      high: estValueHigh,
    },
    is_editable: true,
    competitor_insights: competitorInsights,
  };
}

// Generate findings for the report
export function generateImpactFindings(params: {
  queryResults: QueryResult[];
  competitors?: CompetitorPlace[];
  missedVisibilityQueries: number;
}): { severity: 'high' | 'med' | 'low'; evidence: string; fix: string }[] {
  const { queryResults, competitors = [], missedVisibilityQueries } = params;
  const findings: { severity: 'high' | 'med' | 'low'; evidence: string; fix: string }[] = [];
  
  // Finding: Not ranking for key queries
  if (missedVisibilityQueries > 0) {
    const missedQueries = queryResults
      .filter(qr => qr.intent === 'non_branded' && qr.organic.rank === null)
      .slice(0, 2)
      .map(qr => qr.query);
    
    findings.push({
      severity: missedVisibilityQueries > 3 ? 'high' : 'med',
      evidence: `Not ranking top 10 for: ${missedQueries.join(', ')}`,
      fix: 'Create dedicated service pages with location-specific content targeting these queries',
    });
  }
  
  // Finding: Competitors dominating with reviews
  if (competitors.length > 0) {
    const topByReviews = [...competitors].sort((a, b) => b.user_ratings_total - a.user_ratings_total)[0];
    if (topByReviews && topByReviews.user_ratings_total > 50) {
      findings.push({
        severity: 'med',
        evidence: `"${topByReviews.name}" has ${topByReviews.user_ratings_total} reviews with ${topByReviews.rating || 'N/A'} rating`,
        fix: 'Implement a systematic review collection process to build social proof',
      });
    }
    
    // Finding: Competitors with higher ratings
    const topByRating = [...competitors].filter(c => c.rating !== null).sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    if (topByRating && topByRating.rating && topByRating.rating >= 4.5) {
      findings.push({
        severity: 'low',
        evidence: `"${topByRating.name}" leads with ${topByRating.rating} rating (${topByRating.user_ratings_total} reviews)`,
        fix: 'Focus on service quality and encourage satisfied customers to leave reviews',
      });
    }
  }
  
  // Finding: Strong branded visibility but weak non-branded
  const brandedRanking = queryResults.filter(qr => 
    qr.intent === 'branded' && (qr.mapPack.rank !== null || qr.organic.rank !== null)
  ).length;
  const brandedTotal = queryResults.filter(qr => qr.intent === 'branded').length;
  const nonBrandedRanking = queryResults.filter(qr => 
    qr.intent === 'non_branded' && (qr.mapPack.rank !== null || qr.organic.rank !== null)
  ).length;
  const nonBrandedTotal = queryResults.filter(qr => qr.intent === 'non_branded').length;
  
  if (brandedRanking > brandedTotal * 0.5 && nonBrandedRanking < nonBrandedTotal * 0.3) {
    findings.push({
      severity: 'high',
      evidence: `Ranking for ${brandedRanking}/${brandedTotal} branded queries but only ${nonBrandedRanking}/${nonBrandedTotal} non-branded`,
      fix: 'Content gap: create service/category pages optimized for non-branded search intent',
    });
  }
  
  return findings;
}
