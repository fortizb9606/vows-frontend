'use client';

import { Plus, Check, Pencil, Package } from 'lucide-react';

interface PackageItem {
  name: string;
  price: number;
  color: string;
  items: string[];
  popular: boolean;
}

interface ExtraService {
  name: string;
  price: number;
}

const packages: PackageItem[] = [
  {
    name: 'Paquete Premium',
    price: 5500000,
    color: '#F59E0B',
    items: [
      'Espacio completo (12hrs)',
      'Coordinador de eventos',
      'Decoración premium',
      'DJ + Iluminación',
      'Menú degustación',
      'Barra libre premium',
      'Valet parking',
      'Suite nupcial',
    ],
    popular: false,
  },
  {
    name: 'Paquete Clásico',
    price: 3800000,
    color: '#1B4F72',
    items: [
      'Espacio completo (10hrs)',
      'Coordinador de eventos',
      'Decoración estándar',
      'DJ básico',
      'Menú buffet',
      'Barra libre estándar',
    ],
    popular: true,
  },
  {
    name: 'Paquete Esencial',
    price: 2200000,
    color: '#EC4899',
    items: [
      'Espacio (8hrs)',
      'Coordinador de eventos',
      'Decoración básica',
      'Sistema de sonido',
    ],
    popular: false,
  },
];

const extras: ExtraService[] = [
  { name: 'Ceremonia al aire libre', price: 350000 },
  { name: 'Hora extra', price: 450000 },
  { name: 'Decoración floral premium', price: 800000 },
  { name: 'Valet parking', price: 280000 },
  { name: 'Suite nupcial', price: 180000 },
  { name: 'Torta nupcial', price: 320000 },
];

const formatCLP = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Paquetes</h1>
          </div>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-5 h-5" />
            Nuevo Paquete
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Top Border */}
              <div
                className="h-2"
                style={{ backgroundColor: pkg.color }}
              />

              {/* Card Content */}
              <div className="p-6">
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                    Popular
                  </div>
                )}

                {/* Package Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCLP(pkg.price)}
                  </div>
                  <p className="text-sm text-gray-600">por evento</p>
                </div>

                {/* Items List */}
                <div className="mb-6 space-y-3">
                  {pkg.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        strokeWidth={3}
                      />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Edit Button */}
                <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Servicios Adicionales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {extras.map((extra, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {extra.name}
                </h4>
                <p className="text-lg font-bold text-gray-900">
                  {formatCLP(extra.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
