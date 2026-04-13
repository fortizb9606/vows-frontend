'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Settings, Plus, Edit2, Trash2, Check, X, Wifi, WifiOff, MapPin, Mail, Phone } from 'lucide-react';

type Provider = Database['public']['Tables']['providers']['Row'];
type Agent = Database['public']['Tables']['agents']['Row'];

// Loading skeleton component
const SkeletonLoading = () => (
  <div className="space-y-4">
    <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl animate-pulse" />
    <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
    <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
  </div>
);

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAgent, setSavingAgent] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    rut: '',
    email: '',
    phone: '',
    city: '',
  });
  const [agentFormData, setAgentFormData] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
    checkSupabaseStatus();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.id) {
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (providerData) {
          setProvider(providerData);
          setFormData({
            company_name: providerData.company_name,
            rut: providerData.rut || '',
            email: providerData.email || '',
            phone: providerData.phone || '',
            city: providerData.city || '',
          });
        }
      }

      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('name', { ascending: true });

      if (agentsData) {
        setAgents(agentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSupabaseStatus = async () => {
    try {
      const { data, error } = await supabase.from('providers').select('id').limit(1);
      setSupabaseStatus('connected');
    } catch (error) {
      setSupabaseStatus('disconnected');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('providers')
        .update({
          company_name: formData.company_name,
          rut: formData.rut,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
        })
        .eq('id', provider.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAgent(true);
    try {
      if (editingAgentId) {
        const { error } = await supabase
          .from('agents')
          .update({
            name: agentFormData.name,
            email: agentFormData.email,
            phone: agentFormData.phone,
            is_active: agentFormData.is_active,
          })
          .eq('id', editingAgentId);

        if (error) throw error;
        setEditingAgentId(null);
      } else {
        const { error } = await supabase.from('agents').insert({
          name: agentFormData.name,
          email: agentFormData.email,
          phone: agentFormData.phone,
          is_active: agentFormData.is_active,
        });

        if (error) throw error;
      }

      setAgentFormData({
        name: '',
        email: '',
        phone: '',
        is_active: true,
      });
      setShowAddAgent(false);
      fetchData();
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setSavingAgent(false);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setAgentFormData({
      name: agent.name,
      email: agent.email || '',
      phone: agent.phone || '',
      is_active: agent.is_active,
    });
    setEditingAgentId(agent.id);
    setShowAddAgent(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const { error } = await supabase.from('agents').delete().eq('id', agentId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const closeAgentForm = () => {
    setShowAddAgent(false);
    setEditingAgentId(null);
    setAgentFormData({
      name: '',
      email: '',
      phone: '',
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600 mt-2">Administra tu perfil y preferencias</p>
          </div>
          <SkeletonLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2">Administra tu perfil, plan y equipo de ventas</p>
        </div>

        {/* Supabase Connection Status Card */}
        <Card className="mb-6 border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${supabaseStatus === 'connected' ? 'bg-green-100' : 'bg-red-100'}`}>
                {supabaseStatus === 'connected' ? (
                  <Wifi size={24} className="text-green-600" />
                ) : (
                  <WifiOff size={24} className="text-red-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">Estado de Conexión</p>
                <p className="text-sm text-gray-600">
                  {supabaseStatus === 'connected' ? 'Base de datos conectada' : 'Error de conexión'}
                </p>
              </div>
            </div>
            <Badge
              className={`text-white font-medium ${
                supabaseStatus === 'connected'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {supabaseStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </Card>

        {/* Provider Profile Card */}
        <Card className="mb-6 border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Perfil de la Empresa</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <Input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Mi Empresa de Eventos"
                    className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    RUT
                  </label>
                  <Input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    placeholder="XX.XXX.XXX-X"
                    className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contacto@empresa.com"
                    className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+56 2 1234 5678"
                    className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Ciudad
                </label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Santiago"
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Subscription Plan Card */}
        <Card className="mb-6 border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan de Suscripción</h2>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl text-white mb-6">
              <p className="text-sm font-medium text-blue-100 mb-2">Plan Actual</p>
              <h3 className="text-3xl font-bold mb-4">Professional</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-blue-200" />
                  <span className="text-sm">Venues ilimitados</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-blue-200" />
                  <span className="text-sm">Gestión de precios avanzada</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-blue-200" />
                  <span className="text-sm">CRM completo</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-blue-200" />
                  <span className="text-sm">Reportes detallados</span>
                </div>
              </div>
              <p className="text-sm text-blue-100">Renovación: 15 de abril de 2026</p>
            </div>
            <Button
              variant="outline"
              className="w-full md:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg"
            >
              Cambiar Plan
            </Button>
          </div>
        </Card>

        {/* Sales Agents Section */}
        <Card className="border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Agentes de Ventas</h2>
              <Button
                onClick={() => setShowAddAgent(!showAddAgent)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
                Agregar Agente
              </Button>
            </div>

            {/* Add/Edit Agent Form */}
            {showAddAgent && (
              <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  {editingAgentId ? 'Editar Agente' : 'Nuevo Agente'}
                </h3>
                <form onSubmit={handleAddAgent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={agentFormData.name}
                        onChange={(e) =>
                          setAgentFormData({ ...agentFormData, name: e.target.value })
                        }
                        placeholder="Juan Pérez"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={agentFormData.email}
                        onChange={(e) =>
                          setAgentFormData({ ...agentFormData, email: e.target.value })
                        }
                        placeholder="juan@empresa.com"
                        className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <Input
                      type="tel"
                      value={agentFormData.phone}
                      onChange={(e) =>
                        setAgentFormData({ ...agentFormData, phone: e.target.value })
                      }
                      placeholder="+56 9 1234 5678"
                      className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="agent-active"
                      checked={agentFormData.is_active}
                      onChange={(e) =>
                        setAgentFormData({ ...agentFormData, is_active: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                    />
                    <label htmlFor="agent-active" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Agente Activo
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={savingAgent}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      {savingAgent ? 'Guardando...' : editingAgentId ? 'Guardar Cambios' : 'Crear Agente'}
                    </Button>
                    <Button
                      type="button"
                      onClick={closeAgentForm}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Agents List */}
            {agents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-base">No hay agentes registrados</p>
                <p className="text-gray-500 text-sm mt-1">Comienza agregando tu primer agente de ventas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <Badge
                          className={`mt-2 text-white font-medium ${
                            agent.is_active
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-500 hover:bg-gray-600'
                          }`}
                        >
                          <Check size={14} className="mr-1" />
                          {agent.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEditAgent(agent)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl">
                            <AlertDialogTitle>Eliminar agente</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que deseas eliminar a {agent.name}? Esta acción no se puede
                              deshacer.
                            </AlertDialogDescription>
                            <div className="flex gap-3">
                              <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAgent(agent.id)}
                                className="bg-red-600 hover:bg-red-700 rounded-lg"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {agent.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          <a href={`mailto:${agent.email}`} className="hover:text-blue-600">
                            {agent.email}
                          </a>
                        </div>
                      )}
                      {agent.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <a href={`tel:${agent.phone}`} className="hover:text-blue-600">
                            {agent.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
