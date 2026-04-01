'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { DateSlot } from '@/types/database';
import { formatDate, formatCLP, getStatusLabel } from '@/lib/utils';
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
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...slot,
        status,
        computed_price: computedPrice,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Detalles del Día
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <p className="text-base text-gray-900 font-medium">
                {formatDate(slot.date)}
              </p>
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Base
              </label>
              <p className="text-base text-gray-900 font-medium">
                {formatCLP(slot.base_price || 0)}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    statusOptions.find((o) => o.value === status)?.color || 'bg-gray-300'
                  )}
                />
                <span className="text-sm text-gray-600">
                  {statusOptions.find((o) => o.value === status)?.label}
                </span>
              </div>
            </div>

            {/* Computed Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Computado
              </label>
              <div className="flex gap-2">
                <span className="text-gray-600">$</span>
                <input
                  type="number"
                  value={computedPrice}
                  onChange={(e) => setComputedPrice(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
