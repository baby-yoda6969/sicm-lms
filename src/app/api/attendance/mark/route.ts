import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, records, teacherId } = body;

    if (!sessionId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid session ID or attendance records' }, { status: 400 });
    }

    const session = await db.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        subject: true,
        section: true,
        teacher: { include: { user: true } },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Upsert all student records in a transaction
    await db.$transaction(async (tx) => {
      for (const r of records) {
        await tx.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: r.studentId,
            },
          },
          update: {
            status: r.status || 'PRESENT',
            markedVia: r.markedVia || 'MANUAL',
            remarks: r.remarks || null,
            markedAt: new Date(),
          },
          create: {
            sessionId,
            studentId: r.studentId,
            status: r.status || 'PRESENT',
            markedVia: r.markedVia || 'MANUAL',
            remarks: r.remarks || null,
            markedAt: new Date(),
          },
        });
      }

      // Mark session completed
      await tx.attendanceSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          markedAt: new Date(),
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'MARK_ATTENDANCE',
          entity: 'AttendanceSession',
          entityId: sessionId,
          details: `Marked attendance for ${records.length} students in ${session.section.name} (${session.subject.name}).`,
        },
      });
    });

    // Check if any student in this section dropped below 75% attendance to trigger notification
    const totalSubjectSessions = await db.attendanceSession.count({
      where: {
        subjectId: session.subjectId,
        sectionId: session.sectionId,
        status: 'COMPLETED',
      },
    });

    if (totalSubjectSessions >= 5) {
      // Find low attendance students
      for (const r of records) {
        const studentPresentCount = await db.attendanceRecord.count({
          where: {
            studentId: r.studentId,
            session: {
              subjectId: session.subjectId,
              sectionId: session.sectionId,
              status: 'COMPLETED',
            },
            status: 'PRESENT',
          },
        });

        const percent = Math.round((studentPresentCount / totalSubjectSessions) * 100);
        if (percent < 75) {
          const studentProfile = await db.studentProfile.findUnique({
            where: { id: r.studentId },
            include: { user: true },
          });

          if (studentProfile) {
            // Create notification if not recently notified
            await db.notification.create({
              data: {
                userId: studentProfile.userId,
                title: '⚠️ Attendance Shortage Warning',
                message: `Your current attendance in ${session.subject.name} is ${percent}% (${studentPresentCount}/${totalSubjectSessions} classes). The minimum required threshold is 75%.`,
                type: 'ALERT',
                link: '/student/attendance',
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully marked attendance for ${records.length} students.`,
    });
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
