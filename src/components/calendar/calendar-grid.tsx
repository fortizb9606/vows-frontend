import type { DateSlot } from '@/types/database';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  slots: DateSlot[];
  month: number;
  year: number;
  selectedDateStr: string | null;
  onDayClick: (dateStr: string, existingSlot: DateSlot | null) => void;
}

// Status → visual style
const statusStyles: Record<string, { bg: string; border: string; text: string }> = {
  AVAILABLE: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700' },
  SOFT_BLOCK: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700' },
  RESERVED: { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-700' },
  TECHNICAL_BLOCK: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-600' },
  MAINTENANCE: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700' },
};

export default function CalendarGrid({ slots, month, year, selectedDateStr, onDayClick }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Map slots by date
  const slotMap: Record<string, DateSlot> = {};
  slots.forEach((s) => { slotMap[s.date.split('T')[0]] = s; });

  // Monday-first grid
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
          const isWeekend = (adjustedFirstDay + day - 1) % 7 >= 5;

          // Parse notes for couple name / guest count (format: "Couple Name|120inv")
          let coupleName = '';
          let guestInfo = '';
          if (slot && slot.status === 'RESERVED' && slot.notes) {
            const parts = slot.notes.split('|');
            coupleName = parts[0] || '';
            guestInfo = parts[1] || '';
          }

          return (
            <button
              key={`d-${day}`}
              onClick={() => onDayClick(dateStr, slot)}
              className={cn(
                'aspect-[4/3] rounded-lg border-2 p-1.5 transition-all flex flex-col items-center justify-start gap-0.5 relative overflow-hidden',
                isSelected && 'ring-2 ring-blue-500 ring-offset-1',
                isToday && !isSelected && 'ring-2 ring-blue-300 ring-offset-1',
                slot
                  ? cn(style?.bg, style?.border, 'hover:shadow-md cursor-pointer')
                  : cn(
                    'border-gray-200 hover:border-gray-400 cursor-pointer',
                    isWeekend ? 'bg-gray-50' : 'bg-white'
                  )
              )}
            >
              {/* Day number */}
              <span className={cn(
                'text-sm font-bold leading-none',
                isToday ? 'text-blue-600' : slot ? style?.text : 'text-gray-700'
              )}>
                {day}
              </span>

              {/* Slot content */}
              {slot && slot.status === 'RESERVED' && coupleName && (
                <span className="text-[9px] font-semibold text-pink-700 leading-tight truncate w-full text-center">
                  {coupleName}
                </span>
              )}
              {slot && slot.status === 'RESERVED' && guestInfo && (
                <span className="text-[8px] text-pink-500 leading-tight">
                  {guestInfo}
                </span>
              )}
              {slot && (slot.status === 'MAINTENANCE' || slot.status === 'TECHNICAL_BLOCK') && (
                <svg className="w-3.5 h-3.5 text-orange-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
              {slot && slot.status === 'AVAILABLE' && (
                <span className="text-[9px] font-semibold text-green-600 leading-tight mt-auto">
                  Libre
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
