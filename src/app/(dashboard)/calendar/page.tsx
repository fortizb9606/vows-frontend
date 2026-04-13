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

    // Sum revenue from reserved slots
    let revenue = 0;
    slots.filter((s) => s.status === 'RESERVED').forEach((s) => {
      try {
        const parsed = JSON.parse(s.notes || '{}');
        revenue += parsed.price || 0;
      } catch { /* ignore */ }
    });

    return { available, reserved, blocked, revenue };
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

  const formatRevenue = (val: number) => {
    if (val >= 1000000) {
      const m = val / 1000000;
      return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace('.', ',')}M`;
    }
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendario</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Precios, disponibilidad y agenda</p>
      </div>

      {/* Venue selector (if multiple) */}
      {venues.length > 1 && (
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1B4F72]"
        >
          {venues.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.available}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Disponibles</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mx-auto mb-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
          </div>
          <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{kpis.reserved}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reservados</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-500 dark:text-amber-400">{kpis.blocked}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bloqueados</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-[#1B4F72] dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#1B4F72] dark:text-blue-400">
            {formatRevenue(kpis.revenue)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ingresos Mes</p>
        </div>
      </div>

      {/* Calendar + Side Panel layout */}
      <div className="flex gap-4">
        {/* Calendar Card */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex-1 transition-all ${selectedDateStr ? '' : 'w-full'}`}>
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={handlePrevMonth}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {prevMonthName}
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {nextMonthName}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid */}
          <div className="p-4">
            {loading ? (
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
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
          <div className="flex items-center justify-center gap-6 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-400 dark:border-emerald-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm bg-rose-100 dark:bg-rose-900/50 border-2 border-rose-400 dark:border-rose-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-400 dark:border-amber-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Bloqueado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Sin configurar</span>
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
