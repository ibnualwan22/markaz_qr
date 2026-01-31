import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // 1. Cari slug di database
  const data = await prisma.link.findUnique({
    where: { slug },
  })

  // 2. Jika ketemu, redirect ke URL asli
  if (data) {
    return NextResponse.redirect(data.originalUrl)
  }

  // 3. Jika tidak ketemu
  return NextResponse.json(
    { error: 'Link not found' },
    { status: 404 }
  )
}
