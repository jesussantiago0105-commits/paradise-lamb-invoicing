'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Plus, Download, Mail, Search, Filter } from 'lucide-react'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS, STATUSES } from '@/lib/utils'

interface Invoice {
  id: string
  number: string
  status: string
  issueDate: string
  dueDate: string
  total: number
  client: { name: string; company: string }
}

function InvoicesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const statusFilter = searchParams.get('status') || 'ALL'

  const load = () => {
    setLoading(true)
    const qs = statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''
    fetch(`/api/invoices${qs}`)
      .then(r => r.json())
      .then(d => { setInvoices(d); setLoading(false) })
  }

  useEffect(() => { load() }, [statusFilter])

  const filtered = invoices.filter(inv => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      inv.number.toLowerCase().includes(q) ||
      inv.client.name.toLowerCase().includes(q) ||
      inv.client.company.toLowerCase().includes(q)
    )
  })

  const setStatus = (s: string) => {
    const url = s === 'ALL' ? '/invoices' : `/invoices?status=${s}`
    router.push(url)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-500 text-sm mt-1">{invoices.length} facturas en total</p>
        </div>
        <Link href="/invoices/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva Factura
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por número, cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {['ALL', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'ALL' ? 'Todas' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No hay facturas</p>
            <Link href="/invoices/new" className="mt-4 btn-primary text-xs">Crear primera factura</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Número</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Emitida</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Vence</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Total</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Estatus</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/invoices/${inv.id}`} className="font-semibold text-brand-600 hover:text-brand-700 text-sm">
                      {inv.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-800">{inv.client.company || inv.client.name}</p>
                    {inv.client.company && <p className="text-xs text-gray-400">{inv.client.name}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{formatDate(inv.issueDate)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{formatDate(inv.dueDate)}</td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-gray-900">{formatCurrency(inv.total)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status]}`}>
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/api/invoices/${inv.id}/pdf`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <Link href={`/invoices/${inv.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors" title="Ver factura">
                        <FileText className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesContent />
    </Suspense>
  )
}
