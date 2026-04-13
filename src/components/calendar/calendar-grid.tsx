import type { DateSlot } from '@/types/database';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  slots: DateSlot[];
  month: number;
  year: number;
  selectedDateStr: string | null;
  onDayClick: (dateStr: string, existingSlot: DateSlot | null) => void;
}

// Stronger, more visible color palettes per status
const statusStyles: Record<string, {
  bg: string; darkBg: string;
  border: string; darkBorder: string;
  text: string; darkText: string;
  priceText: string; darkPriceText: string;
  badge: string; darkBadge: string;
}> = {
  AVAILABLE: {
    bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-900/40',
    border: 'border-emerald-400', darkBorder: 'dark:border-emerald-600',
    text: 'text-emerald-800', darkText: 'dark:text-emerald-300',
    priceText: 'text-emerald-700', darkPriceText: 'dark:text-emerald-400',
    badge: 'bg-emerald-500', darkBadge: 'dark:bg-emerald-600',
  },
  SOFT_BLOCK: {
    bg: 'bg-amber-100', darkBg: 'dark:bg-amber-900/40',
    border: 'border-amber-400', darkBorder: 'dark:border-amber-600',
    text: 'text-amber-800', darkText: 'dark:text-amber-300',
    priceText: 'text-amber-700', darkPriceText: 'dark:text-amber-400',
    badge: 'bg-amber-500', darkBadge: 'dark:bg-amber-600',
  },
  RESERVED: {
    bg: 'bg-rose-100', darkBg: 'dark:bg-rose-900/40',
    border: 'border-rose-400', darkBorder: 'dark:border-rose-500',
    text: 'text-rose-800', darkText: 'dark:text-rose-300',
    priceText: 'text-rose-700', darkPriceText: 'dark:text-rose-400',
    badge: 'bg-rose-500', darkBadge: 'dark:bg-rose-600',
  },
  TECHNICAL_BLOCK: {
    bg: 'bg-gray-200', darkBg: 'dark:bg-gray-700',
    border: 'border-gray-400', darkBorder: 'dark:border-gray-500',
    text: 'text-gray-700', darkText: 'dark:text-gray-300',
    priceText: 'text-gray-600', darkPriceText: 'dark:text-gray-400',
    badge: 'bg-gray-500', darkBadge: 'dark:bg-gray-600',
  },
  MAINTENANCE: {
    bg: 'bg-amber-100', darkBg: 'dark:bg-amber-900/40',
    border: 'border-amber-400', darkBorder: 'dark:border-amber-600',
    text: 'text-amber-800', darkText: 'dark:text-amber-300',
    priceText: 'text-amber-700', darkPriceText: 'dark:text-amber-400',
    badge: 'bg-amber-500', darkBadge: 'dark:bg-amber-600',
  },
};

// Parse JSON notes to extract price and couple info
function parseNotes(notes: string | undefined): {
  price: number;
  pricePerGuest: number;
  coupleName: string;
  guestCount: string;
} {
  if (!notes) return { price: 0, pricePerGuest: 0, coupleName: '', guestCount: '' };
  try {
    const p = JSON.parse(notes);
    return {
      price: p.price || 0,
      pricePerGuest: p.pricePerGuest || 0,
      coupleName: p.coupleName || '',
      guestCount: p.guestCount || '',
    };
  } catch {
    return { price: 0, pricePerGuest: 0, coupleName: '', guestCount: '' };
  }
}

function formatShortPrice(value: number): string {
  if (value >= 1000000) {
    const m = value / 1000000;
    const formatted = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace('.', ',');
    return `$${formatted}M`;
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
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {weekDays.map((wd) => (
          <div key={wd} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-1.5">
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
                'aspect-[4/3] rounded-lg border-2 px-1.5 py-1.5 transition-all flex flex-col items-start justify-between relative overflow-hidden cursor-pointer group',
                // Selected state
                isSelected && 'ring-2 ring-[#1B4F72] ring-offset-2 dark:ring-offset-gray-800 shadow-lg scale-[1.02]',
                // Today highlight
                isToday && !isSelected && 'ring-2 ring-blue-400 ring-offset-1 dark:ring-blue-500 dark:ring-offset-gray-800',
                // Status-based coloring
                slot
                  ? cn(
                      style?.bg, style?.darkBg,
                      style?.border, style?.darkBorder,
                      'hover:shadow-md hover:scale-[1.01]'
                    )
                  : cn(
                      'bg-white dark:bg-gray-800',
                      'border-gray-200 dark:border-gray-600',
                      'hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                    )
              )}
            >
              {/* Top row: day number + status dot */}
              <div className="flex items-center justify-between w-full">
                <span className={cn(
                  'text-sm font-bold leading-none',
                  isToday
                    ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'
                    : slot
                      ? cn(style?.text, style?.darkText)
                      : 'text-gray-700 dark:text-gray-300'
                )}>
                  {day}
                </span>
                {/* Small colored status dot */}
                {slot && (
                  <span className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    style?.badge, style?.darkBadge
                  )} />
                )}
              </div>

              {/* Middle content */}
              <div className="flex flex-col items-start w-full min-h-0 flex-1 justify-center">
                {/* Reserved: couple name */}
                {isReserved && parsed?.coupleName && (
                  <span className={cn(
                    'text-[9px] font-semibold leading-tight truncate w-full',
                    style?.text, style?.darkText
                  )}>
                    {parsed.coupleName}
                  </span>
                )}
                {/* Reserved: guest count */}
                {isReserved && parsed?.guestCount && (
                  <span className="text-[8px] text-rose-500 dark:text-rose-400 leading-tight">
                    {parsed.guestCount} inv.
                  </span>
                )}

                {/* Blocked icon */}
                {isBlocked && (
                  <div className="flex items-center justify-center w-full">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Bottom: Price tag — always visible if price exists */}
              {priceLabel && !isBlocked && (
                <div className={cn(
                  'w-full text-right',
                )}>
                  <span className={cn(
                    'text-[11px] font-extrabold leading-none',
                    slot ? cn(style?.priceText, style?.darkPriceText) : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {priceLabel}
                  </span>
                </div>
              )}

              {/* Empty day — no slot, show subtle dash */}
              {!slot && (
                <div className="w-full text-right">
                  <span className="text-[10px] text-gray-300 dark:text-gray-600">—</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
