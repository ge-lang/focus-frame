// test-connection.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');
    
    const tasks = await prisma.task.findMany();
    console.log(`📋 Found ${tasks.length} tasks`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();