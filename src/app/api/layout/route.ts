// src/app/api/layout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { layout } = await req.json();

  // Сохраняем в базу
  await prisma.userLayout.upsert({
    where: { userId: session.user.id },
    update: { layout: JSON.stringify(layout) },
    create: {
      userId: session.user.id,
      layout: JSON.stringify(layout),
    },
  });

  return NextResponse.json({ success: true });
}