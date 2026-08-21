/**
 * SICM Campus Geofence Engine
 * Computes precise distance between student device GPS coordinates
 * and the SICM Campus / Classroom coordinates using the Haversine formula.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Default SICM Main Campus Coordinates (Seshadripuram, Bengaluru)
export const SICM_CAMPUS_COORDINATES: Coordinates = {
  latitude: 12.9892,
  longitude: 77.5753,
};

// Default Geofence Perimeter: 150 meters (covers classrooms, lecture halls, and labs)
export const DEFAULT_GEOFENCE_RADIUS_METERS = 150;

/**
 * Calculates Great-Circle distance between two GPS points in meters (Haversine Formula)
 */
export function calculateDistanceMeters(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth radius in meters
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLatRad = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLonRad = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export interface GeofenceValidationResult {
  isWithinGeofence: boolean;
  distanceMeters: number;
  allowedRadiusMeters: number;
  campusCoordinates: Coordinates;
  studentCoordinates?: Coordinates;
  message: string;
}

/**
 * Validates whether a student GPS coordinate is within the designated campus/classroom geofence
 */
export function validateGeofence(
  studentCoords: Coordinates | null | undefined,
  targetCoords: Coordinates = SICM_CAMPUS_COORDINATES,
  allowedRadiusMeters: number = DEFAULT_GEOFENCE_RADIUS_METERS
): GeofenceValidationResult {
  if (!studentCoords || typeof studentCoords.latitude !== 'number' || typeof studentCoords.longitude !== 'number') {
    return {
      isWithinGeofence: false,
      distanceMeters: -1,
      allowedRadiusMeters,
      campusCoordinates: targetCoords,
      message: 'Location services required. Please enable GPS permissions to verify your classroom presence.',
    };
  }

  const distance = calculateDistanceMeters(studentCoords, targetCoords);
  const isWithin = distance <= allowedRadiusMeters;

  if (isWithin) {
    return {
      isWithinGeofence: true,
      distanceMeters: distance,
      allowedRadiusMeters,
      campusCoordinates: targetCoords,
      studentCoordinates: studentCoords,
      message: `Location verified! You are ${distance}m from the classroom (inside the ${allowedRadiusMeters}m geofence).`,
    };
  } else {
    return {
      isWithinGeofence: false,
      distanceMeters: distance,
      allowedRadiusMeters,
      campusCoordinates: targetCoords,
      studentCoordinates: studentCoords,
      message: `Geofence Violation: You are ${distance}m away from the campus classroom. Attendance can only be marked within ${allowedRadiusMeters}m of the lecture hall.`,
    };
  }
}
