'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DateSlot, Venue } from '@/types/database';
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendario de Disponibilidad</h1>
        <p className="text-gray-600 mt-2">Gestiona la disponibilidad y precios de tu venue</p>
      </div>

      {/* Venue Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona Venue
        </label>
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-sm text-gray-700">Bloqueo Suave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm text-gray-700">Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span className="text-sm text-gray-700">Bloqueo Técnico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-sm text-gray-700">Mantenimiento</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <h2 className="text-2xl font-bold text-gray-900">
            {monthName} {year}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <CalendarGrid
            slots={slots}
            month={currentDate.getMonth()}
            year={currentDate.getFullYear()}
            onDayClick={handleDayClick}
          />
        )}
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
