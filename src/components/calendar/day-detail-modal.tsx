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

function parseSlotNotes(notes: string | undefined): {
  price: number;
  pricePerGuest: number;
  coupleName: string;
  guestCount: string;
  text: string;
} {
  if (!notes) return { price: 0, pricePerGuest: 0, coupleName: '', guestCount: '', text: '' };
  try {
    const parsed = JSON.parse(notes);
    return {
      price: parsed.price || 0,
      pricePerGuest: parsed.pricePerGuest || 0,
      coupleName: parsed.coupleName || '',
      guestCount: parsed.guestCount || '',
      text: parsed.text || '',
    };
  } catch {
    // Legacy plain-text notes
    return { price: 0, pricePerGuest: 0, coupleName: '', guestCount: '', text: notes };
  }
}

function formatShortPrice(value: number): string {
  if (value >= 1000000) {
    const m = value / 1000000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
}

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  AVAILABLE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Disponible' },
  SOFT_BLOCK: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bloqueado' },
  RESERVED: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Reservado' },
  TECHNICAL_BLOCK: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Bloqueado' },
  MAINTENANCE: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Mantención' },
};

const quickPrices = [2200000, 3200000, 3800000, 4500000, 5500000];

export default function DayDetailPanel({ dateStr, existingSlot, onClose, onSave }: DayDetailPanelProps) {
  const dayNum = parseInt(dateStr.split('-')[2]);
  const parsed = parseSlotNotes(existingSlot?.notes);
  const currentStatus = existingSlot?.status || 'AVAILABLE';
  const badge = statusBadge[currentStatus] || statusBadge.AVAILABLE;

  const [status, setStatus] = useState<DateSlotStatus>(currentStatus);
  const [price, setPrice] = useState(parsed.price);
  const [pricePerGuest, setPricePerGuest] = useState(parsed.pricePerGuest);
  const [coupleName, setCoupleName] = useState(parsed.coupleName);
  const [guestCount, setGuestCount] = useState(parsed.guestCount);
  const [textNote, setTextNote] = useState(parsed.text);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const notesJson = JSON.stringify({
      price,
      pricePerGuest,
      coupleName,
      guestCount,
      text: textNote,
    });
    try {
      await onSave(status, notesJson);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900">{dayNum}</span>
              <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', badge.bg, badge.text)}>
                {badge.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{formatDisplayDate(dateStr)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Body — scrollable */}
      <div className="p-5 space-y-5 flex-1 overflow-y-auto">
        {/* Estado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
          <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setStatus('AVAILABLE')}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center',
                status === 'AVAILABLE'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              Disponible
            </button>
            <button
              onClick={() => setStatus('SOFT_BLOCK')}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center',
                status === 'SOFT_BLOCK' || status === 'TECHNICAL_BLOCK' || status === 'MAINTENANCE'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              Bloqueado
            </button>
          </div>
          {status === 'RESERVED' && (
            <p className="text-[10px] text-pink-500 mt-1.5 font-medium">Este día está reservado</p>
          )}
        </div>

        {/* Precio del Día */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Precio del Día</label>
          <input
            type="number"
            value={price || ''}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="0"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {/* Quick price buttons */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {quickPrices.map((qp) => (
              <button
                key={qp}
                onClick={() => setPrice(qp)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                  price === qp
                    ? 'bg-[#1B4F72] text-white border-[#1B4F72]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                )}
              >
                {formatShortPrice(qp)}
              </button>
            ))}
          </div>
        </div>

        {/* Precio por invitado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Precio por invitado</label>
          <input
            type="number"
            value={pricePerGuest || ''}
            onChange={(e) => setPricePerGuest(Number(e.target.value))}
            placeholder="0"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Reserva info (only if reserved) */}
        {(status === 'RESERVED' || currentStatus === 'RESERVED') && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Pareja</label>
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="Ej: María & Juan"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Invitados</label>
              <input
                type="text"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="Ej: 180"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              />
            </div>
          </>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
          <textarea
            value={textNote}
            onChange={(e) => setTextNote(e.target.value)}
            placeholder="Notas opcionales..."
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 resize-none"
          />
        </div>

        {/* Ver Vista Publicada */}
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Eye className="w-4 h-4" />
          Ver Vista Publicada
        </button>
      </div>

      {/* Footer — Guardar */}
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
