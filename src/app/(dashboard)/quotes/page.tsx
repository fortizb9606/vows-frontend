'use client';

import { useState } from 'react';
import { Plus, Eye, Pencil, FileText } from 'lucide-react';

type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted';

interface Quote {
  id: string;
  client: string;
  date: string;
  amount: number;
  status: QuoteStatus;
  expires: string | null;
}

interface Template {
  id: string;
  name: string;
  description: string;
}

const quotes: Quote[] = [
  { id: 'C-001', client: 'Andrea Muñoz', date: '2026-04-10', amount: 4200000, status: 'sent', expires: '2026-04-17' },
  { id: 'C-002', client: 'Roberto Silva', date: '2026-04-08', amount: 3500000, status: 'viewed', expires: '2026-04-15' },
  { id: 'C-003', client: 'María & Juan', date: '2026-03-15', amount: 4500000, status: 'accepted', expires: null },
  { id: 'C-004', client: 'Felipe Contreras', date: '2026-04-06', amount: 2800000, status: 'draft', expires: null },
];

const templates: Template[] = [
  { id: '1', name: 'Cotización Estándar', description: 'Paquete completo con servicios básicos' },
  { id: '2', name: 'Paquete Personalizado', description: 'Diseño personalizado según necesidades' },
  { id: '3', name: 'Servicio Express', description: 'Solución rápida para eventos próximos' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadgeStyles(status: QuoteStatus): string {
  const baseStyles = 'inline-block px-3 py-1 rounded-full text-sm font-medium';
  switch (status) {
    case 'draft':
      return `${baseStyles} bg-gray-100 text-gray-800`;
    case 'sent':
      return `${baseStyles} bg-yellow-100 text-yellow-800`;
    case 'viewed':
      return `${baseStyles} bg-blue-100 text-blue-800`;
    case 'accepted':
      return `${baseStyles} bg-green-100 text-green-800`;
    default:
      return baseStyles;
  }
}

function getStatusLabel(status: QuoteStatus): string {
  switch (status) {
    case 'draft':
      return 'Borrador';
    case 'sent':
      return 'Enviada';
    case 'viewed':
      return 'Vista';
    case 'accepted':
      return 'Aceptada';
    default:
      return status;
  }
}

export default function QuotesPage() {
  const [filter, setFilter] = useState<'all' | QuoteStatus>('all');

  const filteredQuotes = filter === 'all' ? quotes : quotes.filter((q) => q.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-gray-500 mt-1">Gestiona tus cotizaciones y propuestas</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={20} />
          Nueva Cotización
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'draft'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Borradores
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'sent'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Enviadas
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'accepted'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Aceptadas
        </button>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Monto</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vence</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredQuotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{quote.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{quote.client}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{quote.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(quote.amount)}</td>
                <td className="px-6 py-4">
                  <span className={getStatusBadgeStyles(quote.status)}>
                    {getStatusLabel(quote.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {quote.expires || '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Ver cotización"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar cotización"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Templates Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates de Cotización</h2>
          <p className="text-gray-500 mt-1">Utiliza una plantilla para crear cotizaciones rápidamente</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
            >
              <div className="flex items-start gap-3 mb-3">
                <FileText size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
              </div>
              <p className="text-gray-600 text-sm">{template.description}</p>
              <button className="mt-4 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors">
                Usar Plantilla
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
