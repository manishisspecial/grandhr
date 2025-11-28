const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function createDatabase() {
  // Get connection details from DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  // Parse the URL to get connection details
  const url = new URL(dbUrl.replace('postgresql://', 'http://'));
  const user = url.username;
  const password = url.password;
  const host = url.hostname;
  const port = url.port || 5432;
  const database = url.pathname.slice(1).split('?')[0];

  console.log(`\n📝 Attempting to create database: ${database}\n`);

  // Connect to postgres database to create the new database
  const adminUrl = `postgresql://${user}:${password}@${host}:${port}/postgres?schema=public`;
  
  const adminPrisma = new PrismaClient({
    datasources: {
      db: {
        url: adminUrl
      }
    }
  });

  try {
    await adminPrisma.$connect();
    console.log('✅ Connected to PostgreSQL server\n');

    // Check if database exists
    const result = await adminPrisma.$queryRawUnsafe(
      `SELECT 1 FROM pg_database WHERE datname = '${database}'`
    );

    if (result.length > 0) {
      console.log(`ℹ️  Database "${database}" already exists\n`);
    } else {
      await adminPrisma.$executeRawUnsafe(`CREATE DATABASE ${database};`);
      console.log(`✅ Database "${database}" created successfully!\n`);
    }

    await adminPrisma.$disconnect();

    // Now test connection to the new database
    console.log('📝 Testing connection to the new database...\n');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Successfully connected to database!\n');
      console.log('📋 Next step: Run "npm run prisma:migrate" to create tables\n');
      await prisma.$disconnect();
    } catch (error) {
      console.log('⚠️  Database created but connection test failed.');
      console.log('   This might be normal. Try running migrations anyway.\n');
    }

  } catch (error) {
    console.error('❌ Failed to create database!');
    console.error('Error:', error.message);
    console.log('\nPlease check:');
    console.log('   - PostgreSQL service is running');
    console.log('   - Credentials in .env are correct');
    console.log('   - You have permission to create databases\n');
    console.log('You can also create the database manually:');
    console.log(`   CREATE DATABASE ${database};\n`);
    process.exit(1);
  }
}

createDatabase();

