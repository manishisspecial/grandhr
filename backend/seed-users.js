const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('\n🌱 Starting user seeding...\n');

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin12345', 10);
    const hrPassword = await bcrypt.hash('hr12345', 10);
    const empPassword = await bcrypt.hash('emp12345', 10);

    // Admin User
    console.log('Creating Admin user...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@squadhr.com' },
      update: {},
      create: {
        email: 'admin@squadhr.com',
        password: adminPassword,
        role: 'ADMIN',
        employee: {
          create: {
            employeeId: 'ADMIN001',
            firstName: 'Admin',
            lastName: 'User',
            department: 'Administration',
            designation: 'System Administrator',
            joiningDate: new Date(),
            salary: 100000,
            isActive: true,
          },
        },
      },
      include: { employee: true },
    });
    console.log('✅ Admin user created:', adminUser.email);

    // HR Manager User
    console.log('\nCreating HR Manager user...');
    const hrUser = await prisma.user.upsert({
      where: { email: 'hr@squadhr.com' },
      update: {},
      create: {
        email: 'hr@squadhr.com',
        password: hrPassword,
        role: 'HR',
        employee: {
          create: {
            employeeId: 'HR001',
            firstName: 'HR',
            lastName: 'Manager',
            department: 'Human Resources',
            designation: 'HR Manager',
            joiningDate: new Date(),
            salary: 80000,
            isActive: true,
          },
        },
      },
      include: { employee: true },
    });
    console.log('✅ HR Manager user created:', hrUser.email);

    // Employee User
    console.log('\nCreating Employee user...');
    const empUser = await prisma.user.upsert({
      where: { email: 'employee@squadhr.com' },
      update: {},
      create: {
        email: 'employee@squadhr.com',
        password: empPassword,
        role: 'EMPLOYEE',
        employee: {
          create: {
            employeeId: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            department: 'Engineering',
            designation: 'Software Developer',
            joiningDate: new Date(),
            salary: 60000,
            isActive: true,
          },
        },
      },
      include: { employee: true },
    });
    console.log('✅ Employee user created:', empUser.email);

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📋 Test Users Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin');
    console.log('   Email: admin@squadhr.com');
    console.log('   Password: admin12345');
    console.log('   Role: ADMIN');
    console.log('');
    console.log('👤 HR Manager');
    console.log('   Email: hr@squadhr.com');
    console.log('   Password: hr12345');
    console.log('   Role: HR');
    console.log('');
    console.log('👤 Employee');
    console.log('   Email: employee@squadhr.com');
    console.log('   Password: emp12345');
    console.log('   Role: EMPLOYEE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

