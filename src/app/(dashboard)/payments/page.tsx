'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, Clock, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { cn, formatCLP, formatDate } from '@/lib/utils';

type Payment = Database['public']['Tables']['payments']['Row'] & {
  bookings?: Database['public']['Tables']['bookings']['Row'];
  leads?: Database['public']['Tables']['leads']['Row'];
};

type FilterStatus = 'all' | 'PENDING' | 'PAID' | 'VENCIDO';

const FILTER_TABS: { label: string; value: FilterStatus }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Pagados', value: 'PAID' },
  { label: 'Vencidos', value: 'VENCIDO' },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [stats, setStats] = useState({
    pending: 0,
    paid: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payments')
        .select('*, bookings(id, reference, total_price, event_date), bookings(leads(id, name))')
        .order('due_date', { ascending: true });

      if (filter !== 'all') {
        if (filter === 'VENCIDO') {
          query = query.eq('status', 'PENDING');
        } else {
          query = query.eq('status', filter);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter for overdue if needed
      let filteredData = data || [];
      if (filter === 'VENCIDO') {
        const now = new Date();
        filteredData = filteredData.filter(
          (p) => p.status === 'PENDING' && new Date(p.due_date) < now
        );
      }

      setPayments(filteredData);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentList: Payment[]) => {
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
        <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1.5 w-fit border-0">
          <CheckCircle size={14} />
          Pagado
        </Badge>
      );
    }

    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-700 flex items-center gap-1.5 w-fit border-0">
          <AlertCircle size={14} />
          Vencido
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1.5 w-fit border-0">
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

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Pagos y Facturación
          </h1>
          <p className="text-gray-600 mt-2">Administra los pagos de las reservas</p>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pendiente Card */}
          <Card className="rounded-xl shadow-sm border border-gray-100 p-6 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Pendiente</p>
                <p className="text-3xl font-bold mt-3 text-amber-600">
                  {formatCLP(stats.pending)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <Clock size={24} className="text-amber-600" />
              </div>
            </div>
          </Card>

          {/* Pagado Card */}
          <Card className="rounded-xl shadow-sm border border-gray-100 p-6 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Pagado</p>
                <p className="text-3xl font-bold mt-3 text-emerald-600">
                  {formatCLP(stats.paid)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
            </div>
          </Card>

          {/* Vencido Card */}
          <Card className="rounded-xl shadow-sm border border-gray-100 p-6 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Vencido</p>
                <p className="text-3xl font-bold mt-3 text-red-600">
                  {formatCLP(stats.overdue)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle size={24} className="text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              variant={filter === tab.value ? 'default' : 'outline'}
              className={cn(
                'whitespace-nowrap rounded-lg transition-all',
                filter === tab.value
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Payments Table */}
        {loading ? (
          <LoadingSkeleton />
        ) : payments.length === 0 ? (
          <Card className="rounded-xl shadow-sm border border-gray-100 p-12 bg-white text-center">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium">No hay pagos para mostrar</p>
            <p className="text-gray-500 text-sm mt-1">Intenta cambiar los filtros</p>
          </Card>
        ) : (
          <Card className="rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Referencia
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Pareja
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Método de Pago
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Vencimiento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className={cn(
                        'hover:bg-gray-50 transition',
                        isOverdue(payment.due_date) && payment.status === 'PENDING'
                          ? 'bg-red-50'
                          : ''
                      )}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {payment.booking_reference || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {/* Note: Lead data would come from booking relationship */}
                        Cliente Desconocido
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCLP(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50">
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
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                Marcar Pagado
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl">
                              <AlertDialogTitle>Marcar como pagado</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que este pago ha sido recibido? Monto:{' '}
                                <span className="font-semibold text-gray-900">
                                  {formatCLP(payment.amount)}
                                </span>
                              </AlertDialogDescription>
                              <div className="flex gap-3 justify-end pt-4">
                                <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleMarkAsPaid(payment.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
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
      </div>
    </div>
  );
}
