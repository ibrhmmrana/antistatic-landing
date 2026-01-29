# Production photo endpoint hang – instrumentation report

## 1) Route code summary (current behavior)

| Aspect | Current behavior |
|--------|-------------------|
| **Proxies bytes vs redirect** | Proxies bytes: fetches from Google Place Photo API, reads full body (`response.blob()` or `response.arrayBuffer()` when `debug=1`), returns image (or JSON when `debug=1`). |
| **Redirect handling** | Uses `redirect: "follow"` explicitly. Google returns 302 → `googleusercontent.com`; fetch follows. |
| **Cache-Control** | Sets `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`. |
| **maxDuration** | **Added:** `export const maxDuration = 60` (Vercel function can run up to 60s; default may be 10s on Hobby). |
| **Abort timeout** | **Already had:** `AbortSignal.timeout(10000)` per attempt (10s). |
| **Runtime** | No `export const runtime` → **Node.js** (Vercel serverless). |

So: **Node serverless, 10s abort per attempt, 60s max function duration, full body buffered then returned.**

---

## 2) New log lines added (prefix `[places/photo]`)

All logs use the same prefix and a per-request `requestId`. No API keys are logged.

| When | Log line (pattern) |
|------|--------------------|
| **Start** | `[places/photo] start timestamp=<ms> refLen=<n> maxw=<val> requestId=<id> debug=<true\|false>` |
| **Before fetch** | `[places/photo] before fetch url=<Google URL with key [REDACTED]> method=GET redirect=follow signalTimeoutMs=10000 attempt=<1-3> requestId=<id>` |
| **After fetch** | `[places/photo] after fetch status=<code> locationPresent=<true\|false> contentType=<...> contentLength=<...> requestId=<id> ms=<elapsed>` |
| **Upstream !ok** | `[places/photo] upstream !ok bodyPreview=<first 500 chars> requestId=<id>` |
| **After body (proxy)** | `[places/photo] after body bytesRead=<n> requestId=<id> ms=<elapsed>` |
| **Before return** | `[places/photo] before return type=image cacheControl=... requestId=<id>` |
| **Catch** | `[places/photo] catch error=<message> name=<Error.name> isAbortError=<true\|false> attempt=<1-3> requestId=<id>` |
| **Last attempt failure** | `[places/photo] Failed after 3 attempts: <message>` |
| **Retry** | `[places/photo] Attempt <n>/3 failed (network/abort), retrying...` |

With `?debug=1`, the handler returns JSON instead of the image and does not log a separate “before return” for the image path.

---

## 3) What each curl / debug endpoint tells you

| Action | What you learn |
|--------|----------------|
| **1) `curl -I 'https://antistatic.ai/api/places/photo?ref=...&maxw=400'`** | Whether the request ever returns headers. If it hangs, the hang is before the first byte of the response (e.g. fetch or body read never completes, or Vercel kills the function before any response). |
| **2) `curl -v 'https://antistatic.ai/api/places/photo?ref=...&maxw=400'`** | Full request/response and where it blocks (e.g. “waiting for headers” forever vs. slow body). |
| **3) `curl -I '<upstream Google URL>'` (from logs, with key redacted – run server-side or copy URL from logs)** | Whether the **upstream** Google URL returns 302 + Location or 200. If you can’t run this from prod, use `?debug=1` and check `locationHeaderPresent` and `upstreamStatus`. |
| **4) Short ref + maxw** | Same as (1)–(2) but with a minimal ref to rule out ref-length or encoding issues. |
| **5) `?debug=1` (same ref + maxw)** | **Without downloading the image:** `upstreamStatus`, `timingMs`, `locationHeaderPresent`, `bytesRead` (or error + `stage`/`isAbortError`). If it returns in &lt;15s with `isAbortError: true`, the hang is the **upstream fetch** (or redirect follow) timing out. If it returns with `upstreamStatus: 200` and `bytesRead`, the hang is likely in **sending the image response** (e.g. buffered blob too large / serverless behavior). |
| **6) `GET /api/health/places-photo`** | Confirms the app and route layout are up; points you to use `?debug=1` for real diagnostics. |

---

## 4) Top 3 likely root causes (with evidence to look for)

| Rank | Likely cause | Evidence to look for |
|------|----------------|----------------------|
| **1** | **Upstream fetch never completes in prod** (redirect follow, DNS, or TLS from Vercel’s runtime to Google / googleusercontent) | **Evidence:** With `?debug=1`, after ~10s you get JSON with `isAbortError: true`, `stage: "fetch"`. Logs show `before fetch` but never `after fetch`. |
| **2** | **Returning a large buffered blob from serverless** (streaming vs buffer, or response flush) | **Evidence:** With `?debug=1` you get JSON quickly with `upstreamStatus: 200`, `bytesRead` large. Normal request (no debug) hangs. Logs show `after fetch` and `after body byteLength=...` and optionally `before return`, but client never gets headers. |
| **3** | **API key / restrictions (e.g. REQUEST_DENIED) only in prod** (different key or IP restrictions) | **Evidence:** With `?debug=1`, response has `upstreamStatus: 403` or body shows `REQUEST_DENIED` / `error_message`. Logs show `after fetch status=403` and `upstream !ok bodyPreview=...`. |

---

## 5) Next actions after you have evidence

- **If (1):** Investigate fetch from Vercel to Google (redirect follow, DNS, TLS, IPv6). Consider a short timeout + explicit redirect handling (e.g. follow 302 and fetch `Location` yourself with a second, time-limited fetch) or switching to Edge if allowed.
- **If (2):** Avoid buffering the full image in memory; stream from upstream to the client (or use a smaller buffer/chunked response) and ensure no single huge `NextResponse(blob)` in Node serverless.
- **If (3):** Fix prod env (`GOOGLE_PLACES_API_KEY`) or relax API key restrictions (e.g. allow Vercel’s IPs or remove HTTP referrer/IP restrictions for the Photo API).

---

## 6) Minimal reproduction checklist

Run these **after** deploying the instrumented code to production.

1. **Headers only (see if anything returns):**  
   `curl -I 'https://antistatic.ai/api/places/photo?ref=YOUR_REF&maxw=400'`

2. **Verbose (see where it blocks):**  
   `curl -v 'https://antistatic.ai/api/places/photo?ref=YOUR_REF&maxw=400'`

3. **Diagnostics without downloading image:**  
   `curl 'https://antistatic.ai/api/places/photo?debug=1&ref=YOUR_REF&maxw=400'`  
   Inspect: `upstreamStatus`, `timingMs`, `locationHeaderPresent`, `bytesRead`, or `error` + `isAbortError` + `stage`.

4. **Health route:**  
   `curl 'https://antistatic.ai/api/health/places-photo'`

5. **Vercel logs:** After each request, check Vercel function logs for `[places/photo]` lines to see how far the handler got (start → before fetch → after fetch → after body → before return / catch).

Use the same `ref` and `maxw=400` as in the failing example (e.g. the long ref from the issue) for (1)–(3).
