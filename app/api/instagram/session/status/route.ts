import { NextRequest, NextResponse } from 'next/server';
import { InstagramSessionService } from '@/lib/services/instagram-session';

export const runtime = 'nodejs';

/**
 * GET /api/instagram/session/status
 * Returns current session status and health information
 */
export async function GET(request: NextRequest) {
  try {
    const sessionService = InstagramSessionService.getInstance();
    const healthCheck = await sessionService.healthCheck();
    const currentSession = sessionService.getCurrentSession();

    return NextResponse.json({
      healthy: healthCheck.healthy,
      message: healthCheck.message,
      session_age_hours: healthCheck.session_age_hours,
      needs_refresh: healthCheck.needs_refresh,
      has_session: !!currentSession,
      session_info: currentSession ? {
        refreshed_at: currentSession.refreshed_at.toISOString(),
        expires_at: currentSession.expires_at.toISOString(),
        is_valid: currentSession.is_valid,
        has_csrf: !!currentSession.csrftoken,
        has_user_id: !!currentSession.ds_user_id,
      } : null,
    });
  } catch (error: any) {
    console.error('[API] Status check error:', error);
    return NextResponse.json(
      {
        healthy: false,
        message: error.message || 'Error checking session status',
      },
      { status: 500 }
    );
  }
}
