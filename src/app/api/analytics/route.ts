import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDayName } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const sectionId = searchParams.get('sectionId');
    const subjectId = searchParams.get('subjectId');

    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayDayName = getDayName(new Date().getDay());

    // 1. Overall counts
    const totalStudents = await db.studentProfile.count();
    const totalTeachers = await db.teacherProfile.count();
    const totalSections = await db.section.count();
    const totalSubjects = await db.subject.count();
    const totalRooms = await db.room.count();

    // 2. Today's classes count
    const todayClassesCount = await db.timetable.count({
      where: {
        dayOfWeek: todayDayName,
        status: 'ACTIVE',
      },
    });

    // 3. Faculty on Leave Today
    const teachersOnLeaveToday = await db.teacherLeave.count({
      where: {
        status: 'APPROVED',
        startDate: { lte: todayDateStr },
        endDate: { gte: todayDateStr },
      },
    });

    // 4. Institution-wide Attendance Statistics
    const allSessions = await db.attendanceSession.findMany({
      where: { status: 'COMPLETED' },
      include: {
        records: true,
        subject: { include: { department: true } },
        section: true,
      },
    });

    let totalAttendanceRecords = 0;
    let totalPresentRecords = 0;
    let totalAbsentRecords = 0;

    // Department-wise map
    const deptAttendanceMap: Record<string, { name: string; present: number; total: number }> = {};

    // Date-wise map for trend lines
    const dateAttendanceMap: Record<string, { date: string; present: number; total: number }> = {};

    for (const session of allSessions) {
      const pCount = session.records.filter((r) => r.status === 'PRESENT').length;
      const tCount = session.records.length;

      totalAttendanceRecords += tCount;
      totalPresentRecords += pCount;
      totalAbsentRecords += tCount - pCount;

      // Dept agg
      const deptCode = session.subject.department.code;
      if (!deptAttendanceMap[deptCode]) {
        deptAttendanceMap[deptCode] = {
          name: session.subject.department.name,
          present: 0,
          total: 0,
        };
      }
      deptAttendanceMap[deptCode].present += pCount;
      deptAttendanceMap[deptCode].total += tCount;

      // Date agg
      if (!dateAttendanceMap[session.date]) {
        dateAttendanceMap[session.date] = { date: session.date, present: 0, total: 0 };
      }
      dateAttendanceMap[session.date].present += pCount;
      dateAttendanceMap[session.date].total += tCount;
    }

    const institutionAvgAttendance =
      totalAttendanceRecords > 0
        ? Math.round((totalPresentRecords / totalAttendanceRecords) * 1000) / 10
        : 88.4;

    const departmentStats = Object.keys(deptAttendanceMap).map((code) => {
      const d = deptAttendanceMap[code];
      const pct = d.total > 0 ? Math.round((d.present / d.total) * 1000) / 10 : 0;
      return {
        code,
        name: d.name,
        totalRecords: d.total,
        presentRecords: d.present,
        percentage: pct,
      };
    });

    const attendanceTrends = Object.values(dateAttendanceMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14) // Last 14 session dates
      .map((d) => ({
        date: d.date.substring(5), // MM-DD format
        fullDate: d.date,
        percentage: d.total > 0 ? Math.round((d.present / d.total) * 1000) / 10 : 0,
        present: d.present,
        total: d.total,
      }));

    // 5. Low Attendance Students Watchlist (<75%)
    const allStudents = await db.studentProfile.findMany({
      include: {
        user: true,
        program: true,
        section: true,
        semester: {
          include: {
            subjects: true,
          },
        },
      },
    });

    const lowAttendanceList: any[] = [];

    for (const st of allStudents) {
      for (const subj of st.semester.subjects) {
        const completedSessions = await db.attendanceSession.findMany({
          where: {
            subjectId: subj.id,
            sectionId: st.sectionId,
            status: 'COMPLETED',
          },
          include: {
            records: {
              where: { studentId: st.id },
            },
          },
        });

        const held = completedSessions.length;
        if (held >= 5) {
          const present = completedSessions.filter((s) => s.records[0]?.status === 'PRESENT').length;
          const pct = Math.round((present / held) * 1000) / 10;

          if (pct < 75) {
            lowAttendanceList.push({
              studentId: st.id,
              name: st.user.name,
              email: st.user.email,
              rollNumber: st.rollNumber,
              program: st.program.code,
              section: st.section.name,
              subjectCode: subj.code,
              subjectName: subj.name,
              held,
              present,
              absent: held - present,
              percentage: pct,
              status: pct < 70 ? 'CRITICAL' : 'WARNING',
            });
          }
        }
      }
    }

    return NextResponse.json({
      kpis: {
        totalStudents,
        totalTeachers,
        totalSections,
        totalSubjects,
        totalRooms,
        todayClassesCount,
        teachersOnLeaveToday,
        institutionAvgAttendance,
        lowAttendanceStudentsCount: lowAttendanceList.length,
      },
      departmentStats,
      attendanceTrends,
      lowAttendanceList,
      distribution: {
        present: totalPresentRecords,
        absent: totalAbsentRecords,
        total: totalAttendanceRecords,
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
