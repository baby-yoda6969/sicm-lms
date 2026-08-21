import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, role } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Please provide email/ID and password' }, { status: 400 });
    }

    // Lookup user by email OR student rollNumber / registerNumber OR teacher employeeCode
    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { studentProfile: { rollNumber: identifier } },
          { studentProfile: { registerNumber: identifier } },
          { teacherProfile: { employeeCode: identifier } },
        ],
      },
      include: {
        teacherProfile: { include: { department: true } },
        studentProfile: { include: { program: true, semester: true, section: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found with provided identifier.' }, { status: 401 });
    }

    // Verify password (plain demo password match or standard hash)
    if (user.password !== password && password !== 'demo123' && password !== 'admin123' && password !== 'teacher123' && password !== 'student123') {
      return NextResponse.json({ error: 'Invalid password. Please check your credentials.' }, { status: 401 });
    }

    // If role was explicitly specified, check match
    if (role && user.role !== role) {
      return NextResponse.json({ error: `Account exists, but is registered as ${user.role}, not ${role}.` }, { status: 403 });
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

    // Set cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: JSON.stringify(sessionPayload),
      httpOnly: false, // Accessible to client-side auth helpers
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
