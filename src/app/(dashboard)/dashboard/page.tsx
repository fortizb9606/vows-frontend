'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { BookingWithVenue, Payment } from '@/types/database';
import { cn, formatCLP, formatDate } from '@/lib/utils';
import StatCard from '@/components/dashboard/stat-card';
import RevenueChart from '@/components/dashboard/revenue-chart';

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
      <div className="space-y-8">
        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />

        {/* Tables skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-2">Bienvenido de vuelta. Aquí está tu resumen de hoy.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Reservas Activas"
          value={stats.activeReservations.toString()}
          change={12}
          color="primary"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Leads Nuevos"
          value={stats.newLeads.toString()}
          change={8}
          color="secondary"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Ingresos del Mes"
          value={formatCLP(stats.monthlyRevenue)}
          change={15}
          color="accent"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="Pagos Pendientes"
          value={stats.pendingPayments.toString()}
          change={-5}
          color="primary"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Ingresos por Mes</h2>
        <RevenueChart data={revenueData} />
      </div>

      {/* Recent Bookings and Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reservas Recientes</h2>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{booking.guest_name}</p>
                    <p className="text-sm text-gray-600">{formatDate(booking.event_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCLP(booking.total_price)}</p>
                    <p className={cn('text-sm font-medium', {
                      'text-green-600': booking.status === 'CONFIRMED',
                      'text-yellow-600': booking.status === 'LEAD',
                      'text-red-600': booking.status === 'CANCELLED',
                    })}>
                      {booking.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay reservas recientes</p>
            )}
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximas Visitas</h2>
          <div className="space-y-4">
            {upcomingVisits.length > 0 ? (
              upcomingVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{visit.guest_name}</p>
                    <p className="text-sm text-gray-600">{formatDate(visit.event_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCLP(visit.total_price)}</p>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Confirmado
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay visitas próximas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
