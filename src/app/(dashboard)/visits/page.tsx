'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Calendar, MapPin, User, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type Visit = Database['public']['Tables']['visits']['Row'] & {
  leads?: Database['public']['Tables']['leads']['Row'];
  venues?: Database['public']['Tables']['venues']['Row'];
  agents?: Database['public']['Tables']['agents']['Row'];
};

type Lead = Database['public']['Tables']['leads']['Row'];
type Venue = Database['public']['Tables']['venues']['Row'];
type Agent = Database['public']['Tables']['agents']['Row'];

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    lead_id: '',
    venue_id: '',
    agent_id: '',
    scheduled_at: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [visitsRes, leadsRes, venuesRes, agentsRes] = await Promise.all([
        supabase
          .from('visits')
          .select('*, leads(id, name, email, phone), venues(id, name), agents(id, name)')
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true }),
        supabase.from('leads').select('*'),
        supabase.from('venues').select('*'),
        supabase.from('agents').select('*').eq('is_active', true),
      ]);

      if (visitsRes.error) throw visitsRes.error;
      if (leadsRes.error) throw leadsRes.error;
      if (venuesRes.error) throw venuesRes.error;
      if (agentsRes.error) throw agentsRes.error;

      setVisits(visitsRes.data || []);
      setLeads(leadsRes.data || []);
      setVenues(venuesRes.data || []);
      setAgents(agentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead_id || !formData.venue_id || !formData.agent_id || !formData.scheduled_at) {
      return;
    }

    try {
      const { error } = await supabase.from('visits').insert({
        lead_id: formData.lead_id,
        venue_id: formData.venue_id,
        agent_id: formData.agent_id,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        notes: formData.notes || null,
        status: 'SCHEDULED',
      });

      if (error) throw error;
      setFormData({
        lead_id: '',
        venue_id: '',
        agent_id: '',
        scheduled_at: '',
        notes: '',
      });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding visit:', error);
    }
  };

  const handleCompleteVisit = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({ status: 'COMPLETED' })
        .eq('id', visitId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error completing visit:', error);
    }
  };

  const handleCancelVisit = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({ status: 'CANCELLED' })
        .eq('id', visitId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error cancelling visit:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge style={{ backgroundColor: '#3498DB' }} className="text-white">
            Programado
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge style={{ backgroundColor: '#10b981' }} className="text-white">
            Completado
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge style={{ backgroundColor: '#ef4444' }} className="text-white">
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#1B4F72' }}>
            Calendario de Visitas
          </h1>
          <p className="text-gray-600 mt-2">Administra las visitas programadas a venues</p>
        </div>

        {/* Add Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
            style={{ backgroundColor: '#2E75B6' }}
          >
            <Plus size={20} />
            Programar Nueva Visita
          </Button>
        </div>

        {/* Add Visit Form */}
        {showAddForm && (
          <Card className="mb-8 p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Nueva Visita</h2>
            <form onSubmit={handleAddVisit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente *
                  </label>
                  <select
                    value={formData.lead_id}
                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#1B4F72' } as any}
                  >
                    <option value="">Selecciona un cliente</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} ({lead.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue *
                  </label>
                  <select
                    value={formData.venue_id}
                    onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#1B4F72' } as any}
                  >
                    <option value="">Selecciona un venue</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agente *
                  </label>
                  <select
                    value={formData.agent_id}
                    onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#1B4F72' } as any}
                  >
                    <option value="">Selecciona un agente</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales sobre la visita..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#1B4F72' } as any}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  style={{ backgroundColor: '#2E75B6' }}
                >
                  Programar Visita
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Visits List */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">Cargando visitas...</div>
        ) : visits.length === 0 ? (
          <Card className="p-8 text-center border border-gray-200">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No hay visitas programadas</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <Card
                key={visit.id}
                className={`p-6 border-l-4 ${
                  visit.status === 'COMPLETED'
                    ? 'border-l-green-500'
                    : visit.status === 'CANCELLED'
                      ? 'border-l-red-500'
                      : 'border-l-blue-500'
                } border border-gray-200`}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Cliente</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {visit.leads?.name || 'Desconocido'}
                    </p>
                    {visit.leads?.email && (
                      <p className="text-sm text-gray-600">{visit.leads.email}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      <MapPin size={14} />
                      Venue
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {visit.venues?.name || 'Desconocido'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      <User size={14} />
                      Agente
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {visit.agents?.name || 'Desconocido'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      <Calendar size={14} />
                      Fecha y Hora
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDateTime(visit.scheduled_at)}
                    </p>
                  </div>

                  <div className="flex items-center justify-end">
                    {getStatusBadge(visit.status)}
                  </div>
                </div>

                {visit.notes && (
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-700">{visit.notes}</p>
                  </div>
                )}

                {visit.status === 'SCHEDULED' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleCompleteVisit(visit.id)}
                      className="flex items-center gap-2"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      <CheckCircle size={16} />
                      Completar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2 text-red-600 hover:text-red-800"
                        >
                          <XCircle size={16} />
                          Cancelar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Cancelar visita</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas cancelar esta visita?
                        </AlertDialogDescription>
                        <div className="flex gap-3">
                          <AlertDialogCancel>No, mantener</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelVisit(visit.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Cancelar Visita
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
