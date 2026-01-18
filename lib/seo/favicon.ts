/**
 * Favicon utilities for organic search results
 */

/**
 * Get favicon URL for a domain using Google's favicon service
 */
export function getFaviconUrl(link: string, displayLink?: string): string {
  let domain: string;
  
  if (displayLink) {
    domain = displayLink;
  } else {
    try {
      const url = new URL(link.startsWith('http') ? link : `https://${link}`);
      domain = url.hostname;
    } catch {
      domain = link;
    }
  }
  
  // Remove www. prefix
  domain = domain.replace(/^www\./, '');
  
  // Use Google's favicon service (same as Owner.com and most SEO tools)
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}
