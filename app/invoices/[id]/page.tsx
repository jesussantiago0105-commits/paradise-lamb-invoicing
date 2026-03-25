'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Download, Mail, CheckCircle, Trash2,
  Edit3, Save, X, Plus, Trash
} from 'lucide-react'
import {
  formatCurrency, formatDate, formatDateInput,
  STATUS_COLORS, STATUS_LABELS, STATUSES
} from '@/lib/utils'

interface Item { id?: string; description: string; quantity: number; unitPrice: number; total: number }
interface Client { id: string; name: string; company: string; email: string; phone: string; address: string; city: string; state: string; zip: string }
interface Invoice {
  id: string; number: string; status: string
  issueDate: string; dueDate: string; paidDate: string | null
  subtotal: number; taxRate: number; taxAmount: number; total: number
  notes: string; client: Client; items: Item[]
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Edit form state
  const [editItems, setEditItems] = useState<Item[]>([])
  const [editStatus, setEditStatus] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editPaidDate, setEditPaidDate] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editTaxRate, setEditTaxRate] = useState(0)
  const [clients, setClients] = useState<Client[]>([])

  const load = () => {
    setLoading(true)
    fetch(`/api/invoices/${id}`)
      .then(r => r.json())
      .then(d => {
        setInvoice(d)
        setEditItems(d.items)
        setEditStatus(d.status)
        setEditDueDate(formatDateInput(d.dueDate))
        setEditPaidDate(d.paidDate ? formatDateInput(d.paidDate) : '')
        setEditNotes(d.notes || '')
        setEditTaxRate(d.taxRate)
        setEmailTo(d.client.email)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { fetch('/api/clients').then(r => r.json()).then(setClients) }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full" />
    </div>
  )
  if (!invoice) return <div className="p-8 text-red-500">Factura no encontrada</div>

  const editSubtotal = editItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const editTaxAmt   = editSubtotal * (editTaxRate / 100)
  const editTotal    = editSubtotal + editTaxAmt

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          dueDate: editDueDate,
          paidDate: editPaidDate || null,
          notes: editNotes,
          taxRate: editTaxRate,
          items: editItems,
          issueDate: invoice.issueDate,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      load()
      setEditing(false)
      setSuccess('Factura actualizada')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  const markPaid = async () => {
    const today = new Date().toISOString().split('T')[0]
    await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...invoice, status: 'PAID', paidDate: today, issueDate: invoice.issueDate, dueDate: invoice.dueDate, items: invoice.items }),
    })
    load()
    setSuccess('Factura marcada como pagada')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta factura permanentemente?')) return
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    router.push('/invoices')
  }

  const sendEmail = async () => {
    setSendingEmail(true)
    setError('')
    try {
      const res = await fetch(`/api/invoices/${id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo, message: emailMsg }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowEmail(false)
      setSuccess(`Factura enviada a ${emailTo}`)
      setTimeout(() => setSuccess(''), 4000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar')
    } finally {
      setSendingEmail(false)
    }
  }

  const addEditItem = () => setEditItems(p => [...p, { description: '', quantity: 1, unitPrice: 0, total: 0 }])
  const removeEditItem = (i: number) => setEditItems(p => p.filter((_, idx) => idx !== i))
  const updateEditItem = (i: number, field: keyof Item, value: string | number) => {
    setEditItems(p => p.map((item, idx) =>
      idx === i ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
    ))
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.number}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[invoice.status]}`}>
                {STATUS_LABELS[invoice.status]}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              {invoice.client.company || invoice.client.name} · Emitida {formatDate(invoice.issueDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {invoice.status !== 'PAID' && (
            <button onClick={markPaid} className="btn-secondary text-green-600 border-green-200 hover:bg-green-50">
              <CheckCircle className="w-4 h-4" />
              Marcar Pagada
            </button>
          )}
          <a href={`/api/invoices/${id}/pdf`} target="_blank" className="btn-secondary">
            <Download className="w-4 h-4" />
            Descargar PDF
          </a>
          <button onClick={() => setShowEmail(true)} className="btn-secondary">
            <Mail className="w-4 h-4" />
            Enviar por Correo
          </button>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-primary">
              <Edit3 className="w-4 h-4" />
              Editar
            </button>
          )}
          <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
      {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{success}</div>}

      {/* Email modal */}
      {showEmail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Enviar Factura por Correo</h3>
              <button onClick={() => setShowEmail(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Para</label>
                <input className="input" value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="email@cliente.com" />
              </div>
              <div>
                <label className="label">Mensaje adicional (opcional)</label>
                <textarea className="input resize-none" rows={4} value={emailMsg} onChange={e => setEmailMsg(e.target.value)}
                  placeholder="Mensaje personalizado..." />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowEmail(false)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={sendEmail} className="btn-primary flex-1" disabled={sendingEmail}>
                  {sendingEmail ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Servicios / Productos</h2>
            </div>

            {editing ? (
              <div className="space-y-3">
                {editItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input className="input flex-1 text-sm" placeholder="Descripción" value={item.description}
                      onChange={e => updateEditItem(i, 'description', e.target.value)} />
                    <input type="number" className="input w-16 text-center text-sm" placeholder="Cant." value={item.quantity}
                      onChange={e => updateEditItem(i, 'quantity', e.target.value)} />
                    <input type="number" className="input w-24 text-right text-sm" placeholder="Precio" value={item.unitPrice}
                      onChange={e => updateEditItem(i, 'unitPrice', e.target.value)} />
                    <span className="text-sm font-semibold text-gray-700 self-center w-20 text-right">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    {editItems.length > 1 && (
                      <button type="button" onClick={() => removeEditItem(i)} className="text-gray-300 hover:text-red-400 self-center">
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addEditItem} className="btn-secondary text-xs">
                  <Plus className="w-3.5 h-3.5" />Agregar ítem
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs text-gray-500 font-semibold pb-2">Descripción</th>
                    <th className="text-center text-xs text-gray-500 font-semibold pb-2 w-16">Cant.</th>
                    <th className="text-right text-xs text-gray-500 font-semibold pb-2 w-24">Precio Unit.</th>
                    <th className="text-right text-xs text-gray-500 font-semibold pb-2 w-24">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 text-gray-700">{item.description}</td>
                      <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-2.5 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Totals */}
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
              {editing ? (
                <div className="flex items-center gap-3 mb-3">
                  <label className="label mb-0 w-24 shrink-0">Impuesto %</label>
                  <input type="number" min="0" max="100" step="0.1" className="input w-24 text-sm"
                    value={editTaxRate} onChange={e => setEditTaxRate(Number(e.target.value))} />
                </div>
              ) : null}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(editing ? editSubtotal : invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Impuesto ({editing ? editTaxRate : invoice.taxRate}%)</span>
                <span>{formatCurrency(editing ? editTaxAmt : invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="text-brand-600">{formatCurrency(editing ? editTotal : invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Notas</h2>
            {editing ? (
              <textarea className="input resize-none" rows={3} value={editNotes}
                onChange={e => setEditNotes(e.target.value)} placeholder="Términos, instrucciones..." />
            ) : (
              <p className="text-sm text-gray-600">{invoice.notes || 'Sin notas'}</p>
            )}
          </div>

          {editing && (
            <div className="flex justify-end gap-3">
              <button onClick={() => { setEditing(false); load() }} className="btn-secondary">
                <X className="w-4 h-4" />Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="space-y-4">
          {/* Status */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Estatus</h3>
            {editing ? (
              <select className="input" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            ) : (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[invoice.status]}`}>
                {STATUS_LABELS[invoice.status]}
              </span>
            )}
          </div>

          {/* Dates */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Fechas</h3>
            <div>
              <p className="text-xs text-gray-400 mb-1">Emitida</p>
              <p className="text-sm font-medium">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Vencimiento</p>
              {editing ? (
                <input type="date" className="input text-sm" value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)} />
              ) : (
                <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Fecha de pago</p>
              {editing ? (
                <input type="date" className="input text-sm" value={editPaidDate}
                  onChange={e => setEditPaidDate(e.target.value)} />
              ) : (
                <p className="text-sm font-medium">{invoice.paidDate ? formatDate(invoice.paidDate) : '—'}</p>
              )}
            </div>
          </div>

          {/* Client */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Cliente</h3>
            <p className="font-semibold text-gray-900">{invoice.client.company || invoice.client.name}</p>
            {invoice.client.company && <p className="text-sm text-gray-500">{invoice.client.name}</p>}
            <p className="text-sm text-gray-500 mt-1">{invoice.client.email}</p>
            <p className="text-sm text-gray-500">{invoice.client.phone}</p>
            {invoice.client.address && <p className="text-sm text-gray-500 mt-1">{invoice.client.address}, {invoice.client.city}</p>}
          </div>

          {/* Total summary */}
          <div className="card p-5 bg-brand-50 border-brand-100">
            <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-1">Total</p>
            <p className="text-3xl font-bold text-brand-600">{formatCurrency(invoice.total)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
