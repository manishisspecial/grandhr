const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('\n=== SquadHR Database Setup ===\n');
  console.log('Please provide your PostgreSQL connection details:\n');

  const host = await question('PostgreSQL Host (default: localhost): ') || 'localhost';
  const port = await question('PostgreSQL Port (default: 5432): ') || '5432';
  const user = await question('PostgreSQL Username (default: postgres): ') || 'postgres';
  const password = await question('PostgreSQL Password: ');
  const database = await question('Database Name (default: squadhr): ') || 'squadhr';

  if (!password) {
    console.log('\n❌ Password is required!');
    rl.close();
    process.exit(1);
  }

  const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;

  console.log('\n📝 Testing database connection...\n');

  // Test connection
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL!\n');

    // Check if database exists, if not create it
    try {
      await prisma.$executeRawUnsafe(`CREATE DATABASE ${database};`);
      console.log(`✅ Database "${database}" created successfully!\n`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️  Database "${database}" already exists.\n`);
      } else {
        // Try connecting to postgres database to create the new one
        const adminPrisma = new PrismaClient({
          datasources: {
            db: {
              url: `postgresql://${user}:${password}@${host}:${port}/postgres?schema=public`
            }
          }
        });
        try {
          await adminPrisma.$executeRawUnsafe(`CREATE DATABASE ${database};`);
          console.log(`✅ Database "${database}" created successfully!\n`);
          await adminPrisma.$disconnect();
        } catch (createError) {
          if (createError.message.includes('already exists')) {
            console.log(`ℹ️  Database "${database}" already exists.\n`);
          } else {
            console.log(`⚠️  Could not create database automatically. Please create it manually:\n`);
            console.log(`   CREATE DATABASE ${database};\n`);
          }
        }
      }
    }

    await prisma.$disconnect();

    // Update .env file
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    
    let envContent = `DATABASE_URL="${databaseUrl}"
JWT_SECRET="squadhr-super-secret-jwt-key-change-in-production-${Date.now()}"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Run: npm run prisma:migrate');
    console.log('   2. This will create all database tables\n');

  } catch (error) {
    console.log('❌ Failed to connect to PostgreSQL!');
    console.log('Error:', error.message);
    console.log('\nPlease check:');
    console.log('   - PostgreSQL service is running');
    console.log('   - Credentials are correct');
    console.log('   - Database server is accessible\n');
    rl.close();
    process.exit(1);
  }

  rl.close();
}

setupDatabase();

