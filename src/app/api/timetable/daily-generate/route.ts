import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDayName } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const dateObj = new Date(date);
    const dayOfWeek = getDayName(dateObj.getDay());

    // 1. Fetch all teachers and their availability + leaves + morning checkins for this date
    const teachers = await db.teacherProfile.findMany({
      include: {
        user: true,
        department: true,
        dailyCheckins: {
          where: { date },
        },
        availabilities: {
          where: { dayOfWeek },
        },
        leaves: {
          where: {
            status: 'APPROVED',
            startDate: { lte: date },
            endDate: { gte: date },
          },
        },
      },
      orderBy: { employeeCode: 'asc' },
    });

    // 2. Fetch sections and time slots
    const sections = await db.section.findMany({
      include: {
        semester: {
          include: {
            program: true,
            subjects: {
              include: { department: true },
            },
          },
        },
        students: true,
      },
    });

    const timeSlots = await db.timeSlot.findMany({
      where: { isBreak: false },
      orderBy: { slotNumber: 'asc' },
    });

    const rooms = await db.room.findMany({
      where: { isAvailable: true },
      orderBy: { roomNumber: 'asc' },
    });

    // 3. Fetch current timetable entries for this day
    const currentTimetables = await db.timetable.findMany({
      where: { dayOfWeek, status: 'ACTIVE' },
      include: {
        subject: true,
        teacher: { include: { user: true, department: true } },
        substituteTeacher: { include: { user: true } },
        room: true,
        section: true,
        timeSlot: true,
      },
      orderBy: { timeSlot: { slotNumber: 'asc' } },
    });

    // Determine teacher daily statuses prioritizing Morning Check-in
    const teacherStatuses = teachers.map((t) => {
      const checkin = t.dailyCheckins.length > 0 ? t.dailyCheckins[0] : null;
      const isLeave = t.leaves.length > 0;
      const leaveInfo = isLeave ? t.leaves[0] : null;
      const unavailCount = t.availabilities.filter((a) => a.status === 'UNAVAILABLE').length;

      let status = 'AVAILABLE';
      let declarationSource = 'DEFAULT'; // 'MORNING_CHECKIN', 'APPROVED_LEAVE', 'WEEKLY_MATRIX'

      if (checkin) {
        declarationSource = 'MORNING_CHECKIN';
        if (checkin.status === 'ABSENT') status = 'ABSENT_TODAY';
        else if (checkin.status === 'PARTIAL') status = 'PARTIAL';
        else status = 'PRESENT_TODAY';
      } else if (isLeave) {
        declarationSource = 'APPROVED_LEAVE';
        status = 'ON_LEAVE';
      } else if (unavailCount >= 3) {
        declarationSource = 'WEEKLY_MATRIX';
        status = 'UNAVAILABLE';
      } else if (unavailCount > 0) {
        declarationSource = 'WEEKLY_MATRIX';
        status = 'PARTIAL';
      }

      return {
        id: t.id,
        name: t.user.name,
        employeeCode: t.employeeCode,
        department: t.department.name,
        departmentId: t.departmentId,
        status,
        declarationSource,
        checkinTime: checkin?.declaredAt || null,
        reason: checkin?.reason || leaveInfo?.reason || null,
        leaveType: leaveInfo?.leaveType || null,
        availabilities: t.availabilities,
      };
    });

    const presentTeachersCount = teacherStatuses.filter(
      (t) => t.status === 'PRESENT_TODAY' || t.status === 'AVAILABLE'
    ).length;
    const absentTeachersCount = teacherStatuses.filter(
      (t) => t.status === 'ABSENT_TODAY' || t.status === 'ON_LEAVE'
    ).length;
    const partialTeachersCount = teacherStatuses.filter((t) => t.status === 'PARTIAL').length;

    return NextResponse.json({
      date,
      dayOfWeek,
      teacherStatuses,
      timeSlots,
      sections,
      rooms,
      currentTimetables,
      presentTeachersCount,
      absentTeachersCount,
      partialTeachersCount,
    });
  } catch (error: any) {
    console.error('Error fetching daily timetable status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, sectionIds, autoAssignSubstitutes = true } = body;

    const targetDate = date || new Date().toISOString().split('T')[0];
    const dateObj = new Date(targetDate);
    const dayOfWeek = getDayName(dateObj.getDay());

    // 1. Fetch all teachers, availabilities, leaves, and morning check-ins for targetDate
    const allTeachers = await db.teacherProfile.findMany({
      include: {
        user: true,
        department: true,
        dailyCheckins: {
          where: { date: targetDate },
        },
        availabilities: {
          where: { dayOfWeek },
        },
        leaves: {
          where: {
            status: 'APPROVED',
            startDate: { lte: targetDate },
            endDate: { gte: targetDate },
          },
        },
      },
    });

    // 2. Fetch sections to generate for
    const whereSections: any = {};
    if (sectionIds && Array.isArray(sectionIds) && sectionIds.length > 0) {
      whereSections.id = { in: sectionIds };
    }

    const sections = await db.section.findMany({
      where: whereSections,
      include: {
        semester: {
          include: {
            subjects: {
              include: { department: true },
            },
          },
        },
      },
    });

    const timeSlots = await db.timeSlot.findMany({
      where: { isBreak: false },
      orderBy: { slotNumber: 'asc' },
    });

    const rooms = await db.room.findMany({
      where: { isAvailable: true },
      orderBy: { roomNumber: 'asc' },
    });

    // Occupancy trackers
    const occupiedTeachers = new Map<string, Set<string>>(); // slotId -> Set<teacherId>
    const occupiedRooms = new Map<string, Set<string>>(); // slotId -> Set<roomId>

    for (const slot of timeSlots) {
      occupiedTeachers.set(slot.id, new Set());
      occupiedRooms.set(slot.id, new Set());
    }

    // Helper: is teacher available on this day & slot?
    const isTeacherFreeAndAvailable = (teacher: (typeof allTeachers)[0], slotId: string) => {
      // Priority 1: Morning Checkin declaration for today
      if (teacher.dailyCheckins.length > 0) {
        const checkin = teacher.dailyCheckins[0];
        if (checkin.status === 'ABSENT') return false;
      }

      // Priority 2: Approved leave
      if (teacher.leaves.length > 0) return false;

      // Priority 3: Weekly availability matrix
      const pref = teacher.availabilities.find((a) => a.timeSlotId === slotId);
      if (pref && pref.status === 'UNAVAILABLE') return false;

      // Priority 4: Already assigned to another class in this slot
      if (occupiedTeachers.get(slotId)?.has(teacher.id)) return false;

      return true;
    };

    // Helper: find substitute teacher in same department
    const findAvailableSubstitute = (departmentId: string, slotId: string, excludeTeacherId: string) => {
      const candidates = allTeachers.filter(
        (t) =>
          t.id !== excludeTeacherId &&
          t.departmentId === departmentId &&
          isTeacherFreeAndAvailable(t, slotId)
      );

      if (candidates.length > 0) return candidates[0];

      // Fallback: search any department free faculty
      const globalCandidates = allTeachers.filter(
        (t) => t.id !== excludeTeacherId && isTeacherFreeAndAvailable(t, slotId)
      );
      return globalCandidates.length > 0 ? globalCandidates[0] : null;
    };

    const generatedDailySlots = [];
    const substitutionsMade: any[] = [];
    const logs: string[] = [];

    logs.push(`Generating Daily Timetable for ${dayOfWeek} (${targetDate})...`);

    // Iterate through each section and time slot
    for (const section of sections) {
      const subjects = section.semester.subjects;
      if (subjects.length === 0) continue;

      let subjectIndex = 0;

      for (const slot of timeSlots) {
        const slotId = slot.id;

        // Select candidate subject for this slot
        const subj = subjects[subjectIndex % subjects.length];
        subjectIndex++;

        // Find available primary teacher for subject in this slot
        let primaryTeacher =
          allTeachers.find((t) => t.departmentId === subj.departmentId && isTeacherFreeAndAvailable(t, slotId)) ||
          allTeachers.find((t) => t.departmentId === subj.departmentId) ||
          allTeachers[0];

        let effectiveTeacher = primaryTeacher;
        let isSubstituted = false;

        // Check if primary teacher is free & available today based on morning checkin / leave
        if (!isTeacherFreeAndAvailable(primaryTeacher, slotId)) {
          if (autoAssignSubstitutes) {
            const sub = findAvailableSubstitute(subj.departmentId, slotId, primaryTeacher.id);
            if (sub) {
              effectiveTeacher = sub;
              isSubstituted = true;

              const morningCheckin = primaryTeacher.dailyCheckins[0];
              const reasonText = morningCheckin?.status === 'ABSENT'
                ? `Morning Check-In: Declared Absent ("${morningCheckin.reason || 'Personal / Sick'}")`
                : primaryTeacher.leaves.length > 0
                ? 'Approved Faculty Leave'
                : 'Faculty Slot Unavailable';

              substitutionsMade.push({
                sectionName: section.name,
                subjectName: subj.name,
                slotName: slot.name,
                primaryTeacher: primaryTeacher.user.name,
                substituteTeacher: sub.user.name,
                reason: reasonText,
              });
              logs.push(
                `[${slot.name}] Substituted ${sub.user.name} for ${primaryTeacher.user.name} in ${subj.name} (${section.name}) - ${reasonText}`
              );
            }
          }
        }

        // Find available room
        const busyRooms = occupiedRooms.get(slotId) || new Set();
        let suitableRooms = rooms.filter((r) => !busyRooms.has(r.id));
        if (subj.type === 'LAB') {
          const labRooms = suitableRooms.filter((r) => r.type === 'LAB');
          if (labRooms.length > 0) suitableRooms = labRooms;
        }

        const chosenRoom = suitableRooms[0] || rooms[0];

        // Mark teacher and room as occupied for this slot
        occupiedTeachers.get(slotId)?.add(effectiveTeacher.id);
        occupiedRooms.get(slotId)?.add(chosenRoom.id);

        // Upsert into Timetable database table
        const ttRecord = await db.timetable.upsert({
          where: {
            dayOfWeek_timeSlotId_sectionId: {
              dayOfWeek,
              timeSlotId: slotId,
              sectionId: section.id,
            },
          },
          update: {
            subjectId: subj.id,
            teacherId: primaryTeacher.id,
            substituteTeacherId: isSubstituted ? effectiveTeacher.id : null,
            roomId: chosenRoom.id,
            status: 'ACTIVE',
          },
          create: {
            dayOfWeek,
            timeSlotId: slotId,
            sectionId: section.id,
            subjectId: subj.id,
            teacherId: primaryTeacher.id,
            substituteTeacherId: isSubstituted ? effectiveTeacher.id : null,
            roomId: chosenRoom.id,
            status: 'ACTIVE',
          },
        });

        // Upsert today's AttendanceSession record
        await db.attendanceSession.upsert({
          where: {
            timetableId_date: {
              timetableId: ttRecord.id,
              date: targetDate,
            },
          },
          update: {
            teacherId: effectiveTeacher.id,
            sectionId: section.id,
            subjectId: subj.id,
            timeSlotId: slotId,
            status: 'SCHEDULED',
            substituteMarked: isSubstituted,
          },
          create: {
            timetableId: ttRecord.id,
            date: targetDate,
            teacherId: effectiveTeacher.id,
            sectionId: section.id,
            subjectId: subj.id,
            timeSlotId: slotId,
            status: 'SCHEDULED',
            substituteMarked: isSubstituted,
          },
        });

        generatedDailySlots.push({
          slotId,
          slotName: slot.name,
          startTime: slot.startTime,
          endTime: slot.endTime,
          sectionName: section.name,
          subjectCode: subj.code,
          subjectName: subj.name,
          subjectColor: subj.color,
          teacherName: primaryTeacher.user.name,
          substituteTeacherName: isSubstituted ? effectiveTeacher.user.name : null,
          roomNumber: chosenRoom.roomNumber,
        });
      }
    }

    // Broadcast automated notification to Students and Faculty about today's published timetable
    const allUsers = await db.user.findMany({
      where: { role: { in: ['STUDENT', 'TEACHER'] } },
    });

    for (const u of allUsers) {
      await db.notification.create({
        data: {
          userId: u.id,
          title: `📅 Today's Timetable Prepared (${targetDate})`,
          message: `Admin has generated today's timetable based on morning faculty attendance declarations. ${substitutionsMade.length} substitute adjustments prepared.`,
          type: 'TIMETABLE',
          link: u.role === 'STUDENT' ? '/student/timetable' : '/teacher/timetable',
        },
      });
    }

    // Audit Log
    await db.auditLog.create({
      data: {
        action: 'GENERATE_DAILY_TIMETABLE_FROM_MORNING_DECLARATION',
        entity: 'Timetable',
        details: `Generated daily timetable for ${targetDate} (${dayOfWeek}) from Morning Teacher Declarations. Created ${generatedDailySlots.length} slots and ${substitutionsMade.length} substitute assignments.`,
      },
    });

    return NextResponse.json({
      success: true,
      targetDate,
      dayOfWeek,
      totalSlotsGenerated: generatedDailySlots.length,
      substitutionsMade,
      slots: generatedDailySlots,
      logs,
    });
  } catch (error: any) {
    console.error('Error generating daily timetable:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
