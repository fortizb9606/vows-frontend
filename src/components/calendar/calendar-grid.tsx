import type { DateSlot } from '@/types/database';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  slots: DateSlot[];
  month: number;
  year: number;
  onDayClick: (dateStr: string, existingSlot: DateSlot | null) => void;
}

const statusColors: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  AVAILABLE: { dot: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800' },
  SOFT_BLOCK: { dot: 'bg-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800' },
  RESERVED: { dot: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800' },
  TECHNICAL_BLOCK: { dot: 'bg-gray-400', bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  MAINTENANCE: { dot: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800' },
};

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Disponible',
  SOFT_BLOCK: 'Bloqueado',
  RESERVED: 'Reservado',
  TECHNICAL_BLOCK: 'Técnico',
  MAINTENANCE: 'Mantención',
};

export default function CalendarGrid({ slots, month, year, onDayClick }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Map slots by date string
  const slotMap: Record<string, DateSlot> = {};
  slots.forEach((slot) => {
    slotMap[slot.date.split('T')[0]] = slot;
  });

  // Build grid: Monday = 0
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < adjustedFirstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div>
      {/* Header row */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((wd) => (
          <div key={wd} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">
            {wd}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`e-${idx}`} className="aspect-square rounded-lg bg-gray-50" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const slot = slotMap[dateStr] || null;
          const isToday = isCurrentMonth && day === today.getDate();
          const colors = slot ? statusColors[slot.status] : null;
          const isPast = new Date(dateStr) < new Date(today.toISOString().split('T')[0]);

          return (
            <button
              key={`d-${day}`}
              onClick={() => onDayClick(dateStr, slot)}
              className={cn(
                'aspect-square rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 relative group',
                isToday && 'ring-2 ring-blue-500 ring-offset-1',
                isPast && !slot && 'opacity-40',
                slot
                  ? cn(colors?.bg, colors?.border, 'hover:shadow-md cursor-pointer')
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
              )}
            >
              {/* Day number */}
              <span className={cn(
                'text-sm font-semibold',
                isToday ? 'text-blue-600' : slot ? colors?.text : 'text-gray-700'
              )}>
                {day}
              </span>

              {/* Status indicator */}
              {slot ? (
                <>
                  <div className={cn('w-2 h-2 rounded-full', colors?.dot)} />
                  <span className={cn('text-[10px] font-medium leading-tight', colors?.text)}>
                    {statusLabels[slot.status] || ''}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Sin estado
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
