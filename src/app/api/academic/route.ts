import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'departments') {
      const departments = await db.department.findMany({
        include: { programs: true, teachers: { include: { user: true } } },
      });
      return NextResponse.json({ departments });
    }

    if (type === 'sections') {
      const sections = await db.section.findMany({
        include: {
          semester: { include: { program: { include: { department: true } } } },
          students: { include: { user: true } },
        },
      });
      return NextResponse.json({ sections });
    }

    if (type === 'subjects') {
      const subjects = await db.subject.findMany({
        include: {
          department: true,
          semester: { include: { program: true } },
        },
        orderBy: { code: 'asc' },
      });
      return NextResponse.json({ subjects });
    }

    if (type === 'rooms') {
      const rooms = await db.room.findMany({
        orderBy: { roomNumber: 'asc' },
      });
      return NextResponse.json({ rooms });
    }

    if (type === 'teachers') {
      const teachers = await db.teacherProfile.findMany({
        include: {
          user: true,
          department: true,
          availabilities: true,
        },
        orderBy: { employeeCode: 'asc' },
      });
      return NextResponse.json({ teachers });
    }

    if (type === 'timeslots') {
      const timeslots = await db.timeSlot.findMany({
        orderBy: { slotNumber: 'asc' },
      });
      return NextResponse.json({ timeslots });
    }

    // Default: Return complete academic bundle for fast UI consumption
    const [departments, sections, subjects, rooms, teachers, timeSlots] = await Promise.all([
      db.department.findMany({ include: { programs: true } }),
      db.section.findMany({
        include: {
          semester: { include: { program: true, subjects: true } },
          students: { include: { user: true } },
        },
      }),
      db.subject.findMany({ include: { department: true } }),
      db.room.findMany({ orderBy: { roomNumber: 'asc' } }),
      db.teacherProfile.findMany({
        include: { user: true, department: true },
        orderBy: { employeeCode: 'asc' },
      }),
      db.timeSlot.findMany({ orderBy: { slotNumber: 'asc' } }),
    ]);

    return NextResponse.json({
      departments,
      sections,
      subjects,
      rooms,
      teachers,
      timeSlots,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
