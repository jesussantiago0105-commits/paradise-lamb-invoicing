'use client'
import { useEffect, useState } from 'react'
import { Save, Building, Mail, Globe } from 'lucide-react'

interface Settings {
  agencyName: string; address: string; city: string; state: string
  zip: string; country: string; phone: string; email: string
  website: string; taxId: string; defaultTaxRate: number
  currency: string; invoicePrefix: string; nextInvoiceNumber: number
  smtpHost: string; smtpPort: number; smtpUser: string
  smtpPass: string; smtpFrom: string
}

const DEFAULTS: Settings = {
  agencyName: 'Paradise Lamb Agency', address: '', city: '', state: '',
  zip: '', country: 'MX', phone: '', email: '', website: '', taxId: '',
  defaultTaxRate: 0, currency: 'USD', invoicePrefix: 'INV', nextInvoiceNumber: 1001,
  smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', smtpFrom: '',
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { setForm(d); setLoading(false) })
  }, [])

  const set = (field: keyof Settings, value: string | number) =>
    setForm(p => ({ ...p, [field]: value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSuccess('Configuración guardada correctamente')
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">Datos de tu agencia y configuración del sistema</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />{success}
          </div>
        )}

        {/* Agency info */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building className="w-5 h-5 text-brand-400" />
            <h2 className="font-semibold text-gray-800">Información de la Agencia</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre de la Agencia</label>
              <input className="input" value={form.agencyName} onChange={e => set('agencyName', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Dirección</label>
              <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Calle y número" />
            </div>
            <div>
              <label className="label">Ciudad</label>
              <input className="input" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className="label">Estado</label>
              <input className="input" value={form.state} onChange={e => set('state', e.target.value)} />
            </div>
            <div>
              <label className="label">Código Postal</label>
              <input className="input" value={form.zip} onChange={e => set('zip', e.target.value)} />
            </div>
            <div>
              <label className="label">País</label>
              <input className="input" value={form.country} onChange={e => set('country', e.target.value)} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Email de la Agencia</label>
              <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Sitio Web</label>
              <input className="input" value={form.website} onChange={e => set('website', e.target.value)} placeholder="www.paradiselamb.com" />
            </div>
            <div>
              <label className="label">RFC / Tax ID</label>
              <input className="input" value={form.taxId} onChange={e => set('taxId', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Invoice settings */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-brand-400" />
            <h2 className="font-semibold text-gray-800">Configuración de Facturas</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prefijo de Factura</label>
              <input className="input" value={form.invoicePrefix} onChange={e => set('invoicePrefix', e.target.value)} placeholder="INV" />
            </div>
            <div>
              <label className="label">Próximo número</label>
              <input type="number" className="input" value={form.nextInvoiceNumber}
                onChange={e => set('nextInvoiceNumber', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Impuesto por defecto (%)</label>
              <input type="number" min="0" max="100" step="0.1" className="input"
                value={form.defaultTaxRate} onChange={e => set('defaultTaxRate', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Moneda</label>
              <select className="input" value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="USD">USD — Dólar</option>
                <option value="MXN">MXN — Peso Mexicano</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* SMTP */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-brand-400" />
            <h2 className="font-semibold text-gray-800">Configuración de Correo (SMTP)</h2>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Para Gmail: usa una <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-brand-500 underline">contraseña de aplicación</a>.
            Host: smtp.gmail.com, Puerto: 587.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Servidor SMTP</label>
              <input className="input" value={form.smtpHost} onChange={e => set('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="label">Puerto</label>
              <input type="number" className="input" value={form.smtpPort} onChange={e => set('smtpPort', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Usuario (email)</label>
              <input className="input" value={form.smtpUser} onChange={e => set('smtpUser', e.target.value)} placeholder="tu@gmail.com" />
            </div>
            <div>
              <label className="label">Contraseña / App Password</label>
              <input type="password" className="input" value={form.smtpPass} onChange={e => set('smtpPass', e.target.value)} placeholder="••••••••••••••••" />
            </div>
            <div className="col-span-2">
              <label className="label">Nombre del remitente</label>
              <input className="input" value={form.smtpFrom} onChange={e => set('smtpFrom', e.target.value)}
                placeholder="Paradise Lamb Agency <agencia@paradiselamb.com>" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary px-8">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}
