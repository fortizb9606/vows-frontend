'use client';

import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DateSlot, DateSlotStatus, Venue } from '@/types/database';
import CalendarGrid from '@/components/calendar/calendar-grid';
import DayDetailPanel from '@/components/calendar/day-detail-modal';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [slots, setSlots] = useState<DateSlot[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DateSlot | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const { data } = await supabase.from('venues').select('*').order('name');
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

  // Fetch slots when venue or month changes
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

  // KPI stats computed from slots
  const kpis = useMemo(() => {
    const available = slots.filter((s) => s.status === 'AVAILABLE').length;
    const reserved = slots.filter((s) => s.status === 'RESERVED').length;
    const blocked = slots.filter((s) =>
      s.status === 'SOFT_BLOCK' || s.status === 'TECHNICAL_BLOCK' || s.status === 'MAINTENANCE'
    ).length;
    return { available, reserved, blocked };
  }, [slots]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDateStr(null);
    setSelectedSlot(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDateStr(null);
    setSelectedSlot(null);
  };

  const handleDayClick = (dateStr: string, existingSlot: DateSlot | null) => {
    setSelectedDateStr(dateStr);
    setSelectedSlot(existingSlot);
  };

  const handleClosePanel = () => {
    setSelectedDateStr(null);
    setSelectedSlot(null);
  };

  const handleSaveSlot = async (status: DateSlotStatus, notes: string) => {
    if (!selectedDateStr || !selectedVenue) return;
    try {
      if (selectedSlot) {
        const { error } = await supabase
          .from('date_slots')
          .update({ status, notes })
          .eq('id', selectedSlot.id);
        if (error) throw error;
        setSlots(slots.map((s) => (s.id === selectedSlot.id ? { ...s, status, notes } : s)));
        setSelectedSlot({ ...selectedSlot, status, notes });
      } else {
        const { data, error } = await supabase
          .from('date_slots')
          .insert({ venue_id: selectedVenue, date: selectedDateStr, status, notes })
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setSlots([...slots, data]);
          setSelectedSlot(data);
        }
      }
    } catch (error) {
      console.error('Error saving date slot:', error);
    }
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const prevMonthName = months[currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1].slice(0, 3);
  const nextMonthName = months[currentDate.getMonth() === 11 ? 0 : currentDate.getMonth() + 1].slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
        <p className="text-gray-500 mt-1">Precios, disponibilidad y agenda</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{kpis.available}</p>
          <p className="text-sm text-gray-500 mt-1">Disponibles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-pink-600">{kpis.reserved}</p>
          <p className="text-sm text-gray-500 mt-1">Reservados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-orange-500">{kpis.blocked}</p>
          <p className="text-sm text-gray-500 mt-1">Bloqueados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-[#1B4F72]">
            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Ingresos Mes</p>
        </div>
      </div>

      {/* Calendar + Side Panel layout */}
      <div className="flex gap-4">
        {/* Calendar Card */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 transition-all ${selectedDateStr ? '' : 'w-full'}`}>
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <button
              onClick={handlePrevMonth}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {prevMonthName}
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {nextMonthName}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid */}
          <div className="p-4">
            {loading ? (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <CalendarGrid
                slots={slots}
                month={currentDate.getMonth()}
                year={currentDate.getFullYear()}
                selectedDateStr={selectedDateStr}
                onDayClick={handleDayClick}
              />
            )}
          </div>

          {/* Bottom Legend */}
          <div className="flex items-center justify-center gap-6 px-5 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-400" />
              <span className="text-xs text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-pink-100 border border-pink-400" />
              <span className="text-xs text-gray-600">Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-400" />
              <span className="text-xs text-gray-600">Bloqueado</span>
            </div>
          </div>
        </div>

        {/* Side Detail Panel */}
        {selectedDateStr && (
          <DayDetailPanel
            dateStr={selectedDateStr}
            existingSlot={selectedSlot}
            onClose={handleClosePanel}
            onSave={handleSaveSlot}
          />
        )}
      </div>
    </div>
  );
}
