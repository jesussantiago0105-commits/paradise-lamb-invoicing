import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: 'main' } })
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: 'main',
        agencyName: 'Paradise Lamb Agency',
        address: 'Boulevard Jardínes de la Hacienda 1504',
        city: 'Querétaro',
        state: 'Querétaro',
        zip: '76180',
        country: 'MX',
        phone: '+525573514539',
        email: 'agencia@paradiselamb.com',
      },
    })
  }
  return settings
}

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const settings = await prisma.settings.upsert({
      where: { id: 'main' },
      update: body,
      create: { id: 'main', ...body },
    })
    return NextResponse.json(settings)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
