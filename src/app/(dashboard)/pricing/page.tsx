'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Plus, Edit2, Zap, Calendar, Users } from 'lucide-react';

type PricingRule = Database['public']['Tables']['pricing_rules']['Row'];
type Venue = Database['public']['Tables']['venues']['Row'];

// Loading skeleton component
const RuleSkeleton = () => (
  <Card className="rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      <div className="flex gap-2 pt-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
      </div>
    </div>
  </Card>
);

export default function PricingPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [pricingRules, setPricingRules] = useState<(PricingRule & { venues?: Venue })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [simulatorDate, setSimulatorDate] = useState('');
  const [simulatorGuests, setSimulatorGuests] = useState('');
  const [simulatorResult, setSimulatorResult] = useState<any>(null);
  const [editingRule, setEditingRule] = useState<string | null>(null);
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
      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('pricing_rules')
          .update({
            name: formData.name,
            rule_type: formData.rule_type,
            adjustment_type: formData.adjustment_type,
            adjustment_value: parseFloat(formData.adjustment_value),
            day_of_week: formData.day_of_week || null,
            priority: parseInt(formData.priority),
            valid_from: formData.valid_from || null,
            valid_until: formData.valid_until || null,
            is_active: formData.is_active,
          })
          .eq('id', editingRule);
        if (error) throw error;
      } else {
        // Create new rule
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
      }

      setShowAddForm(false);
      setEditingRule(null);
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
      console.error('Error saving rule:', error);
    }
  };

  const handleEditRule = (rule: PricingRule) => {
    setFormData({
      name: rule.name,
      rule_type: rule.rule_type,
      adjustment_type: rule.adjustment_type,
      adjustment_value: rule.adjustment_value.toString(),
      day_of_week: rule.day_of_week || '',
      priority: rule.priority.toString(),
      valid_from: rule.valid_from || '',
      valid_until: rule.valid_until || '',
      is_active: rule.is_active,
    });
    setEditingRule(rule.id);
    setShowAddForm(true);
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

  const getRuleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'DAY_OF_WEEK': 'Día de la Semana',
      'SEASON': 'Temporada',
      'LAST_MINUTE': 'Última Hora',
      'VOLUME': 'Volumen',
      'CUSTOM': 'Personalizado',
    };
    return labels[type] || type;
  };

  const getRuleTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'DAY_OF_WEEK': 'bg-blue-100 text-blue-800',
      'SEASON': 'bg-green-100 text-green-800',
      'LAST_MINUTE': 'bg-orange-100 text-orange-800',
      'VOLUME': 'bg-purple-100 text-purple-800',
      'CUSTOM': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Precios</h1>
          <p className="text-gray-600">Administra las reglas de precios y simula el cálculo de tus eventos</p>
        </div>

        {/* Venue Selector */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Selecciona un Venue</label>
              <select
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium shadow-sm transition-all"
              >
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price Simulator */}
        <Card className="rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Simulador de Precios</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Fecha del Evento
              </label>
              <Input
                type="date"
                value={simulatorDate}
                onChange={(e) => setSimulatorDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Cantidad de Huéspedes
              </label>
              <Input
                type="number"
                value={simulatorGuests}
                onChange={(e) => setSimulatorGuests(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={runSimulator}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-sm"
              >
                Simular
              </Button>
            </div>
          </div>

          {simulatorResult && (
            <div className="pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm font-medium text-gray-600 mb-1">Precio Base</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${simulatorResult.base_price?.toLocaleString('es-CL') || '0'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-600 mb-1">Precio Final</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${simulatorResult.final_price?.toLocaleString('es-CL') || '0'}
                  </p>
                </div>
                {simulatorResult.rules_applied && simulatorResult.rules_applied.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm font-medium text-purple-600 mb-1">Reglas Aplicadas</p>
                    <p className="text-3xl font-bold text-purple-600">{simulatorResult.rules_applied.length}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Add/Edit Rule Button */}
        {!showAddForm && (
          <div className="mb-8">
            <Button
              onClick={() => {
                setEditingRule(null);
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
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nueva Regla
            </Button>
          </div>
        )}

        {/* Add/Edit Rule Form */}
        {showAddForm && (
          <Card className="rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingRule ? 'Editar Regla de Precio' : 'Nueva Regla de Precio'}
            </h2>
            <form onSubmit={handleAddRule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Nombre</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Descuento de Temporada Baja"
                    required
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo de Regla</label>
                  <select
                    value={formData.rule_type}
                    onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="DAY_OF_WEEK">Día de la Semana</option>
                    <option value="SEASON">Temporada</option>
                    <option value="LAST_MINUTE">Última Hora</option>
                    <option value="VOLUME">Volumen</option>
                    <option value="CUSTOM">Personalizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo de Ajuste</label>
                  <select
                    value={formData.adjustment_type}
                    onChange={(e) => setFormData({ ...formData, adjustment_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Fijo (CLP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Valor de Ajuste</label>
                  <Input
                    type="number"
                    value={formData.adjustment_value}
                    onChange={(e) => setFormData({ ...formData, adjustment_value: e.target.value })}
                    placeholder={formData.adjustment_type === 'PERCENTAGE' ? '15' : '50000'}
                    required
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {formData.rule_type === 'DAY_OF_WEEK' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Día de la Semana</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Prioridad</label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Válida Desde</label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Válida Hasta</label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Activar regla
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-sm"
                >
                  {editingRule ? 'Guardar Cambios' : 'Crear Regla'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRule(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Pricing Rules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reglas de Precio</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <RuleSkeleton key={i} />
              ))}
            </div>
          ) : pricingRules.length === 0 ? (
            <Card className="rounded-xl shadow-sm border border-gray-100 p-12 text-center bg-white">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No hay reglas de precio para este venue</p>
                <p className="text-gray-500 text-sm mt-1">Crea tu primera regla para comenzar</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingRules.map((rule) => (
                <Card key={rule.id} className="rounded-xl shadow-sm border border-gray-100 p-6 bg-white hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{rule.name}</h3>
                    </div>
                    <Badge className={`${getRuleTypeBadgeColor(rule.rule_type)} text-xs font-semibold px-3 py-1 rounded-full ml-2 flex-shrink-0`}>
                      {getRuleTypeLabel(rule.rule_type).split(' ')[0]}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ajuste</span>
                      <span className="font-semibold text-gray-900">{rule.adjustment_value}{rule.adjustment_type === 'PERCENTAGE' ? '%' : ' CLP'}</span>
                    </div>
                    {rule.day_of_week && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Día</span>
                        <span className="font-semibold text-gray-900">{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][parseInt(rule.day_of_week)]}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prioridad</span>
                      <span className="font-semibold text-gray-900">{rule.priority}</span>
                    </div>
                    {rule.valid_from && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Desde</span>
                        <span className="font-semibold text-gray-900 text-sm">{new Date(rule.valid_from).toLocaleDateString('es-CL')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.is_active}
                        onChange={() => handleToggleRule(rule.id, rule.is_active)}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                      <span className={`text-xs font-semibold ${rule.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                        {rule.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleEditRule(rule)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl">
                          <AlertDialogTitle className="text-lg font-bold">Eliminar regla</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            ¿Estás seguro de que deseas eliminar la regla "<strong>{rule.name}</strong>"? Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                          <div className="flex gap-3 pt-6">
                            <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteRule(rule.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
