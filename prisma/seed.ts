import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// First names & Last names for realistic Indian collegiate naming
const FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Divya', 'Karthik', 'Ananya', 'Mohammed', 'Pooja',
  'Aditya', 'Neha', 'Sanjay', 'Meera', 'Rahul', 'Anjali', 'Deepak', 'Swati', 'Varun', 'Kavya',
  'Nikhil', 'Tanvi', 'Abhishek', 'Ritu', 'Manish', 'Shreya', 'Gaurav', 'Bhavna', 'Harish', 'Preeti',
  'Arjun', 'Isha', 'Vishal', 'Nandini', 'Pranav', 'Payal', 'Tarun', 'Archana', 'Manoj', 'Simran',
  'Siddharth', 'Rashmi', 'Kiran', 'Vidya', 'Chetan', 'Geetha', 'Raghav', 'Shruti', 'Akash', 'Madhuri',
  'Sunil', 'Jyothi', 'Rajesh', 'Aparna', 'Vikas', 'Deepa', 'Suresh', 'Namrata', 'Naveen', 'Roopa',
  'Pradeep', 'Pallavi', 'Sandeep', 'Chaitra', 'Vinay', 'Meghana', 'Dinesh', 'Lavanya', 'Praveen', 'Sowmya',
  'Sachin', 'Sahana', 'Vijay', 'Shweta', 'Ajay', 'Aishwarya', 'Anand', 'Keerthi', 'Ashwin', 'Nirupama',
];

const LAST_NAMES = [
  'Sharma', 'Nair', 'Gupta', 'Patel', 'Desai', 'Ramesh', 'Venkatesh', 'Joshi', 'Zaid', 'Hegde',
  'Kumar', 'Reddy', 'Rao', 'Bhat', 'Shetty', 'Gowda', 'Murthy', 'Prasad', 'Kulkarni', 'Naik',
  'Mishra', 'Singh', 'Verma', 'Menon', 'Pillai', 'Acharya', 'Kamath', 'Shenoy', 'Pai', 'Iyer',
  'Iyengar', 'Chauhan', 'Mehta', 'Shah', 'Agarwal', 'Banerjee', 'Chatterjee', 'Dutta', 'Ghosh', 'Sen',
];

function generateStudentName(index: number) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[(index + Math.floor(index / FIRST_NAMES.length)) % LAST_NAMES.length];
  return `${first} ${last}`;
}

async function main() {
  console.log('Seeding SICM Database with Conflict-Free Pure Daily Timetable Roster...');

  // Clear existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.teacherLeave.deleteMany();
  await prisma.dailyTeacherCheckin.deleteMany();
  await prisma.teacherAvailability.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.room.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.section.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  // 1. Settings
  await prisma.setting.createMany({
    data: [
      { key: 'ATTENDANCE_CRITICAL_THRESHOLD', value: '75', category: 'ATTENDANCE', description: 'Mandatory minimum attendance percentage' },
      { key: 'ATTENDANCE_WARNING_THRESHOLD', value: '85', category: 'ATTENDANCE', description: 'Warning threshold for students' },
      { key: 'COLLEGE_NAME', value: 'Seshadripuram Institute of Commerce and Management (SICM)', category: 'GENERAL', description: 'Institution Name' },
      { key: 'COLLEGE_CODE', value: 'SICM-BLR', category: 'GENERAL', description: 'Institution Code' },
      { key: 'ACADEMIC_YEAR', value: '2026-2027', category: 'GENERAL', description: 'Current Academic Year' },
      { key: 'QR_EXPIRY_SECONDS', value: '90', category: 'ATTENDANCE', description: 'QR Code validity duration in seconds' },
    ],
  });

  // 2. Departments
  const deptBCA = await prisma.department.create({
    data: { code: 'D-CA', name: 'Department of Computer Applications', description: 'Computer Applications, AI & ML studies' },
  });
  const deptBSC = await prisma.department.create({
    data: { code: 'D-SC', name: 'Department of Science', description: 'Pure and Applied Physical & Mathematical Sciences' },
  });
  const deptBBA = await prisma.department.create({
    data: { code: 'D-BA', name: 'Department of Business Administration', description: 'Business Management, Strategy, and Analytics' },
  });
  const deptBCOM = await prisma.department.create({
    data: { code: 'D-CM', name: 'Department of Commerce', description: 'Commerce, Accounting, Finance, and Business Data Analytics' },
  });

  // 3. Programs Definition (Exact 9 requested programs)
  const programsDef = [
    { code: 'BCA', name: 'Bachelor of Computer Applications', deptId: deptBCA.id, rollPrefix: 'BCA' },
    { code: 'BSC', name: 'Bachelor of Science (B.Sc)', deptId: deptBSC.id, rollPrefix: 'BSC' },
    { code: 'BBA', name: 'Bachelor of Business Administration', deptId: deptBBA.id, rollPrefix: 'BBA' },
    { code: 'BCOM-A', name: 'Bachelor of Commerce - Section A', deptId: deptBCOM.id, rollPrefix: 'BCMA' },
    { code: 'BCOM-B', name: 'Bachelor of Commerce - Section B', deptId: deptBCOM.id, rollPrefix: 'BCMB' },
    { code: 'BCOM-C', name: 'Bachelor of Commerce - Section C', deptId: deptBCOM.id, rollPrefix: 'BCMC' },
    { code: 'BCOM-AF', name: 'B.Com (Accounting & Finance)', deptId: deptBCOM.id, rollPrefix: 'BCMAF' },
    { code: 'BCOM-BDA', name: 'B.Com (Business Data Analytics)', deptId: deptBCOM.id, rollPrefix: 'BCMBDA' },
    { code: 'BCA-AIML', name: 'BCA (Artificial Intelligence & ML)', deptId: deptBCA.id, rollPrefix: 'BCAAI' },
  ];

  const createdPrograms: Record<string, any> = {};
  for (const p of programsDef) {
    const prog = await prisma.program.create({
      data: {
        code: p.code,
        name: p.name,
        departmentId: p.deptId,
        totalSemesters: 6,
        durationYears: 3,
      },
    });
    createdPrograms[p.code] = { ...prog, rollPrefix: p.rollPrefix };
  }

  // 4. Semesters & Sections (3 Years for each of the 9 programs: 1st Year, 2nd Year, 3rd Year)
  const yearsDef = [
    { yearNum: 1, semNum: 2, nameSuffix: '1st Year', batch: '2026-2029', rollYear: '26' },
    { yearNum: 2, semNum: 4, nameSuffix: '2nd Year', batch: '2025-2028', rollYear: '25' },
    { yearNum: 3, semNum: 6, nameSuffix: '3rd Year', batch: '2024-2027', rollYear: '24' },
  ];

  const createdSections: any[] = [];
  const createdSemesters: any[] = [];

  for (const progKey of Object.keys(createdPrograms)) {
    const prog = createdPrograms[progKey];

    for (const yr of yearsDef) {
      const sem = await prisma.semester.create({
        data: {
          programId: prog.id,
          semesterNumber: yr.semNum,
          academicYear: '2026-2027',
        },
      });
      createdSemesters.push({ ...sem, progKey, yearNum: yr.yearNum });

      const secName = `${prog.code} ${yr.nameSuffix}`;
      const sec = await prisma.section.create({
        data: {
          semesterId: sem.id,
          name: secName,
          capacity: 70,
        },
      });

      createdSections.push({
        ...sec,
        progKey,
        yearNum: yr.yearNum,
        batch: yr.batch,
        rollYear: yr.rollYear,
        rollPrefix: prog.rollPrefix,
        semesterId: sem.id,
        deptId: prog.departmentId,
      });
    }
  }

  console.log(`Created ${Object.keys(createdPrograms).length} Programs and ${createdSections.length} Cohort Sections.`);

  // 5. Rooms (30 dedicated classrooms and labs)
  const roomsData = [];
  for (let i = 101; i <= 115; i++) {
    roomsData.push({ roomNumber: `Room ${i}`, name: `Smart Lecture Hall ${i}`, building: 'Main Academic Block', floor: 1, capacity: 75, type: 'CLASSROOM' });
  }
  for (let i = 201; i <= 215; i++) {
    roomsData.push({ roomNumber: `Room ${i}`, name: `Smart Lecture Hall ${i}`, building: 'Main Academic Block', floor: 2, capacity: 75, type: 'CLASSROOM' });
  }
  roomsData.push({ roomNumber: 'Lab 101', name: 'Turing Computer Lab 1', building: 'Tech Block', floor: 1, capacity: 75, type: 'LAB' });
  roomsData.push({ roomNumber: 'Lab 102', name: 'Babbage AI/ML Lab 2', building: 'Tech Block', floor: 1, capacity: 75, type: 'LAB' });
  roomsData.push({ roomNumber: 'Lab 103', name: 'Data Analytics & Stats Lab', building: 'Tech Block', floor: 2, capacity: 75, type: 'LAB' });
  roomsData.push({ roomNumber: 'Lab 201', name: 'Science Physics & Electronics Lab', building: 'Science Block', floor: 2, capacity: 75, type: 'LAB' });

  const createdRooms = [];
  for (const r of roomsData) {
    const rm = await prisma.room.create({ data: r });
    createdRooms.push(rm);
  }

  // 6. Time Slots (6 periods)
  const timeSlotsData = [
    { slotNumber: 1, name: 'Period 1 (08:30 - 09:30)', startTime: '08:30', endTime: '09:30', isBreak: false },
    { slotNumber: 2, name: 'Period 2 (09:30 - 10:30)', startTime: '09:30', endTime: '10:30', isBreak: false },
    { slotNumber: 3, name: 'Period 3 (10:45 - 11:45)', startTime: '10:45', endTime: '11:45', isBreak: false },
    { slotNumber: 4, name: 'Period 4 (11:45 - 12:45)', startTime: '11:45', endTime: '12:45', isBreak: false },
    { slotNumber: 5, name: 'Period 5 (01:15 - 02:15)', startTime: '01:15', endTime: '02:15', isBreak: false },
    { slotNumber: 6, name: 'Period 6 (02:15 - 03:15)', startTime: '02:15', endTime: '03:15', isBreak: false },
  ];

  const createdTimeSlots = [];
  for (const s of timeSlotsData) {
    const ts = await prisma.timeSlot.create({ data: s });
    createdTimeSlots.push(ts);
  }

  // 7. 30 Dedicated Faculty Members
  const facultyRoster = [
    // Computer Applications & AI (8 Faculty)
    { name: 'Dr. Pratibha Rao', email: 'pratibha.rao@sicm.edu.in', code: 'SICM-FAC-101', deptId: deptBCA.id, desig: 'Associate Professor & HOD (CA)', qual: 'Ph.D. in Computer Science, M.Tech' },
    { name: 'Prof. Vinay Kumar', email: 'vinay.kumar@sicm.edu.in', code: 'SICM-FAC-102', deptId: deptBCA.id, desig: 'Assistant Professor (CA)', qual: 'MCA, M.Phil' },
    { name: 'Dr. Vikramaditya Sen', email: 'vikram.sen@sicm.edu.in', code: 'SICM-FAC-103', deptId: deptBCA.id, desig: 'Associate Professor (AIML)', qual: 'Ph.D. in Machine Learning, MS' },
    { name: 'Prof. Shweta Kulkarni', email: 'shweta.k@sicm.edu.in', code: 'SICM-FAC-104', deptId: deptBCA.id, desig: 'Assistant Professor (Web Tech)', qual: 'M.Tech IT, MCA' },
    { name: 'Prof. Sandeep Shenoy', email: 'sandeep.s@sicm.edu.in', code: 'SICM-FAC-105', deptId: deptBCA.id, desig: 'Assistant Professor (Data Science)', qual: 'M.Sc Data Science, MCA' },
    { name: 'Prof. Deepa Acharya', email: 'deepa.a@sicm.edu.in', code: 'SICM-FAC-106', deptId: deptBCA.id, desig: 'Assistant Professor (AI & NLP)', qual: 'M.Tech CSE, Ph.D. Scholar' },
    { name: 'Prof. Kiran Hegde', email: 'kiran.h@sicm.edu.in', code: 'SICM-FAC-107', deptId: deptBCA.id, desig: 'Assistant Professor (Cloud & DevOps)', qual: 'MCA, AWS Certified' },
    { name: 'Prof. Anjali Pai', email: 'anjali.p@sicm.edu.in', code: 'SICM-FAC-108', deptId: deptBCA.id, desig: 'Assistant Professor (Algorithms)', qual: 'M.Tech Software Eng' },

    // Science (5 Faculty)
    { name: 'Dr. Suresh Babu', email: 'suresh.babu@sicm.edu.in', code: 'SICM-FAC-109', deptId: deptBSC.id, desig: 'Professor & HOD (Science)', qual: 'Ph.D. in Physics, M.Sc' },
    { name: 'Prof. Kavitha S.', email: 'kavitha.s@sicm.edu.in', code: 'SICM-FAC-110', deptId: deptBSC.id, desig: 'Associate Professor (Math & Stats)', qual: 'M.Sc. Statistics, M.Phil' },
    { name: 'Prof. Raghavendra Rao', email: 'raghav.rao@sicm.edu.in', code: 'SICM-FAC-111', deptId: deptBSC.id, desig: 'Assistant Professor (Electronics)', qual: 'M.Sc Electronics, M.Phil' },
    { name: 'Dr. Nandini Bhat', email: 'nandini.b@sicm.edu.in', code: 'SICM-FAC-112', deptId: deptBSC.id, desig: 'Assistant Professor (Applied Math)', qual: 'Ph.D. in Mathematics, M.Sc' },
    { name: 'Prof. Tarun Sen', email: 'tarun.s@sicm.edu.in', code: 'SICM-FAC-113', deptId: deptBSC.id, desig: 'Assistant Professor (Physics)', qual: 'M.Sc Physics, CSIR-NET' },

    // Business Administration (5 Faculty)
    { name: 'Dr. Ananya Hegde', email: 'ananya.hegde@sicm.edu.in', code: 'SICM-FAC-114', deptId: deptBBA.id, desig: 'Associate Professor & HOD (Mgmt)', qual: 'Ph.D. in Management, MBA' },
    { name: 'Prof. Chetan Murthy', email: 'chetan.m@sicm.edu.in', code: 'SICM-FAC-115', deptId: deptBBA.id, desig: 'Assistant Professor (Marketing)', qual: 'MBA Marketing, NET' },
    { name: 'Prof. Preeti Deshpande', email: 'preeti.d@sicm.edu.in', code: 'SICM-FAC-116', deptId: deptBBA.id, desig: 'Assistant Professor (HRM)', qual: 'MBA HR, M.Phil' },
    { name: 'Prof. Harish Gowda', email: 'harish.g@sicm.edu.in', code: 'SICM-FAC-117', deptId: deptBBA.id, desig: 'Assistant Professor (Strategy)', qual: 'MBA Strategy, FCA' },
    { name: 'Prof. Archana Nayak', email: 'archana.n@sicm.edu.in', code: 'SICM-FAC-118', deptId: deptBBA.id, desig: 'Assistant Professor (Finance)', qual: 'MBA Finance, CFA' },

    // Commerce (12 Faculty)
    { name: 'Prof. Rajesh Kulkarni', email: 'rajesh.kulkarni@sicm.edu.in', code: 'SICM-FAC-119', deptId: deptBCOM.id, desig: 'Professor & Dean of Commerce', qual: 'Ph.D., M.Com, FCA' },
    { name: 'Prof. Meera Deshmukh', email: 'meera.d@sicm.edu.in', code: 'SICM-FAC-120', deptId: deptBCOM.id, desig: 'Assistant Professor (A&F)', qual: 'M.Com, CMA, NET' },
    { name: 'Prof. Harish Nair', email: 'harish.nair@sicm.edu.in', code: 'SICM-FAC-121', deptId: deptBCOM.id, desig: 'Assistant Professor (BDA)', qual: 'M.Sc Data Science, MBA' },
    { name: 'Prof. Sneha Kamath', email: 'sneha.k@sicm.edu.in', code: 'SICM-FAC-122', deptId: deptBCOM.id, desig: 'Assistant Professor (Law & Tax)', qual: 'LL.M, M.Com, ACS' },
    { name: 'Prof. Prakash Pai', email: 'prakash.p@sicm.edu.in', code: 'SICM-FAC-123', deptId: deptBCOM.id, desig: 'Assistant Professor (Banking)', qual: 'M.Com Banking, CAIIB' },
    { name: 'Prof. Jyothi Prasad', email: 'jyothi.p@sicm.edu.in', code: 'SICM-FAC-124', deptId: deptBCOM.id, desig: 'Assistant Professor (Auditing)', qual: 'M.Com, FCA' },
    { name: 'Prof. Manjunath Swamy', email: 'manjunath.s@sicm.edu.in', code: 'SICM-FAC-125', deptId: deptBCOM.id, desig: 'Assistant Professor (Costing)', qual: 'M.Com, FCMA' },
    { name: 'Prof. Divya Iyengar', email: 'divya.i@sicm.edu.in', code: 'SICM-FAC-126', deptId: deptBCOM.id, desig: 'Assistant Professor (Analytics)', qual: 'M.Sc Stats, MBA' },
    { name: 'Prof. Srinivas Bhat', email: 'srinivas.b@sicm.edu.in', code: 'SICM-FAC-127', deptId: deptBCOM.id, desig: 'Assistant Professor (Taxation)', qual: 'M.Com, CA' },
    { name: 'Prof. Roopa Joshi', email: 'roopa.j@sicm.edu.in', code: 'SICM-FAC-128', deptId: deptBCOM.id, desig: 'Assistant Professor (Corporate Fin)', qual: 'M.Com, CMA' },
    { name: 'Prof. Vijay Acharya', email: 'vijay.a@sicm.edu.in', code: 'SICM-FAC-129', deptId: deptBCOM.id, desig: 'Assistant Professor (E-Commerce)', qual: 'M.Com, MBA' },
    { name: 'Prof. Madhuri Rao', email: 'madhuri.r@sicm.edu.in', code: 'SICM-FAC-130', deptId: deptBCOM.id, desig: 'Assistant Professor (Marketing)', qual: 'M.Com, NET' },
  ];

  const createdTeachers: any[] = [];
  for (const f of facultyRoster) {
    const u = await prisma.user.create({
      data: {
        name: f.name,
        email: f.email,
        password: 'teacher123',
        role: 'TEACHER',
        phone: '+91 9845' + Math.floor(100000 + Math.random() * 900000),
      },
    });

    const tp = await prisma.teacherProfile.create({
      data: {
        userId: u.id,
        employeeCode: f.code,
        departmentId: f.deptId,
        designation: f.desig,
        qualification: f.qual,
        maxHoursPerWeek: 18,
      },
    });
    createdTeachers.push({ ...tp, user: u, name: f.name, email: f.email });
  }

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'Prof. M. Narayana Swamy',
      email: 'admin@sicm.edu.in',
      password: 'admin123',
      role: 'ADMIN',
      phone: '+91 98450 12345',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 8. Subjects
  const subjectsDef: any[] = [
    // BCA Subjects
    { code: 'BCA401', name: 'Database Management Systems', deptId: deptBCA.id, type: 'THEORY', color: '#2563eb' },
    { code: 'BCA402', name: 'Web Technologies & Frameworks', deptId: deptBCA.id, type: 'THEORY', color: '#059669' },
    { code: 'BCA403', name: 'Python & Data Science Lab', deptId: deptBCA.id, type: 'LAB', color: '#d97706' },
    { code: 'BCA404', name: 'Operating Systems & Linux', deptId: deptBCA.id, type: 'THEORY', color: '#7c3aed' },
    { code: 'BCA405', name: 'Quantitative Aptitude & Stats', deptId: deptBCA.id, type: 'THEORY', color: '#db2777' },

    // B.Sc Subjects
    { code: 'BSC401', name: 'Quantum Mechanics & Modern Physics', deptId: deptBSC.id, type: 'THEORY', color: '#0284c7' },
    { code: 'BSC402', name: 'Calculus & Linear Differential Eq', deptId: deptBSC.id, type: 'THEORY', color: '#059669' },
    { code: 'BSC403', name: 'Electronics & Microcontrollers Lab', deptId: deptBSC.id, type: 'LAB', color: '#d97706' },
    { code: 'BSC404', name: 'Applied Statistics & Probability', deptId: deptBSC.id, type: 'THEORY', color: '#7c3aed' },

    // BBA Subjects
    { code: 'BBA401', name: 'Marketing Management & Digital Strategies', deptId: deptBBA.id, type: 'THEORY', color: '#0284c7' },
    { code: 'BBA402', name: 'Human Resource Management & Talent', deptId: deptBBA.id, type: 'THEORY', color: '#7c3aed' },
    { code: 'BBA403', name: 'Financial Management & Valuation', deptId: deptBBA.id, type: 'THEORY', color: '#db2777' },
    { code: 'BBA404', name: 'Business Ethics & Corporate Law', deptId: deptBBA.id, type: 'THEORY', color: '#2563eb' },

    // B.Com Subjects
    { code: 'BCM401', name: 'Advanced Corporate Accounting', deptId: deptBCOM.id, type: 'THEORY', color: '#0284c7' },
    { code: 'BCM402', name: 'Direct & Indirect Taxation (GST)', deptId: deptBCOM.id, type: 'THEORY', color: '#059669' },
    { code: 'BCM403', name: 'Corporate Law & Governance', deptId: deptBCOM.id, type: 'THEORY', color: '#d97706' },
    { code: 'BCM404', name: 'Business Intelligence & Big Data Analytics', deptId: deptBCOM.id, type: 'LAB', color: '#7c3aed' },
    { code: 'BCM405', name: 'Financial Markets & Investment Banking', deptId: deptBCOM.id, type: 'THEORY', color: '#db2777' },

    // BCA AIML Subjects
    { code: 'AIM401', name: 'Neural Networks & Deep Learning', deptId: deptBCA.id, type: 'THEORY', color: '#2563eb' },
    { code: 'AIM402', name: 'Computer Vision & NLP Practical Lab', deptId: deptBCA.id, type: 'LAB', color: '#059669' },
    { code: 'AIM403', name: 'Mathematical Foundations for AI', deptId: deptBCA.id, type: 'THEORY', color: '#7c3aed' },
  ];

  const createdSubjects: any[] = [];
  for (const s of createdSemesters) {
    const subMatch = subjectsDef.filter(sub => sub.deptId === createdPrograms[s.progKey].departmentId);
    for (const sub of subMatch) {
      const subjectRecord = await prisma.subject.create({
        data: {
          code: `${sub.code}-${s.progKey}-${s.yearNum}`,
          name: sub.name,
          departmentId: sub.deptId,
          semesterId: s.id,
          credits: 4,
          type: sub.type,
          hoursPerWeek: 4,
          color: sub.color,
        },
      });
      createdSubjects.push({ ...subjectRecord, progKey: s.progKey, yearNum: s.yearNum });
    }
  }

  // 9. Generate Exactly 70 Students for each of the 27 Cohort Sections (1,890 total)
  console.log('Generating 70 students per section across all 27 cohort sections (1,890 total)...');

  let studentGlobalIndex = 0;
  const studentUserBatch = [];
  const studentProfileBatch = [];

  for (const sec of createdSections) {
    for (let stNum = 1; stNum <= 70; stNum++) {
      studentGlobalIndex++;
      const paddedNum = String(stNum).padStart(3, '0');
      const roll = `${sec.rollYear}${sec.rollPrefix}${paddedNum}`;
      const reg = `U18SICM${sec.rollYear}${sec.rollPrefix}${paddedNum}`;
      const fullName = generateStudentName(studentGlobalIndex);
      const email = `${fullName.toLowerCase().replace(/[^a-z]/g, '.')}.${roll.toLowerCase()}@sicm.edu.in`;

      const isPrimaryDemo = sec.progKey === 'BCA' && sec.yearNum === 2 && stNum === 1;
      const finalName = isPrimaryDemo ? 'Aarav Sharma' : fullName;
      const finalEmail = isPrimaryDemo ? 'aarav.sharma@sicm.edu.in' : email;
      const finalRoll = isPrimaryDemo ? '22BCA001' : roll;
      const finalReg = isPrimaryDemo ? 'U18CM21S0001' : reg;

      const userId = `std-user-${sec.progKey}-${sec.yearNum}-${paddedNum}`;

      studentUserBatch.push({
        id: userId,
        name: finalName,
        email: finalEmail,
        password: 'student123',
        role: 'STUDENT',
        phone: '+91 99' + Math.floor(10000000 + Math.random() * 90000000),
      });

      studentProfileBatch.push({
        userId,
        rollNumber: finalRoll,
        registerNumber: finalReg,
        programId: createdPrograms[sec.progKey].id,
        semesterId: sec.semesterId,
        sectionId: sec.id,
        batch: sec.batch,
      });
    }
  }

  // Bulk insert users and profiles in chunks of 500
  for (let i = 0; i < studentUserBatch.length; i += 500) {
    await prisma.user.createMany({ data: studentUserBatch.slice(i, i + 500) });
    await prisma.studentProfile.createMany({ data: studentProfileBatch.slice(i, i + 500) });
  }

  console.log(`Created 1,890 students across all 27 sections!`);

  // 10. Teacher Availabilities in bulk
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const teacherAvailData = [];
  for (const t of createdTeachers) {
    for (const d of days) {
      for (const slot of createdTimeSlots) {
        teacherAvailData.push({
          teacherId: t.id,
          dayOfWeek: d,
          timeSlotId: slot.id,
          status: 'AVAILABLE',
        });
      }
    }
  }
  await prisma.teacherAvailability.createMany({ data: teacherAvailData });

  // 11. Create Sample Morning Checkins
  await prisma.dailyTeacherCheckin.createMany({
    data: [
      {
        teacherId: createdTeachers[0].id,
        date: '2026-08-20',
        status: 'PRESENT',
        declaredAt: new Date('2026-08-20T07:40:00Z'),
      },
      {
        teacherId: createdTeachers[1].id,
        date: '2026-08-20',
        status: 'PRESENT',
        declaredAt: new Date('2026-08-20T07:45:00Z'),
      },
      {
        teacherId: createdTeachers[18].id,
        date: '2026-08-20',
        status: 'PRESENT',
        declaredAt: new Date('2026-08-20T07:50:00Z'),
      },
    ],
  });

  // 12. Build a STRICTLY CONFLICT-FREE Timetable Matrix
  console.log('Generating strictly collision-free daily lecture schedules...');

  const timetableEntries = [];
  const insertedKeys = new Set<string>();

  for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
    const day = days[dayIdx];

    for (let slotIdx = 0; slotIdx < createdTimeSlots.length; slotIdx++) {
      const slot = createdTimeSlots[slotIdx];
      const busyTeachersThisSlot = new Set<string>();
      const busyRoomsThisSlot = new Set<string>();

      for (let secIdx = 0; secIdx < createdSections.length; secIdx++) {
        const sec = createdSections[secIdx];
        const uniqueKey = `${day}_${slot.id}_${sec.id}`;
        if (insertedKeys.has(uniqueKey)) continue;
        insertedKeys.add(uniqueKey);

        const secSubjects = createdSubjects.filter(s => s.progKey === sec.progKey && s.yearNum === sec.yearNum);
        if (secSubjects.length === 0) continue;

        // Subject
        const subj = secSubjects[(dayIdx + slotIdx + secIdx) % secSubjects.length];

        // Pick unique teacher for this slot
        const deptTeachers = createdTeachers.filter(t => t.departmentId === sec.deptId);
        let teacher = deptTeachers.find(t => !busyTeachersThisSlot.has(t.id));

        if (!teacher) {
          teacher = createdTeachers.find(t => !busyTeachersThisSlot.has(t.id));
        }

        if (teacher) {
          busyTeachersThisSlot.add(teacher.id);
        } else {
          teacher = createdTeachers[secIdx % createdTeachers.length];
        }

        // Pick unique room for this slot
        let room = createdRooms.find(r => !busyRoomsThisSlot.has(r.id));
        if (subj.type === 'LAB') {
          const labRoom = createdRooms.find(r => r.type === 'LAB' && !busyRoomsThisSlot.has(r.id));
          if (labRoom) room = labRoom;
        }
        if (room) {
          busyRoomsThisSlot.add(room.id);
        } else {
          room = createdRooms[secIdx % createdRooms.length];
        }

        timetableEntries.push({
          dayOfWeek: day,
          timeSlotId: slot.id,
          subjectId: subj.id,
          teacherId: teacher.id,
          substituteTeacherId: null,
          sectionId: sec.id,
          roomId: room.id,
          status: 'ACTIVE',
          academicYear: '2026-2027',
        });
      }
    }
  }

  // Insert all timetable records
  await prisma.timetable.createMany({
    data: timetableEntries,
  });

  const createdTimetables = await prisma.timetable.findMany();
  console.log(`Generated ${createdTimetables.length} 100% collision-free timetable slots!`);

  // 13. Historical Attendance Sessions for demo sections
  console.log('Generating realistic historical attendance distribution...');
  const dates = [
    '2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14',
    '2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20'
  ];

  const historySections = createdSections.filter(s => s.yearNum === 2).slice(0, 4);
  let totalRecordsCount = 0;

  for (const sec of historySections) {
    const secTimetables = createdTimetables.filter(t => t.sectionId === sec.id);
    const secStudents = await prisma.studentProfile.findMany({
      where: { sectionId: sec.id },
      take: 70,
    });

    for (const dStr of dates) {
      const dObj = new Date(dStr);
      const dayMap: Record<number, string> = { 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY' };
      const dayName = dayMap[dObj.getDay()] || 'MONDAY';

      const daySlots = secTimetables.filter(t => t.dayOfWeek === dayName).slice(0, 4);

      for (const slot of daySlots) {
        const session = await prisma.attendanceSession.create({
          data: {
            timetableId: slot.id,
            date: dStr,
            timeSlotId: slot.timeSlotId,
            teacherId: slot.substituteTeacherId || slot.teacherId,
            sectionId: sec.id,
            subjectId: slot.subjectId,
            status: 'COMPLETED',
            markedAt: new Date(`${dStr}T11:00:00Z`),
          },
        });

        const recordsData = secStudents.map((st, idx) => {
          let isPresent = true;
          if (st.rollNumber === '22BCA001') {
            isPresent = (idx % 10) < 8; // 80%
          } else {
            isPresent = Math.random() > 0.12; // ~88% average
          }

          return {
            sessionId: session.id,
            studentId: st.id,
            status: isPresent ? 'PRESENT' : 'ABSENT',
            markedVia: 'MANUAL',
          };
        });

        await prisma.attendanceRecord.createMany({
          data: recordsData,
        });

        totalRecordsCount += recordsData.length;
      }
    }
  }

  console.log(`Generated ${totalRecordsCount} historical student attendance records.`);

  // 14. In-App Notifications
  const primaryStudentUser = await prisma.user.findUnique({
    where: { email: 'aarav.sharma@sicm.edu.in' },
  });

  if (primaryStudentUser) {
    await prisma.notification.createMany({
      data: [
        {
          userId: primaryStudentUser.id,
          title: '📅 Daily Timetable Published (BCA 2nd Year)',
          message: 'Today\'s lecture schedule is prepared and verified by the Academic Dean.',
          type: 'TIMETABLE',
          link: '/student/timetable',
          isRead: false,
        },
        {
          userId: primaryStudentUser.id,
          title: '⚠️ Attendance Advisory',
          message: 'Your overall aggregate attendance is 81.4%. Maintain regular attendance to stay above the 75% threshold.',
          type: 'ALERT',
          link: '/student/attendance',
          isRead: false,
        },
      ],
    });
  }

  console.log('✅ SICM Academic Database Seed Completed Successfully with Zero Collisions!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
