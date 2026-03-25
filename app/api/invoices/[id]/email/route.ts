import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { InvoicePDFDocument } from '@/components/InvoicePDF'
import nodemailer from 'nodemailer'
import React from 'react'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { to, subject, message } = await req.json()

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { client: true, items: true },
    })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const settings = await prisma.settings.findUnique({ where: { id: 'main' } })

    // Generate PDF
    const buffer = await renderToBuffer(
      React.createElement(InvoicePDFDocument, { invoice, settings }) as React.ReactElement<DocumentProps>
    )

    // SMTP config: from settings DB or env
    const smtpHost = settings?.smtpHost || process.env.SMTP_HOST
    const smtpPort = settings?.smtpPort || Number(process.env.SMTP_PORT) || 587
    const smtpUser = settings?.smtpUser || process.env.SMTP_USER
    const smtpPass = settings?.smtpPass || process.env.SMTP_PASS
    const smtpFrom = settings?.smtpFrom || process.env.SMTP_FROM || smtpUser

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'SMTP no configurado. Ve a Configuración para agregar tus datos de correo.' },
        { status: 400 }
      )
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    const defaultSubject = `Factura ${invoice.number} — ${settings?.agencyName || 'Paradise Lamb Agency'}`
    const defaultMessage = `Estimado/a ${invoice.client.name},\n\nAdjunto encontrará la factura ${invoice.number} por un total de $${invoice.total.toFixed(2)} USD.\n\nGracias por su preferencia.\n\n${settings?.agencyName || 'Paradise Lamb Agency'}`

    await transporter.sendMail({
      from: smtpFrom,
      to: to || invoice.client.email,
      subject: subject || defaultSubject,
      text: message || defaultMessage,
      attachments: [
        {
          filename: `factura-${invoice.number}.pdf`,
          content: buffer,
          contentType: 'application/pdf',
        },
      ],
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
