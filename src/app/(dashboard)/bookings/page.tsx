'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Booking } from '@/types/database';
import { formatCLP } from '@/lib/utils';
import { BookingCard } from '@/components/bookings/booking-card';
import { Search, Plus } from 'lucide-react';

type BookingStatus = 'Visita Agendada' | 'Presupuesto Enviado' | 'Contrato Firmado' | 'Depósito Pagado' | 'Evento Cerrado' | 'Cancelada';

const STATUS_OPTIONS: BookingStatus[] = [
  'Visita Agendada',
  'Presupuesto Enviado',
  'Contrato Firmado',
  'Depósito Pagado',
  'Evento Cerrado',
  'Cancelada',
];

const STATUS_COLORS: Record<BookingStatus, string> = {
  'Visita Agendada': 'bg-blue-100 text-blue-800',
  'Presupuesto Enviado': 'bg-purple-100 text-purple-800',
  'Contrato Firmado': 'bg-indigo-100 text-indigo-800',
  'Depósito Pagado': 'bg-green-100 text-green-800',
  'Evento Cerrado': 'bg-emerald-100 text-emerald-800',
  'Cancelada': 'bg-red-100 text-red-800',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<BookingStatus | 'Todas'>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, activeTab, searchQuery, sortBy]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          venue:venue_id (name, location),
          payments (id, amount, payment_date, method)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (activeTab !== 'Todas') {
      filtered = filtered.filter((b) => b.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((b) =>
        `${b.couple_name_1} ${b.couple_name_2}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
        case 'amount':
          return b.total_amount - a.total_amount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  };

  const getStatusCount = (status: BookingStatus) => {
    return bookings.filter((b) => b.status === status).length;
  };

  const getTotalCount = () => bookings.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#1B4F72' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B4F72' }}>
            Reservas
          </h1>
          <p className="text-gray-600">Gestiona el pipeline de reservas de tu venue</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Tab Filters */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('Todas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                activeTab === 'Todas'
                  ? 'text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: activeTab === 'Todas' ? '#1B4F72' : 'transparent',
              }}
            >
              Todas
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-white" style={{ color: '#1B4F72' }}>
                {getTotalCount()}
              </span>
            </button>

            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                  activeTab === status
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: activeTab === status ? '#2E75B6' : 'transparent',
                }}
              >
                {status}
                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-white" style={{ color: '#2E75B6' }}>
                  {getStatusCount(status)}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre de pareja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ focusRing: '2px solid #3498DB' }}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2"
              style={{ focusRing: '2px solid #3498DB' }}
            >
              <option value="date">Ordenar por fecha</option>
              <option value="amount">Ordenar por monto</option>
              <option value="status">Ordenar por estado</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">Sin reservas</p>
            <p className="text-gray-500">No hay reservas que coincidan con tu búsqueda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="cursor-pointer transition-all"
                onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
              >
                <BookingCard
                  booking={booking}
                  isExpanded={expandedId === booking.id}
                  onStatusChange={fetchBookings}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
