'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP, formatDate, getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import { Booking, BookingStatus } from '@/types/database';
import { Search, ChevronDown, Calendar, MapPin, Users, DollarSign } from 'lucide-react';

const BOOKING_STATUSES: BookingStatus[] = [
  'VISIT_SCHEDULED',
  'BUDGET_SENT',
  'CONTRACT_SIGNED',
  'DEPOSIT_PAID',
  'EVENT_CLOSED',
  'CANCELLED',
];

// Skeleton component for loading state
function BookingSkeleton() {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </td>
    </tr>
  );
}

interface ExtendedBooking extends Booking {
  couple?: {
    partner_one_name: string;
    partner_two_name: string;
  };
  venue?: {
    name: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<ExtendedBooking[]>([]);
  const [activeTab, setActiveTab] = useState<BookingStatus | 'Todas'>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [loading, setLoading] = useState(true);

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
          couple:couple_id (partner_one_name, partner_two_name),
          venue:venue_id (name)
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

    // Filter by search query (couple name)
    if (searchQuery) {
      filtered = filtered.filter((b) => {
        const coupleName = b.couple
          ? `${b.couple.partner_one_name} ${b.couple.partner_two_name}`.toLowerCase()
          : '';
        return coupleName.includes(searchQuery.toLowerCase());
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          return b.total_price_clp - a.total_price_clp;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  };

  const getStatusCount = (status: BookingStatus): number => {
    return bookings.filter((b) => b.status === status).length;
  };

  const getTotalCount = (): number => bookings.length;

  const getCoupleName = (booking: ExtendedBooking): string => {
    if (booking.couple) {
      return `${booking.couple.partner_one_name} & ${booking.couple.partner_two_name}`;
    }
    return 'Sin pareja';
  };

  const getVenueName = (booking: ExtendedBooking): string => {
    return booking.venue?.name || 'Sin especificar';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservas</h1>
          <p className="text-gray-600">Gestiona el pipeline de reservas de tu venue</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('Todas')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2',
              activeTab === 'Todas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Todas
            <span
              className={cn(
                'inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full',
                activeTab === 'Todas'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-900'
              )}
            >
              {getTotalCount()}
            </span>
          </button>

          {BOOKING_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2',
                activeTab === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {getStatusLabel(status)}
              <span
                className={cn(
                  'inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full',
                  activeTab === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-900'
                )}
              >
                {getStatusCount(status)}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre de pareja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="date">Ordenar por fecha</option>
              <option value="amount">Ordenar por monto</option>
              <option value="status">Ordenar por estado</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
          </div>
        </div>

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin reservas</h3>
            <p className="text-gray-600">
              {searchQuery || activeTab !== 'Todas'
                ? 'No hay reservas que coincidan con tu búsqueda'
                : 'No hay reservas registradas aún'}
            </p>
          </div>
        )}

        {/* Bookings Table */}
        {!loading && filteredBookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Pareja
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Espacio
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const statusColor = getStatusColor(booking.status);
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getCoupleName(booking)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Users size={12} />
                          {booking.guest_count} invitados
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(booking.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          {getVenueName(booking)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <DollarSign size={14} className="text-gray-400" />
                          {formatCLP(booking.total_price_clp)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-block px-3 py-1 rounded-full text-sm font-medium',
                            statusColor.bg,
                            statusColor.text
                          )}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm transition-colors"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Pareja
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Espacio
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <BookingSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
