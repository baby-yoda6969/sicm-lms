import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Find available substitute teachers for a given day, timeSlot, and department
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dayOfWeek = searchParams.get('dayOfWeek');
    const timeSlotId = searchParams.get('timeSlotId');
    const departmentId = searchParams.get('departmentId');
    const excludeTeacherId = searchParams.get('excludeTeacherId');

    if (!dayOfWeek || !timeSlotId) {
      return NextResponse.json({ error: 'dayOfWeek and timeSlotId required' }, { status: 400 });
    }

    // Find teachers who are already booked at this day and slot
    const busyTimetables = await db.timetable.findMany({
      where: {
        dayOfWeek,
        timeSlotId,
        status: 'ACTIVE',
      },
      select: {
        teacherId: true,
        substituteTeacherId: true,
      },
    });

    const busyTeacherIds = new Set<string>();
    for (const b of busyTimetables) {
      busyTeacherIds.add(b.teacherId);
      if (b.substituteTeacherId) busyTeacherIds.add(b.substituteTeacherId);
    }
    if (excludeTeacherId) busyTeacherIds.add(excludeTeacherId);

    // Fetch all teachers in department (or college)
    const teachers = await db.teacherProfile.findMany({
      where: {
        id: { notIn: Array.from(busyTeacherIds) },
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        user: true,
        department: true,
        availabilities: {
          where: {
            dayOfWeek,
            timeSlotId,
          },
        },
      },
    });

    // Filter out teachers who have marked themselves UNAVAILABLE
    const availableCandidates = teachers.filter((t) => {
      const pref = t.availabilities[0];
      return !pref || pref.status !== 'UNAVAILABLE';
    });

    return NextResponse.json({
      candidates: availableCandidates.map((t) => ({
        id: t.id,
        name: t.user.name,
        email: t.user.email,
        employeeCode: t.employeeCode,
        designation: t.designation,
        department: t.department.name,
        isSameDepartment: departmentId ? t.departmentId === departmentId : true,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Assign a substitute teacher to a timetable slot
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { timetableId, substituteTeacherId, notes } = body;

    if (!timetableId) {
      return NextResponse.json({ error: 'Timetable ID required' }, { status: 400 });
    }

    const timetable = await db.timetable.findUnique({
      where: { id: timetableId },
      include: {
        subject: true,
        section: true,
        timeSlot: true,
        room: true,
        teacher: { include: { user: true } },
      },
    });

    if (!timetable) {
      return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 });
    }

    const updated = await db.timetable.update({
      where: { id: timetableId },
      data: {
        substituteTeacherId: substituteTeacherId || null,
        notes: notes !== undefined ? notes : timetable.notes,
      },
      include: {
        substituteTeacher: { include: { user: true } },
      },
    });

    // If substitute assigned, send notifications
    if (substituteTeacherId && updated.substituteTeacher) {
      // 1. Notify substitute teacher
      await db.notification.create({
        data: {
          userId: updated.substituteTeacher.userId,
          title: '👥 Substitute Lecture Assignment',
          message: `You have been assigned to conduct ${timetable.subject.name} for ${timetable.section.name} on ${timetable.dayOfWeek} (${timetable.timeSlot.name}) in ${timetable.room.roomNumber}.`,
          type: 'TIMETABLE',
          link: '/teacher/timetable',
        },
      });

      // 2. Notify students in that section
      const students = await db.studentProfile.findMany({
        where: { sectionId: timetable.sectionId },
      });

      for (const s of students) {
        await db.notification.create({
          data: {
            userId: s.userId,
            title: '📅 Faculty Update for Today\'s Lecture',
            message: `${updated.substituteTeacher.user.name} will be conducting your ${timetable.subject.name} lecture today during ${timetable.timeSlot.name} in ${timetable.room.roomNumber}.`,
            type: 'TIMETABLE',
            link: '/student/timetable',
          },
        });
      }

      // 3. Log Audit
      await db.auditLog.create({
        data: {
          action: 'ASSIGN_SUBSTITUTE',
          entity: 'Timetable',
          entityId: timetableId,
          details: `Assigned substitute ${updated.substituteTeacher.user.name} for ${timetable.teacher.user.name} in ${timetable.subject.name}.`,
        },
      });
    }

    return NextResponse.json({ success: true, timetable: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
