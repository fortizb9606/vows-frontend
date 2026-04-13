import type { DateSlot } from '@/types/database';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  slots: DateSlot[];
  month: number;
  year: number;
  selectedDateStr: string | null;
  onDayClick: (dateStr: string, existingSlot: DateSlot | null) => void;
}

const statusStyles: Record<string, { bg: string; border: string; text: string; priceText: string }> = {
  AVAILABLE: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', priceText: 'text-green-600' },
  SOFT_BLOCK: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', priceText: 'text-orange-600' },
  RESERVED: { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-700', priceText: 'text-pink-600' },
  TECHNICAL_BLOCK: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-600', priceText: 'text-gray-500' },
  MAINTENANCE: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', priceText: 'text-orange-600' },
};

// Parse JSON notes to extract price and couple info
function parseNotes(notes: string | undefined): {
  price: number;
  coupleName: string;
  guestCount: string;
} {
  if (!notes) return { price: 0, coupleName: '', guestCount: '' };
  try {
    const p = JSON.parse(notes);
    return {
      price: p.price || 0,
      coupleName: p.coupleName || '',
      guestCount: p.guestCount || '',
    };
  } catch {
    return { price: 0, coupleName: '', guestCount: '' };
  }
}

function formatShortPrice(value: number): string {
  if (value >= 1000000) {
    const m = value / 1000000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  if (value > 0) return `$${value}`;
  return '';
}

export default function CalendarGrid({ slots, month, year, selectedDateStr, onDayClick }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const slotMap: Record<string, DateSlot> = {};
  slots.forEach((s) => { slotMap[s.date.split('T')[0]] = s; });

  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const cells: (number | null)[] = [];
  for (let i = 0; i < adjustedFirstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((wd) => (
          <div key={wd} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`e-${idx}`} className="aspect-[4/3] rounded-lg" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const slot = slotMap[dateStr] || null;
          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = dateStr === selectedDateStr;
          const style = slot ? statusStyles[slot.status] : null;

          const parsed = slot ? parseNotes(slot.notes) : null;
          const priceLabel = parsed?.price ? formatShortPrice(parsed.price) : '';
          const isReserved = slot?.status === 'RESERVED';
          const isBlocked = slot?.status === 'SOFT_BLOCK' || slot?.status === 'TECHNICAL_BLOCK' || slot?.status === 'MAINTENANCE';

          return (
            <button
              key={`d-${day}`}
              onClick={() => onDayClick(dateStr, slot)}
              className={cn(
                'aspect-[4/3] rounded-lg border-2 px-1 py-1.5 transition-all flex flex-col items-center justify-start gap-0 relative overflow-hidden',
                isSelected && 'ring-2 ring-blue-500 ring-offset-1',
                isToday && !isSelected && 'ring-2 ring-blue-300 ring-offset-1',
                slot
                  ? cn(style?.bg, style?.border, 'hover:shadow-md cursor-pointer')
                  : 'bg-white border-gray-200 hover:border-gray-400 cursor-pointer'
              )}
            >
              {/* Day number */}
              <span className={cn(
                'text-sm font-bold leading-none',
                isToday ? 'text-blue-600' : slot ? style?.text : 'text-gray-700'
              )}>
                {day}
              </span>

              {/* Reserved: couple name + guests */}
              {isReserved && parsed?.coupleName && (
                <span className="text-[8px] font-semibold text-pink-700 leading-tight truncate w-full text-center mt-0.5">
                  {parsed.coupleName}
                </span>
              )}
              {isReserved && parsed?.guestCount && (
                <span className="text-[7px] text-pink-500 leading-tight">
                  {parsed.guestCount}inv
                </span>
              )}

              {/* Blocked icon */}
              {isBlocked && (
                <svg className="w-3.5 h-3.5 text-orange-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}

              {/* Price — shown at bottom */}
              {priceLabel && !isBlocked && (
                <span className={cn(
                  'text-[10px] font-bold leading-none mt-auto',
                  slot ? style?.priceText : 'text-gray-500'
                )}>
                  {priceLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
