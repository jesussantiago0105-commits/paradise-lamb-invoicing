import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const where: Record<string, unknown> = {}
    if (status && status !== 'ALL') where.status = status
    if (clientId) where.clientId = clientId

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { id: true, name: true, company: true, email: true } }, items: true },
    })
    return NextResponse.json(invoices)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clientId, issueDate, dueDate, notes, taxRate, items, status } = body

    // Get and increment invoice number
    const settings = await prisma.settings.upsert({
      where: { id: 'main' },
      update: { nextInvoiceNumber: { increment: 1 } },
      create: { id: 'main' },
    })
    const number = `${settings.invoicePrefix}-${settings.nextInvoiceNumber}`

    const subtotal = items.reduce(
      (sum: number, i: { quantity: number; unitPrice: number }) => sum + i.quantity * i.unitPrice,
      0
    )
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    const invoice = await prisma.invoice.create({
      data: {
        number,
        clientId,
        status: status || 'PENDING',
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes: notes || '',
        subtotal,
        taxRate,
        taxAmount,
        total,
        items: {
          create: items.map((i: { description: string; quantity: number; unitPrice: number }) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.quantity * i.unitPrice,
          })),
        },
      },
      include: { client: true, items: true },
    })
    return NextResponse.json(invoice, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 })
  }
}
