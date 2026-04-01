'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Plus, MapPin, Users, DollarSign, Trash2 } from 'lucide-react';

type Venue = Database['public']['Tables']['venues']['Row'];

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    capacity_min: '',
    capacity_max: '',
    price_per_guest: '',
    amenities: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchVenues();
    fetchStats();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('venue_id, total_price');
      if (error) throw error;

      const newStats: Record<string, any> = {};
      const bookingsByVenue: Record<string, any> = {};

      data?.forEach((booking: any) => {
        if (!bookingsByVenue[booking.venue_id]) {
          bookingsByVenue[booking.venue_id] = { count: 0, revenue: 0 };
        }
        bookingsByVenue[booking.venue_id].count += 1;
        bookingsByVenue[booking.venue_id].revenue += booking.total_price || 0;
      });

      setStats(bookingsByVenue);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amenitiesArray = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      const venueData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        capacity_min: formData.capacity_min ? parseInt(formData.capacity_min) : null,
        capacity_max: formData.capacity_max ? parseInt(formData.capacity_max) : null,
        price_per_guest: formData.price_per_guest ? parseFloat(formData.price_per_guest) : null,
        amenities: amenitiesArray,
        description: formData.description,
        is_active: formData.is_active,
      };

      if (editingId) {
        const { error } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase.from('venues').insert(venueData);
        if (error) throw error;
      }

      setFormData({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        capacity_min: '',
        capacity_max: '',
        price_per_guest: '',
        amenities: '',
        description: '',
        is_active: true,
      });
      setShowAddForm(false);
      fetchVenues();
      fetchStats();
    } catch (error) {
      console.error('Error saving venue:', error);
    }
  };

  const handleEditVenue = (venue: Venue) => {
    setFormData({
      name: venue.name,
      address: venue.address || '',
      city: venue.city || '',
      phone: venue.phone || '',
      email: venue.email || '',
      capacity_min: venue.capacity_min?.toString() || '',
      capacity_max: venue.capacity_max?.toString() || '',
      price_per_guest: venue.price_per_guest?.toString() || '',
      amenities: Array.isArray(venue.amenities) ? venue.amenities.join(', ') : '',
      description: venue.description || '',
      is_active: venue.is_active,
    });
    setEditingId(venue.id);
    setShowAddForm(true);
  };

  const handleDeleteVenue = async (venueId: string) => {
    try {
      const { error } = await supabase.from('venues').delete().eq('id', venueId);
      if (error) throw error;
      fetchVenues();
      fetchStats();
    } catch (error) {
      console.error('Error deleting venue:', error);
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      capacity_min: '',
      capacity_max: '',
      price_per_guest: '',
      amenities: '',
      description: '',
      is_active: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#1B4F72' }}>
            Gestión de Venues
          </h1>
          <p className="text-gray-600 mt-2">Administra tus venues de bodas</p>
        </div>

        {/* Add Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
            style={{ backgroundColor: '#2E75B6' }}
          >
            <Plus size={20} />
            Agregar Venue
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8 p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar Venue' : 'Nuevo Venue'}
            </h2>
            <form onSubmit={handleAddVenue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Hacienda La Viña"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ej: Santiago"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle, número..."
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contacto@venue.com"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad Mínima
                  </label>
                  <Input
                    type="number"
                    value={formData.capacity_min}
                    onChange={(e) => setFormData({ ...formData, capacity_min: e.target.value })}
                    placeholder="50"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad Máxima
                  </label>
                  <Input
                    type="number"
                    value={formData.capacity_max}
                    onChange={(e) => setFormData({ ...formData, capacity_max: e.target.value })}
                    placeholder="500"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Huésped (CLP)
                  </label>
                  <Input
                    type="number"
                    value={formData.price_per_guest}
                    onChange={(e) =>
                      setFormData({ ...formData, price_per_guest: e.target.value })
                    }
                    placeholder="150000"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenidades (separadas por coma)
                </label>
                <Input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Piscina, Estacionamiento, Cocina, Zona VIP"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu venue..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#1B4F72' } as any}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#1B4F72' }}
                />
                <label className="text-sm font-medium text-gray-700">Activo</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  style={{ backgroundColor: '#2E75B6' }}
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Venue'}
                </Button>
                <Button
                  type="button"
                  onClick={closeForm}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Venues Grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">Cargando venues...</div>
        ) : venues.length === 0 ? (
          <Card className="p-8 text-center border border-gray-200">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No hay venues registrados</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => {
              const venueStats = stats[venue.id] || { count: 0, revenue: 0 };
              const occupancyRate = venueStats.count > 0
                ? Math.min(100, Math.round((venueStats.count / 12) * 100))
                : 0;

              return (
                <Card key={venue.id} className="p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                    <Badge
                      style={{
                        backgroundColor: venue.is_active ? '#10b981' : '#6b7280',
                      }}
                      className="text-white"
                    >
                      {venue.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    {venue.address && (
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{venue.address}</p>
                      </div>
                    )}
                    {venue.capacity_min && venue.capacity_max && (
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-500 flex-shrink-0" />
                        <p className="text-sm text-gray-600">
                          {venue.capacity_min}-{venue.capacity_max} huéspedes
                        </p>
                      </div>
                    )}
                    {venue.price_per_guest && (
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-gray-500 flex-shrink-0" />
                        <p className="text-sm text-gray-600">
                          ${venue.price_per_guest.toLocaleString('es-CL')} por huésped
                        </p>
                      </div>
                    )}
                  </div>

                  {Array.isArray(venue.amenities) && venue.amenities.length > 0 && (
                    <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Amenidades</p>
                      <div className="flex flex-wrap gap-2">
                        {venue.amenities.map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-t border-gray-200 pt-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Reservas</p>
                      <p className="text-lg font-bold" style={{ color: '#1B4F72' }}>
                        {venueStats.count}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Ingresos</p>
                      <p className="text-lg font-bold" style={{ color: '#2E75B6' }}>
                        ${(venueStats.revenue / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Ocupación</p>
                      <p className="text-lg font-bold" style={{ color: '#3498DB' }}>
                        {occupancyRate}%
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditVenue(venue)}
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-800 flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Eliminar venue</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar {venue.name}? Esta acción no se
                          puede deshacer.
                        </AlertDialogDescription>
                        <div className="flex gap-3">
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteVenue(venue.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
