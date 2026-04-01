"use client";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido a Vows
          </h2>
          <p className="text-gray-600">
            Tu plataforma integral para gestionar espacios de bodas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Reservas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="text-4xl text-blue-200">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="text-4xl text-blue-200">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Ingresos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
            </div>
            <div className="text-4xl text-blue-200">💰</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1B4F72] hover:bg-blue-50 transition-colors text-left">
              <p className="font-semibold text-gray-700">+ Nuevo Espacio</p>
              <p className="text-sm text-gray-500 mt-1">Añade tu primer espacio</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1B4F72] hover:bg-blue-50 transition-colors text-left">
              <p className="font-semibold text-gray-700">+ Actualizar Calendario</p>
              <p className="text-sm text-gray-500 mt-1">Gestiona disponibilidad</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1B4F72] hover:bg-blue-50 transition-colors text-left">
              <p className="font-semibold text-gray-700">+ Configurar Precios</p>
              <p className="text-sm text-gray-500 mt-1">Define tu tarifa</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1B4F72] hover:bg-blue-50 transition-colors text-left">
              <p className="font-semibold text-gray-700">+ Ver Mensajes</p>
              <p className="text-sm text-gray-500 mt-1">Contacto con clientes</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
