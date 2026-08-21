import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkTimetableConflicts } from '@/lib/conflictEngine';
import { getDayName } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let sectionId = searchParams.get('sectionId');
    const teacherId = searchParams.get('teacherId');
    const studentProfileId = searchParams.get('studentProfileId');
    const roomId = searchParams.get('roomId');
    const date = searchParams.get('date');
    let dayOfWeek = searchParams.get('dayOfWeek');

    if (date && !dayOfWeek) {
      const d = new Date(date);
      dayOfWeek = getDayName(d.getDay());
    }

    // If studentProfileId is given, strictly resolve to that student's single enrolled section
    if (studentProfileId && !sectionId) {
      const student = await db.studentProfile.findUnique({
        where: { id: studentProfileId },
        select: { sectionId: true },
      });
      if (student?.sectionId) {
        sectionId = student.sectionId;
      }
    }

    const where: any = { status: 'ACTIVE' };
    if (sectionId) where.sectionId = sectionId;

    if (teacherId) {
      // Return slots the teacher is actively teaching on this day:
      // Either regular slots without substitution OR substitute duties assigned to this teacher
      where.OR = [
        { teacherId: teacherId, substituteTeacherId: null },
        { substituteTeacherId: teacherId },
      ];
    }

    if (roomId) where.roomId = roomId;
    if (dayOfWeek) where.dayOfWeek = dayOfWeek;

    const timetables = await db.timetable.findMany({
      where,
      include: {
        timeSlot: true,
        subject: true,
        teacher: { include: { user: true, department: true } },
        substituteTeacher: { include: { user: true } },
        section: { include: { semester: { include: { program: true } } } },
        room: true,
      },
      orderBy: [
        { timeSlot: { slotNumber: 'asc' } },
      ],
    });

    return NextResponse.json({
      timetables,
      dayOfWeek: dayOfWeek || 'THURSDAY',
      date: date || new Date().toISOString().split('T')[0],
      sectionId: sectionId || null,
    });
  } catch (error: any) {
    console.error('Error fetching timetables:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dayOfWeek, timeSlotId, subjectId, teacherId, sectionId, roomId, substituteTeacherId, notes } = body;

    if (!dayOfWeek || !timeSlotId || !subjectId || !teacherId || !sectionId || !roomId) {
      return NextResponse.json({ error: 'Missing required schedule parameters' }, { status: 400 });
    }

    const conflictResult = await checkTimetableConflicts({
      dayOfWeek,
      timeSlotId,
      teacherId,
      sectionId,
      roomId,
      substituteTeacherId,
    });

    if (conflictResult.hasConflict) {
      return NextResponse.json({
        error: 'Timetable conflict detected',
        details: conflictResult.errors,
        conflictDetails: conflictResult.conflictDetails,
      }, { status: 409 });
    }

    const newEntry = await db.timetable.create({
      data: {
        dayOfWeek,
        timeSlotId,
        subjectId,
        teacherId,
        sectionId,
        roomId,
        substituteTeacherId: substituteTeacherId || null,
        notes: notes || null,
      },
      include: {
        timeSlot: true,
        subject: true,
        teacher: { include: { user: true } },
        substituteTeacher: { include: { user: true } },
        section: true,
        room: true,
      },
    });

    await db.auditLog.create({
      data: {
        action: 'CREATE_TIMETABLE_SLOT',
        entity: 'Timetable',
        entityId: newEntry.id,
        details: `Created slot for ${newEntry.subject.name} on ${dayOfWeek} (${newEntry.timeSlot.name}) in ${newEntry.room.roomNumber}`,
      },
    });

    return NextResponse.json({
      success: true,
      timetable: newEntry,
      warnings: conflictResult.warnings,
    });
  } catch (error: any) {
    console.error('Error creating timetable slot:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, dayOfWeek, timeSlotId, subjectId, teacherId, sectionId, roomId, substituteTeacherId, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Timetable ID required' }, { status: 400 });
    }

    if (status !== 'CANCELLED') {
      const conflictResult = await checkTimetableConflicts({
        timetableId: id,
        dayOfWeek,
        timeSlotId,
        teacherId,
        sectionId,
        roomId,
        substituteTeacherId,
      });

      if (conflictResult.hasConflict) {
        return NextResponse.json({
          error: 'Timetable conflict detected',
          details: conflictResult.errors,
          conflictDetails: conflictResult.conflictDetails,
        }, { status: 409 });
      }
    }

    const updated = await db.timetable.update({
      where: { id },
      data: {
        ...(dayOfWeek ? { dayOfWeek } : {}),
        ...(timeSlotId ? { timeSlotId } : {}),
        ...(subjectId ? { subjectId } : {}),
        ...(teacherId ? { teacherId } : {}),
        ...(sectionId ? { sectionId } : {}),
        ...(roomId ? { roomId } : {}),
        substituteTeacherId: substituteTeacherId !== undefined ? substituteTeacherId : undefined,
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        timeSlot: true,
        subject: true,
        teacher: { include: { user: true } },
        substituteTeacher: { include: { user: true } },
        section: true,
        room: true,
      },
    });

    return NextResponse.json({ success: true, timetable: updated });
  } catch (error: any) {
    console.error('Error updating timetable slot:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Timetable ID required' }, { status: 400 });
    }

    await db.timetable.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
