// create-vercel-build.js
const { execSync } = require('child_process');
const { writeFileSync } = require('fs');

console.log('Starting Vercel build process...');

try {
  // 1. Generate the Prisma Client
  console.log('Step 1: Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 2. Run migrations
  console.log('Step 2: Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // 3. Build the Next.js application
  console.log('Step 3: Building Next.js application...');
  execSync('npx next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
