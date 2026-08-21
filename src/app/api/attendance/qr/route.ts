import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSessionQrCode, verifyAndMarkQrAttendance } from '@/lib/qrEngine';
import { SICM_CAMPUS_COORDINATES, DEFAULT_GEOFENCE_RADIUS_METERS } from '@/lib/geoFence';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      sessionId,
      expirySeconds,
      studentProfileId,
      tokenInput,
      coordinates,
      geofenceRadiusMeters,
    } = body;

    // Action 1: Teacher generates Geofenced QR Code for the active session
    if (action === 'generate') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
      }

      const radius = geofenceRadiusMeters || DEFAULT_GEOFENCE_RADIUS_METERS;
      const targetCoords = coordinates || SICM_CAMPUS_COORDINATES;

      const qrData = await generateSessionQrCode(sessionId, expirySeconds || 90, radius, targetCoords);
      return NextResponse.json({ success: true, ...qrData });
    }

    // Action 2: Student submits scanned QR token with GPS location
    if (action === 'verify') {
      if (!studentProfileId || !tokenInput) {
        return NextResponse.json({ error: 'Student ID and QR payload/token required' }, { status: 400 });
      }

      const result = await verifyAndMarkQrAttendance(
        studentProfileId,
        tokenInput,
        coordinates,
        geofenceRadiusMeters || DEFAULT_GEOFENCE_RADIUS_METERS
      );

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in QR route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Poll live QR session status and list of students who have checked in
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const session = await db.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        records: {
          include: {
            student: { include: { user: true } },
          },
          orderBy: { markedAt: 'desc' },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const isExpired = session.qrExpiresAt ? new Date() > session.qrExpiresAt : true;

    return NextResponse.json({
      qrToken: session.qrToken,
      qrExpiresAt: session.qrExpiresAt,
      isExpired,
      geofence: {
        campusCoordinates: SICM_CAMPUS_COORDINATES,
        radiusMeters: DEFAULT_GEOFENCE_RADIUS_METERS,
      },
      totalCheckedIn: session.records.filter((r) => r.status === 'PRESENT').length,
      records: session.records,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
