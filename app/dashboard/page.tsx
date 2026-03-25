'use client'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { DollarSign, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface DashboardData {
  totalRevenue: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
  invoiceCount: number
  statusCount: Record<string, number>
  monthly: { month: string; issued: number; paid: number }[]
}

const PIE_COLORS: Record<string, string> = {
  PAID:      '#7BB829',
  PENDING:   '#F59E0B',
  OVERDUE:   '#EF4444',
  DRAFT:     '#9CA3AF',
  CANCELLED: '#D1D5DB',
}

const STATUS_ES: Record<string, string> = {
  PAID:      'Pagadas',
  PENDING:   'Pendientes',
  OVERDUE:   'Vencidas',
  DRAFT:     'Borradores',
  CANCELLED: 'Canceladas',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full" />
    </div>
  )

  if (!data) return <div className="p-8 text-red-500">Error cargando dashboard</div>

  const pieData = Object.entries(data.statusCount).map(([k, v]) => ({
    name: STATUS_ES[k] || k,
    value: v,
    color: PIE_COLORS[k] || '#ccc',
  }))

  const stats = [
    {
      label: 'Total Facturado',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      color: 'bg-brand-400',
      sub: `${data.invoiceCount} facturas`,
    },
    {
      label: 'Cobrado',
      value: formatCurrency(data.totalPaid),
      icon: CheckCircle,
      color: 'bg-green-500',
      sub: `${data.statusCount['PAID'] || 0} facturas`,
    },
    {
      label: 'Pendiente',
      value: formatCurrency(data.totalPending),
      icon: Clock,
      color: 'bg-yellow-400',
      sub: `${data.statusCount['PENDING'] || 0} facturas`,
    },
    {
      label: 'Vencido',
      value: formatCurrency(data.totalOverdue),
      icon: AlertTriangle,
      color: 'bg-red-500',
      sub: `${data.statusCount['OVERDUE'] || 0} facturas`,
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de tu actividad de facturación</p>
        </div>
        <Link href="/invoices/new" className="btn-primary">
          <FileText className="w-4 h-4" />
          Nueva Factura
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card p-5 flex items-start gap-4">
            <div className={`${color} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Bar chart */}
        <div className="card p-6 xl:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-1">Ingresos mensuales</h2>
          <p className="text-xs text-gray-400 mb-5">Últimos 12 meses</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthly} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number, name: string) => [formatCurrency(v), name === 'issued' ? 'Emitido' : 'Cobrado']}
                labelStyle={{ fontWeight: 600, color: '#374151' }}
                contentStyle={{ border: 'none', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}
              />
              <Bar dataKey="issued" fill="#dbeafe" radius={[4, 4, 0, 0]} name="issued" />
              <Bar dataKey="paid"   fill="#7BB829" radius={[4, 4, 0, 0]} name="paid" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-brand-400 inline-block" /> Cobrado
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-blue-100 inline-block" /> Emitido
            </span>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Por estatus</h2>
          <p className="text-xs text-gray-400 mb-3">Distribución de facturas</p>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Sin datos aún</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
                />
                <Tooltip
                  formatter={(v: number) => [v, 'Facturas']}
                  contentStyle={{ border: 'none', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/invoices?status=OVERDUE" className="card p-4 hover:border-red-200 transition-colors group">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 group-hover:text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Facturas Vencidas</p>
              <p className="text-xs text-gray-400">{data.statusCount['OVERDUE'] || 0} requieren atención</p>
            </div>
          </div>
        </Link>
        <Link href="/invoices?status=PENDING" className="card p-4 hover:border-yellow-200 transition-colors group">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-400 group-hover:text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Por Cobrar</p>
              <p className="text-xs text-gray-400">{data.statusCount['PENDING'] || 0} pendientes</p>
            </div>
          </div>
        </Link>
        <Link href="/clients" className="card p-4 hover:border-brand-200 transition-colors group">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-brand-400 group-hover:text-brand-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Clientes</p>
              <p className="text-xs text-gray-400">Administrar directorio</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
