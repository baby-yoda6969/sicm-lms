import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDayName } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    const where: any = {};
    if (teacherId) where.teacherId = teacherId;

    const leaves = await db.teacherLeave.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Enrich leaves with affected classes count
    const enrichedLeaves = await Promise.all(
      leaves.map(async (leave) => {
        // Calculate days within leave range
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const affectedDays = new Set<string>();

        let curr = new Date(start);
        while (curr <= end) {
          affectedDays.add(getDayName(curr.getDay()));
          curr.setDate(curr.getDate() + 1);
        }

        const affectedSlots = await db.timetable.findMany({
          where: {
            teacherId: leave.teacherId,
            dayOfWeek: { in: Array.from(affectedDays) },
            status: 'ACTIVE',
          },
          include: {
            subject: true,
            section: true,
            room: true,
            timeSlot: true,
            substituteTeacher: { include: { user: true } },
          },
        });

        return {
          ...leave,
          affectedClassesCount: affectedSlots.length,
          affectedSlots,
        };
      })
    );

    return NextResponse.json({ leaves: enrichedLeaves });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teacherId, startDate, endDate, leaveType, reason } = body;

    if (!teacherId || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Please provide all required leave details.' }, { status: 400 });
    }

    const newLeave = await db.teacherLeave.create({
      data: {
        teacherId,
        startDate,
        endDate,
        leaveType: leaveType || 'CASUAL',
        reason,
        status: 'PENDING',
      },
      include: {
        teacher: { include: { user: true } },
      },
    });

    // Notify Admins
    const admins = await db.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          title: '📝 New Leave Application',
          message: `${newLeave.teacher.user.name} applied for ${newLeave.leaveType} leave from ${startDate} to ${endDate}. Reason: "${reason}"`,
          type: 'LEAVE',
          link: '/admin/leaves-substitutes',
        },
      });
    }

    return NextResponse.json({ success: true, leave: newLeave });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { leaveId, status, adminUserId, substituteNotes } = body;

    if (!leaveId || !status) {
      return NextResponse.json({ error: 'Leave ID and Status required' }, { status: 400 });
    }

    const updatedLeave = await db.teacherLeave.update({
      where: { id: leaveId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: adminUserId || null,
        substituteNotes: substituteNotes || null,
      },
      include: {
        teacher: { include: { user: true } },
      },
    });

    // Notify the teacher
    await db.notification.create({
      data: {
        userId: updatedLeave.teacher.userId,
        title: status === 'APPROVED' ? '✅ Leave Request Approved' : '❌ Leave Request Declined',
        message: `Your leave request for ${updatedLeave.startDate} to ${updatedLeave.endDate} has been ${status.toLowerCase()} by administration.`,
        type: 'LEAVE',
        link: '/teacher/leaves',
      },
    });

    return NextResponse.json({ success: true, leave: updatedLeave });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
