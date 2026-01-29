import { NextResponse } from "next/server";

/**
 * Temporary health/diagnostic endpoint for the places photo proxy.
 * Does not perform an upstream fetch; use the photo route with ?debug=1 for that.
 *
 * For diagnostics (upstream status, timing, Location header, bytes read), call:
 *   GET /api/places/photo?debug=1&ref=...&maxw=400
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Places photo health check. Use GET /api/places/photo?debug=1&ref=PHOTO_REF&maxw=400 for upstream diagnostics (upstream status, timing, location header, bytes read).",
    diagnosticUrl: "/api/places/photo?debug=1&ref=YOUR_PHOTO_REF&maxw=400",
  });
}
