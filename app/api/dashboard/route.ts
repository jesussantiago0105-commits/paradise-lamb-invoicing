import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfMonth, subMonths, endOfMonth, format } from 'date-fns'

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      select: { total: true, status: true, paidDate: true, issueDate: true, createdAt: true },
    })

    const totalRevenue   = invoices.reduce((s, i) => s + i.total, 0)
    const totalPaid      = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
    const totalPending   = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.total, 0)
    const totalOverdue   = invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.total, 0)
    const totalDraft     = invoices.filter(i => i.status === 'DRAFT').reduce((s, i) => s + i.total, 0)

    // Status distribution
    const statusCount: Record<string, number> = {}
    invoices.forEach(i => { statusCount[i.status] = (statusCount[i.status] || 0) + 1 })

    // Monthly revenue for last 12 months
    const monthly: { month: string; paid: number; issued: number }[] = []
    for (let m = 11; m >= 0; m--) {
      const date = subMonths(new Date(), m)
      const start = startOfMonth(date)
      const end = endOfMonth(date)
      const monthInvoices = invoices.filter(i => {
        const d = new Date(i.createdAt)
        return d >= start && d <= end
      })
      monthly.push({
        month: format(date, 'MMM yy'),
        issued: monthInvoices.reduce((s, i) => s + i.total, 0),
        paid: monthInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0),
      })
    }

    return NextResponse.json({
      totalRevenue,
      totalPaid,
      totalPending,
      totalOverdue,
      totalDraft,
      invoiceCount: invoices.length,
      statusCount,
      monthly,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
