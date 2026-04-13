'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader } from 'lucide-react';

interface LeadFormModalProps {
  lead?: any;
  venues: any[];
  agents: any[];
  onClose: () => void;
  onSave: () => void;
}

const SOURCE_OPTIONS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'GOOGLE', label: 'Google' },
  { value: 'REFERENCIA', label: 'Referencia' },
  { value: 'DIRECTO', label: 'Directo' },
];

export function LeadFormModal({
  lead,
  venues,
  agents,
  onClose,
  onSave,
}: LeadFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'DIRECTO',
    budget_min: '',
    budget_max: '',
    guest_count: '',
    event_date_range_start: '',
    event_date_range_end: '',
    venue_id: '',
    assigned_agent_id: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || 'DIRECTO',
        budget_min: lead.budget_min?.toString() || '',
        budget_max: lead.budget_max?.toString() || '',
        guest_count: lead.guest_count?.toString() || '',
        event_date_range_start: lead.event_date_range_start || '',
        event_date_range_end: lead.event_date_range_end || '',
        venue_id: lead.venue_id || '',
        assigned_agent_id: lead.assigned_agent_id || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('El teléfono es requerido');
      return false;
    }
    if (formData.budget_min && formData.budget_max) {
      const min = parseInt(formData.budget_min);
      const max = parseInt(formData.budget_max);
      if (min > max) {
        setError('El presupuesto mínimo no puede ser mayor al máximo');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const dataToSave = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        source: formData.source,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
        event_date_range_start: formData.event_date_range_start || null,
        event_date_range_end: formData.event_date_range_end || null,
        venue_id: formData.venue_id || null,
        assigned_agent_id: formData.assigned_agent_id || null,
        notes: formData.notes.trim() || null,
      };

      if (lead) {
        // Update existing lead
        const { error: updateError } = await supabase
          .from('leads')
          .update(dataToSave)
          .eq('id', lead.id);

        if (updateError) throw updateError;
      } else {
        // Create new lead
        const { error: insertError } = await supabase.from('leads').insert([
          {
            ...dataToSave,
            status: 'NUEVO',
            score: 50, // Default score
          },
        ]);

        if (insertError) throw insertError;
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {lead ? 'Editar Lead' : 'Nuevo Lead'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Name, Email, Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Juan Pérez"
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@example.com"
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Source and Guest Count Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fuente
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cantidad de Invitados
              </label>
              <input
                type="number"
                name="guest_count"
                value={formData.guest_count}
                onChange={handleChange}
                placeholder="100"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Budget Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Presupuesto Mínimo (CLP)
              </label>
              <input
                type="number"
                name="budget_min"
                value={formData.budget_min}
                onChange={handleChange}
                placeholder="1000000"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Presupuesto Máximo (CLP)
              </label>
              <input
                type="number"
                name="budget_max"
                value={formData.budget_max}
                onChange={handleChange}
                placeholder="5000000"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Event Date Range Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Evento (Desde)
              </label>
              <input
                type="date"
                name="event_date_range_start"
                value={formData.event_date_range_start}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Evento (Hasta)
              </label>
              <input
                type="date"
                name="event_date_range_end"
                value={formData.event_date_range_end}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Venue and Agent Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferencia de Venue
              </label>
              <select
                name="venue_id"
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">Sin venue</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Agente Asignado
              </label>
              <select
                name="assigned_agent_id"
                value={formData.assigned_agent_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">Sin asignar</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notas adicionales sobre el lead..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {lead ? 'Guardar Cambios' : 'Crear Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
