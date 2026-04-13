'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LeadCard } from '@/components/leads/lead-card';
import { LeadFormModal } from '@/components/leads/lead-form-modal';
import { Plus, ChevronDown } from 'lucide-react';

type LeadStatus = 'NUEVO' | 'CALIFICADO' | 'EN CONTACTO/NURTURING' | 'VISITA AGENDADA' | 'CONVERTIDO' | 'PERDIDO';

const KANBAN_COLUMNS: LeadStatus[] = [
  'NUEVO',
  'CALIFICADO',
  'EN CONTACTO/NURTURING',
  'VISITA AGENDADA',
  'CONVERTIDO',
  'PERDIDO',
];

const COLUMN_CONFIG: Record<LeadStatus, { color: string; bgColor: string }> = {
  'NUEVO': { color: '#06B6D4', bgColor: 'from-cyan-50' },
  'CALIFICADO': { color: '#10B981', bgColor: 'from-green-50' },
  'EN CONTACTO/NURTURING': { color: '#EAB308', bgColor: 'from-yellow-50' },
  'VISITA AGENDADA': { color: '#3B82F6', bgColor: 'from-blue-50' },
  'CONVERTIDO': { color: '#10B981', bgColor: 'from-emerald-50' },
  'PERDIDO': { color: '#EF4444', bgColor: 'from-red-50' },
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
        .select(
          `
          *,
          venue:venue_id (id, name),
          agent:assigned_agent_id (id, name)
        `
        )
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leads / CRM</h1>
          <p className="text-gray-600">Gestiona tu pipeline de leads con el tablero Kanban</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Venue Filter */}
          <div className="relative flex-1 md:flex-none">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Venue</label>
            <div className="relative">
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="w-full md:w-48 appearance-none px-4 py-2.5 rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">Todos los venues</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Agent Filter */}
          <div className="relative flex-1 md:flex-none">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Agente</label>
            <div className="relative">
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full md:w-48 appearance-none px-4 py-2.5 rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">Todos los agentes</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* New Lead Button */}
          <div className="flex items-end">
            <button
              onClick={handleAddLead}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus size={20} />
              Nuevo Lead
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {KANBAN_COLUMNS.map((status) => {
              const columnLeads = getFilteredLeads(status);
              const config = COLUMN_CONFIG[status];

              return (
                <div
                  key={status}
                  className="flex flex-col flex-shrink-0 w-96 rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Column Header */}
                  <div
                    className="px-6 py-4 border-b border-gray-100"
                    style={{
                      borderTopWidth: '4px',
                      borderTopColor: config.color,
                      backgroundColor: `${config.color}08`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: config.color }}
                        />
                        <h3 className="font-bold text-gray-900">{status}</h3>
                      </div>
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {columnLeads.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)] px-4 py-4 space-y-3">
                    {columnLeads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                          <span className="text-xl">📭</span>
                        </div>
                        <p className="text-sm font-medium">Sin leads</p>
                      </div>
                    ) : (
                      columnLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => handleLeadClick(lead)}
                          className="cursor-pointer transform transition-all duration-200 hover:scale-105"
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
