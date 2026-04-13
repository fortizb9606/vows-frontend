import type { DateSlot } from '@/types/database';
import { formatCLP } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  slots: DateSlot[];
  month: number;
  year: number;
  onDayClick: (slot: DateSlot) => void;
}

const statusColorMap: { [key: string]: { dot: string; bg: string; border: string; hover: string } } = {
  AVAILABLE: {
    dot: 'bg-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    hover: 'hover:border-green-400 hover:shadow-md hover:shadow-green-100',
  },
  SOFT_BLOCK: {
    dot: 'bg-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    hover: 'hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-100',
  },
  RESERVED: {
    dot: 'bg-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    hover: 'hover:border-red-400 hover:shadow-md hover:shadow-red-100',
  },
  TECHNICAL_BLOCK: {
    dot: 'bg-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    hover: 'hover:border-gray-400 hover:shadow-md hover:shadow-gray-100',
  },
  MAINTENANCE: {
    dot: 'bg-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    hover: 'hover:border-orange-400 hover:shadow-md hover:shadow-orange-100',
  },
};

export default function CalendarGrid({ slots, month, year, onDayClick }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Create a map of slots by date for quick lookup
  const slotMap: { [key: string]: DateSlot } = {};
  slots.forEach((slot) => {
    const dateStr = slot.date.split('T')[0];
    slotMap[dateStr] = slot;
  });

  // Build calendar grid
  const calendarDays: (number | null)[] = [];

  // Previous month's days (adjust for Sunday = 0)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    calendarDays.push(null);
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Next month's days to fill grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push(null);
  }

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-3 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-700 py-3 text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-gray-50 rounded-lg border border-gray-100"
              />
            );
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const slot = slotMap[dateStr];
          const isToday = isCurrentMonth && day === today.getDate();
          const colors = slot ? statusColorMap[slot.status] : null;

          return (
            <button
              key={`day-${day}`}
              onClick={() => slot && onDayClick(slot)}
              disabled={!slot}
              className={cn(
                'aspect-square rounded-lg border-2 p-2 transition-all flex flex-col items-center justify-center',
                isToday && 'ring-2 ring-offset-2 ring-blue-600',
                !slot && 'bg-gray-50 border-gray-100 cursor-default',
                slot && cn(
                  'border-2 cursor-pointer font-medium',
                  colors?.bg,
                  colors?.border,
                  colors?.hover,
                )
              )}
            >
              <span className="text-sm font-semibold text-gray-900">{day}</span>
              {slot && (
                <>
                  <div className={cn('w-2 h-2 rounded-full mt-1.5', colors?.dot || 'bg-gray-300')} />
                  {slot.computed_price && (
                    <span className="text-xs text-gray-600 mt-1 line-clamp-1 font-medium">
                      {formatCLP(slot.computed_price)}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
