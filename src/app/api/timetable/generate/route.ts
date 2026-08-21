import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAutomatedTimetable } from '@/lib/schedulerEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionId, workingDays, commit, clearExisting } = body;

    if (!sectionId) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    const generationResult = await generateAutomatedTimetable({
      sectionId,
      workingDays,
    });

    if (commit && generationResult.slots.length > 0) {
      // If requested to commit directly into database
      if (clearExisting) {
        await db.timetable.deleteMany({
          where: { sectionId },
        });
      }

      for (const slot of generationResult.slots) {
        await db.timetable.upsert({
          where: {
            dayOfWeek_timeSlotId_sectionId: {
              dayOfWeek: slot.dayOfWeek,
              timeSlotId: slot.timeSlotId,
              sectionId,
            },
          },
          update: {
            subjectId: slot.subjectId,
            teacherId: slot.teacherId,
            roomId: slot.roomId,
            status: 'ACTIVE',
          },
          create: {
            dayOfWeek: slot.dayOfWeek,
            timeSlotId: slot.timeSlotId,
            sectionId,
            subjectId: slot.subjectId,
            teacherId: slot.teacherId,
            roomId: slot.roomId,
            status: 'ACTIVE',
          },
        });
      }

      await db.auditLog.create({
        data: {
          action: 'AUTO_GENERATE_TIMETABLE',
          entity: 'Timetable',
          details: `Automatically generated and committed ${generationResult.slots.length} timetable slots for section ${sectionId}.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      result: generationResult,
      committed: !!commit,
    });
  } catch (error: any) {
    console.error('Error generating timetable:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
