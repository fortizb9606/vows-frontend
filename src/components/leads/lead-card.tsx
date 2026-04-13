'use client';

import { formatCLP } from '@/lib/utils';
import { MapPin, Users, Calendar, Phone, Mail } from 'lucide-react';

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
    if (score >= 70) return { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100' };
    if (score >= 40) return { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100' };
    return { bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100' };
  };

  // Get source badge color
  const getSourceColor = (source: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'INSTAGRAM': { bg: 'bg-pink-50', text: 'text-pink-700' },
      'FACEBOOK': { bg: 'bg-blue-50', text: 'text-blue-700' },
      'GOOGLE': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
      'REFERENCIA': { bg: 'bg-purple-50', text: 'text-purple-700' },
      'DIRECTO': { bg: 'bg-slate-50', text: 'text-slate-700' },
    };
    return colors[source] || { bg: 'bg-gray-50', text: 'text-gray-700' };
  };

  const scoreColor = getScoreColor(lead.score || 50);
  const sourceColor = getSourceColor(lead.source);

  const budgetRange = lead.budget_min && lead.budget_max
    ? `${formatCLP(lead.budget_min)} - ${formatCLP(lead.budget_max)}`
    : lead.budget_min
    ? `Desde ${formatCLP(lead.budget_min)}`
    : 'Sin definir';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Name and Score */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{lead.name}</h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{lead.email}</p>
          </div>
          <span className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${scoreColor.badge} ${scoreColor.text}`}>
            {lead.score || 50}%
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-2">
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone size={14} className="flex-shrink-0 text-gray-400" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail size={14} className="flex-shrink-0 text-gray-400" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
      </div>

      {/* Budget and Guest Count */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-2">
        {(lead.budget_min || lead.budget_max) && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Presupuesto</p>
            <p className="font-semibold text-sm text-blue-600">{budgetRange}</p>
          </div>
        )}
        {lead.guest_count && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Users size={14} className="flex-shrink-0 text-gray-400" />
            <span>{lead.guest_count} invitados</span>
          </div>
        )}
        {lead.event_date_range_start && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={14} className="flex-shrink-0 text-gray-400" />
            <span>{new Date(lead.event_date_range_start).toLocaleDateString('es-CL')}</span>
          </div>
        )}
      </div>

      {/* Venue and Source */}
      <div className="px-4 py-3 space-y-2">
        {lead.venue && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin size={14} className="flex-shrink-0 text-gray-400" />
            <span className="truncate">{lead.venue.name}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${sourceColor.bg} ${sourceColor.text}`}>
            {lead.source || 'Directo'}
          </span>
          <span className="text-xs text-gray-400">
            {daysSinceCreated === 0 ? 'Hoy' : `${daysSinceCreated}d`}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 truncate">
          {lead.agent?.name || 'Sin asignar'}
        </p>
      </div>
    </div>
  );
}
