import { db } from './db';

export type DayOfWeekString = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface GenerationInput {
  sectionId: string;
  academicYear?: string;
  workingDays?: (DayOfWeekString | string)[];
  maxConsecutivePerTeacher?: number;
  subjectTeacherOverrides?: Record<string, string>; // subjectId -> teacherId
  subjectRoomOverrides?: Record<string, string>; // subjectId -> roomId
}

export interface GeneratedSlot {
  dayOfWeek: string;
  timeSlotId: string;
  timeSlotName: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectColor: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
}

export interface GenerationResult {
  success: boolean;
  totalSlotsRequired: number;
  totalSlotsAssigned: number;
  unassignedSubjects: { subjectName: string; missingHours: number }[];
  slots: GeneratedSlot[];
  logs: string[];
}

export async function generateAutomatedTimetable(
  input: GenerationInput
): Promise<GenerationResult> {
  const logs: string[] = [];
  logs.push(`Starting automated timetable generation for section ${input.sectionId}...`);

  const workingDays = input.workingDays || [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];

  // 1. Fetch section and semester
  const section = await db.section.findUnique({
    where: { id: input.sectionId },
    include: {
      semester: {
        include: {
          subjects: {
            include: {
              department: {
                include: {
                  teachers: {
                    include: { user: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!section) {
    throw new Error('Section not found');
  }

  // 2. Fetch Time Slots (exclude break slots)
  const timeSlots = await db.timeSlot.findMany({
    where: { isBreak: false },
    orderBy: { slotNumber: 'asc' },
  });

  // 3. Fetch Rooms
  const allRooms = await db.room.findMany({
    where: { isAvailable: true },
  });

  // 4. Fetch All Teachers and their availabilities
  const allTeachers = await db.teacherProfile.findMany({
    include: {
      user: true,
      availabilities: true,
    },
  });

  // 5. Fetch existing active timetable entries for OTHER sections to avoid global collisions
  const existingOtherTimetables = await db.timetable.findMany({
    where: {
      status: 'ACTIVE',
      sectionId: { not: input.sectionId },
    },
  });

  // Create occupancy trackers
  // key format: `${dayOfWeek}_${timeSlotId}` -> Set of occupied teacherIds / roomIds
  const occupiedTeachers = new Map<string, Set<string>>();
  const occupiedRooms = new Map<string, Set<string>>();

  for (const t of existingOtherTimetables) {
    const key = `${t.dayOfWeek}_${t.timeSlotId}`;
    if (!occupiedTeachers.has(key)) occupiedTeachers.set(key, new Set());
    if (!occupiedRooms.has(key)) occupiedRooms.set(key, new Set());

    occupiedTeachers.get(key)!.add(t.teacherId);
    if (t.substituteTeacherId) occupiedTeachers.get(key)!.add(t.substituteTeacherId);
    occupiedRooms.get(key)!.add(t.roomId);
  }

  // Helper to check if teacher is available in slot preference
  const isTeacherAvailable = (
    teacher: (typeof allTeachers)[0],
    day: string,
    slotId: string
  ): boolean => {
    const pref = teacher.availabilities.find(
      (a) => a.dayOfWeek === day && a.timeSlotId === slotId
    );
    if (pref && pref.status === 'UNAVAILABLE') return false;
    return true;
  };

  // 6. Build the list of required lecture hours to allocate
  const subjectsToSchedule = section.semester.subjects;
  interface AllocationRequirement {
    subject: (typeof subjectsToSchedule)[0];
    hoursRemaining: number;
    assignedTeacher: (typeof allTeachers)[0];
    suitableRooms: (typeof allRooms)[0][];
  }

  const requirements: AllocationRequirement[] = [];
  let totalRequired = 0;

  for (const subj of subjectsToSchedule) {
    const hours = subj.hoursPerWeek || 4;
    totalRequired += hours;

    // Find teacher
    let teacher: (typeof allTeachers)[0] | undefined;
    if (input.subjectTeacherOverrides?.[subj.id]) {
      teacher = allTeachers.find((t) => t.id === input.subjectTeacherOverrides![subj.id]);
    }
    if (!teacher) {
      teacher = allTeachers.find((t) => t.departmentId === subj.departmentId) || allTeachers[0];
    }

    // Find suitable rooms
    let rooms: (typeof allRooms)[0][] = [];
    if (input.subjectRoomOverrides?.[subj.id]) {
      const specifiedRoom = allRooms.find((r) => r.id === input.subjectRoomOverrides![subj.id]);
      if (specifiedRoom) rooms = [specifiedRoom];
    }
    if (rooms.length === 0) {
      if (subj.type === 'LAB') {
        rooms = allRooms.filter((r) => r.type === 'LAB');
        if (rooms.length === 0) rooms = allRooms;
      } else {
        rooms = allRooms.filter((r) => r.type === 'CLASSROOM' || r.type === 'SEMINAR_HALL');
        if (rooms.length === 0) rooms = allRooms;
      }
    }

    requirements.push({
      subject: subj,
      hoursRemaining: hours,
      assignedTeacher: teacher!,
      suitableRooms: rooms,
    });
  }

  logs.push(`Total subjects: ${requirements.length}, Total required lecture hours: ${totalRequired}`);

  // 7. Grid for the target section: day -> slot -> assignment
  const generatedSchedule: GeneratedSlot[] = [];
  const dailySubjectCount: Record<string, Record<string, number>> = {};
  for (const d of workingDays) {
    dailySubjectCount[d] = {};
  }

  // Iterate slots day by day, prioritizing balanced distribution
  for (const day of workingDays) {
    for (const slot of timeSlots) {
      const key = `${day}_${slot.id}`;
      const busyTeachers = occupiedTeachers.get(key) || new Set();
      const busyRooms = occupiedRooms.get(key) || new Set();

      const candidates = requirements
        .filter((r) => r.hoursRemaining > 0)
        .filter((r) => {
          if (busyTeachers.has(r.assignedTeacher.id)) return false;
          if (!isTeacherAvailable(r.assignedTeacher, day, slot.id)) return false;
          const currentDayCount = dailySubjectCount[day][r.subject.id] || 0;
          const maxPerDay = r.subject.type === 'LAB' ? 2 : 1;
          if (currentDayCount >= maxPerDay) return false;

          const hasRoom = r.suitableRooms.some((rm) => !busyRooms.has(rm.id));
          return hasRoom;
        })
        .sort((a, b) => {
          const aDayCount = dailySubjectCount[day][a.subject.id] || 0;
          const bDayCount = dailySubjectCount[day][b.subject.id] || 0;
          if (aDayCount !== bDayCount) return aDayCount - bDayCount;
          return b.hoursRemaining - a.hoursRemaining;
        });

      if (candidates.length > 0) {
        const chosen = candidates[0];
        const chosenRoom = chosen.suitableRooms.find((rm) => !busyRooms.has(rm.id))!;

        chosen.hoursRemaining -= 1;
        dailySubjectCount[day][chosen.subject.id] = (dailySubjectCount[day][chosen.subject.id] || 0) + 1;

        if (!occupiedTeachers.has(key)) occupiedTeachers.set(key, new Set());
        if (!occupiedRooms.has(key)) occupiedRooms.set(key, new Set());
        occupiedTeachers.get(key)!.add(chosen.assignedTeacher.id);
        occupiedRooms.get(key)!.add(chosenRoom.id);

        generatedSchedule.push({
          dayOfWeek: day,
          timeSlotId: slot.id,
          timeSlotName: slot.name,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subjectId: chosen.subject.id,
          subjectCode: chosen.subject.code,
          subjectName: chosen.subject.name,
          subjectColor: chosen.subject.color,
          teacherId: chosen.assignedTeacher.id,
          teacherName: chosen.assignedTeacher.user.name,
          roomId: chosenRoom.id,
          roomNumber: chosenRoom.roomNumber,
          roomName: chosenRoom.name,
        });

        logs.push(
          `[${day} ${slot.startTime}] Assigned ${chosen.subject.code} (${chosen.subject.name}) with ${chosen.assignedTeacher.user.name} in ${chosenRoom.roomNumber}`
        );
      }
    }
  }

  const unassigned = requirements
    .filter((r) => r.hoursRemaining > 0)
    .map((r) => ({
      subjectName: `${r.subject.code} - ${r.subject.name}`,
      missingHours: r.hoursRemaining,
    }));

  logs.push(
    `Generation completed: ${generatedSchedule.length} of ${totalRequired} slots assigned. ${
      unassigned.length > 0 ? `Unassigned: ${unassigned.length}` : 'All slots fully scheduled!'
    }`
  );

  return {
    success: unassigned.length === 0,
    totalSlotsRequired: totalRequired,
    totalSlotsAssigned: generatedSchedule.length,
    unassignedSubjects: unassigned,
    slots: generatedSchedule,
    logs,
  };
}
