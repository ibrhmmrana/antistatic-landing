/**
 * Owner-style Query Builder
 * Generates non-branded, high-intent queries (category/service + neighborhood)
 * Similar to Owner.com's approach
 */

import type { BusinessIdentity } from '@/lib/business/resolveBusinessIdentity';

export interface OwnerStyleQuery {
  query: string;
  intent: 'non_branded' | 'branded';
  rationale: string;
}

// Category to search phrase mapping
const CATEGORY_PHRASES: Record<string, string> = {
  'Restaurant': 'restaurant',
  'Bar': 'bar',
  'Cafe': 'cafe',
  'Bakery': 'bakery',
  'Hotel': 'hotel',
  'Nightclub': 'nightclub',
  'Dentist': 'dentist',
  'Law Firm': 'lawyer',
  'Accounting Firm': 'accounting',
  'Medical Practice': 'doctor',
  'Hospital': 'hospital',
  'Pharmacy': 'pharmacy',
  'Gym': 'gym',
  'Spa': 'spa',
  'Beauty Salon': 'beauty salon',
  'Hair Salon': 'hair salon',
  'Car Dealership': 'car dealer',
  'Auto Repair': 'auto repair',
  'Electrician': 'electrician',
  'Plumber': 'plumber',
  'Roofing Contractor': 'roofing contractor',
  'Contractor': 'contractor',
  'Real Estate Agency': 'real estate',
  'Travel Agency': 'travel agency',
  'Insurance Agency': 'insurance',
  'Marketing Agency': 'marketing agency',
  'Retail Store': 'store',
  'Clothing Store': 'clothing store',
  'Furniture Store': 'furniture store',
};

// Service intents for restaurants/cafes (only if detected on site)
const RESTAURANT_SERVICE_INTENTS = [
  'brunch', 'breakfast', 'cocktails', 'tapas', 'seafood', 'pizza',
  'sushi', 'italian', 'french', 'mediterranean', 'steakhouse',
];

// Generic words to reject
const REJECTED_KEYWORDS = new Set([
  'home', 'welcome', 'contact', 'login', 'signup', 'privacy', 'terms',
  'booking', 'menu', 'about', 'page', 'site', 'website',
]);

/**
 * Check if a keyword is valid for queries
 */
function isValidKeyword(keyword: string): boolean {
  const lower = keyword.toLowerCase().trim();
  if (lower.length < 3) return false;
  if (REJECTED_KEYWORDS.has(lower)) return false;
  if (/^\d+$/.test(lower)) return false; // pure numbers
  return true;
}

/**
 * Build Owner-style queries
 */
export function buildOwnerStyleQueries(params: {
  identity: BusinessIdentity;
  maxQueries?: number;
  detectedServiceIntents?: string[]; // e.g., ['brunch', 'cocktails'] from site content
}): OwnerStyleQuery[] {
  const { identity, maxQueries = 12, detectedServiceIntents = [] } = params;
  const queries: OwnerStyleQuery[] = [];
  const seen = new Set<string>();
  
  const { business_name, category_label, location_suburb, location_city, service_keywords } = identity;
  
  // Determine location to use (prefer suburb, fallback to city)
  const location = location_suburb || location_city;
  
  if (!location) {
    // No location - can't build meaningful non-branded queries
    // Only return minimal branded queries
    if (business_name && business_name.length > 2) {
      queries.push({
        query: business_name,
        intent: 'branded',
        rationale: 'Brand name (no location available)',
      });
    }
    return queries.slice(0, maxQueries);
  }
  
  // =========================================================================
  // A) NON-BRANDED CORE (Primary - category + neighborhood)
  // =========================================================================
  
  const categoryPhrase = CATEGORY_PHRASES[category_label] || category_label.toLowerCase();
  
  if (categoryPhrase && categoryPhrase !== 'business') {
    // Core category queries
    const addQuery = (q: string, rationale: string) => {
      const normalized = q.toLowerCase().trim();
      if (!seen.has(normalized) && q.split(/\s+/).length >= 3) {
        seen.add(normalized);
        queries.push({ query: q.trim(), intent: 'non_branded', rationale });
      }
    };
    
    addQuery(`best ${categoryPhrase} in ${location}`, `Best + category + ${location_suburb ? 'suburb' : 'city'}`);
    addQuery(`${categoryPhrase} in ${location}`, `Category + ${location_suburb ? 'suburb' : 'city'}`);
    addQuery(`${categoryPhrase} ${location}`, `Category + ${location_suburb ? 'suburb' : 'city'} (no preposition)`);
    
    // If we have suburb, also try city-level
    if (location_suburb && location_city && location_suburb !== location_city) {
      addQuery(`best ${categoryPhrase} in ${location_city}`, `Best + category + city`);
      addQuery(`${categoryPhrase} ${location_city}`, `Category + city`);
    }
  }
  
  // =========================================================================
  // B) NON-BRANDED SECONDARY (Service intents)
  // =========================================================================
  
  // Use detected service intents from site content
  const validServiceIntents = detectedServiceIntents
    .filter(kw => isValidKeyword(kw) && kw.length >= 3)
    .slice(0, 4);
  
  // Also check service keywords from identity
  for (const kw of service_keywords) {
    if (validServiceIntents.length >= 4) break;
    const lower = kw.toLowerCase();
    if (isValidKeyword(kw) && !validServiceIntents.includes(lower)) {
      // Check if it's a restaurant/cafe service intent
      if (['Restaurant', 'Bar', 'Cafe'].includes(category_label)) {
        if (RESTAURANT_SERVICE_INTENTS.some(intent => lower.includes(intent) || intent.includes(lower))) {
          validServiceIntents.push(lower);
        }
      } else {
        // For other businesses, use service keywords that aren't generic
        validServiceIntents.push(lower);
      }
    }
  }
  
  // Build service intent queries
  for (const serviceIntent of validServiceIntents) {
    if (queries.length >= maxQueries - 3) break; // Reserve 3 for branded
    
    const addServiceQuery = (q: string, rationale: string) => {
      const normalized = q.toLowerCase().trim();
      if (!seen.has(normalized) && q.split(/\s+/).length >= 3) {
        seen.add(normalized);
        queries.push({ query: q.trim(), intent: 'non_branded', rationale });
      }
    };
    
    addServiceQuery(`best ${serviceIntent} in ${location}`, `Best + service "${serviceIntent}" + location`);
    addServiceQuery(`${serviceIntent} ${location}`, `Service "${serviceIntent}" + location`);
    
    if (location_suburb && location_city && location_suburb !== location_city) {
      addServiceQuery(`${serviceIntent} ${location_city}`, `Service "${serviceIntent}" + city`);
    }
  }
  
  // =========================================================================
  // C) BRANDED (Minimal - max 3)
  // =========================================================================
  
  if (business_name && business_name.length > 2) {
    const addBranded = (q: string, rationale: string) => {
      const normalized = q.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        queries.push({ query: q.trim(), intent: 'branded', rationale });
      }
    };
    
    addBranded(business_name, 'Brand name');
    if (location) {
      addBranded(`${business_name} ${location}`, 'Brand + location');
    }
    addBranded(`${business_name} reviews`, 'Brand reviews');
  }
  
  return queries.slice(0, maxQueries);
}
