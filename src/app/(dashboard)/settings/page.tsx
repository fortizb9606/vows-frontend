'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Plus, Edit2, Trash2, Check, X, Wifi, WifiOff } from 'lucide-react';

type Provider = Database['public']['Tables']['providers']['Row'];
type Agent = Database['public']['Tables']['agents']['Row'];

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'disconnected'>('disconnected');
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
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleToggleAgent = async (agentId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ is_active: !isActive })
        .eq('id', agentId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling agent:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#1B4F72' }}>
            Configuración
          </h1>
          <p className="text-gray-600 mt-2">Administra tu perfil y preferencias</p>
        </div>

        {/* Supabase Connection Status */}
        <Card className="mb-8 p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {supabaseStatus === 'connected' ? (
                <Wifi size={24} className="text-green-600" />
              ) : (
                <WifiOff size={24} className="text-red-600" />
              )}
              <div>
                <p className="font-semibold text-gray-900">Estado de Conexión</p>
                <p className="text-sm text-gray-600">
                  {supabaseStatus === 'connected' ? 'Base de datos conectada' : 'Error de conexión'}
                </p>
              </div>
            </div>
            <Badge
              style={{
                backgroundColor:
                  supabaseStatus === 'connected' ? '#10b981' : '#ef4444',
              }}
              className="text-white"
            >
              {supabaseStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </Card>

        {/* Provider Profile Section */}
        <Card className="mb-8 p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Settings size={24} style={{ color: '#1B4F72' }} />
            Perfil de la Empresa
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Empresa
                </label>
                <Input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Mi Empresa de Eventos"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RUT
                </label>
                <Input
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  placeholder="XX.XXX.XXX-X"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@empresa.com"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+56 2 1234 5678"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Santiago"
                className="w-full"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                style={{ backgroundColor: '#2E75B6' }}
                className="w-full md:w-auto"
              >
                Guardar Perfil
              </Button>
            </div>
          </form>
        </Card>

        {/* Subscription Plan Section */}
        <Card className="mb-8 p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Plan de Suscripción</h2>
          <div className="bg-gradient-to-r p-6 rounded-lg" style={{ backgroundImage: `linear-gradient(135deg, #1B4F72 0%, #2E75B6 100%)` }}>
            <p className="text-white text-sm font-medium mb-2">Plan Actual</p>
            <p className="text-white text-3xl font-bold mb-4">Professional</p>
            <div className="space-y-2 text-white text-sm mb-4">
              <p>✓ Venues ilimitados</p>
              <p>✓ Gestión de precios avanzada</p>
              <p>✓ CRM completo</p>
              <p>✓ Reportes detallados</p>
            </div>
            <p className="text-white text-sm opacity-75">Renovación: 15 de abril de 2026</p>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full md:w-auto">
              Cambiar Plan
            </Button>
          </div>
        </Card>

        {/* Sales Agents Section */}
        <Card className="p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Agentes de Ventas</h2>
            <Button
              onClick={() => setShowAddAgent(!showAddAgent)}
              className="flex items-center gap-2"
              style={{ backgroundColor: '#2E75B6' }}
            >
              <Plus size={20} />
              Agregar Agente
            </Button>
          </div>

          {/* Add/Edit Agent Form */}
          {showAddAgent && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-4">
                {editingAgentId ? 'Editar Agente' : 'Nuevo Agente'}
              </h3>
              <form onSubmit={handleAddAgent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <Input
                      type="text"
                      value={agentFormData.name}
                      onChange={(e) =>
                        setAgentFormData({ ...agentFormData, name: e.target.value })
                      }
                      placeholder="Juan Pérez"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={agentFormData.email}
                      onChange={(e) =>
                        setAgentFormData({ ...agentFormData, email: e.target.value })
                      }
                      placeholder="juan@empresa.com"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={agentFormData.phone}
                    onChange={(e) =>
                      setAgentFormData({ ...agentFormData, phone: e.target.value })
                    }
                    placeholder="+56 9 1234 5678"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agentFormData.is_active}
                    onChange={(e) =>
                      setAgentFormData({ ...agentFormData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#1B4F72' }}
                  />
                  <label className="text-sm font-medium text-gray-700">Agente Activo</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#2E75B6' }}
                    className="flex-1"
                  >
                    {editingAgentId ? 'Guardar Cambios' : 'Crear Agente'}
                  </Button>
                  <Button
                    type="button"
                    onClick={closeAgentForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Agents List */}
          {loading ? (
            <div className="text-center py-8 text-gray-600">Cargando agentes...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No hay agentes registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    {agent.email && (
                      <p className="text-sm text-gray-600">{agent.email}</p>
                    )}
                    {agent.phone && (
                      <p className="text-sm text-gray-600">{agent.phone}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      style={{
                        backgroundColor: agent.is_active ? '#10b981' : '#6b7280',
                      }}
                      className="text-white flex items-center gap-1"
                    >
                      {agent.is_active ? (
                        <>
                          <Check size={14} />
                          Activo
                        </>
                      ) : (
                        <>
                          <X size={14} />
                          Inactivo
                        </>
                      )}
                    </Badge>

                    <Button
                      onClick={() => handleEditAgent(agent)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={16} />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Eliminar agente</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar a {agent.name}? Esta acción no se
                          puede deshacer.
                        </AlertDialogDescription>
                        <div className="flex gap-3">
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
