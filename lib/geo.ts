import { NextRequest } from "next/server";

/**
 * Detects the user's country code from request headers.
 * Priority:
 * 1. cf-ipcountry (Cloudflare)
 * 2. x-vercel-ip-country (Vercel)
 * 3. Fallback to "XX" (unknown)
 */
export function getCountryFromRequest(request: NextRequest): {
  country: string;
  sourceHeader: string | null;
} {
  // Priority 1: Cloudflare header (if domain is proxied through Cloudflare)
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX" && cfCountry.length === 2) {
    return {
      country: cfCountry.toUpperCase(),
      sourceHeader: "cf-ipcountry",
    };
  }

  // Priority 2: Vercel header
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  if (vercelCountry && vercelCountry !== "XX" && vercelCountry.length === 2) {
    return {
      country: vercelCountry.toUpperCase(),
      sourceHeader: "x-vercel-ip-country",
    };
  }

  // Fallback: unknown country
  return {
    country: "XX",
    sourceHeader: null,
  };
}
