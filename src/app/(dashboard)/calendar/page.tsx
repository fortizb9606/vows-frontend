'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DateSlot, Venue } from '@/types/database';
import { cn } from '@/lib/utils';
import CalendarGrid from '@/components/calendar/calendar-grid';
import DayDetailModal from '@/components/calendar/day-detail-modal';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [slots, setSlots] = useState<DateSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<DateSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch venues on mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const { data } = await supabase
          .from('venues')
          .select('*')
          .order('name');

        if (data && data.length > 0) {
          setVenues(data);
          setSelectedVenue(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      }
    };

    fetchVenues();
  }, []);

  // Fetch date slots when venue or month changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedVenue) return;

      setLoading(true);
      try {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];

        const { data } = await supabase
          .from('date_slots')
          .select('*')
          .eq('venue_id', selectedVenue)
          .gte('date', monthStart)
          .lte('date', monthEnd);

        setSlots(data || []);
      } catch (error) {
        console.error('Error fetching date slots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedVenue, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (slot: DateSlot) => {
    setSelectedDay(slot);
    setShowModal(true);
  };

  const handleSaveSlot = async (updatedSlot: DateSlot) => {
    try {
      const { error } = await supabase
        .from('date_slots')
        .update({
          status: updatedSlot.status,
          computed_price: updatedSlot.computed_price,
        })
        .eq('id', updatedSlot.id);

      if (error) throw error;

      // Update local state
      setSlots(slots.map((s) => (s.id === updatedSlot.id ? updatedSlot : s)));
      setShowModal(false);
    } catch (error) {
      console.error('Error updating date slot:', error);
    }
  };

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthName = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-bold text-gray-900">Calendario de Disponibilidad</h1>
        <p className="text-gray-600 mt-2">Gestiona la disponibilidad y precios de tu venue</p>
      </div>

      {/* Venue Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Selecciona Venue
        </label>
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
        >
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      </div>

      {/* Color Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Leyenda de Estados</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Bloqueo Suave</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Reservado</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700">Bloqueo Técnico</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Mantenimiento</span>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-gray-900">
            {monthName} {year}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : (
            <CalendarGrid
              slots={slots}
              month={currentDate.getMonth()}
              year={currentDate.getFullYear()}
              onDayClick={handleDayClick}
            />
          )}
        </div>
      </div>

      {/* Day Detail Modal */}
      {showModal && selectedDay && (
        <DayDetailModal
          slot={selectedDay}
          onClose={() => setShowModal(false)}
          onSave={handleSaveSlot}
        />
      )}
    </div>
  );
}
