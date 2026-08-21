import { db } from './db';

export type DayOfWeekString = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface ConflictCheckParams {
  timetableId?: string; // If editing an existing slot
  dayOfWeek: DayOfWeekString | string;
  timeSlotId: string;
  teacherId: string;
  sectionId: string;
  roomId: string;
  substituteTeacherId?: string | null;
  targetDate?: string; // Optional specific date (YYYY-MM-DD) for leave checking
}

export interface ConflictResult {
  hasConflict: boolean;
  errors: string[];
  warnings: string[];
  conflictDetails: {
    teacherConflict?: {
      slot: string;
      subject: string;
      section: string;
      room: string;
    };
    sectionConflict?: {
      slot: string;
      subject: string;
      teacher: string;
      room: string;
    };
    roomConflict?: {
      slot: string;
      subject: string;
      section: string;
      teacher: string;
    };
    availabilityConflict?: {
      teacherName: string;
      status: string;
      reason?: string;
    };
    leaveConflict?: {
      teacherName: string;
      leaveType: string;
      reason: string;
      dates: string;
    };
  };
}

export async function checkTimetableConflicts(
  params: ConflictCheckParams
): Promise<ConflictResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const conflictDetails: ConflictResult['conflictDetails'] = {};

  const effectiveTeacherId = params.substituteTeacherId || params.teacherId;

  // 1. Check Section Conflict (Same section cannot have two classes at the same time)
  const sectionConflict = await db.timetable.findFirst({
    where: {
      dayOfWeek: params.dayOfWeek,
      timeSlotId: params.timeSlotId,
      sectionId: params.sectionId,
      status: 'ACTIVE',
      ...(params.timetableId ? { id: { not: params.timetableId } } : {}),
    },
    include: {
      subject: true,
      teacher: { include: { user: true } },
      room: true,
      timeSlot: true,
    },
  });

  if (sectionConflict) {
    const msg = `Section Conflict: Section already has "${sectionConflict.subject.name}" with ${sectionConflict.teacher.user.name} in ${sectionConflict.room.roomNumber} during ${sectionConflict.timeSlot.name}.`;
    errors.push(msg);
    conflictDetails.sectionConflict = {
      slot: sectionConflict.timeSlot.name,
      subject: sectionConflict.subject.name,
      teacher: sectionConflict.teacher.user.name,
      room: sectionConflict.room.roomNumber,
    };
  }

  // 2. Check Teacher Conflict (Teacher cannot be in two places simultaneously)
  const teacherConflict = await db.timetable.findFirst({
    where: {
      dayOfWeek: params.dayOfWeek,
      timeSlotId: params.timeSlotId,
      OR: [
        { teacherId: effectiveTeacherId },
        { substituteTeacherId: effectiveTeacherId },
      ],
      status: 'ACTIVE',
      ...(params.timetableId ? { id: { not: params.timetableId } } : {}),
    },
    include: {
      subject: true,
      section: true,
      room: true,
      timeSlot: true,
      teacher: { include: { user: true } },
    },
  });

  if (teacherConflict) {
    const msg = `Teacher Conflict: Faculty ${teacherConflict.teacher.user.name} is already assigned to "${teacherConflict.subject.name}" for ${teacherConflict.section.name} in ${teacherConflict.room.roomNumber} at this time.`;
    errors.push(msg);
    conflictDetails.teacherConflict = {
      slot: teacherConflict.timeSlot.name,
      subject: teacherConflict.subject.name,
      section: teacherConflict.section.name,
      room: teacherConflict.room.roomNumber,
    };
  }

  // 3. Check Room Conflict (Room cannot hold two classes at the same time)
  const roomConflict = await db.timetable.findFirst({
    where: {
      dayOfWeek: params.dayOfWeek,
      timeSlotId: params.timeSlotId,
      roomId: params.roomId,
      status: 'ACTIVE',
      ...(params.timetableId ? { id: { not: params.timetableId } } : {}),
    },
    include: {
      subject: true,
      section: true,
      teacher: { include: { user: true } },
      timeSlot: true,
      room: true,
    },
  });

  if (roomConflict) {
    const msg = `Room Conflict: ${roomConflict.room.roomNumber} is already occupied by ${roomConflict.section.name} for "${roomConflict.subject.name}".`;
    errors.push(msg);
    conflictDetails.roomConflict = {
      slot: roomConflict.timeSlot.name,
      subject: roomConflict.subject.name,
      section: roomConflict.section.name,
      teacher: roomConflict.teacher.user.name,
    };
  }

  // 4. Check Teacher Availability Preference
  const teacherAvailability = await db.teacherAvailability.findUnique({
    where: {
      teacherId_dayOfWeek_timeSlotId: {
        teacherId: effectiveTeacherId,
        dayOfWeek: params.dayOfWeek,
        timeSlotId: params.timeSlotId,
      },
    },
    include: {
      teacher: { include: { user: true } },
      timeSlot: true,
    },
  });

  if (teacherAvailability && teacherAvailability.status === 'UNAVAILABLE') {
    const msg = `Teacher Availability Conflict: ${teacherAvailability.teacher.user.name} has marked themselves UNAVAILABLE on ${params.dayOfWeek} during ${teacherAvailability.timeSlot.name}.`;
    errors.push(msg);
    conflictDetails.availabilityConflict = {
      teacherName: teacherAvailability.teacher.user.name,
      status: 'UNAVAILABLE',
      reason: teacherAvailability.notes || 'Marked unavailable in schedule preferences',
    };
  } else if (teacherAvailability && teacherAvailability.status === 'PARTIAL') {
    const msg = `Notice: ${teacherAvailability.teacher.user.name} has marked PARTIAL availability on ${params.dayOfWeek}.`;
    warnings.push(msg);
  }

  // 5. Check Approved Teacher Leaves (if target date provided)
  if (params.targetDate) {
    const approvedLeave = await db.teacherLeave.findFirst({
      where: {
        teacherId: effectiveTeacherId,
        status: 'APPROVED',
        startDate: { lte: params.targetDate },
        endDate: { gte: params.targetDate },
      },
      include: {
        teacher: { include: { user: true } },
      },
    });

    if (approvedLeave) {
      const msg = `Approved Leave Conflict: ${approvedLeave.teacher.user.name} is on approved ${approvedLeave.leaveType} leave on ${params.targetDate} (${approvedLeave.reason}).`;
      errors.push(msg);
      conflictDetails.leaveConflict = {
        teacherName: approvedLeave.teacher.user.name,
        leaveType: approvedLeave.leaveType,
        reason: approvedLeave.reason,
        dates: `${approvedLeave.startDate} to ${approvedLeave.endDate}`,
      };
    }
  }

  return {
    hasConflict: errors.length > 0,
    errors,
    warnings,
    conflictDetails,
  };
}
