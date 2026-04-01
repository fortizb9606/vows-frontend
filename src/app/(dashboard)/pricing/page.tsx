'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Plus, DollarSign } from 'lucide-react';

type PricingRule = Database['public']['Tables']['pricing_rules']['Row'];
type Venue = Database['public']['Tables']['venues']['Row'];

export default function PricingPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [pricingRules, setPricingRules] = useState<(PricingRule & { venues?: Venue })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorDate, setSimulatorDate] = useState('');
  const [simulatorGuests, setSimulatorGuests] = useState('');
  const [simulatorResult, setSimulatorResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    rule_type: 'DAY_OF_WEEK' as PricingRule['rule_type'],
    adjustment_type: 'PERCENTAGE' as PricingRule['adjustment_type'],
    adjustment_value: '',
    day_of_week: '',
    priority: '1',
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenueId) {
      fetchPricingRules();
    }
  }, [selectedVenueId]);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase.from('venues').select('*');
      if (error) throw error;
      setVenues(data || []);
      if (data && data.length > 0) {
        setSelectedVenueId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchPricingRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*, venues(id, name)')
        .eq('venue_id', selectedVenueId)
        .order('priority', { ascending: true });
      if (error) throw error;
      setPricingRules(data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('pricing_rules').insert({
        venue_id: selectedVenueId,
        name: formData.name,
        rule_type: formData.rule_type,
        adjustment_type: formData.adjustment_type,
        adjustment_value: parseFloat(formData.adjustment_value),
        day_of_week: formData.day_of_week || null,
        priority: parseInt(formData.priority),
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
      });
      if (error) throw error;
      setShowAddForm(false);
      setFormData({
        name: '',
        rule_type: 'DAY_OF_WEEK',
        adjustment_type: 'PERCENTAGE',
        adjustment_value: '',
        day_of_week: '',
        priority: '1',
        valid_from: '',
        valid_until: '',
        is_active: true,
      });
      fetchPricingRules();
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase.from('pricing_rules').delete().eq('id', ruleId);
      if (error) throw error;
      fetchPricingRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId);
      if (error) throw error;
      fetchPricingRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const runSimulator = async () => {
    if (!simulatorDate || !simulatorGuests || !selectedVenueId) return;
    try {
      const { data, error } = await supabase.rpc('compute_date_price', {
        p_venue_id: selectedVenueId,
        p_event_date: simulatorDate,
        p_guest_count: parseInt(simulatorGuests),
      });
      if (error) throw error;
      setSimulatorResult(data);
    } catch (error) {
      console.error('Error running simulator:', error);
      setSimulatorResult(null);
    }
  };

  const getRuleTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'DAY_OF_WEEK':
        return 'bg-blue-100 text-blue-800';
      case 'SEASON':
        return 'bg-green-100 text-green-800';
      case 'LAST_MINUTE':
        return 'bg-orange-100 text-orange-800';
      case 'VOLUME':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#1B4F72' }}>
            Gestión de Precios
          </h1>
          <p className="text-gray-600 mt-2">Administra las reglas de precios para tus venues</p>
        </div>

        {/* Venue Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona un Venue</label>
          <select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#1B4F72' } as any}
          >
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Simulator */}
        <Card className="mb-8 p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={24} style={{ color: '#1B4F72' }} />
            <h2 className="text-xl font-semibold">Simulador de Precios</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha del Evento</label>
              <Input
                type="date"
                value={simulatorDate}
                onChange={(e) => setSimulatorDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Huéspedes</label>
              <Input
                type="number"
                value={simulatorGuests}
                onChange={(e) => setSimulatorGuests(e.target.value)}
                placeholder="100"
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={runSimulator}
                className="w-full"
                style={{ backgroundColor: '#1B4F72' }}
              >
                Simular
              </Button>
            </div>
          </div>
          {simulatorResult && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Precio Base</p>
                  <p className="text-2xl font-bold" style={{ color: '#1B4F72' }}>
                    ${simulatorResult.base_price?.toLocaleString('es-CL') || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Precio Final</p>
                  <p className="text-2xl font-bold" style={{ color: '#2E75B6' }}>
                    ${simulatorResult.final_price?.toLocaleString('es-CL') || '0'}
                  </p>
                </div>
                {simulatorResult.rules_applied && simulatorResult.rules_applied.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Reglas Aplicadas</p>
                    <p className="text-lg font-semibold">{simulatorResult.rules_applied.length}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Add Rule Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
            style={{ backgroundColor: '#2E75B6' }}
          >
            <Plus size={20} />
            Agregar Regla de Precio
          </Button>
        </div>

        {/* Add Rule Form */}
        {showAddForm && (
          <Card className="mb-8 p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Nueva Regla de Precio</h2>
            <form onSubmit={handleAddRule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Descuento de Temporada Baja"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Regla</label>
                  <select
                    value={formData.rule_type}
                    onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#1B4F72' } as any}
                  >
                    <option value="DAY_OF_WEEK">Día de la Semana</option>
                    <option value="SEASON">Temporada</option>
                    <option value="LAST_MINUTE">Última Hora</option>
                    <option value="VOLUME">Volumen</option>
                    <option value="CUSTOM">Personalizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ajuste</label>
                  <select
                    value={formData.adjustment_type}
                    onChange={(e) => setFormData({ ...formData, adjustment_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#1B4F72' } as any}
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Fijo (CLP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor de Ajuste</label>
                  <Input
                    type="number"
                    value={formData.adjustment_value}
                    onChange={(e) => setFormData({ ...formData, adjustment_value: e.target.value })}
                    placeholder={formData.adjustment_type === 'PERCENTAGE' ? '15' : '50000'}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              {formData.rule_type === 'DAY_OF_WEEK' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Día de la Semana</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#1B4F72' } as any}
                  >
                    <option value="">Selecciona un día</option>
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                    <option value="0">Domingo</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    min="1"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Válida Desde</label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Válida Hasta</label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#1B4F72' }}
                />
                <label className="text-sm font-medium text-gray-700">Activa</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  style={{ backgroundColor: '#2E75B6' }}
                >
                  Guardar Regla
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

        {/* Pricing Rules List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Reglas de Precio Activas</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Cargando reglas...</div>
          ) : pricingRules.length === 0 ? (
            <Card className="p-8 text-center border border-gray-200">
              <p className="text-gray-600">No hay reglas de precio para este venue</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pricingRules.map((rule) => (
                <Card key={rule.id} className="p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                    <Badge className={getRuleTypeBadgeColor(rule.rule_type)}>
                      {rule.rule_type === 'DAY_OF_WEEK' ? 'Día' : rule.rule_type === 'SEASON' ? 'Temporada' : rule.rule_type === 'LAST_MINUTE' ? 'Últ. Hora' : rule.rule_type === 'VOLUME' ? 'Volumen' : 'Personalizado'}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Ajuste:</span> {rule.adjustment_value}{rule.adjustment_type === 'PERCENTAGE' ? '%' : ' CLP'}
                    </p>
                    {rule.day_of_week && (
                      <p className="text-gray-700">
                        <span className="font-medium">Día:</span> {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][parseInt(rule.day_of_week)]}
                      </p>
                    )}
                    <p className="text-gray-700">
                      <span className="font-medium">Prioridad:</span> {rule.priority}
                    </p>
                    {rule.valid_from && (
                      <p className="text-gray-700">
                        <span className="font-medium">Desde:</span> {new Date(rule.valid_from).toLocaleDateString('es-CL')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.is_active}
                        onChange={() => handleToggleRule(rule.id, rule.is_active)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#1B4F72' }}
                      />
                      <span className="text-sm text-gray-600">{rule.is_active ? 'Activa' : 'Inactiva'}</span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Eliminar regla</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar esta regla de precio? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                        <div className="flex gap-3">
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRule(rule.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
