'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Plus, MapPin, Users, DollarSign, Trash2 } from 'lucide-react';

const PROVIDER_ID = 'a0000000-0000-0000-0000-000000000001';

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
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
    } catch (err: any) {
      console.error('Error fetching venues:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const amenitiesArray = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      const venueData: any = {
        provider_id: PROVIDER_ID,
        name: formData.name,
        address: formData.address || null,
        city: formData.city || null,
        phone: formData.phone || null,
        email: formData.email || null,
        capacity_min: formData.capacity_min ? parseInt(formData.capacity_min) : null,
        capacity_max: formData.capacity_max ? parseInt(formData.capacity_max) : null,
        price_per_guest: formData.price_per_guest ? parseInt(formData.price_per_guest) : null,
        amenities: amenitiesArray,
        description: formData.description || null,
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
        name: '', address: '', city: '', phone: '', email: '',
        capacity_min: '', capacity_max: '', price_per_guest: '',
        amenities: '', description: '', is_active: true,
      });
      setShowAddForm(false);
      fetchVenues();
    } catch (err: any) {
      console.error('Error saving venue:', err);
      setError(err.message || 'Error al guardar el venue');
    }
  };

  const handleEditVenue = (venue: any) => {
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
    } catch (err: any) {
      console.error('Error deleting venue:', err);
      setError(err.message);
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setError(null);
    setFormData({
      name: '', address: '', city: '', phone: '', email: '',
      capacity_min: '', capacity_max: '', price_per_guest: '',
      amenities: '', description: '', is_active: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#1B4F72' }}>Gestión de Venues</h1>
          <p className="text-gray-600 mt-2">Administra tus venues de bodas</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-800">✕</button>
          </div>
        )}

        <div className="mb-8">
          <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2" style={{ backgroundColor: '#2E75B6' }}>
            <Plus size={20} />
            Agregar Venue
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8 p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Venue' : 'Nuevo Venue'}</h2>
            <form onSubmit={handleAddVenue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Hacienda La Viña" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                  <Input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Ej: Santiago" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <Input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Calle, número..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+56 2 1234 5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contacto@venue.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad Mínima</label>
                  <Input type="number" value={formData.capacity_min} onChange={(e) => setFormData({ ...formData, capacity_min: e.target.value })} placeholder="50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad Máxima</label>
                  <Input type="number" value={formData.capacity_max} onChange={(e) => setFormData({ ...formData, capacity_max: e.target.value })} placeholder="500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio por Huésped (CLP)</label>
                  <Input type="number" value={formData.price_per_guest} onChange={(e) => setFormData({ ...formData, price_per_guest: e.target.value })} placeholder="150000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenidades (separadas por coma)</label>
                <Input type="text" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="Piscina, Estacionamiento, Cocina" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe tu venue..." rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                <label className="text-sm font-medium text-gray-700">Activo</label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" style={{ backgroundColor: '#2E75B6' }}>{editingId ? 'Guardar Cambios' : 'Crear Venue'}</Button>
                <Button type="button" onClick={closeForm} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-600">Cargando venues...</div>
        ) : venues.length === 0 ? (
          <Card className="p-8 text-center border border-gray-200">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No hay venues registrados</p>
            <p className="text-gray-400 mt-2">Haz clic en &quot;Agregar Venue&quot; para empezar</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <Card key={venue.id} className="p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                  <Badge style={{ backgroundColor: venue.is_active ? '#10b981' : '#6b7280' }} className="text-white">
                    {venue.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="space-y-3 mb-4">
                  {venue.city && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      <p className="text-sm text-gray-600">{venue.city}{venue.address ? ` - ${venue.address}` : ''}</p>
                    </div>
                  )}
                  {venue.capacity_max && (
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-500" />
                      <p className="text-sm text-gray-600">{venue.capacity_min || 0}-{venue.capacity_max} personas</p>
                    </div>
                  )}
                  {venue.price_per_guest && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-gray-500" />
                      <p className="text-sm text-gray-600">${Number(venue.price_per_guest).toLocaleString('es-CL')} por persona</p>
                    </div>
                  )}
                </div>
                {Array.isArray(venue.amenities) && venue.amenities.length > 0 && (
                  <div className="mb-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.map((a: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button onClick={() => handleEditVenue(venue)} variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-1 text-red-600 hover:text-red-800 flex items-center justify-center gap-2">
                        <Trash2 size={16} /> Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Eliminar venue</AlertDialogTitle>
                      <AlertDialogDescription>¿Estás seguro de que deseas eliminar {venue.name}? Esta acción no se puede deshacer.</AlertDialogDescription>
                      <div className="flex gap-3">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteVenue(venue.id)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
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
  );
}
