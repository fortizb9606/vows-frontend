'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import { formatCLP } from '@/lib/utils';
import { LeadCard } from '@/components/leads/lead-card';
import { LeadFormModal } from '@/components/leads/lead-form-modal';
import { Plus, Filter } from 'lucide-react';

type LeadStatus = 'NUEVO' | 'CALIFICADO' | 'EN CONTACTO' | 'VISITA AGENDADA' | 'CONVERTIDO' | 'PERDIDO';

const KANBAN_COLUMNS: LeadStatus[] = ['NUEVO', 'CALIFICADO', 'EN CONTACTO', 'VISITA AGENDADA', 'CONVERTIDO', 'PERDIDO'];

const COLUMN_COLORS: Record<LeadStatus, string> = {
  'NUEVO': '#3498DB',
  'CALIFICADO': '#9B59B6',
  'EN CONTACTO': '#F39C12',
  'VISITA AGENDADA': '#16A085',
  'CONVERTIDO': '#27AE60',
  'PERDIDO': '#E74C3C',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          venue:venue_id (id, name),
          agent:assigned_agent_id (id, name)
        `)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

      // Fetch venues
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select('id, name')
        .order('name');

      if (venuesError) throw venuesError;
      setVenues(venuesData || []);

      // Fetch agents (users with role 'agent')
      const { data: agentsData, error: agentsError } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'agent')
        .order('name');

      if (agentsError) throw agentsError;
      setAgents(agentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLeads = (status: LeadStatus) => {
    return leads.filter((lead) => {
      const statusMatch = lead.status === status;
      const venueMatch = !selectedVenue || lead.venue_id === selectedVenue;
      const agentMatch = !selectedAgent || lead.assigned_agent_id === selectedAgent;
      return statusMatch && venueMatch && agentMatch;
    });
  };

  const getTotalLeads = (status: LeadStatus) => getFilteredLeads(status).length;

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
    setShowFormModal(true);
  };

  const handleAddLead = () => {
    setSelectedLead(null);
    setShowFormModal(true);
  };

  const handleFormClose = () => {
    setShowFormModal(false);
    setSelectedLead(null);
  };

  const handleFormSave = () => {
    fetchData();
    handleFormClose();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#1B4F72' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B4F72' }}>
            Leads
          </h1>
          <p className="text-gray-600">Gestiona tu pipeline de leads con el tablero Kanban</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2"
            style={{ focusRing: '2px solid #3498DB' }}
          >
            <option value="">Todos los venues</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2"
            style={{ focusRing: '2px solid #3498DB' }}
          >
            <option value="">Todos los agentes</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddLead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: '#1B4F72' }}
          >
            <Plus size={20} />
            Nuevo Lead
          </button>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-6">
            {KANBAN_COLUMNS.map((status) => {
              const columnLeads = getFilteredLeads(status);
              const columnColor = COLUMN_COLORS[status];

              return (
                <div
                  key={status}
                  className="flex flex-col bg-gray-100 rounded-lg p-4 w-96 flex-shrink-0"
                >
                  {/* Column Header */}
                  <div className="mb-4 pb-3 border-b-2" style={{ borderColor: columnColor }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: columnColor }}
                      />
                      <h3 className="font-bold text-gray-900">{status}</h3>
                    </div>
                    <p className="text-xs font-semibold text-gray-500">
                      {columnLeads.length} {columnLeads.length === 1 ? 'lead' : 'leads'}
                    </p>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                    {columnLeads.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">Sin leads</p>
                      </div>
                    ) : (
                      columnLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => handleLeadClick(lead)}
                          className="cursor-pointer"
                        >
                          <LeadCard lead={lead} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <LeadFormModal
          lead={selectedLead}
          venues={venues}
          agents={agents}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
}
