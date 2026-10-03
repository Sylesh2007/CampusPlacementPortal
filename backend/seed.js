const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');
const PlacementDrive = require('./models/PlacementDrive');
const Application = require('./models/Application');

dotenv.config();

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('[Seed] Connected to database.');

    // Clear existing sample data
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      PlacementDrive.deleteMany({}),
      Application.deleteMany({}),
    ]);
    console.log('[Seed] Collections cleared.');

    // Passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('adminpassword123', salt);
    const studentPassword = await bcrypt.hash('studentpassword123', salt);
    const companyPassword = await bcrypt.hash('companypassword123', salt);

    // 1. Create Users
    console.log('[Seed] Inserting Users...');
    const users = await User.create([
      {
        userId: 'ADM001',
        name: 'Placement Director Dr. Sharma',
        email: 'admin@campus.edu',
        password: adminPassword,
        role: 'admin',
      },
      {
        userId: 'STU001',
        name: 'Alex Johnson',
        email: 'alex@campus.edu',
        password: studentPassword,
        role: 'student',
      },
      {
        userId: 'STU002',
        name: 'Priya Patel',
        email: 'priya@campus.edu',
        password: studentPassword,
        role: 'student',
      },
      {
        userId: 'STU003',
        name: 'Rahul Nair',
        email: 'rahul@campus.edu',
        password: studentPassword,
        role: 'student',
      },
      {
        userId: 'CMP001',
        name: 'Google Campus Recruitment',
        email: 'hr@google.com',
        password: companyPassword,
        role: 'company',
      },
      {
        userId: 'CMP002',
        name: 'Microsoft University Relations',
        email: 'hr@microsoft.com',
        password: companyPassword,
        role: 'company',
      },
    ]);
    console.log(`[Seed] Inserted ${users.length} users.`);

    // 2. Create Companies
    console.log('[Seed] Inserting Companies...');
    const companies = await Company.create([
      {
        companyId: 'CMP001',
        companyName: 'Google',
        location: 'Bangalore & Hyderabad',
        website: 'https://careers.google.com',
        HRName: 'Sarah Jenkins',
        packageOffered: '28 LPA',
        eligibilityCriteria: 'CGPA >= 8.0, B.Tech CSE/IT/ECE, Strong DSA & Systems Knowledge',
      },
      {
        companyId: 'CMP002',
        companyName: 'Microsoft',
        location: 'Hyderabad & Bangalore',
        website: 'https://careers.microsoft.com',
        HRName: 'David Smith',
        packageOffered: '24 LPA',
        eligibilityCriteria: 'CGPA >= 7.5, No active backlogs, Proficiency in C++/Java/C#',
      },
      {
        companyId: 'CMP003',
        companyName: 'Amazon',
        location: 'Chennai & Hyderabad',
        website: 'https://amazon.jobs',
        HRName: 'Priya Rao',
        packageOffered: '22 LPA',
        eligibilityCriteria: 'CGPA >= 7.0, Problem Solving, Data Structures, Web Technologies',
      },
      {
        companyId: 'CMP004',
        companyName: 'Tata Consultancy Services (TCS)',
        location: 'Pan-India',
        website: 'https://www.tcs.com/careers',
        HRName: 'Rajesh Verma',
        packageOffered: '7.5 LPA',
        eligibilityCriteria: 'CGPA >= 6.5, All Engineering Branches Eligible, Max 1 Backlog',
      },
    ]);
    console.log(`[Seed] Inserted ${companies.length} companies.`);

    // 3. Create Placement Drives
    console.log('[Seed] Inserting Placement Drives...');
    const now = new Date();
    const driveDate1 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const lastDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const driveDate2 = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
    const lastDate2 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    const driveDate3 = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
    const lastDate3 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const driveDate4 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const lastDate4 = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    const drives = await PlacementDrive.create([
      {
        driveId: 'DRV001',
        companyId: 'CMP001',
        jobRole: 'Software Development Engineer (SDE-1)',
        driveDate: driveDate1,
        venue: 'Main Auditorium Hall A, Technology Block',
        lastDateToApply: lastDate1,
        vacancies: 15,
      },
      {
        driveId: 'DRV002',
        companyId: 'CMP002',
        jobRole: 'Cloud Solutions Engineer',
        driveDate: driveDate2,
        venue: 'Tech Innovation Center Hall 2',
        lastDateToApply: lastDate2,
        vacancies: 25,
      },
      {
        driveId: 'DRV003',
        companyId: 'CMP003',
        jobRole: 'Frontend Developer (React / Full Stack)',
        driveDate: driveDate3,
        venue: 'Virtual Campus Assessment Portal',
        lastDateToApply: lastDate3,
        vacancies: 20,
      },
      {
        driveId: 'DRV004',
        companyId: 'CMP004',
        jobRole: 'Systems Associate Engineer',
        driveDate: driveDate4,
        venue: 'Convention Center Block B',
        lastDateToApply: lastDate4,
        vacancies: 50,
      },
    ]);
    console.log(`[Seed] Inserted ${drives.length} placement drives.`);

    // 4. Create Applications
    console.log('[Seed] Inserting Applications...');
    const applications = await Application.create([
      {
        applicationId: 'APP001',
        studentId: 'STU001',
        driveId: 'DRV001',
        applicationDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: 'Shortlisted',
        selected: false,
      },
      {
        applicationId: 'APP002',
        studentId: 'STU001',
        driveId: 'DRV003',
        applicationDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'Selected',
        selected: true,
      },
      {
        applicationId: 'APP003',
        studentId: 'STU002',
        driveId: 'DRV002',
        applicationDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'Verified',
        selected: false,
      },
      {
        applicationId: 'APP004',
        studentId: 'STU003',
        driveId: 'DRV004',
        applicationDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'Applied',
        selected: false,
      },
    ]);
    console.log(`[Seed] Inserted ${applications.length} applications.`);

    console.log('----------------------------------------------------');
    console.log('Default Seed Data Populated Successfully:');
    console.log('Admin Account:   admin@campus.edu / adminpassword123');
    console.log('Student Account: alex@campus.edu / studentpassword123');
    console.log('Company Account: hr@google.com / companypassword123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
