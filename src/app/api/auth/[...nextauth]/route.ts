// src/app/api/auth/[...nextauth]/route.ts
import { authHandler } from '@/auth';

export { authHandler as GET, authHandler as POST };
