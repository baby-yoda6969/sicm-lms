import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
    }

    const availabilities = await db.teacherAvailability.findMany({
      where: { teacherId },
      include: { timeSlot: true },
      orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: { slotNumber: 'asc' } }],
    });

    const timeSlots = await db.timeSlot.findMany({
      where: { isBreak: false },
      orderBy: { slotNumber: 'asc' },
    });

    return NextResponse.json({ availabilities, timeSlots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teacherId, updates } = body; // updates is an array of { dayOfWeek, timeSlotId, status, notes }

    if (!teacherId || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    for (const item of updates) {
      await db.teacherAvailability.upsert({
        where: {
          teacherId_dayOfWeek_timeSlotId: {
            teacherId,
            dayOfWeek: item.dayOfWeek,
            timeSlotId: item.timeSlotId,
          },
        },
        update: {
          status: item.status,
          notes: item.notes || null,
        },
        create: {
          teacherId,
          dayOfWeek: item.dayOfWeek,
          timeSlotId: item.timeSlotId,
          status: item.status,
          notes: item.notes || null,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Availability preferences updated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
