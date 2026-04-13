'use client';

import { useState } from 'react';
import { Building2, Eye, Pencil, Star } from 'lucide-react';

interface ToggleOption {
  id: string;
  label: string;
  enabled: boolean;
}

export default function PublicProfilePage() {
  const [visibilitySettings, setVisibilitySettings] = useState<ToggleOption[]>([
    { id: 'published', label: 'Perfil publicado', enabled: true },
    { id: 'searchable', label: 'Aparecer en búsquedas', enabled: true },
    { id: 'directRequests', label: 'Aceptar solicitudes directas', enabled: true },
    { id: 'showPrices', label: 'Mostrar precios', enabled: false },
    { id: 'showAvailability', label: 'Mostrar calendario disponibilidad', enabled: true },
  ]);

  const toggleOption = (id: string) => {
    setVisibilitySettings(
      visibilitySettings.map((option) =>
        option.id === id ? { ...option, enabled: !option.enabled } : option
      )
    );
  };

  const stats = [
    { label: 'Visitas al perfil (este mes)', value: '342', icon: null },
    { label: 'Solicitudes recibidas', value: '23', icon: null },
    { label: 'Tasa de conversión', value: '38%', icon: null },
    { label: 'Posición en búsquedas', value: '#4', icon: null },
    { label: 'Reseñas promedio', value: '4.8', icon: <Star className="w-5 h-5 text-yellow-400" /> },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="bg-purple-100 rounded-lg p-4">
              <Building2 className="w-12 h-12 text-purple-600" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Tu Nombre de Negocio</h1>
              <p className="text-lg text-purple-600 font-semibold mb-3">Centro de Eventos</p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Somos un centro de eventos especializado en bodas con más de 10 años de experiencia.
                Contamos con espacios elegantes y modernos para hacer tu día especial inolvidable.
              </p>

              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-2 bg-[#1B4F72] text-white rounded-lg hover:bg-[#153a52] transition">
                  <Pencil className="w-4 h-4" />
                  Editar Perfil
                </button>
                <button className="flex items-center gap-2 px-6 py-2 border-2 border-[#1B4F72] text-[#1B4F72] rounded-lg hover:bg-blue-50 transition">
                  <Eye className="w-4 h-4" />
                  Ver como Pareja
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visibility Settings Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Visibilidad en Marketplace</h2>

            <div className="space-y-4">
              {visibilitySettings.map((option) => (
                <div key={option.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <label className="text-gray-700 font-medium">{option.label}</label>

                  {/* Custom Toggle Switch */}
                  <button
                    onClick={() => toggleOption(option.id)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      option.enabled ? 'bg-[#1B4F72]' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={option.enabled}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        option.enabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Estadísticas del Perfil</h2>

            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-700">{stat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#1B4F72]">{stat.value}</span>
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
