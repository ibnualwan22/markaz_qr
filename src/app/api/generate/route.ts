// src/app/api/generate/route.ts
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { studentName, originalUrl } = await request.json();

    if (!studentName || !originalUrl) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 1. Buat Slug Random (6 karakter)
    const slug = Math.random().toString(36).substring(2, 8);

    // 2. Simpan ke Database
    const newLink = await prisma.link.create({
      data: {
        slug,
        studentName,
        originalUrl,
      },
    });

    // 3. Kembalikan Link Pendek
    // Sesuaikan domain saat deploy nanti. Untuk dev gunakan localhost.
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${slug}`;

    return NextResponse.json({ shortUrl, ...newLink });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}