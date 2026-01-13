/**
 * CSP Violation Reporting Endpoint
 *
 * This endpoint receives Content Security Policy violation reports from the browser
 * and logs them to the console in development mode. This helps developers identify
 * and fix CSP issues during development before they reach production.
 *
 * The endpoint is only active when 'report-uri /api/csp-report' is included in the
 * CSP header (which happens in development mode only).
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const report = await request.json();
        console.error('[CSP VIOLATION]', JSON.stringify(report, null, 2));
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[CSP REPORT] Failed to parse report:', error);
        return NextResponse.json({ error: 'Invalid report' }, { status: 400 });
    }
}
