'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/lib/utils';
import { ChevronDown, Calendar, DollarSign, User, MapPin } from 'lucide-react';

type BookingStatus = 'Visita Agendada' | 'Presupuesto Enviado' | 'Contrato Firmado' | 'Depósito Pagado' | 'Evento Cerrado' | 'Cancelada';

const STATUS_COLORS: Record<BookingStatus, string> = {
  'Visita Agendada': 'bg-blue-100 text-blue-800 border-blue-200',
  'Presupuesto Enviado': 'bg-purple-100 text-purple-800 border-purple-200',
  'Contrato Firmado': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Depósito Pagado': 'bg-green-100 text-green-800 border-green-200',
  'Evento Cerrado': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Cancelada': 'bg-red-100 text-red-800 border-red-200',
};

const NEXT_STATUS: Record<BookingStatus, BookingStatus | null> = {
  'Visita Agendada': 'Presupuesto Enviado',
  'Presupuesto Enviado': 'Contrato Firmado',
  'Contrato Firmado': 'Depósito Pagado',
  'Depósito Pagado': 'Evento Cerrado',
  'Evento Cerrado': null,
  'Cancelada': null,
};

interface BookingCardProps {
  booking: any;
  isExpanded: boolean;
  onStatusChange: () => void;
}

export function BookingCard({ booking, isExpanded, onStatusChange }: BookingCardProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const coupleName = `${booking.couple_name_1} & ${booking.couple_name_2}`;
  const paymentProgress = booking.total_amount > 0
    ? (booking.paid_amount / booking.total_amount) * 100
    : 0;
  const nextStatus = NEXT_STATUS[booking.status as BookingStatus];

  const handleStatusChange = async (newStatus: BookingStatus) => {
    try {
      setIsChangingStatus(true);
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', booking.id);

      if (error) throw error;
      setShowStatusDropdown(false);
      onStatusChange();
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const eventDate = new Date(booking.event_date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Main Card */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Couple Names */}
            <div className="flex items-center gap-2 mb-3">
              <User size={18} style={{ color: '#1B4F72' }} />
              <h3 className="text-lg font-semibold text-gray-900">{coupleName}</h3>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Venue */}
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">VENUE</p>
                  <p className="text-sm font-medium text-gray-900">{booking.venue?.name || 'N/A'}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">FECHA EVENTO</p>
                  <p className="text-sm font-medium text-gray-900">{eventDate}</p>
                </div>
              </div>

              {/* Event Type */}
              <div>
                <p className="text-xs text-gray-500 font-medium">TIPO EVENTO</p>
                <p className="text-sm font-medium text-gray-900">{booking.event_type}</p>
              </div>
            </div>

            {/* Amount and Status Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">TOTAL</p>
                  <p className="text-lg font-bold" style={{ color: '#1B4F72' }}>
                    {formatCLP(booking.total_amount)}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${STATUS_COLORS[booking.status]} flex items-center gap-1`}
                  disabled={isChangingStatus}
                >
                  {booking.status}
                  {nextStatus && <ChevronDown size={14} />}
                </button>

                {/* Status Dropdown */}
                {showStatusDropdown && nextStatus && (
                  <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleStatusChange(nextStatus)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-900"
                    >
                      Cambiar a: {nextStatus}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expand Icon */}
          <button
            onClick={() => {}}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown
              size={24}
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Payment Progress Bar */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">PAGADO</p>
            <p className="text-xs font-semibold" style={{ color: '#2E75B6' }}>
              {formatCLP(booking.paid_amount)} / {formatCLP(booking.total_amount)}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${Math.min(paymentProgress, 100)}%`,
                backgroundColor: '#3498DB',
              }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Información de Contacto</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-medium">EMAIL</p>
                  <p className="text-gray-900">{booking.contact_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">TELÉFONO</p>
                  <p className="text-gray-900">{booking.contact_phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Detalles Adicionales</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-medium">CANTIDAD INVITADOS</p>
                  <p className="text-gray-900">{booking.guest_count || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">UBICACIÓN</p>
                  <p className="text-gray-900">{booking.venue?.location || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payments List */}
          {booking.payments && booking.payments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Pagos</h4>
              <div className="space-y-2">
                {booking.payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(payment.payment_date).toLocaleDateString('es-CL')}
                      </p>
                      <p className="text-xs text-gray-500">{payment.method}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#2E75B6' }}>
                      {formatCLP(payment.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Notas</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{booking.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
