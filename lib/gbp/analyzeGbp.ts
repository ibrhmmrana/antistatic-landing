/**
 * Google Business Profile Analysis
 * Analyzes place details and generates a checklist similar to Owner.com
 */

import { resolveCategoryFamily, getAllowedServiceKeywords } from '@/lib/seo/categoryFamilies';

export interface ChecklistItem {
  key: string;
  label: string;
  status: 'good' | 'warn' | 'bad';
  value?: string;
  helper: string;
  extractedValue?: string; // The actual extracted data to display
}

export interface KeywordChecks {
  extractedKeywords: string[];
  descriptionKeywordMatchPct?: number;
  categoryKeywordMatchPct?: number;
}

export interface GbpAnalysis {
  businessName: string;
  rating?: number;
  reviews?: number;
  checklist: ChecklistItem[];
  keywordChecks: KeywordChecks;
}

export interface PlaceDetails {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  website: string | null;
  phone: string | null;
  rating: number | null;
  reviews: number;
  openingHours: {
    weekday_text?: string[];
    open_now?: boolean;
  } | null;
  priceLevel: number | null;
  types: string[];
  businessStatus: string | null;
  description: string | null; // From editorial_summary
  photoRef: string | null;
  url: string | null;
}

/**
 * Extract social media links from a website
 */
async function extractSocialLinks(websiteUrl: string): Promise<string[]> {
  try {
    // Ensure URL has protocol
    const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      return [];
    }
    
    const html = await response.text();
    const socialDomains = [
      'instagram.com',
      'facebook.com',
      'linkedin.com',
      'youtube.com',
      'tiktok.com',
      'twitter.com',
      'x.com',
    ];
    
    const found: string[] = [];
    for (const domain of socialDomains) {
      const regex = new RegExp(`https?://(?:www\\.)?${domain.replace(/\./g, '\\.')}[^"\\s<>]*`, 'gi');
      const matches = html.match(regex);
      if (matches) {
        found.push(...matches.slice(0, 1)); // Take first match per domain
      }
    }
    
    return Array.from(new Set(found));
  } catch (error) {
    console.error('[GBP-ANALYZE] Error extracting social links:', error);
    return [];
  }
}

/**
 * Extract keywords from address and types
 */
function extractKeywords(placeDetails: PlaceDetails): string[] {
  const keywords: string[] = [];
  
  // Extract from address (city, suburb)
  const addressParts = placeDetails.address.split(',').map(s => s.trim());
  if (addressParts.length > 1) {
    // Usually city is second-to-last, suburb might be earlier
    keywords.push(...addressParts.slice(0, -1)); // Exclude country
  }
  
  // Extract from types (filter out generic ones)
  const genericTypes = new Set([
    'point_of_interest',
    'establishment',
    'premise',
    'geocode',
  ]);
  
  const businessTypes = placeDetails.types
    .filter(t => !genericTypes.has(t))
    .map(t => t.replace(/_/g, ' '));
  
  keywords.push(...businessTypes);
  
  return keywords;
}

/**
 * Analyze Google Business Profile
 */
export async function analyzeGbp(placeDetails: PlaceDetails): Promise<GbpAnalysis> {
  const checklist: ChecklistItem[] = [];
  
  // 1. First-party website
  if (placeDetails.website) {
    const domain = new URL(placeDetails.website).hostname.replace('www.', '');
    checklist.push({
      key: 'website',
      label: 'First-party website',
      status: 'good',
      value: domain,
      extractedValue: placeDetails.website,
      helper: 'A website helps customers learn more about your business and find you online.',
    });
  } else {
    checklist.push({
      key: 'website',
      label: 'First-party website',
      status: 'bad',
      extractedValue: 'Not found',
      helper: 'A visible website makes it easy for customers to find you online.',
    });
  }
  
  // 2. Description
  if (placeDetails.description) {
    checklist.push({
      key: 'description',
      label: 'Description',
      status: 'good',
      value: `${placeDetails.description.length} characters`,
      extractedValue: placeDetails.description,
      helper: 'A well-written description helps customers understand what your business offers.',
    });
  } else {
    checklist.push({
      key: 'description',
      label: 'Description',
      status: 'bad',
      extractedValue: 'Not found',
      helper: 'No description found. Add a description to help customers understand your business.',
    });
  }
  
  // 3. Business hours
  if (placeDetails.openingHours && placeDetails.openingHours.weekday_text) {
    const hoursCount = placeDetails.openingHours.weekday_text.length;
    const hoursText = placeDetails.openingHours.weekday_text.join('\n');
    checklist.push({
      key: 'hours',
      label: 'Business hours',
      status: 'good',
      value: `${hoursCount} days configured`,
      extractedValue: hoursText,
      helper: 'Displaying business hours helps customers plan their visits and reduces inquiries.',
    });
  } else {
    checklist.push({
      key: 'hours',
      label: 'Business hours',
      status: 'bad',
      extractedValue: 'Not found',
      helper: 'Displaying business hours helps customers plan their visits and reduces inquiries.',
    });
  }
  
  // 4. Phone number
  if (placeDetails.phone) {
    checklist.push({
      key: 'phone',
      label: 'Phone number',
      status: 'good',
      value: placeDetails.phone,
      extractedValue: placeDetails.phone,
      helper: 'A visible phone number makes it easy for customers to contact you directly.',
    });
  } else {
    checklist.push({
      key: 'phone',
      label: 'Phone number',
      status: 'bad',
      extractedValue: 'Not found',
      helper: 'A visible phone number makes it easy for customers to contact you directly.',
    });
  }
  
  // 5. Price range
  if (placeDetails.priceLevel !== null && placeDetails.priceLevel !== undefined) {
    const priceLabels = ['Free', '$', '$$', '$$$', '$$$$'];
    const priceLabel = priceLabels[placeDetails.priceLevel] || `Level ${placeDetails.priceLevel}`;
    checklist.push({
      key: 'price',
      label: 'Price range',
      status: 'good',
      value: priceLabel,
      extractedValue: priceLabel,
      helper: 'Showing price range sets clear expectations for potential customers.',
    });
  } else {
    checklist.push({
      key: 'price',
      label: 'Price range',
      status: 'warn',
      extractedValue: 'Not set',
      helper: 'Showing price range sets clear expectations for potential customers.',
    });
  }
  
  // 6. Social media links
  if (placeDetails.website) {
    const socialLinks = await extractSocialLinks(placeDetails.website);
    if (socialLinks.length > 0) {
      checklist.push({
        key: 'social',
        label: 'Social media links',
        status: 'good',
        value: `${socialLinks.length} found`,
        extractedValue: socialLinks.join('\n'),
        helper: 'Social media links extend your reach and provide additional ways for customers to engage.',
      });
    } else {
      checklist.push({
        key: 'social',
        label: 'Social media links',
        status: 'bad',
        extractedValue: 'No social media links found on website',
        helper: 'Social media links extend your reach and provide additional ways for customers to engage.',
      });
    }
  } else {
    checklist.push({
      key: 'social',
      label: 'Social media links',
      status: 'warn',
      extractedValue: 'Cannot check (no website URL available)',
      helper: 'Not available via Places API. Connect GBP to analyze social media links.',
    });
  }
  
  // 8. Description includes relevant keywords
  const extractedKeywords = extractKeywords(placeDetails);
  
  if (placeDetails.description) {
    // Check if description contains relevant keywords from types/address
    const descriptionLower = placeDetails.description.toLowerCase();
    const keywordMatches = extractedKeywords.filter(kw => 
      descriptionLower.includes(kw.toLowerCase())
    );
    const matchPct = extractedKeywords.length > 0 
      ? Math.round((keywordMatches.length / extractedKeywords.length) * 100)
      : 0;
    
    const keywordsFound = keywordMatches.length > 0 
      ? `Keywords found: ${keywordMatches.join(', ')}`
      : 'No matching keywords found';
    const allKeywords = extractedKeywords.length > 0
      ? `Extracted keywords: ${extractedKeywords.join(', ')}`
      : 'No keywords extracted';
    
    if (matchPct >= 50) {
      checklist.push({
        key: 'description_keywords',
        label: 'Description includes relevant keywords',
        status: 'good',
        value: `${matchPct}% match`,
        extractedValue: `${keywordsFound}\n${allKeywords}`,
        helper: 'Relevant keywords in your description improve search engine visibility.',
      });
    } else if (matchPct > 0) {
      checklist.push({
        key: 'description_keywords',
        label: 'Description includes relevant keywords',
        status: 'warn',
        value: `${matchPct}% match`,
        extractedValue: `${keywordsFound}\n${allKeywords}`,
        helper: 'Relevant keywords in your description improve search engine visibility. Consider adding more location and service keywords.',
      });
    } else {
      checklist.push({
        key: 'description_keywords',
        label: 'Description includes relevant keywords',
        status: 'warn',
        extractedValue: `${keywordsFound}\n${allKeywords}`,
        helper: 'Relevant keywords in your description improve search engine visibility. Consider adding location and service keywords.',
      });
    }
  } else {
    checklist.push({
      key: 'description_keywords',
      label: 'Description includes relevant keywords',
      status: 'warn',
      extractedValue: 'Cannot analyze (no description found)',
      helper: 'Relevant keywords in your description improve search engine visibility. Add a description first.',
    });
  }
  
  // 9. Categories match keywords
  const genericTypes = new Set([
    'point_of_interest',
    'establishment',
    'premise',
    'geocode',
  ]);
  
  const businessTypes = placeDetails.types.filter(t => !genericTypes.has(t));
  
  if (businessTypes.length > 0) {
    // Try to resolve category family
    const categoryLabel = businessTypes[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const family = resolveCategoryFamily(categoryLabel, placeDetails.types);
    const allowedKeywords = getAllowedServiceKeywords(family);
    
    const typesDisplay = businessTypes
      .map(t => t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
      .join(', ');
    
    checklist.push({
      key: 'category_keywords',
      label: 'Categories match keywords',
      status: 'good',
      value: `${businessTypes.length} business type${businessTypes.length > 1 ? 's' : ''}`,
      extractedValue: typesDisplay,
      helper: 'The categories in your Google Business Profile match your keywords',
    });
  } else {
    checklist.push({
      key: 'category_keywords',
      label: 'Categories match keywords',
      status: 'warn',
      extractedValue: 'Only generic types found (point_of_interest, establishment, etc.)',
      helper: 'The categories in your Google Business Profile match your keywords',
    });
  }
  
  return {
    businessName: placeDetails.name,
    rating: placeDetails.rating || undefined,
    reviews: placeDetails.reviews || undefined,
    checklist,
    keywordChecks: {
      extractedKeywords,
    },
  };
}
