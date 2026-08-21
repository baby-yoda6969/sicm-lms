import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDayName } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!teacherId) {
      return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
    }

    const teacher = await db.teacherProfile.findUnique({
      where: { id: teacherId },
      include: { user: true, department: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Determine day of week from date
    const dateObj = new Date(date);
    const currentDay = getDayName(dateObj.getDay());

    // Fetch all timetable slots actively taught by the teacher (regular non-substituted or substitute duties)
    const scheduledSlots = await db.timetable.findMany({
      where: {
        OR: [
          { teacherId: teacher.id, substituteTeacherId: null },
          { substituteTeacherId: teacher.id },
        ],
        dayOfWeek: currentDay,
        status: 'ACTIVE',
      },
      include: {
        timeSlot: true,
        subject: true,
        section: {
          include: {
            students: true,
          },
        },
        room: true,
      },
      orderBy: { timeSlot: { slotNumber: 'asc' } },
    });

    // Check which sessions exist for today's slots
    const todayClasses = [];
    let completedCount = 0;
    let pendingCount = 0;

    for (const slot of scheduledSlots) {
      const session = await db.attendanceSession.findUnique({
        where: {
          timetableId_date: {
            timetableId: slot.id,
            date,
          },
        },
        include: {
          records: true,
        },
      });

      const isCompleted = session?.status === 'COMPLETED' && (session.records.length > 0);
      if (isCompleted) completedCount++;
      else pendingCount++;

      const presentCount = session?.records.filter((r) => r.status === 'PRESENT').length || 0;
      const totalStudents = slot.section.students.length;
      const attendancePercent = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

      todayClasses.push({
        timetableId: slot.id,
        sessionId: session?.id || null,
        timeSlot: slot.timeSlot,
        subject: slot.subject,
        section: slot.section,
        room: slot.room,
        isSubstitute: slot.substituteTeacherId === teacher.id,
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        presentCount,
        totalStudents,
        attendancePercent,
        qrToken: session?.qrToken,
      });
    }

    // Teacher historical attendance statistics
    const allTeacherSessions = await db.attendanceSession.findMany({
      where: {
        teacherId: teacher.id,
        status: 'COMPLETED',
      },
      include: {
        records: true,
        subject: true,
      },
    });

    let totalTaught = allTeacherSessions.length;
    let totalPresentOverall = 0;
    let totalRosterOverall = 0;

    for (const sess of allTeacherSessions) {
      totalPresentOverall += sess.records.filter((r) => r.status === 'PRESENT').length;
      totalRosterOverall += sess.records.length;
    }

    const overallTeacherAvgAttendance =
      totalRosterOverall > 0 ? Math.round((totalPresentOverall / totalRosterOverall) * 1000) / 10 : 92.5;

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        name: teacher.user.name,
        email: teacher.user.email,
        employeeCode: teacher.employeeCode,
        designation: teacher.designation,
        department: teacher.department.name,
      },
      todaySummary: {
        date,
        dayOfWeek: currentDay,
        totalClassesToday: scheduledSlots.length,
        completedCount,
        pendingCount,
        classes: todayClasses,
      },
      stats: {
        totalSessionsTaught: totalTaught,
        averageAttendancePercentage: overallTeacherAvgAttendance,
      },
    });
  } catch (error: any) {
    console.error('Error fetching teacher dashboard data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
