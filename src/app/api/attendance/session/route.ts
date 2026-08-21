import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function getOrCreateSession(timetableId: string, date: string, sessionId?: string | null) {
  let session = null;

  if (sessionId) {
    session = await db.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        timetable: { include: { room: true } },
        subject: true,
        section: {
          include: {
            students: {
              include: { user: true },
              orderBy: { rollNumber: 'asc' },
            },
          },
        },
        teacher: { include: { user: true } },
        timeSlot: true,
        records: {
          include: {
            student: { include: { user: true } },
          },
          orderBy: { markedAt: 'desc' },
        },
      },
    });
  } else if (timetableId) {
    // Find or create session for this timetable & date
    session = await db.attendanceSession.findUnique({
      where: {
        timetableId_date: {
          timetableId,
          date,
        },
      },
      include: {
        timetable: { include: { room: true } },
        subject: true,
        section: {
          include: {
            students: {
              include: { user: true },
              orderBy: { rollNumber: 'asc' },
            },
          },
        },
        teacher: { include: { user: true } },
        timeSlot: true,
        records: {
          include: {
            student: { include: { user: true } },
          },
          orderBy: { markedAt: 'desc' },
        },
      },
    });

    if (!session) {
      // Fetch timetable info to create session
      const tt = await db.timetable.findUnique({
        where: { id: timetableId },
      });

      if (!tt) {
        return null;
      }

      const effectiveTeacherId = tt.substituteTeacherId || tt.teacherId;

      session = await db.attendanceSession.create({
        data: {
          timetableId: tt.id,
          date,
          timeSlotId: tt.timeSlotId,
          teacherId: effectiveTeacherId,
          sectionId: tt.sectionId,
          subjectId: tt.subjectId,
          status: 'SCHEDULED',
          substituteMarked: !!tt.substituteTeacherId,
        },
        include: {
          timetable: { include: { room: true } },
          subject: true,
          section: {
            include: {
              students: {
                include: { user: true },
                orderBy: { rollNumber: 'asc' },
              },
            },
          },
          teacher: { include: { user: true } },
          timeSlot: true,
          records: {
            include: {
              student: { include: { user: true } },
            },
            orderBy: { markedAt: 'desc' },
          },
        },
      });
    }
  }

  return session;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timetableId = searchParams.get('timetableId') || '';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const sessionId = searchParams.get('sessionId') || '';

    const session = await getOrCreateSession(timetableId, date, sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session parameters missing or invalid' }, { status: 400 });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Error fetching attendance session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const timetableId = body.timetableId || '';
    const date = body.date || new Date().toISOString().split('T')[0];
    const sessionId = body.sessionId || '';

    const session = await getOrCreateSession(timetableId, date, sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session parameters missing or timetable not found' }, { status: 400 });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Error in POST attendance session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
