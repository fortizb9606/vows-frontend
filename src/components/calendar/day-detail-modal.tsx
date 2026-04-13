'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { DateSlot } from '@/types/database';
import { formatDate, formatCLP } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DayDetailModalProps {
  slot: DateSlot;
  onClose: () => void;
  onSave: (slot: DateSlot) => void;
}

const statusOptions = [
  { value: 'AVAILABLE', label: 'Disponible', color: 'bg-green-500' },
  { value: 'SOFT_BLOCK', label: 'Bloqueo Suave', color: 'bg-yellow-500' },
  { value: 'RESERVED', label: 'Reservado', color: 'bg-red-500' },
  { value: 'TECHNICAL_BLOCK', label: 'Bloqueo Técnico', color: 'bg-gray-400' },
  { value: 'MAINTENANCE', label: 'Mantenimiento', color: 'bg-orange-500' },
];

export default function DayDetailModal({ slot, onClose, onSave }: DayDetailModalProps) {
  const [status, setStatus] = useState(slot.status);
  const [computedPrice, setComputedPrice] = useState(slot.computed_price || slot.base_price || 0);
  const [notes, setNotes] = useState(slot.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...slot,
        status,
        computed_price: computedPrice,
        notes,
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedStatusOption = statusOptions.find((o) => o.value === status);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">
              Detalles del Día
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Fecha
              </label>
              <p className="text-base text-gray-900 font-semibold">
                {formatDate(slot.date)}
              </p>
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Precio Base
              </label>
              <p className="text-base text-gray-900 font-semibold">
                {formatCLP(slot.base_price || 0)}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Estado
              </label>
              <div className="space-y-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 font-medium"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2.5 pl-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full flex-shrink-0',
                      selectedStatusOption?.color || 'bg-gray-300'
                    )}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedStatusOption?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Computed Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Precio Ajustado
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">$</span>
                <input
                  type="number"
                  value={computedPrice}
                  onChange={(e) => setComputedPrice(Number(e.target.value))}
                  className="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 font-medium"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade notas sobre este día..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
