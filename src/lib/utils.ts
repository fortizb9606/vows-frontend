import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount as Chilean pesos (CLP)
 * Input is in centavos, display as pesos with proper formatting
 */
export function formatCLP(amount: number): string {
  const pesos = amount / 100;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pesos);
}

/**
 * Format date string to Spanish format (dd MMM yyyy)
 */
export function formatDate(date: string): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Format date string with time to Spanish format (dd MMM yyyy HH:mm)
 */
export function formatDateTime(date: string): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Get Tailwind color classes based on status
 */
export function getStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  const statusMap: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    // Booking statuses
    VISIT_SCHEDULED: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    BUDGET_SENT: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    CONTRACT_SIGNED: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    DEPOSIT_PAID: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    EVENT_CLOSED: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
    CANCELLED: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    // Lead statuses
    NEW: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
    },
    QUALIFIED: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    NURTURING: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    CONVERTED: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    LOST: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    // Date slot statuses
    AVAILABLE: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    SOFT_BLOCK: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    RESERVED: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
    TECHNICAL_BLOCK: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
    },
    MAINTENANCE: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    // Payment statuses
    PENDING: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    PAID: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    OVERDUE: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    REFUNDED: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
  };

  return (
    statusMap[status] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
    }
  );
}

/**
 * Get Spanish label for status
 */
export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    // Booking statuses
    VISIT_SCHEDULED: 'Visita Programada',
    BUDGET_SENT: 'Presupuesto Enviado',
    CONTRACT_SIGNED: 'Contrato Firmado',
    DEPOSIT_PAID: 'Depósito Pagado',
    EVENT_CLOSED: 'Evento Cerrado',
    CANCELLED: 'Cancelado',
    // Lead statuses
    NEW: 'Nuevo',
    QUALIFIED: 'Calificado',
    NURTURING: 'En Seguimiento',
    CONVERTED: 'Convertido',
    LOST: 'Perdido',
    // Date slot statuses
    AVAILABLE: 'Disponible',
    SOFT_BLOCK: 'Bloqueado Blando',
    RESERVED: 'Reservado',
    TECHNICAL_BLOCK: 'Bloqueado Técnico',
    MAINTENANCE: 'Mantenimiento',
    // Payment statuses
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    OVERDUE: 'Vencido',
    REFUNDED: 'Reembolsado',
  };

  return labelMap[status] || status;
}
