import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Pastikan path ini benar nanti

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  // 1. Cari slug di database
  const data = await prisma.link.findUnique({
    where: { slug },
  });

  // 2. Jika ketemu, redirect ke Link GDrive asli
  if (data) {
    return NextResponse.redirect(data.originalUrl);
  }

  // 3. Jika tidak ketemu, lempar ke 404
  return NextResponse.json({ error: 'Link not found' }, { status: 404 });
}