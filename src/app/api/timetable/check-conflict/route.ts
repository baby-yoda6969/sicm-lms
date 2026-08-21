import { NextResponse } from 'next/server';
import { checkTimetableConflicts } from '@/lib/conflictEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await checkTimetableConflicts(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
