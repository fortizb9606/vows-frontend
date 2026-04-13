'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { BookingWithVenue, Payment } from '@/types/database';
import { cn, formatCLP, formatDate } from '@/lib/utils';

interface DashboardStats {
  activeReservations: number;
  newLeads: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

// KPI Card Component
const KPICard = ({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-3">{value}</p>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-green-600 text-sm font-medium">{change}</span>
        </div>
      </div>
      <div className="bg-green-50 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    CONFIRMED: 'bg-green-100 text-green-800',
    LEAD: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const labels: { [key: string]: string } = {
    CONFIRMED: 'Confirmado',
    LEAD: 'Lead',
    CANCELLED: 'Cancelado',
  };

  return (
    <span className={cn('inline-block px-3 py-1 text-xs font-medium rounded-full', styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800')}>
      {labels[status] || status}
    </span>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeReservations: 0,
    newLeads: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active reservations
        const { count: activeCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'CONFIRMED')
          .gte('event_date', new Date().toISOString().split('T')[0]);

        // Fetch new leads (created in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: leadsCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'LEAD')
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Fetch monthly revenue
        const currentMonth = new Date();
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const { data: monthlyBookings } = await supabase
          .from('bookings')
          .select('total_price')
          .eq('status', 'CONFIRMED')
          .gte('event_date', monthStart.toISOString().split('T')[0])
          .lte('event_date', monthEnd.toISOString().split('T')[0]);

        const monthlyRevenue = monthlyBookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

        // Fetch pending payments
        const { count: pendingCount } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'PENDING');

        // Fetch revenue data for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: allBookings } = await supabase
          .from('bookings')
          .select('event_date, total_price')
          .eq('status', 'CONFIRMED')
          .gte('event_date', sixMonthsAgo.toISOString().split('T')[0]);

        // Process revenue data by month
        const revenueByMonth: { [key: string]: number } = {};
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = `${months[date.getMonth()]}-${date.getFullYear()}`;
          revenueByMonth[monthKey] = 0;
        }

        allBookings?.forEach((booking) => {
          if (booking.event_date && booking.total_price) {
            const date = new Date(booking.event_date);
            const monthKey = `${months[date.getMonth()]}-${date.getFullYear()}`;
            if (monthKey in revenueByMonth) {
              revenueByMonth[monthKey] += booking.total_price;
            }
          }
        });

        const chartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
          month,
          revenue,
        }));

        // Fetch recent bookings
        const { data: recent } = await supabase
          .from('bookings')
          .select('id, guest_name, event_date, total_price, status, venue_id')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch upcoming visits
        const today = new Date().toISOString().split('T')[0];
        const { data: upcoming } = await supabase
          .from('bookings')
          .select('id, guest_name, event_date, total_price, status, venue_id')
          .eq('status', 'CONFIRMED')
          .gte('event_date', today)
          .order('event_date', { ascending: true })
          .limit(5);

        setStats({
          activeReservations: activeCount || 0,
          newLeads: leadsCount || 0,
          monthlyRevenue,
          pendingPayments: pendingCount || 0,
        });

        setRevenueData(chartData);
        setRecentBookings(recent || []);
        setUpcomingVisits(upcoming || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-9 bg-gray-200 rounded-lg animate-pulse w-48" />
          <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-64" />
        </div>

        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />

        {/* Tables skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-2">Bienvenido de vuelta. Aquí está tu resumen de hoy.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Reservas Activas"
          value={stats.activeReservations.toString()}
          change="+12% este mes"
          icon={TrendingUp}
        />
        <KPICard
          title="Leads Nuevos"
          value={stats.newLeads.toString()}
          change="+8% este mes"
          icon={Users}
        />
        <KPICard
          title="Ingresos del Mes"
          value={formatCLP(stats.monthlyRevenue)}
          change="+15% este mes"
          icon={DollarSign}
        />
        <KPICard
          title="Pagos Pendientes"
          value={stats.pendingPayments.toString()}
          change="-5% este mes"
          icon={Clock}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Ingresos por Mes</h2>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value) => formatCLP(value as number)}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings and Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Reservas Recientes</h2>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-100">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-0">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{booking.guest_name}</p>
                            <p className="text-xs text-gray-500">{formatDate(booking.event_date)}</p>
                          </div>
                        </td>
                        <td className="py-3 px-0 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <p className="font-medium text-gray-900 text-sm">{formatCLP(booking.total_price)}</p>
                            <StatusBadge status={booking.status} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay reservas recientes</p>
            )}
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Próximas Visitas</h2>
          <div className="space-y-4">
            {upcomingVisits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-100">
                    {upcomingVisits.map((visit) => (
                      <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-0">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{visit.guest_name}</p>
                            <p className="text-xs text-gray-500">{formatDate(visit.event_date)}</p>
                          </div>
                        </td>
                        <td className="py-3 px-0 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <p className="font-medium text-gray-900 text-sm">{formatCLP(visit.total_price)}</p>
                            <span className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Confirmado
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay visitas próximas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
