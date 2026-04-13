'use client';

import { useState } from 'react';
import { X, Eye } from 'lucide-react';
import type { DateSlotStatus, DateSlot } from '@/types/database';
import { cn } from '@/lib/utils';

interface DayDetailPanelProps {
  dateStr: string;
  existingSlot: DateSlot | null;
  onClose: () => void;
  onSave: (status: DateSlotStatus, notes: string) => Promise<void>;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${days[date.getDay()]}, ${months[m - 1]}`;
}

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  AVAILABLE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Disponible' },
  SOFT_BLOCK: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bloqueado' },
  RESERVED: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Reservado' },
  TECHNICAL_BLOCK: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Bloqueado' },
  MAINTENANCE: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Mantención' },
};

export default function DayDetailPanel({ dateStr, existingSlot, onClose, onSave }: DayDetailPanelProps) {
  const dayNum = dateStr.split('-')[2];
  const currentStatus = existingSlot?.status || 'AVAILABLE';
  const badge = statusBadge[currentStatus] || statusBadge.AVAILABLE;

  const [status, setStatus] = useState<DateSlotStatus>(currentStatus);
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

  // Simplified status: Disponible, Reservado, or Bloqueado
  const statusTabs: { value: DateSlotStatus; label: string }[] = [
    { value: 'AVAILABLE', label: 'Disponible' },
    { value: 'RESERVED', label: 'Reservado' },
    { value: 'SOFT_BLOCK', label: 'Bloqueado' },
  ];

  return (
    <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900">{parseInt(dayNum)}</span>
              <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', badge.bg, badge.text)}>
                {badge.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{formatDisplayDate(dateStr)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5 flex-1 overflow-y-auto">
        {/* Estado — tab buttons */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                className={cn(
                  'px-2 py-2 rounded-lg text-xs font-semibold transition-all text-center',
                  status === tab.value
                    ? tab.value === 'AVAILABLE'
                      ? 'bg-green-500 text-white shadow-sm'
                      : tab.value === 'RESERVED'
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes / Couple info */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {status === 'RESERVED' ? 'Pareja / Detalle' : 'Notas'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              status === 'RESERVED'
                ? 'Ej: María & Juan|180inv'
                : 'Notas opcionales...'
            }
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 resize-none"
          />
          {status === 'RESERVED' && (
            <p className="text-[10px] text-gray-400 mt-1">Formato: Nombre Pareja|100inv</p>
          )}
        </div>

        {/* Quick info for reserved */}
        {existingSlot && existingSlot.status === 'RESERVED' && existingSlot.notes && (
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-pink-700 mb-1">Reserva actual</p>
            <p className="text-sm text-pink-800">{existingSlot.notes.split('|')[0]}</p>
            {existingSlot.notes.split('|')[1] && (
              <p className="text-xs text-pink-600 mt-0.5">{existingSlot.notes.split('|')[1]}</p>
            )}
          </div>
        )}

        {/* View published button */}
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Eye className="w-4 h-4" />
          Ver Vista Publicada
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-3 bg-[#1B4F72] text-white font-semibold rounded-xl hover:bg-[#163d5a] transition-colors disabled:opacity-50 text-sm"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
