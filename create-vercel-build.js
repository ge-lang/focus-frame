// create-vercel-build.js
const { execSync } = require('child_process');
const { writeFileSync } = require('fs');

console.log('Starting Vercel build process...');

try {
  // 1. Генерируем Prisma Client
  console.log('Step 1: Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 2. Выполняем миграции
  console.log('Step 2: Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // 3. Собираем Next.js приложение
  console.log('Step 3: Building Next.js application...');
  execSync('npx next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}