'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';

type Payment = Database['public']['Tables']['payments']['Row'] & {
  bookings?: Database['public']['Tables']['bookings']['Row'];
  leads?: Database['public']['Tables']['leads']['Row'];
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    pending: 0,
    paid: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payments')
        .select('*, bookings(id, reference, total_price, event_date), bookings(leads(id, name))')
        .order('due_date', { ascending: true });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setPayments(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentList: any[]) => {
    const now = new Date();
    let pending = 0;
    let paid = 0;
    let overdue = 0;

    paymentList.forEach((payment) => {
      if (payment.status === 'PAID') {
        paid += payment.amount;
      } else if (payment.status === 'PENDING') {
        const dueDate = new Date(payment.due_date);
        if (dueDate < now) {
          overdue += payment.amount;
        } else {
          pending += payment.amount;
        }
      }
    });

    setStats({ pending, paid, overdue });
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'PAID', paid_at: new Date().toISOString() })
        .eq('id', paymentId);

      if (error) throw error;
      fetchPayments();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === 'PAID') {
      return (
        <Badge style={{ backgroundColor: '#10b981' }} className="text-white flex items-center gap-1 w-fit">
          <CheckCircle size={14} />
          Pagado
        </Badge>
      );
    }

    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) {
      return (
        <Badge style={{ backgroundColor: '#ef4444' }} className="text-white flex items-center gap-1 w-fit">
          <AlertCircle size={14} />
          Vencido
        </Badge>
      );
    }

    return (
      <Badge style={{ backgroundColor: '#f59e0b' }} className="text-white flex items-center gap-1 w-fit">
        <Clock size={14} />
        Pendiente
      </Badge>
    );
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Seña';
      case 'INSTALLMENT':
        return 'Cuota';
      case 'FINAL':
        return 'Pago Final';
      default:
        return type;
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#1B4F72' }}>
            Pagos y Facturación
          </h1>
          <p className="text-gray-600 mt-2">Administra los pagos de las reservas</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Pendiente</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#f59e0b' }}>
                  ${stats.pending.toLocaleString('es-CL')}
                </p>
              </div>
              <Clock size={32} style={{ color: '#f59e0b' }} className="opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Pagado</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#10b981' }}>
                  ${stats.paid.toLocaleString('es-CL')}
                </p>
              </div>
              <CheckCircle size={32} style={{ color: '#10b981' }} className="opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Vencido</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#ef4444' }}>
                  ${stats.overdue.toLocaleString('es-CL')}
                </p>
              </div>
              <AlertCircle size={32} style={{ color: '#ef4444' }} className="opacity-20" />
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto">
          <Button
            onClick={() => setStatusFilter('all')}
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            style={statusFilter === 'all' ? { backgroundColor: '#1B4F72' } : {}}
            className="whitespace-nowrap"
          >
            Todos
          </Button>
          <Button
            onClick={() => setStatusFilter('PENDING')}
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            style={statusFilter === 'PENDING' ? { backgroundColor: '#1B4F72' } : {}}
            className="whitespace-nowrap"
          >
            Pendientes
          </Button>
          <Button
            onClick={() => setStatusFilter('PAID')}
            variant={statusFilter === 'PAID' ? 'default' : 'outline'}
            style={statusFilter === 'PAID' ? { backgroundColor: '#1B4F72' } : {}}
            className="whitespace-nowrap"
          >
            Pagados
          </Button>
        </div>

        {/* Payments Table */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">Cargando pagos...</div>
        ) : payments.length === 0 ? (
          <Card className="p-8 text-center border border-gray-200">
            <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No hay pagos para mostrar</p>
          </Card>
        ) : (
          <Card className="border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Referencia
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Pareja
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Vencimiento
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                        isOverdue(payment.due_date) && payment.status === 'PENDING'
                          ? 'bg-red-50'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {payment.booking_reference || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {/* Note: Lead data would come from booking relationship */}
                        Cliente Desconocido
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${payment.amount.toLocaleString('es-CL')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline">
                          {getPaymentTypeLabel(payment.payment_type)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(payment.due_date)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(payment.status, payment.due_date)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.status === 'PENDING' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-800"
                              >
                                Marcar Pagado
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Marcar como pagado</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que este pago ha sido recibido?
                                ${payment.amount.toLocaleString('es-CL')} CLP
                              </AlertDialogDescription>
                              <div className="flex gap-3">
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleMarkAsPaid(payment.id)}
                                  style={{ backgroundColor: '#10b981' }}
                                >
                                  Confirmar Pago
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Summary Statistics */}
        {!loading && payments.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Total de Pagos</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#1B4F72' }}>
                {payments.length}
              </p>
            </Card>
            <Card className="p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Pagos Pagados</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#10b981' }}>
                {payments.filter((p) => p.status === 'PAID').length}
              </p>
            </Card>
            <Card className="p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Pagos Pendientes</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#f59e0b' }}>
                {payments.filter((p) => p.status === 'PENDING').length}
              </p>
            </Card>
            <Card className="p-4 border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Pagos Vencidos</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#ef4444' }}>
                {payments.filter(
                  (p) => p.status === 'PENDING' && isOverdue(p.due_date)
                ).length}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
