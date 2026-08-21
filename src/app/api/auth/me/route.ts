import { NextResponse } from 'next/server';
import { getCurrentUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback for seamless demo experience: Return default student if unauthenticated
      const defaultUser = await db.user.findFirst({
        where: { role: 'STUDENT' },
        include: {
          studentProfile: {
            include: { program: true, semester: true, section: true },
          },
        },
      });

      if (defaultUser) {
        return NextResponse.json({
          user: {
            userId: defaultUser.id,
            name: defaultUser.name,
            email: defaultUser.email,
            role: defaultUser.role,
            avatar: defaultUser.avatar,
            studentProfileId: defaultUser.studentProfile?.id,
            rollNumber: defaultUser.studentProfile?.rollNumber,
            sectionId: defaultUser.studentProfile?.section?.id,
            sectionName: defaultUser.studentProfile?.section?.name,
            semesterNumber: defaultUser.studentProfile?.semester?.semesterNumber,
            programCode: defaultUser.studentProfile?.program?.code,
          },
          isGuestFallback: true,
        });
      }

      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
