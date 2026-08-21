// Shared Dynamic Daily Timetable Store for SICM
// Connects the Admin Daily Timetable Solver with Faculty and Student views

export interface DailyTimetablePeriod {
  id: string;
  slotNumber: number;
  timeSlot: {
    slotNumber: number;
    name: string;
    startTime: string;
    endTime: string;
  };
  subject: {
    code: string;
    name: string;
    color?: string;
  };
  section: {
    id?: string;
    name: string;
    totalStudents?: number;
  };
  room: {
    roomNumber: string;
    name?: string;
  };
  teacher: {
    id?: string;
    user: {
      name: string;
    };
  };
  substituteTeacher?: {
    id?: string;
    user: {
      name: string;
    };
  } | null;
  substituteTeacherId?: string | null;
  isSubstitute?: boolean;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  adminApproved: boolean;
}

export interface AdminDailyGeneration {
  date: string;
  dayOfWeek: string;
  generatedAt: string;
  generatedBy: string;
  totalSlots: number;
  slots: DailyTimetablePeriod[];
}

export function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayIndex = d.getDay();
  const map = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return map[dayIndex] || 'MONDAY';
}

// Generate the Admin Official Schedule for a specific date
export function generateAdminDailyScheduleForDate(dateStr: string): AdminDailyGeneration {
  const dayName = getDayName(dateStr);

  const baseSlots: DailyTimetablePeriod[] = [
    {
      id: `admin-slot-${dateStr}-1`,
      slotNumber: 1,
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      section: { id: 'sec-2', name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 2', name: 'Computer Applications Lab 2' },
      teacher: { id: 't-1', user: { name: 'Dr. Pratibha Rao' } },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'COMPLETED',
      adminApproved: true,
    },
    {
      id: `admin-slot-${dateStr}-2`,
      slotNumber: 2,
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#0284C7' },
      section: { id: 'sec-2', name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Hall 302', name: 'Main Academic Block' },
      teacher: { id: 't-1', user: { name: 'Dr. Pratibha Rao' } },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'ACTIVE',
      adminApproved: true,
    },
    {
      id: `admin-slot-${dateStr}-3`,
      slotNumber: 3,
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA601', name: 'Cloud Computing & DevOps', color: '#16A34A' },
      section: { id: 'sec-3', name: 'BCA 3rd Year', totalStudents: 68 },
      room: { roomNumber: 'Room 204', name: 'Central Wing' },
      teacher: { id: 't-1', user: { name: 'Dr. Pratibha Rao' } },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'UPCOMING',
      adminApproved: true,
    },
    {
      id: `admin-slot-${dateStr}-4`,
      slotNumber: 4,
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA406', name: 'Python & Linux Advanced Lab', color: '#7C3AED' },
      section: { id: 'sec-2', name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 3', name: 'Advanced Systems Lab' },
      teacher: { id: 't-4', user: { name: 'Dr. Rekha M.' } },
      substituteTeacher: { id: 't-1', user: { name: 'Dr. Pratibha Rao' } },
      substituteTeacherId: 't-1',
      isSubstitute: true,
      status: 'UPCOMING',
      adminApproved: true,
    },
    {
      id: `admin-slot-${dateStr}-5`,
      slotNumber: 5,
      timeSlot: { slotNumber: 5, name: 'Period 5', startTime: '01:15 PM', endTime: '02:15 PM' },
      subject: { code: 'BCA201', name: 'Data Structures & Algorithms', color: '#EA580C' },
      section: { id: 'sec-1', name: 'BCA 1st Year', totalStudents: 72 },
      room: { roomNumber: 'Hall 102', name: 'First Floor' },
      teacher: { id: 't-1', user: { name: 'Dr. Pratibha Rao' } },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'UPCOMING',
      adminApproved: true,
    },
  ];

  return {
    date: dateStr,
    dayOfWeek: dayName,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    generatedBy: 'Central Administration & Dean Office (Prof. Narayana S.)',
    totalSlots: baseSlots.length,
    slots: baseSlots,
  };
}

// Retrieve the active Admin-generated timetable for a given date
export function getAdminGeneratedDailyTimetable(dateStr: string): AdminDailyGeneration {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`sicm_admin_daily_schedule_${dateStr}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read admin daily timetable from storage', e);
    }
  }
  return generateAdminDailyScheduleForDate(dateStr);
}

// Save Admin generated timetable
export function saveAdminGeneratedDailyTimetable(data: AdminDailyGeneration) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`sicm_admin_daily_schedule_${data.date}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('sicm_timetable_updated', { detail: data }));
    } catch (e) {
      console.warn('Could not save admin daily timetable to storage', e);
    }
  }
}

// Filter strictly for the logged-in teacher for that particular day
export function getTeacherDailySchedule(
  teacherIdentifier: string | undefined,
  dateStr: string
): { generation: AdminDailyGeneration; classes: DailyTimetablePeriod[] } {
  const gen = getAdminGeneratedDailyTimetable(dateStr);
  const search = (teacherIdentifier || 'Dr. Pratibha Rao').toLowerCase();

  const filtered = gen.slots.filter((slot) => {
    const isPrimaryTeacher =
      slot.teacher?.user?.name.toLowerCase().includes(search) ||
      slot.teacher?.id === teacherIdentifier;
    const isSub =
      slot.substituteTeacher?.user?.name.toLowerCase().includes(search) ||
      slot.substituteTeacherId === teacherIdentifier;
    return isPrimaryTeacher || isSub;
  });

  return {
    generation: gen,
    classes: filtered.length > 0 ? filtered : gen.slots,
  };
}

// Filter strictly for the student cohort for that particular day
export function getStudentDailySchedule(
  sectionName: string | undefined,
  dateStr: string
): { generation: AdminDailyGeneration; classes: DailyTimetablePeriod[] } {
  const gen = getAdminGeneratedDailyTimetable(dateStr);
  const search = (sectionName || 'BCA 2nd Year').toLowerCase();

  const filtered = gen.slots.filter((slot) => {
    return (
      slot.section.name.toLowerCase().includes(search) ||
      slot.section.id === sectionName
    );
  });

  return {
    generation: gen,
    classes: filtered.length > 0 ? filtered : gen.slots,
  };
}
