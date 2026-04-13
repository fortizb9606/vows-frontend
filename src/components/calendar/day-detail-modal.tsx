'use client';

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import type { DateSlotStatus } from '@/types/database';
import type { DateSlot } from '@/types/database';
import { cn } from '@/lib/utils';

interface DayDetailModalProps {
  dateStr: string;
  existingSlot: DateSlot | null;
  onClose: () => void;
  onSave: (status: DateSlotStatus, notes: string) => Promise<void>;
}

const statusOptions: { value: DateSlotStatus; label: string; color: string; description: string }[] = [
  { value: 'AVAILABLE', label: 'Disponible', color: 'bg-green-500', description: 'Abierto para reservas' },
  { value: 'SOFT_BLOCK', label: 'Bloqueo Suave', color: 'bg-yellow-500', description: 'Temporalmente bloqueado' },
  { value: 'RESERVED', label: 'Reservado', color: 'bg-red-500', description: 'Confirmado por una pareja' },
  { value: 'TECHNICAL_BLOCK', label: 'Bloqueo Técnico', color: 'bg-gray-400', description: 'No disponible por razones técnicas' },
  { value: 'MAINTENANCE', label: 'Mantenimiento', color: 'bg-orange-500', description: 'En mantenimiento programado' },
];

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${days[date.getDay()]} ${d} de ${months[m - 1]}, ${y}`;
}

export default function DayDetailModal({ dateStr, existingSlot, onClose, onSave }: DayDetailModalProps) {
  const [status, setStatus] = useState<DateSlotStatus>(existingSlot?.status || 'AVAILABLE');
  const [notes, setNotes] = useState(existingSlot?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(status, notes);
    } finally {
      setSaving(false);
    }
  };

  const isNew = !existingSlot;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isNew ? 'Asignar Estado' : 'Editar Día'}
                </h2>
                <p className="text-sm text-gray-500">{formatDisplayDate(dateStr)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Status selector — radio buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Estado</label>
              <div className="space-y-2">
                {statusOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                      status === opt.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={status === opt.value}
                      onChange={() => setStatus(opt.value)}
                      className="sr-only"
                    />
                    <div className={cn('w-3 h-3 rounded-full flex-shrink-0', opt.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.description}</p>
                    </div>
                    {status === opt.value && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notas <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Reserva para matrimonio Pérez-González"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? 'Guardando...' : isNew ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
