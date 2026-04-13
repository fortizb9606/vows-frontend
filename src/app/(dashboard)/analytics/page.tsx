'use client';

import { TrendingUp, BarChart3 } from 'lucide-react';

// Utility function to format CLP currency
const formatCLP = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

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

// Lead Sources Chart Component
const LeadSourcesChart = () => {
  const sources = [
    { name: 'Instagram', percentage: 35, color: '#E1306C' },
    { name: 'Google', percentage: 28, color: '#4285F4' },
    { name: 'Referidos', percentage: 20, color: '#10b981' },
    { name: 'WhatsApp', percentage: 12, color: '#25D366' },
    { name: 'Otros', percentage: 5, color: '#94A3B8' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Fuentes de Leads</h3>
      <div className="space-y-4">
        {sources.map((source) => (
          <div key={source.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {source.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {source.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${source.percentage}%`,
                  backgroundColor: source.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Conversion Funnel Component
const ConversionFunnel = () => {
  const stages = [
    { name: 'Leads Entrantes', current: 156, total: 156 },
    { name: 'Contactados', current: 120, total: 156 },
    { name: 'Visita/Reunión', current: 68, total: 156 },
    { name: 'Cotización Enviada', current: 45, total: 156 },
    { name: 'Reserva Confirmada', current: 34, total: 156 },
  ];

  const getPercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Funnel de Conversión
      </h3>
      <div className="space-y-5">
        {stages.map((stage, index) => {
          const percentage = getPercentage(stage.current, stage.total);
          return (
            <div key={stage.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {stage.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {stage.current}/{stage.total}
                  </p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analíticas</h1>
          <p className="text-gray-600 mt-2">
            Visualiza el desempeño de tu negocio
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Ingresos Totales"
            value={formatCLP(52800000)}
            change="+12% este mes"
            icon={BarChart3}
          />
          <KPICard
            title="Eventos Realizados"
            value="34"
            change="+8% este mes"
            icon={BarChart3}
          />
          <KPICard
            title="Ticket Promedio"
            value={formatCLP(3920000)}
            change="+5% este mes"
            icon={BarChart3}
          />
          <KPICard
            title="Leads → Reserva"
            value="38%"
            change="+3% este mes"
            icon={TrendingUp}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadSourcesChart />
          <ConversionFunnel />
        </div>
      </div>
    </div>
  );
}
