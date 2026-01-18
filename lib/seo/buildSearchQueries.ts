/**
 * Build high-quality search queries for Google CSE
 * Based on resolved business identity
 */

import type { BusinessIdentity } from '@/lib/business/resolveBusinessIdentity';

export interface SearchQuery {
  query: string;
  intent: 'branded' | 'non_branded';
  rationale: string;
}

// Invalid query patterns - these should never be generated
const INVALID_QUERY_PATTERNS = [
  /^home$/i,
  /^home\s+reviews?$/i,
  /^home\s+contact$/i,
  /^home\s+pricing$/i,
  /^about$/i,
  /^contact$/i,
  /^welcome$/i,
  /^index$/i,
  /^page$/i,
  /^untitled$/i,
];

// Generic words that shouldn't be the only content of a service keyword
const GENERIC_SERVICE_WORDS = new Set([
  'home', 'about', 'contact', 'page', 'site', 'website', 'index', 'welcome',
  'login', 'signup', 'register', 'privacy', 'terms', 'policy', 'main',
  'services', 'products', 'solutions', // too vague alone
]);

/**
 * Check if a query is valid
 */
function isValidQuery(query: string): boolean {
  const trimmed = query.trim();
  
  // Must have at least 2 meaningful tokens
  const tokens = trimmed.split(/\s+/).filter(t => t.length >= 2);
  if (tokens.length < 1) return false;
  
  // Check against invalid patterns
  if (INVALID_QUERY_PATTERNS.some(p => p.test(trimmed))) {
    return false;
  }
  
  // Query shouldn't be just generic words
  const allGeneric = tokens.every(t => GENERIC_SERVICE_WORDS.has(t.toLowerCase()));
  if (allGeneric) return false;
  
  return true;
}

/**
 * Build search queries from business identity
 */
export function buildSearchQueries(params: {
  identity: BusinessIdentity;
  maxQueries?: number;
  hasMenuPage?: boolean;
  hasPricingPage?: boolean;
}): SearchQuery[] {
  const { identity, maxQueries = 10, hasMenuPage = false, hasPricingPage = false } = params;
  const queries: SearchQuery[] = [];
  const seen = new Set<string>();
  
  const addQuery = (query: string, intent: 'branded' | 'non_branded', rationale: string) => {
    const normalized = query.toLowerCase().trim();
    if (!isValidQuery(normalized) || seen.has(normalized)) return;
    seen.add(normalized);
    queries.push({ query: query.trim(), intent, rationale });
  };
  
  const { business_name, location_suburb, location_city, location_country, service_keywords, category_label } = identity;
  
  // Determine best location to use
  const suburbOrCity = location_suburb || location_city;
  const cityOrCountry = location_city || location_country || 'South Africa';
  const hasLocation = !!suburbOrCity;
  
  // =========================================================================
  // 1. BRANDED QUERIES (always include if business name is valid)
  // =========================================================================
  if (business_name && business_name.length > 2) {
    // Basic brand query
    addQuery(business_name, 'branded', 'Brand name search');
    
    // Brand + location (if we have one)
    if (suburbOrCity) {
      addQuery(`${business_name} ${suburbOrCity}`, 'branded', 'Brand + suburb/city');
    }
    
    // Brand + reviews (important for reputation)
    addQuery(`${business_name} reviews`, 'branded', 'Brand reviews search');
    
    // Brand + contact
    addQuery(`${business_name} contact`, 'branded', 'Brand contact search');
    
    // Brand + menu (only for hospitality)
    const isHospitality = ['Restaurant', 'Bar', 'Cafe', 'Hotel', 'Bakery', 'Nightclub'].includes(category_label);
    if ((isHospitality || hasMenuPage) && queries.length < maxQueries) {
      addQuery(`${business_name} menu`, 'branded', 'Brand menu search (hospitality)');
    }
    
    // Brand + pricing (only if relevant)
    const isPriceRelevant = ['Marketing Agency', 'Law Firm', 'Dentist', 'Contractor', 'Plumber', 'Electrician'].includes(category_label) || hasPricingPage;
    if (isPriceRelevant && queries.length < maxQueries) {
      addQuery(`${business_name} pricing`, 'branded', 'Brand pricing search');
    }
  }
  
  // =========================================================================
  // 2. NON-BRANDED QUERIES (service + location)
  // =========================================================================
  
  // Filter service keywords
  const validServiceKeywords = service_keywords
    .filter(kw => kw.length >= 3 && !GENERIC_SERVICE_WORDS.has(kw.toLowerCase()))
    .slice(0, 5);
  
  // If we don't have good service keywords, use category
  if (validServiceKeywords.length === 0 && category_label && category_label !== 'Business') {
    validServiceKeywords.push(category_label.toLowerCase());
  }
  
  for (const service of validServiceKeywords) {
    if (queries.length >= maxQueries) break;
    
    // Service + suburb (most specific)
    if (location_suburb && queries.length < maxQueries) {
      addQuery(
        `${service} ${location_suburb}`,
        'non_branded',
        `Service "${service}" + suburb`
      );
    }
    
    // Service + city
    if (location_city && queries.length < maxQueries) {
      addQuery(
        `${service} ${location_city}`,
        'non_branded',
        `Service "${service}" + city`
      );
    }
    
    // "Best" + service + location
    if (suburbOrCity && queries.length < maxQueries) {
      addQuery(
        `best ${service} ${suburbOrCity}`,
        'non_branded',
        `Best + service + location`
      );
    }
    
    // Fallback: service + country (if no city)
    if (!hasLocation && location_country && queries.length < maxQueries) {
      addQuery(
        `${service} ${location_country}`,
        'non_branded',
        `Service + country (no local location)`
      );
    }
  }
  
  // Category + location if we still need queries
  if (category_label && category_label !== 'Business' && queries.length < maxQueries) {
    const catLower = category_label.toLowerCase();
    
    if (location_suburb && queries.length < maxQueries) {
      addQuery(
        `${catLower} ${location_suburb}`,
        'non_branded',
        `Category + suburb`
      );
    }
    
    if (location_city && queries.length < maxQueries) {
      addQuery(
        `best ${catLower} ${location_city}`,
        'non_branded',
        `Best + category + city`
      );
    }
  }
  
  // =========================================================================
  // IMPORTANT: DO NOT generate "near me" queries without location context
  // CSE is not geolocated, so "near me" is meaningless
  // =========================================================================
  
  return queries.slice(0, maxQueries);
}

/**
 * Validate queries - helper for debugging
 */
export function validateQueries(queries: SearchQuery[]): { valid: SearchQuery[]; invalid: SearchQuery[] } {
  const valid: SearchQuery[] = [];
  const invalid: SearchQuery[] = [];
  
  for (const q of queries) {
    if (isValidQuery(q.query)) {
      valid.push(q);
    } else {
      invalid.push(q);
    }
  }
  
  return { valid, invalid };
}
