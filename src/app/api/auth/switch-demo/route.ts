import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    let targetEmail = 'admin@sicm.edu.in';
    if (role === 'TEACHER') targetEmail = 'pratibha.rao@sicm.edu.in';
    if (role === 'STUDENT') targetEmail = 'aarav.sharma@sicm.edu.in';

    const user = await db.user.findUnique({
      where: { email: targetEmail },
      include: {
        teacherProfile: { include: { department: true } },
        studentProfile: { include: { program: true, semester: true, section: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Demo user not found' }, { status: 404 });
    }

    const sessionPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        teacherProfile: user.teacherProfile,
        studentProfile: user.studentProfile,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: JSON.stringify(sessionPayload),
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
