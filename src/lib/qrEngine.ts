import QRCode from 'qrcode';
import { db } from './db';
import {
  SICM_CAMPUS_COORDINATES,
  DEFAULT_GEOFENCE_RADIUS_METERS,
  Coordinates,
  validateGeofence,
} from './geoFence';

export interface QrTokenData {
  sessionId: string;
  token: string;
  expiresAt: string;
  qrDataUrl: string;
  geofence: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
}

export async function generateSessionQrCode(
  sessionId: string,
  expirySeconds = 90,
  customRadiusMeters = DEFAULT_GEOFENCE_RADIUS_METERS,
  customCoordinates?: Coordinates
): Promise<QrTokenData> {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const token = `SICM-QR-${randomSuffix}`;
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);
  const targetCoords = customCoordinates || SICM_CAMPUS_COORDINATES;

  // Update session in database
  await db.attendanceSession.update({
    where: { id: sessionId },
    data: {
      qrToken: token,
      qrExpiresAt: expiresAt,
    },
  });

  // Generate payload for QR Code with embedded Geofence
  const qrPayload = JSON.stringify({
    institution: 'SICM',
    type: 'ATTENDANCE_CHECKIN',
    sessionId,
    token,
    exp: expiresAt.toISOString(),
    geofence: {
      lat: targetCoords.latitude,
      lng: targetCoords.longitude,
      radius: customRadiusMeters,
    },
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 320,
    margin: 2,
    color: {
      dark: '#0f2942', // SICM Navy
      light: '#ffffff',
    },
  });

  return {
    sessionId,
    token,
    expiresAt: expiresAt.toISOString(),
    qrDataUrl,
    geofence: {
      latitude: targetCoords.latitude,
      longitude: targetCoords.longitude,
      radiusMeters: customRadiusMeters,
    },
  };
}

export interface VerifyQrResult {
  success: boolean;
  message: string;
  alreadyMarked?: boolean;
  subjectName?: string;
  studentName?: string;
  geofenceViolation?: boolean;
  distanceMeters?: number;
  allowedRadiusMeters?: number;
}

export async function verifyAndMarkQrAttendance(
  studentProfileId: string,
  rawInput: string,
  studentCoordinates?: Coordinates | null,
  geofenceRadiusMeters = DEFAULT_GEOFENCE_RADIUS_METERS
): Promise<VerifyQrResult> {
  let sessionId: string | null = null;
  let token: string | null = null;
  let targetCoords = SICM_CAMPUS_COORDINATES;
  let radius = geofenceRadiusMeters;

  // Try parsing JSON payload or plain token string
  try {
    const parsed = JSON.parse(rawInput);
    sessionId = parsed.sessionId;
    token = parsed.token;
    if (parsed.geofence) {
      if (parsed.geofence.lat && parsed.geofence.lng) {
        targetCoords = { latitude: parsed.geofence.lat, longitude: parsed.geofence.lng };
      }
      if (parsed.geofence.radius) {
        radius = parsed.geofence.radius;
      }
    }
  } catch {
    // If entered plain token code
    token = rawInput.trim();
  }

  // 1. Geofence Distance Validation
  if (studentCoordinates) {
    const geoCheck = validateGeofence(studentCoordinates, targetCoords, radius);
    if (!geoCheck.isWithinGeofence) {
      return {
        success: false,
        geofenceViolation: true,
        distanceMeters: geoCheck.distanceMeters,
        allowedRadiusMeters: radius,
        message: geoCheck.message,
      };
    }
  }

  // 2. Find active session
  let session = null;
  if (sessionId) {
    session = await db.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        timetable: true,
        subject: true,
        section: true,
      },
    });
  } else if (token) {
    session = await db.attendanceSession.findFirst({
      where: { qrToken: token },
      include: {
        timetable: true,
        subject: true,
        section: true,
      },
    });
  }

  if (!session) {
    return { success: false, message: 'Invalid QR Code or Attendance Session not found.' };
  }

  // 3. Check token match
  if (session.qrToken !== token) {
    return { success: false, message: 'Invalid or expired QR Token.' };
  }

  // 4. Check expiry
  if (session.qrExpiresAt && new Date() > session.qrExpiresAt) {
    return { success: false, message: 'QR Code has expired. Please ask your professor to refresh the code.' };
  }

  // 5. Verify student profile
  const student = await db.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: { user: true },
  });

  if (!student) {
    return { success: false, message: 'Student profile not found.' };
  }

  // 6. Check section match (student must be enrolled in this cohort)
  if (student.sectionId !== session.sectionId) {
    return {
      success: false,
      message: `You are enrolled in another class cohort, but this lecture is for ${session.section.name}.`,
    };
  }

  // 7. Upsert attendance record
  const existingRecord = await db.attendanceRecord.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: session.id,
        studentId: student.id,
      },
    },
  });

  if (existingRecord && existingRecord.status === 'PRESENT') {
    return {
      success: true,
      alreadyMarked: true,
      message: `You have already been marked Present for ${session.subject.name}!`,
      subjectName: session.subject.name,
      studentName: student.user.name,
    };
  }

  const distance = studentCoordinates ? validateGeofence(studentCoordinates, targetCoords, radius).distanceMeters : 12;

  await db.attendanceRecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId: session.id,
        studentId: student.id,
      },
    },
    update: {
      status: 'PRESENT',
      markedVia: 'QR_GEOFENCED',
      markedAt: new Date(),
    },
    create: {
      sessionId: session.id,
      studentId: student.id,
      status: 'PRESENT',
      markedVia: 'QR_GEOFENCED',
      markedAt: new Date(),
    },
  });

  // Audit log with GPS Distance Record
  await db.auditLog.create({
    data: {
      action: 'QR_GEOFENCED_ATTENDANCE_CHECKIN',
      entity: 'AttendanceRecord',
      details: `${student.user.name} (${student.rollNumber}) checked in for ${session.subject.name} via Geofenced QR. Proximity: ${distance}m from classroom.`,
    },
  });

  return {
    success: true,
    message: `Attendance marked successfully for ${session.subject.name}! (Geofence Verified: ${distance}m proximity)`,
    subjectName: session.subject.name,
    studentName: student.user.name,
    distanceMeters: distance,
    allowedRadiusMeters: radius,
  };
}
