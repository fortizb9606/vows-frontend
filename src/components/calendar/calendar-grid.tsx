import type { DateSlot } from '@/types/database';
import { formatCLP } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  slots: DateSlot[];
  month: number;
  year: number;
  onDayClick: (slot: DateSlot) => void;
}

const statusColorMap: { [key: string]: string } = {
  AVAILABLE: 'bg-green-500',
  SOFT_BLOCK: 'bg-yellow-500',
  RESERVED: 'bg-red-500',
  TECHNICAL_BLOCK: 'bg-gray-400',
  MAINTENANCE: 'bg-orange-500',
};

export default function CalendarGrid({ slots, month, year, onDayClick }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Create a map of slots by date for quick lookup
  const slotMap: { [key: string]: DateSlot } = {};
  slots.forEach((slot) => {
    const dateStr = slot.date.split('T')[0]; // Normalize to YYYY-MM-DD
    slotMap[dateStr] = slot;
  });

  // Build calendar grid
  const calendarDays: (number | null)[] = [];

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
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
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-700 py-2 text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-gray-50 rounded-lg border border-gray-200"
              />
            );
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const slot = slotMap[dateStr];
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <button
              key={`day-${day}`}
              onClick={() => slot && onDayClick(slot)}
              disabled={!slot}
              className={cn(
                'aspect-square rounded-lg border-2 p-2 transition-all flex flex-col items-center justify-center text-xs font-medium',
                isToday && 'ring-2 ring-offset-2 ring-blue-500',
                !slot && 'bg-gray-50 border-gray-200 cursor-default',
                slot && 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md cursor-pointer'
              )}
            >
              <span className="text-sm font-semibold text-gray-900">{day}</span>
              {slot && (
                <>
                  <div className={cn('w-2 h-2 rounded-full mt-1', statusColorMap[slot.status] || 'bg-gray-300')} />
                  {slot.computed_price && (
                    <span className="text-xs text-gray-600 mt-1 line-clamp-1">
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
