'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DateSlot, DateSlotStatus, Venue } from '@/types/database';
import CalendarGrid from '@/components/calendar/calendar-grid';
import DayDetailModal from '@/components/calendar/day-detail-modal';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [slots, setSlots] = useState<DateSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DateSlot | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
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
          .toISOString().split('T')[0];
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          .toISOString().split('T')[0];

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

  // Click any day — existing slot or new
  const handleDayClick = (dateStr: string, existingSlot: DateSlot | null) => {
    setSelectedDateStr(dateStr);
    setSelectedSlot(existingSlot);
    setShowModal(true);
  };

  // Save: upsert into Supabase
  const handleSaveSlot = async (status: DateSlotStatus, notes: string) => {
    if (!selectedDateStr || !selectedVenue) return;

    try {
      if (selectedSlot) {
        // Update existing
        const { error } = await supabase
          .from('date_slots')
          .update({ status, notes })
          .eq('id', selectedSlot.id);
        if (error) throw error;

        setSlots(slots.map((s) =>
          s.id === selectedSlot.id ? { ...s, status, notes } : s
        ));
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('date_slots')
          .insert({
            venue_id: selectedVenue,
            date: selectedDateStr,
            status,
            notes,
          })
          .select()
          .single();
        if (error) throw error;
        if (data) setSlots([...slots, data]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving date slot:', error);
    }
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendario de Disponibilidad</h1>
        <p className="text-gray-500 mt-1">Gestiona la disponibilidad de tu espacio por día</p>
      </div>

      {/* Venue Selector + Legend row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Venue Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:w-64">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Espacio
          </label>
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>{venue.name}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Leyenda
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { color: 'bg-green-500', label: 'Disponible' },
              { color: 'bg-yellow-500', label: 'Bloqueo Suave' },
              { color: 'bg-red-500', label: 'Reservado' },
              { color: 'bg-gray-400', label: 'Bloqueo Técnico' },
              { color: 'bg-orange-500', label: 'Mantenimiento' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
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

      {/* Modal */}
      {showModal && selectedDateStr && (
        <DayDetailModal
          dateStr={selectedDateStr}
          existingSlot={selectedSlot}
          onClose={() => setShowModal(false)}
          onSave={handleSaveSlot}
        />
      )}
    </div>
  );
}
