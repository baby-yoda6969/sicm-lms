import { db } from './db';
import { cookies } from 'next/headers';

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | string;

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | string;
  avatar?: string | null;
  teacherProfileId?: string;
  studentProfileId?: string;
  rollNumber?: string;
  employeeCode?: string;
  departmentName?: string;
  sectionId?: string;
  sectionName?: string;
  semesterNumber?: number;
  programCode?: string;
}

export const SESSION_COOKIE_NAME = 'sicm_auth_session';

export async function getCurrentUser(): Promise<AuthSession | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const payload = JSON.parse(sessionCookie.value) as { userId: string };
    if (!payload.userId) return null;

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        teacherProfile: {
          include: {
            department: true,
          },
        },
        studentProfile: {
          include: {
            program: true,
            semester: true,
            section: true,
          },
        },
      },
    });

    if (!user || !user.isActive) return null;

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      teacherProfileId: user.teacherProfile?.id,
      studentProfileId: user.studentProfile?.id,
      rollNumber: user.studentProfile?.rollNumber,
      employeeCode: user.teacherProfile?.employeeCode,
      departmentName: user.teacherProfile?.department?.name,
      sectionId: user.studentProfile?.section?.id,
      sectionName: user.studentProfile?.section?.name,
      semesterNumber: user.studentProfile?.semester?.semesterNumber,
      programCode: user.studentProfile?.program?.code,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
