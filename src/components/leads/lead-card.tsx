'use client';

import { formatCLP } from '@/lib/utils';
import { MapPin, Users } from 'lucide-react';

interface LeadCardProps {
  lead: any;
}

export function LeadCard({ lead }: LeadCardProps) {
  // Calculate days since created
  const createdDate = new Date(lead.created_at);
  const today = new Date();
  const daysSinceCreated = Math.floor(
    (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Get source badge color
  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'INSTAGRAM': 'bg-pink-100 text-pink-800',
      'FACEBOOK': 'bg-blue-100 text-blue-800',
      'GOOGLE': 'bg-yellow-100 text-yellow-800',
      'REFERENCIA': 'bg-purple-100 text-purple-800',
      'DIRECTO': 'bg-gray-100 text-gray-800',
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const budgetRange = lead.budget_min && lead.budget_max
    ? `${formatCLP(lead.budget_min)} - ${formatCLP(lead.budget_max)}`
    : 'No definido';

  return (
    <div
      className="bg-white rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow"
      style={{
        borderLeftColor:
          lead.score >= 70
            ? '#27AE60'
            : lead.score >= 40
            ? '#F39C12'
            : '#E74C3C',
      }}
    >
      {/* Header with Name and Score */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">{lead.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{lead.email}</p>
        </div>
        <span
          className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold border ${getScoreColor(lead.score)}`}
        >
          {lead.score}%
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-100 text-xs">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-700">Teléfono:</span> {lead.phone || 'N/A'}
        </p>
      </div>

      {/* Budget and Guest Count */}
      <div className="space-y-1.5 mb-3 text-xs">
        <div>
          <p className="text-gray-600 truncate">
            <span className="font-semibold text-gray-700">Presupuesto:</span>
          </p>
          <p className="font-medium text-gray-900" style={{ color: '#2E75B6' }}>
            {budgetRange}
          </p>
        </div>
        {lead.guest_count && (
          <div className="flex items-center gap-1 text-gray-600">
            <Users size={12} />
            <span>{lead.guest_count} invitados</span>
          </div>
        )}
      </div>

      {/* Venue and Source */}
      <div className="space-y-1.5 mb-3 text-xs">
        {lead.venue && (
          <div className="flex items-start gap-1 text-gray-600">
            <MapPin size={12} className="mt-0.5 flex-shrink-0" />
            <span className="truncate">{lead.venue.name}</span>
          </div>
        )}
        <div>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getSourceColor(lead.source)}`}>
            {lead.source}
          </span>
        </div>
      </div>

      {/* Footer with Agent and Days */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span className="truncate">{lead.agent?.name || 'Sin asignar'}</span>
        <span className="flex-shrink-0 ml-2">
          {daysSinceCreated === 0 ? 'Hoy' : `${daysSinceCreated}d`}
        </span>
      </div>
    </div>
  );
}
