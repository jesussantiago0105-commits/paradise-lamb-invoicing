import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { invoices: true } } },
    })
    return NextResponse.json(clients)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const client = await prisma.client.create({ data: body })
    return NextResponse.json(client, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
