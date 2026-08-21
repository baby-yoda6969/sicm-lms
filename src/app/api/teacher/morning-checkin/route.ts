import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const teacherId = searchParams.get('teacherId');

    const where: any = { date };
    if (teacherId) {
      where.teacherId = teacherId;
    }

    const checkins = await db.dailyTeacherCheckin.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      orderBy: { declaredAt: 'desc' },
    });

    return NextResponse.json({ date, checkins });
  } catch (error: any) {
    console.error('Error fetching morning checkins:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teacherId, date, status, reason, availableSlots } = body;

    if (!teacherId || !status) {
      return NextResponse.json({ error: 'teacherId and status are required' }, { status: 400 });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    const checkin = await db.dailyTeacherCheckin.upsert({
      where: {
        teacherId_date: {
          teacherId,
          date: targetDate,
        },
      },
      update: {
        status,
        reason: reason || null,
        availableSlots: availableSlots || null,
        declaredAt: new Date(),
      },
      create: {
        teacherId,
        date: targetDate,
        status,
        reason: reason || null,
        availableSlots: availableSlots || null,
      },
      include: {
        teacher: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    // If teacher declares ABSENT or PARTIAL, create notification for Admin
    if (status === 'ABSENT' || status === 'PARTIAL') {
      const admins = await db.user.findMany({
        where: { role: 'ADMIN' },
      });

      for (const admin of admins) {
        await db.notification.create({
          data: {
            userId: admin.id,
            title: `⚠️ Morning Status: ${checkin.teacher.user.name} (${status})`,
            message: `${checkin.teacher.user.name} declared ${status} for today (${targetDate}). Reason: "${reason || 'Not specified'}". Timetable can be auto-rebalanced with substitute matching.`,
            type: 'LEAVE',
            link: '/admin/daily-timetable',
          },
        });
      }
    }

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'TEACHER_MORNING_DECLARATION',
        entity: 'DailyTeacherCheckin',
        details: `${checkin.teacher.user.name} declared ${status} for ${targetDate}. Reason: "${reason || 'N/A'}"`,
      },
    });

    return NextResponse.json({ success: true, checkin });
  } catch (error: any) {
    console.error('Error saving morning checkin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
