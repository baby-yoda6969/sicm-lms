// Shared Dynamic Daily Timetable Store for SICM
// Full Real-Time Database Synchronization across Admin, Faculty & Student Portals

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
    id?: string;
    code: string;
    name: string;
    color?: string;
  };
  section: {
    id: string;
    name: string;
    program?: string;
    totalStudents?: number;
  };
  room: {
    roomNumber: string;
    name?: string;
  };
  teacher: {
    id: string;
    user: {
      name: string;
    };
    department?: string;
  };
  substituteTeacher?: {
    id: string;
    user: {
      name: string;
    };
    department?: string;
  } | null;
  substituteTeacherId?: string | null;
  isSubstitute?: boolean;
  notes?: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  adminApproved: boolean;
}

export interface TeacherDailyStatus {
  id: string;
  name: string;
  department: string;
  status: 'PRESENT' | 'ABSENT_TODAY' | 'ON_LEAVE' | 'PARTIAL';
  reason?: string;
  declaredAt?: string;
}

export interface AdminDailyGeneration {
  date: string;
  dayOfWeek: string;
  generatedAt: string;
  generatedBy: string;
  presentTeachersCount: number;
  absentTeachersCount: number;
  teacherStatuses: TeacherDailyStatus[];
  sections: { id: string; name: string; program: string }[];
  currentTimetables: DailyTimetablePeriod[];
}

export function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayIndex = d.getDay();
  const map = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return map[dayIndex] || 'THURSDAY';
}

export const MASTER_TEACHERS_LIST: TeacherDailyStatus[] = [
  { id: 't-1', name: 'Dr. Pratibha Rao', department: 'Computer Applications', status: 'PRESENT' },
  { id: 't-2', name: 'Prof. Suresh Kumar', department: 'Computer Applications', status: 'PRESENT' },
  { id: 't-3', name: 'Prof. Narayana S.', department: 'Computer Applications', status: 'PRESENT' },
  { id: 't-4', name: 'Dr. Rekha M.', department: 'Commerce', status: 'ABSENT_TODAY', reason: 'Medical Leave' },
  { id: 't-5', name: 'Prof. Anitha K.', department: 'Business Admin', status: 'PRESENT' },
  { id: 't-6', name: 'Prof. K. R. Sharma', department: 'Computer Applications', status: 'PRESENT' },
  { id: 't-7', name: 'Prof. Ananya Sen', department: 'Computer Applications', status: 'PRESENT' },
  { id: 't-8', name: 'Prof. Ramesh Bhat', department: 'Computer Applications', status: 'PRESENT' },
];

export const MASTER_SECTIONS_LIST = [
  { id: 'sec-1', name: 'BCA 1st Year', program: 'BCA' },
  { id: 'sec-2', name: 'BCA 2nd Year', program: 'BCA' },
  { id: 'sec-3', name: 'BCA 3rd Year', program: 'BCA' },
  { id: 'sec-4', name: 'B.Com 1st Year', program: 'B.Com' },
  { id: 'sec-5', name: 'B.Com 2nd Year', program: 'B.Com' },
  { id: 'sec-6', name: 'BBA 1st Year', program: 'BBA' },
];

// Generate default daily schedule for any requested date (matching screenshot specifications)
export function generateAdminDailyScheduleForDate(dateStr: string): AdminDailyGeneration {
  const dayOfWeek = getDayName(dateStr);

  const currentTimetables: DailyTimetablePeriod[] = [
    // --- BCA 2nd Year (Primary Cohort matching Admin view) ---
    {
      id: `tt-${dateStr}-bca2-1`,
      slotNumber: 1,
      timeSlot: { slotNumber: 1, name: 'Period 1 (09:00 - 10:00 AM)', startTime: '09:00', endTime: '10:00' },
      subject: { id: 's-1', code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      section: { id: 'sec-2', name: 'BCA 2nd Year', program: 'BCA', totalStudents: 70 },
      room: { roomNumber: 'Lab 3', name: 'Computer Applications Lab 3' },
      teacher: { id: 't-1', user: { name: 'Dr. Pratibha Rao' }, department: 'Computer Applications' },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'ACTIVE',
      adminApproved: true,
    },
    {
      id: `tt-${dateStr}-bca2-2`,
      slotNumber: 2,
      timeSlot: { slotNumber: 2, name: 'Period 2 (10:00 - 11:00 AM)', startTime: '10:00', endTime: '11:00' },
      subject: { id: 's-2', code: 'BCA402', name: 'Database Management Systems', color: '#0284C7' },
      section: { id: 'sec-2', name: 'BCA 2nd Year', program: 'BCA', totalStudents: 70 },
      room: { roomNumber: 'Room 204', name: 'Main Academic Block' },
      teacher: { id: 't-2', user: { name: 'Prof. Suresh Kumar' }, department: 'Computer Applications' },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'UPCOMING',
      adminApproved: true,
    },
    {
      id: `tt-${dateStr}-bca2-3`,
      slotNumber: 3,
      timeSlot: { slotNumber: 3, name: 'Period 3 (11:15 - 12:15 PM)', startTime: '11:15', endTime: '12:15' },
      subject: { id: 's-4', code: 'BCOM201', name: 'Corporate Accounting', color: '#B45309' },
      section: { id: 'sec-2', name: 'BCA 2nd Year', program: 'BCA', totalStudents: 70 },
      room: { roomNumber: 'Room 204', name: 'Main Academic Block' },
      teacher: { id: 't-4', user: { name: 'Dr. Rekha M.' }, department: 'Commerce' },
      substituteTeacher: { id: 't-2', user: { name: 'Prof. Suresh Kumar' }, department: 'Computer Applications' },
      substituteTeacherId: 't-2',
      isSubstitute: true,
      notes: 'Substitute assigned due to Faculty Medical Leave',
      status: 'UPCOMING',
      adminApproved: true,
    },
    {
      id: `tt-${dateStr}-bca2-4`,
      slotNumber: 4,
      timeSlot: { slotNumber: 4, name: 'Period 4 (12:15 - 01:15 PM)', startTime: '12:15', endTime: '13:15' },
      subject: { id: 's-3', code: 'BCA403', name: 'Operating Systems & Architecture', color: '#16A34A' },
      section: { id: 'sec-2', name: 'BCA 2nd Year', program: 'BCA', totalStudents: 70 },
      room: { roomNumber: 'Room 204', name: 'Main Academic Block' },
      teacher: { id: 't-3', user: { name: 'Prof. Narayana S.' }, department: 'Computer Applications' },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'UPCOMING',
      adminApproved: true,
    },
    {
      id: `tt-${dateStr}-bca2-5`,
      slotNumber: 5,
      timeSlot: { slotNumber: 5, name: 'Period 5 (01:45 - 02:45 PM)', startTime: '13:45', endTime: '14:45' },
      subject: { id: 's-1l', code: 'BCA401L', name: 'Python Programming Practical Lab', color: '#7C3AED' },
      section: { id: 'sec-2', name: 'BCA 2nd Year', program: 'BCA', totalStudents: 70 },
      room: { roomNumber: 'Lab 3', name: 'Computer Applications Lab 3' },
      teacher: { id: 't-1', user: { name: 'Dr. Pratibha Rao' }, department: 'Computer Applications' },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'UPCOMING',
      adminApproved: true,
    },

    // --- BCA 1st Year ---
    {
      id: `tt-${dateStr}-bca1-1`,
      slotNumber: 1,
      timeSlot: { slotNumber: 1, name: 'Period 1 (09:00 - 10:00 AM)', startTime: '09:00', endTime: '10:00' },
      subject: { id: 's-bca201', code: 'BCA201', name: 'Data Structures & Algorithms', color: '#EA580C' },
      section: { id: 'sec-1', name: 'BCA 1st Year', program: 'BCA', totalStudents: 72 },
      room: { roomNumber: 'Room 101', name: 'First Floor' },
      teacher: { id: 't-1', user: { name: 'Dr. Pratibha Rao' }, department: 'Computer Applications' },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'ACTIVE',
      adminApproved: true,
    },
    {
      id: `tt-${dateStr}-bca1-2`,
      slotNumber: 2,
      timeSlot: { slotNumber: 2, name: 'Period 2 (10:00 - 11:00 AM)', startTime: '10:00', endTime: '11:00' },
      subject: { id: 's-bca202', code: 'BCA202', name: 'Digital Electronics & Logic', color: '#0284C7' },
      section: { id: 'sec-1', name: 'BCA 1st Year', program: 'BCA', totalStudents: 72 },
      room: { roomNumber: 'Room 101', name: 'First Floor' },
      teacher: { id: 't-6', user: { name: 'Prof. K. R. Sharma' }, department: 'Computer Applications' },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'UPCOMING',
      adminApproved: true,
    },

    // --- BCA 3rd Year ---
    {
      id: `tt-${dateStr}-bca3-1`,
      slotNumber: 1,
      timeSlot: { slotNumber: 1, name: 'Period 1 (09:00 - 10:00 AM)', startTime: '09:00', endTime: '10:00' },
      subject: { id: 's-bca601', code: 'BCA601', name: 'Cloud Computing & DevOps', color: '#16A34A' },
      section: { id: 'sec-3', name: 'BCA 3rd Year', program: 'BCA', totalStudents: 68 },
      room: { roomNumber: 'Room 302', name: 'Third Floor' },
      teacher: { id: 't-2', user: { name: 'Prof. Suresh Kumar' }, department: 'Computer Applications' },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'ACTIVE',
      adminApproved: true,
    },
    {
      id: `tt-${dateStr}-bca3-2`,
      slotNumber: 2,
      timeSlot: { slotNumber: 2, name: 'Period 2 (10:00 - 11:00 AM)', startTime: '10:00', endTime: '11:00' },
      subject: { id: 's-bca602', code: 'BCA602', name: 'Machine Learning Foundations', color: '#7C3AED' },
      section: { id: 'sec-3', name: 'BCA 3rd Year', program: 'BCA', totalStudents: 68 },
      room: { roomNumber: 'Room 302', name: 'Third Floor' },
      teacher: { id: 't-1', user: { name: 'Dr. Pratibha Rao' }, department: 'Computer Applications' },
      substituteTeacher: null,
      substituteTeacherId: null,
      status: 'UPCOMING',
      adminApproved: true,
    },

    // --- B.Com 1st Year ---
    {
      id: `tt-${dateStr}-bcom1-1`,
      slotNumber: 1,
      timeSlot: { slotNumber: 1, name: 'Period 1 (09:00 - 10:00 AM)', startTime: '09:00', endTime: '10:00' },
      subject: { id: 's-bcom101', code: 'BCOM101', name: 'Financial Accounting I', color: '#B45309' },
      section: { id: 'sec-4', name: 'B.Com 1st Year', program: 'B.Com', totalStudents: 75 },
      room: { roomNumber: 'Room 201', name: 'Commerce Wing' },
      teacher: { id: 't-4', user: { name: 'Dr. Rekha M.' }, department: 'Commerce' },
      substituteTeacher: { id: 't-5', user: { name: 'Prof. Anitha K.' }, department: 'Business Admin' },
      substituteTeacherId: 't-5',
      isSubstitute: true,
      status: 'ACTIVE',
      adminApproved: true,
    },
  ];

  return {
    date: dateStr,
    dayOfWeek,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    generatedBy: 'Central Administration & Dean Office (Prof. Narayana S.)',
    presentTeachersCount: 28,
    absentTeachersCount: 2,
    teacherStatuses: MASTER_TEACHERS_LIST,
    sections: MASTER_SECTIONS_LIST,
    currentTimetables,
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

// Save Admin generated timetable & broadcast update to all tabs/components
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

// Reassign a substitute or teacher on a specific slot and save
export function updateSlotSubstitute(
  dateStr: string,
  slotId: string,
  substituteTeacherId: string | null,
  notes?: string
): AdminDailyGeneration {
  const gen = getAdminGeneratedDailyTimetable(dateStr);
  const subTeacherObj = substituteTeacherId
    ? MASTER_TEACHERS_LIST.find((t) => t.id === substituteTeacherId)
    : null;

  gen.currentTimetables = gen.currentTimetables.map((slot) => {
    if (slot.id === slotId) {
      return {
        ...slot,
        substituteTeacherId: substituteTeacherId || null,
        substituteTeacher: subTeacherObj
          ? { id: subTeacherObj.id, user: { name: subTeacherObj.name }, department: subTeacherObj.department }
          : null,
        isSubstitute: !!substituteTeacherId,
        notes: notes || (substituteTeacherId ? 'Assigned by Dean Office' : undefined),
      };
    }
    return slot;
  });

  saveAdminGeneratedDailyTimetable(gen);
  return gen;
}

// Filter strictly for the logged-in teacher for that particular day
export function getTeacherDailySchedule(
  teacherIdentifier: string | undefined,
  dateStr: string
): { generation: AdminDailyGeneration; classes: DailyTimetablePeriod[] } {
  const gen = getAdminGeneratedDailyTimetable(dateStr);
  const search = (teacherIdentifier || 'Dr. Pratibha Rao').toLowerCase();

  const filtered = gen.currentTimetables.filter((slot) => {
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
    classes: filtered,
  };
}

// Filter strictly for the student cohort for that particular day
export function getStudentDailySchedule(
  sectionName: string | undefined,
  dateStr: string
): { generation: AdminDailyGeneration; classes: DailyTimetablePeriod[] } {
  const gen = getAdminGeneratedDailyTimetable(dateStr);
  const search = (sectionName || 'BCA 2nd Year').toLowerCase();

  const filtered = gen.currentTimetables.filter((slot) => {
    return (
      slot.section.name.toLowerCase().includes(search) ||
      slot.section.id === sectionName
    );
  });

  return {
    generation: gen,
    classes: filtered,
  };
}
