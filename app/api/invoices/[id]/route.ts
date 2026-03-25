import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { client: true, items: true },
    })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(invoice)
  } catch (e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { items, clientId, issueDate, dueDate, notes, taxRate, status, paidDate } = body

    let subtotal = 0, taxAmount = 0, total = 0

    const updateData: Record<string, unknown> = {
      status,
      notes: notes || '',
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      paidDate: paidDate ? new Date(paidDate) : null,
    }

    if (clientId) updateData.clientId = clientId

    if (items) {
      subtotal = items.reduce(
        (sum: number, i: { quantity: number; unitPrice: number }) => sum + i.quantity * i.unitPrice,
        0
      )
      taxAmount = subtotal * ((taxRate || 0) / 100)
      total = subtotal + taxAmount
      updateData.subtotal = subtotal
      updateData.taxRate = taxRate || 0
      updateData.taxAmount = taxAmount
      updateData.total = total

      // Delete old items and re-create
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } })
      await prisma.invoiceItem.createMany({
        data: items.map((i: { description: string; quantity: number; unitPrice: number }) => ({
          invoiceId: params.id,
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.quantity * i.unitPrice,
        })),
      })
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: { client: true, items: true },
    })
    return NextResponse.json(invoice)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.invoice.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
