'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
import { Edit2, Plus, MapPin, Users, DollarSign, Trash2, Upload, X } from 'lucide-react';

const PROVIDER_ID = 'a0000000-0000-0000-0000-000000000001';

interface FormDataType {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  capacity_min: string;
  capacity_max: string;
  price_per_guest: string;
  amenities: string;
  description: string;
  is_active: boolean;
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'amenities' | 'pricing'>('info');
  const [amenityInput, setAmenityInput] = useState('');
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
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

  const resetForm = () => {
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
    setAmenitiesList([]);
    setAmenityInput('');
    setActiveTab('info');
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !amenitiesList.includes(amenityInput.trim())) {
      setAmenitiesList([...amenitiesList, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenitiesList(amenitiesList.filter((a) => a !== amenity));
  };

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
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
        amenities: amenitiesList,
        description: formData.description || null,
        is_active: formData.is_active,
      };

      if (editingId) {
        const { error } = await supabase.from('venues').update(venueData).eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase.from('venues').insert(venueData);
        if (error) throw error;
      }

      resetForm();
      setShowModal(false);
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
      amenities: '',
      description: venue.description || '',
      is_active: venue.is_active,
    });
    setAmenitiesList(Array.isArray(venue.amenities) ? venue.amenities : []);
    setEditingId(venue.id);
    setActiveTab('info');
    setShowModal(true);
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

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setError(null);
    resetForm();
  };

  const TabButton = ({ tab, label }: { tab: 'info' | 'photos' | 'amenities' | 'pricing'; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        activeTab === tab
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Espacios</h1>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus size={20} />
              Nuevo Espacio
            </Button>
          </div>
          <p className="text-gray-600">Administra los espacios para tus eventos</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
            <div>
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl rounded-xl shadow-lg border border-gray-100 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Editar Espacio' : 'Crear Nuevo Espacio'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 px-6 bg-gray-50">
                <TabButton tab="info" label="Información" />
                <TabButton tab="photos" label="Fotos" />
                <TabButton tab="amenities" label="Amenidades" />
                <TabButton tab="pricing" label="Precios" />
              </div>

              <form onSubmit={handleAddVenue} className="p-6 space-y-6">
                {/* Tab: Información */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
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
                        className="rounded-lg border-gray-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ciudad
                        </label>
                        <Input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Ej: Santiago"
                          className="rounded-lg border-gray-200"
                        />
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
                          className="rounded-lg border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+56 2 1234 5678"
                          className="rounded-lg border-gray-200"
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
                          className="rounded-lg border-gray-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe tu espacio..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Marcar como espacio activo
                      </label>
                    </div>
                  </div>
                )}

                {/* Tab: Fotos */}
                {activeTab === 'photos' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-center">
                            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">Foto {i}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      Arrastra imágenes aquí o haz clic para subir. Las imágenes se redimensionarán automáticamente.
                    </p>
                  </div>
                )}

                {/* Tab: Amenidades */}
                {activeTab === 'amenities' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                        placeholder="Ej: Piscina, Cocina, Estacionamiento"
                        className="rounded-lg border-gray-200 flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddAmenity}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4"
                      >
                        Agregar
                      </Button>
                    </div>

                    {amenitiesList.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {amenitiesList.map((amenity) => (
                          <Badge
                            key={amenity}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2 px-3 py-1 cursor-pointer rounded-full"
                          >
                            {amenity}
                            <button
                              type="button"
                              onClick={() => handleRemoveAmenity(amenity)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X size={14} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {amenitiesList.length === 0 && (
                      <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 text-sm">Agrega amenidades a tu espacio</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Precios */}
                {activeTab === 'pricing' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacidad Mínima
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={formData.capacity_min}
                            onChange={(e) => setFormData({ ...formData, capacity_min: e.target.value })}
                            placeholder="50"
                            className="rounded-lg border-gray-200"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            personas
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacidad Máxima
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={formData.capacity_max}
                            onChange={(e) => setFormData({ ...formData, capacity_max: e.target.value })}
                            placeholder="500"
                            className="rounded-lg border-gray-200"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            personas
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio por Huésped
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          CLP
                        </span>
                        <Input
                          type="number"
                          value={formData.price_per_guest}
                          onChange={(e) => setFormData({ ...formData, price_per_guest: e.target.value })}
                          placeholder="150000"
                          className="rounded-lg border-gray-200 pl-12"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">Nota:</span> El precio total se
                        calculará según la cantidad de huéspedes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Espacio'}
                  </Button>
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="outline"
                    className="flex-1 border-gray-200 rounded-lg font-medium"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 rounded-xl border border-gray-100">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded-lg w-5/6 animate-pulse" />
                  <div className="flex gap-2 pt-4">
                    <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && venues.length === 0 && (
          <Card className="p-12 rounded-xl border border-gray-100 text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-gray-100 rounded-full">
                <MapPin size={48} className="text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay espacios registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando tu primer espacio para eventos
            </p>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6"
            >
              Crear Primer Espacio
            </Button>
          </Card>
        )}

        {/* Venues Grid */}
        {!loading && venues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <Card
                key={venue.id}
                className="rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header with Status Badge */}
                <div className="p-6 pb-4 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                      {venue.name}
                    </h3>
                    <Badge
                      className={`whitespace-nowrap rounded-full text-white text-xs px-3 py-1 ${
                        venue.is_active
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      {venue.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3">
                  {venue.city && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{venue.city}</p>
                        {venue.address && <p className="text-gray-500">{venue.address}</p>}
                      </div>
                    </div>
                  )}

                  {venue.capacity_max && (
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          {venue.capacity_min || 0}-{venue.capacity_max}
                        </span>{' '}
                        personas
                      </p>
                    </div>
                  )}

                  {venue.price_per_guest && (
                    <div className="flex items-center gap-3">
                      <DollarSign size={18} className="text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          ${Number(venue.price_per_guest).toLocaleString('es-CL')}
                        </span>{' '}
                        por persona
                      </p>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {Array.isArray(venue.amenities) && venue.amenities.length > 0 && (
                  <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.slice(0, 3).map((amenity: string, i: number) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs rounded-full border-gray-200 text-gray-700 bg-gray-50"
                        >
                          {amenity}
                        </Badge>
                      ))}
                      {venue.amenities.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs rounded-full border-gray-200 text-gray-700 bg-gray-50"
                        >
                          +{venue.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
                  <Button
                    onClick={() => handleEditVenue(venue)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-200"
                  >
                    <Edit2 size={16} />
                    Editar
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200">
                        <Trash2 size={16} />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl">
                      <AlertDialogTitle className="text-lg font-semibold">
                        Eliminar espacio
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar <strong>{venue.name}</strong>? Esta
                        acción no se puede deshacer.
                      </AlertDialogDescription>
                      <div className="flex gap-3">
                        <AlertDialogCancel className="rounded-lg border-gray-200">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteVenue(venue.id)}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
  );
}
