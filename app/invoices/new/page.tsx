'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDateInput } from '@/lib/utils'

interface Client { id: string; name: string; company: string; email: string }
interface Item { description: string; quantity: number; unitPrice: number }

export default function NewInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const today = formatDateInput(new Date())
  const due = formatDateInput(new Date(Date.now() + 30 * 86400000))

  const [form, setForm] = useState({
    clientId: '',
    status: 'PENDING',
    issueDate: today,
    dueDate: due,
    taxRate: 0,
    notes: '',
  })
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unitPrice: 0 }])

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxAmt   = subtotal * (form.taxRate / 100)
  const total    = subtotal + taxAmt

  const addItem = () => setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }])

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

  const updateItem = (idx: number, field: keyof Item, value: string | number) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientId) { setError('Selecciona un cliente'); return }
    if (items.some(i => !i.description)) { setError('Todos los ítems deben tener descripción'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      router.push(`/invoices/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear factura')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/invoices" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Factura</h1>
          <p className="text-gray-500 text-sm mt-0.5">Completa los datos para generar la factura</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        {/* Client & Status */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Cliente *</label>
              <select
                className="input"
                value={form.clientId}
                onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} — ${c.name}` : c.name}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  No hay clientes.{' '}
                  <Link href="/clients" className="underline">Agrega uno primero.</Link>
                </p>
              )}
            </div>
            <div>
              <label className="label">Estatus</label>
              <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="DRAFT">Borrador</option>
                <option value="PENDING">Pendiente</option>
              </select>
            </div>
            <div>
              <label className="label">Impuesto (%)</label>
              <input type="number" min="0" max="100" step="0.1" className="input"
                value={form.taxRate} onChange={e => setForm(p => ({ ...p, taxRate: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Fecha de emisión</label>
              <input type="date" className="input" value={form.issueDate}
                onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Fecha de vencimiento</label>
              <input type="date" className="input" value={form.dueDate}
                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} required />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Servicios / Productos</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-semibold pb-2 pr-3">Descripción</th>
                  <th className="text-center text-xs text-gray-500 font-semibold pb-2 px-2 w-20">Cant.</th>
                  <th className="text-right text-xs text-gray-500 font-semibold pb-2 px-2 w-28">Precio Unit.</th>
                  <th className="text-right text-xs text-gray-500 font-semibold pb-2 pl-2 w-24">Total</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-3">
                      <input className="input text-sm" placeholder="Descripción del servicio"
                        value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} required />
                    </td>
                    <td className="py-2 px-2">
                      <input type="number" min="0.01" step="0.01" className="input text-center text-sm"
                        value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                    </td>
                    <td className="py-2 px-2">
                      <input type="number" min="0" step="0.01" className="input text-right text-sm"
                        value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} />
                    </td>
                    <td className="py-2 pl-2 text-right font-semibold text-gray-700">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-2 pl-2">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)}
                          className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={addItem} className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" />
            Agregar ítem
          </button>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Impuesto ({form.taxRate}%)</span>
              <span>${taxAmt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span className="text-brand-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-6">
          <label className="label">Notas (opcional)</label>
          <textarea className="input resize-none" rows={3} placeholder="Términos de pago, instrucciones especiales..."
            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/invoices" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creando...' : 'Crear Factura'}
          </button>
        </div>
      </form>
    </div>
  )
}
