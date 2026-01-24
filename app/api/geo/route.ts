import { NextRequest, NextResponse } from "next/server";
import { getCountryFromRequest } from "@/lib/geo";

/**
 * Debug endpoint to test country detection.
 * 
 * Usage:
 * - Local: curl -H "x-vercel-ip-country: ZA" "http://localhost:3000/api/geo"
 * - Vercel: GET /api/geo (will use actual headers)
 */
export async function GET(request: NextRequest) {
  const { country, sourceHeader } = getCountryFromRequest(request);

  // Collect all relevant headers for debugging
  const debug = {
    "cf-ipcountry": request.headers.get("cf-ipcountry"),
    "x-vercel-ip-country": request.headers.get("x-vercel-ip-country"),
    "x-forwarded-for": request.headers.get("x-forwarded-for"),
    "user-agent": request.headers.get("user-agent"),
  };

  return NextResponse.json({
    country,
    sourceHeader,
    debug,
  });
}
