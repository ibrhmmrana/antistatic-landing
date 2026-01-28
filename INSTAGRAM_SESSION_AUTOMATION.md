# Instagram Session Automation System

## Overview

This system automatically refreshes Instagram session credentials using headless browser automation, updates environment variables, and sends credentials to an external webhook for n8n automation.

## Architecture

### Components

1. **Session Service** (`lib/services/instagram-session.ts`)
   - Handles browser automation with Playwright
   - Extracts session cookies (sessionid, csrftoken, ds_user_id)
   - Validates existing sessions
   - Sends credentials to webhook

2. **Environment Manager** (`lib/services/env-manager.ts`)
   - Updates `.env.local` file with new credentials
   - Preserves existing environment variables

3. **API Endpoints**
   - `/api/instagram/session/refresh` - Main refresh endpoint (requires API key)
   - `/api/instagram/session/status` - Health check endpoint
   - `/api/instagram/session/manual` - Manual session creation for testing

4. **Frontend Integration** (`app/new-test/page.tsx`)
   - Session status indicator
   - Manual refresh button
   - Session age display

## Setup

### 1. Environment Variables

Add to `.env.local`:

```env
# Existing Instagram credentials (for automation)
INSTAGRAM_USERNAME=your_instagram_username
INSTAGRAM_PASSWORD=your_instagram_password
INSTAGRAM_2FA_BACKUP_CODE=optional_2fa_backup_code

# Webhook configuration
INSTAGRAM_WEBHOOK_URL=https://ai.intakt.co.za/webhook/instagram-scraper
INSTAGRAM_WEBHOOK_SECRET=optional_webhook_secret

# API security
SESSION_REFRESH_API_KEY=your_secure_api_key_here

# Existing session variables (will be updated automatically)
INSTAGRAM_SESSION_ID=...
INSTAGRAM_CSRF_TOKEN=...
INSTAGRAM_DS_USER_ID=...
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

## Usage

### Automatic Refresh (n8n Cron)

Set up a cron job in n8n to call the refresh endpoint every 6 hours:

**Schedule:** `0 */6 * * *` (Every 6 hours)

**Request:**
```
POST /api/instagram/session/refresh
Headers:
  X-API-Key: [SESSION_REFRESH_API_KEY]
  Content-Type: application/json

# Optional: Add ?headful=true to run in visible browser mode (for debugging)
POST /api/instagram/session/refresh?headful=true
```

**Response:**
```json
{
  "success": true,
  "message": "Session refreshed successfully",
  "session": {
    "sessionid": "77412948771:7Rr4IVSLda1Mkf:17:AYgLa0fmz2i2_HcslPwI1IrsT_rru0WRqtwWZjDnDg",
    "csrftoken": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "ds_user_id": "77412948771",
    "expires_at": "2024-01-26T12:00:00Z",
    "refreshed_at": "2024-01-25T12:00:00Z",
    "is_valid": true
  },
  "steps": {
    "browser_launch": "success",
    "login": "success",
    "cookie_extraction": "success",
    "webhook_send": "success"
  },
  "duration_ms": 12345
}
```

### Health Check

**Request:**
```
GET /api/instagram/session/status
```

**Response:**
```json
{
  "healthy": true,
  "message": "Session is valid",
  "session_age_hours": 2.5,
  "needs_refresh": false,
  "has_session": true,
  "session_info": {
    "refreshed_at": "2024-01-25T10:00:00Z",
    "expires_at": "2024-01-26T10:00:00Z",
    "is_valid": true,
    "has_csrf": true,
    "has_user_id": true
  }
}
```

### Manual Refresh (Testing)

**Request:**
```
POST /api/instagram/session/manual
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

## Webhook Payload

The system sends the following payload to the configured webhook:

```json
{
  "event": "instagram_session_refresh",
  "timestamp": "2024-01-25T12:00:00Z",
  "source": "antistatic-landing",
  "credentials": {
    "sessionid": "77412948771:7Rr4IVSLda1Mkf:17:AYgLa0fmz2i2_HcslPwI1IrsT_rru0WRqtwWZjDnDg",
    "csrftoken": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "ds_user_id": "77412948771",
    "expires_in": 86400
  },
  "metadata": {
    "user_agent": "Instagram 267.0.0.19.301 Android",
    "extracted_at": "2024-01-25T12:00:00Z",
    "session_age_seconds": 0
  }
}
```

## Integration with Existing Scraper

The existing Instagram scraper (`/app/api/test/instagram-api/route.ts`) automatically uses the updated environment variables. No changes needed - the session refresh system updates `.env.local`, and the scraper reads from `process.env.INSTAGRAM_SESSION_ID`.

## Error Handling

### Common Errors

1. **Rate Limiting**
   - Error: "Rate limit: Please wait X seconds before refreshing again"
   - Solution: Wait 5 minutes between refresh attempts

2. **2FA Required**
   - Error: "2FA challenge detected but INSTAGRAM_2FA_BACKUP_CODE not configured"
   - Solution: Add `INSTAGRAM_2FA_BACKUP_CODE` to environment variables

3. **Login Failed**
   - Error: "Login failed - still on login page"
   - Solution: Check credentials, handle 2FA manually, or check for Instagram blocking

4. **Webhook Failure**
   - Warning: Webhook send failed (non-blocking)
   - Solution: Check webhook URL and network connectivity

## Security Considerations

1. **API Key Protection**: The refresh endpoint requires `X-API-Key` header matching `SESSION_REFRESH_API_KEY`
2. **Rate Limiting**: Built-in 5-minute cooldown between refresh attempts
3. **Credential Masking**: API responses mask full credentials in logs
4. **Environment File**: `.env.local` should be in `.gitignore` (already configured)

## Monitoring

### Logs

The system logs each step:
- `[SESSION]` - Session service logs
- `[ENV]` - Environment manager logs
- `[API]` - API endpoint logs

### Frontend Status

The `/new-test` page shows:
- Session health status (green/yellow indicator)
- Session age in hours
- Manual refresh button

## Troubleshooting

### Session Refresh Fails

1. Check credentials: `INSTAGRAM_USERNAME` and `INSTAGRAM_PASSWORD`
2. Check for 2FA: Add `INSTAGRAM_2FA_BACKUP_CODE` if enabled
3. Check Playwright: Ensure Chromium is installed (`npx playwright install chromium`)
4. Check logs: Look for specific error messages in console

### Webhook Not Receiving Data

1. Verify webhook URL: Check `INSTAGRAM_WEBHOOK_URL`
2. Check network: Ensure server can reach webhook URL
3. Check webhook secret: Verify `INSTAGRAM_WEBHOOK_SECRET` if configured
4. Check logs: Look for webhook send errors

### Environment Variables Not Updating

1. Check file permissions: Ensure `.env.local` is writable
2. Check file path: Verify working directory is correct
3. Check logs: Look for environment update errors

## n8n Cron Setup

### Recommended Schedule

- **Frequency**: Every 6 hours (`0 */6 * * *`)
- **Endpoint**: `POST /api/instagram/session/refresh`
- **Headers**: `X-API-Key: [your_api_key]`
- **Timeout**: 60 seconds (browser automation can take time)

### Health Check for Monitoring

- **Frequency**: Every hour (`0 * * * *`)
- **Endpoint**: `GET /api/instagram/session/status`
- **Alert if**: `needs_refresh === true` or `healthy === false`

## Files Created

- `lib/services/instagram-session.ts` - Core session automation service
- `lib/services/env-manager.ts` - Environment variable management
- `app/api/instagram/session/refresh/route.ts` - Refresh endpoint
- `app/api/instagram/session/status/route.ts` - Status endpoint
- `app/api/instagram/session/manual/route.ts` - Manual creation endpoint
- `INSTAGRAM_SESSION_AUTOMATION.md` - This documentation

## Next Steps

1. Configure environment variables
2. Install Playwright browsers: `npx playwright install chromium`
3. Test manual refresh: Use `/api/instagram/session/manual` endpoint
4. Set up n8n cron job for automatic refresh
5. Monitor session health via `/api/instagram/session/status`
