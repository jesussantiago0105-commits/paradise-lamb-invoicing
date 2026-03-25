'use client'
import { useEffect, useState } from 'react'
import { Plus, Users, Edit2, Trash2, FileText, X, Save } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  notes: string
  _count?: { invoices: number }
}

const EMPTY: Omit<Client, 'id' | '_count'> = {
  name: '', company: '', email: '', phone: '',
  address: '', city: '', state: '', zip: '', country: 'US', notes: '',
}

export default function ClientsPage() {
  const [clients, setClients]   = useState<Client[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<Client | null>(null)
  const [form, setForm]         = useState({ ...EMPTY })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const load = () => {
    fetch('/api/clients').then(r => r.json()).then(d => { setClients(d); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setForm({ ...EMPTY }); setEditing(null); setShowForm(true); setError('') }
  const openEdit = (c: Client) => {
    setForm({ name: c.name, company: c.company, email: c.email, phone: c.phone,
              address: c.address, city: c.city, state: c.state, zip: c.zip,
              country: c.country, notes: c.notes })
    setEditing(c)
    setShowForm(true)
    setError('')
  }

  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const url    = editing ? `/api/clients/${editing.id}` : '/api/clients'
      const method = editing ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al guardar')
      load(); closeForm()
    } catch {
      setError('Error al guardar cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (c: Client) => {
    if (!confirm(`¿Eliminar a ${c.name}? Sus facturas quedarán huérfanas.`)) return
    await fetch(`/api/clients/${c.id}`, { method: 'DELETE' })
    load()
  }

  const set = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} clientes registrados</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full" />
        </div>
      ) : clients.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24">
          <Users className="w-14 h-14 text-gray-200 mb-4" />
          <p className="text-gray-400 text-sm mb-4">No hay clientes registrados</p>
          <button onClick={openNew} className="btn-primary">Agregar primer cliente</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(c => (
            <div key={c.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{c.company || c.name}</p>
                  {c.company && <p className="text-sm text-gray-500 truncate">{c.name}</p>}
                  <p className="text-sm text-gray-400 mt-1 truncate">{c.email}</p>
                  {c.phone && <p className="text-sm text-gray-400 truncate">{c.phone}</p>}
                  {c.city && <p className="text-sm text-gray-400 truncate">{[c.city, c.state].filter(Boolean).join(', ')}</p>}
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {c._count?.invoices || 0} facturas
                </span>
                <Link href={`/invoices?clientId=${c.id}`} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  Ver facturas
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-gray-900 text-lg">{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button onClick={closeForm}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre *</label>
                  <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="John Doe" />
                </div>
                <div>
                  <label className="label">Empresa</label>
                  <input className="input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Empresa LLC" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="email@empresa.com" />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
                </div>
                <div className="col-span-2">
                  <label className="label">Dirección</label>
                  <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
                </div>
                <div>
                  <label className="label">Ciudad</label>
                  <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Atlanta" />
                </div>
                <div>
                  <label className="label">Estado / Prov.</label>
                  <input className="input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="GA" />
                </div>
                <div>
                  <label className="label">CP</label>
                  <input className="input" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="30075" />
                </div>
                <div>
                  <label className="label">País</label>
                  <input className="input" value={form.country} onChange={e => set('country', e.target.value)} placeholder="US" />
                </div>
                <div className="col-span-2">
                  <label className="label">Notas internas</label>
                  <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas sobre el cliente..." />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={closeForm} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
