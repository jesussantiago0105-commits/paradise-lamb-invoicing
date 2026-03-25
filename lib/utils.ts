import { format } from 'date-fns'

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateInput(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd')
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-gray-100 text-gray-600',
  PENDING:   'bg-yellow-100 text-yellow-700',
  PAID:      'bg-green-100 text-green-700',
  OVERDUE:   'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT:     'Borrador',
  PENDING:   'Pendiente',
  PAID:      'Pagada',
  OVERDUE:   'Vencida',
  CANCELLED: 'Cancelada',
}

export const STATUSES = ['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED']
