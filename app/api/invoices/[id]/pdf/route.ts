import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { InvoicePDFDocument } from '@/components/InvoicePDF'
import React from 'react'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { client: true, items: true },
    })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const settings = await prisma.settings.findUnique({ where: { id: 'main' } })

    const buffer = await renderToBuffer(
      React.createElement(InvoicePDFDocument, { invoice, settings }) as React.ReactElement<DocumentProps>
    )

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${invoice.number}.pdf"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}
