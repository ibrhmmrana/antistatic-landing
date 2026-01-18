/**
 * Business Name Normalization
 * Sanitizes and scores business name candidates to avoid "Home - ..." issues
 */

// Generic words that should be rejected
const GENERIC_WORDS = new Set([
  'home', 'welcome', 'index', 'contact', 'menu', 'bookings', 'booking',
  'about', 'page', 'site', 'website', 'main', 'default', 'untitled',
  'official', 'official site', 'homepage', 'home page',
]);

// Leading prefixes to strip
const LEADING_PREFIXES = [
  /^home\s*[-|:•]\s*/i,
  /^welcome\s*(to)?\s*/i,
  /^index\s*[-|:•]\s*/i,
  /^official\s+(site|website|page)?\s*[-|:•]?\s*/i,
  /^homepage\s*[-|:•]\s*/i,
  /^home\s+page\s*[-|:•]\s*/i,
];

// Separators that split name parts
const SEPARATORS = /[-|:•–—]/;

// Generic parts to remove when splitting
const GENERIC_PARTS = new Set([
  'home', 'welcome', 'index', 'contact', 'menu', 'bookings', 'booking',
  'about', 'page', 'site', 'website', 'main', 'official', 'official site',
  'homepage', 'home page', 'privacy', 'terms', 'login', 'signup',
]);

export interface NormalizedCandidate {
  raw: string;
  normalized: string;
  score: number;
  source: string;
}

/**
 * Normalize a single business name candidate
 */
export function normalizeBusinessName(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  
  let cleaned = raw.trim();
  
  // Strip leading prefixes
  for (const prefix of LEADING_PREFIXES) {
    cleaned = cleaned.replace(prefix, '');
  }
  
  // If contains separators, split and pick best part
  if (SEPARATORS.test(cleaned)) {
    const parts = cleaned.split(SEPARATORS)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // Remove generic parts
    const meaningfulParts = parts.filter(p => 
      !GENERIC_PARTS.has(p.toLowerCase()) && 
      p.length >= 2
    );
    
    if (meaningfulParts.length > 0) {
      // Pick the longest part with letters (most brand-like)
      meaningfulParts.sort((a, b) => {
        const aHasLetters = /[a-zA-Z]/.test(a);
        const bHasLetters = /[a-zA-Z]/.test(b);
        if (aHasLetters && !bHasLetters) return -1;
        if (!aHasLetters && bHasLetters) return 1;
        return b.length - a.length; // longest first
      });
      cleaned = meaningfulParts[0];
    } else if (parts.length > 0) {
      // Fallback: use first non-empty part
      cleaned = parts[0];
    }
  }
  
  // Final cleanup
  cleaned = cleaned
    .trim()
    .replace(/\s+/g, ' ') // collapse spaces
    .replace(/^[-|:•–—\s]+|[-|:•–—\s]+$/g, ''); // trim separators from edges
  
  // Hard reject if result is generic
  const lowerCleaned = cleaned.toLowerCase();
  if (GENERIC_WORDS.has(lowerCleaned) || lowerCleaned.length < 2) {
    return '';
  }
  
  return cleaned;
}

/**
 * Extract domain slug name (e.g., "cafecaprice" -> "Cafe Caprice")
 */
export function extractDomainName(host: string): string {
  const domainPart = host.split('.')[0];
  
  // Handle camelCase
  const camelCase = domainPart.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Handle kebab-case/snake_case
  const withSpaces = camelCase.replace(/[-_]/g, ' ');
  
  // Capitalize words
  return withSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Calculate name similarity to domain
 */
export function calculateDomainSimilarity(name: string, domainHost: string): number {
  const domainName = extractDomainName(domainHost);
  const nameLower = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domainLower = domainName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (nameLower === domainLower) return 1.0;
  if (nameLower.includes(domainLower) || domainLower.includes(nameLower)) return 0.8;
  
  // Character overlap
  const nameChars = new Set(nameLower);
  const domainChars = new Set(domainLower);
  let overlap = 0;
  for (const c of nameChars) if (domainChars.has(c)) overlap++;
  
  return overlap / Math.max(nameChars.size, domainChars.size);
}

/**
 * Score a normalized candidate
 */
export function scoreCandidate(
  normalized: string,
  source: string,
  domainHost: string,
  allCandidates: string[]
): number {
  if (!normalized || normalized.length < 2) return -1000;
  
  let score = 0;
  
  // Source-based scoring
  if (source === 'json-ld' || source === 'structured_data') {
    score += 50;
  } else if (source === 'og_site_name') {
    score += 40;
  } else if (source === 'og_title') {
    score += 30;
  } else if (source === 'title') {
    score += 20;
  } else if (source === 'domain') {
    score += 10;
  }
  
  // Domain similarity bonus
  if (domainHost) {
    const similarity = calculateDomainSimilarity(normalized, domainHost);
    if (similarity > 0.7) {
      score += 30;
    } else if (similarity > 0.5) {
      score += 15;
    }
  }
  
  // Multi-source appearance bonus
  const normalizedLower = normalized.toLowerCase();
  const appearances = allCandidates.filter(c => 
    normalizeBusinessName(c).toLowerCase() === normalizedLower
  ).length;
  if (appearances > 1) {
    score += 20;
  }
  
  // Penalty for generic prefixes (shouldn't happen after normalization, but safety check)
  const lower = normalized.toLowerCase();
  if (lower.startsWith('home') || lower.startsWith('welcome') || lower.startsWith('index')) {
    score -= 100;
  }
  
  // Length bonus (prefer meaningful names, but not too long)
  if (normalized.length >= 4 && normalized.length <= 50) {
    score += 5;
  }
  
  // Penalty for very short or very long
  if (normalized.length < 3) score -= 50;
  if (normalized.length > 60) score -= 20;
  
  return score;
}

/**
 * Collect and score all business name candidates
 */
export function collectAndScoreCandidates(params: {
  structuredDataName: string | null;
  ogSiteName: string | null;
  ogTitle: string | null;
  title: string | null;
  domainHost: string;
}): NormalizedCandidate[] {
  const { structuredDataName, ogSiteName, ogTitle, title, domainHost } = params;
  
  const rawCandidates: Array<{ value: string; source: string }> = [];
  
  // Collect all raw candidates
  if (structuredDataName) {
    rawCandidates.push({ value: structuredDataName, source: 'json-ld' });
  }
  if (ogSiteName) {
    rawCandidates.push({ value: ogSiteName, source: 'og_site_name' });
  }
  if (ogTitle) {
    rawCandidates.push({ value: ogTitle, source: 'og_title' });
  }
  if (title) {
    rawCandidates.push({ value: title, source: 'title' });
  }
  
  // Domain fallback
  const domainName = extractDomainName(domainHost);
  if (domainName) {
    rawCandidates.push({ value: domainName, source: 'domain' });
  }
  
  // Normalize all candidates
  const normalizedCandidates: NormalizedCandidate[] = [];
  const allRawValues = rawCandidates.map(c => c.value);
  
  for (const candidate of rawCandidates) {
    const normalized = normalizeBusinessName(candidate.value);
    if (normalized) {
      const score = scoreCandidate(normalized, candidate.source, domainHost, allRawValues);
      normalizedCandidates.push({
        raw: candidate.value,
        normalized,
        score,
        source: candidate.source,
      });
    }
  }
  
  // Sort by score descending
  normalizedCandidates.sort((a, b) => b.score - a.score);
  
  return normalizedCandidates;
}

/**
 * Get the best business name from candidates
 */
export function getBestBusinessName(candidates: NormalizedCandidate[]): string | null {
  if (candidates.length === 0) return null;
  
  // Return highest scoring candidate
  const winner = candidates[0];
  if (winner.score > 0) {
    return winner.normalized;
  }
  
  return null;
}
