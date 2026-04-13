"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  BookOpen,
  Users,
  MessageSquare,
  DollarSign,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
  FileText,
  Star,
  BarChart3,
  Globe,
  Package,
  ChevronDown,
} from "lucide-react";

interface NavigationGroup {
  title: string;
  items: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ size: number }>;
    hideWhen?: (operatorType: string) => boolean;
  }>;
}

const operatorTypes = [
  { id: "venue", emoji: "🏛️", label: "Centro de Eventos" },
  { id: "dj", emoji: "🎵", label: "DJ / Música" },
  { id: "photo", emoji: "📸", label: "Fotografía" },
  { id: "catering", emoji: "🍽️", label: "Banquetera" },
  { id: "decor", emoji: "🌸", label: "Decoración" },
  { id: "planner", emoji: "💍", label: "Wedding Planner" },
  { id: "producer", emoji: "🎬", label: "Productora" },
  { id: "transport", emoji: "🚐", label: "Transporte" },
  { id: "pastry", emoji: "🎂", label: "Pastelería" },
];

const navigationGroups: NavigationGroup[] = [
  {
    title: "GENERAL",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "Espacios",
        href: "/venues",
        icon: Building2,
        hideWhen: (type) => type !== "venue",
      },
      { label: "Calendario", href: "/calendar", icon: Calendar },
    ],
  },
  {
    title: "VENTAS",
    items: [
      { label: "Reservas", href: "/bookings", icon: BookOpen },
      { label: "Leads / CRM", href: "/leads", icon: Users },
      {
        label: "Mensajes",
        href: "/conversations",
        icon: MessageSquare,
      },
      { label: "Cotizaciones", href: "/quotes", icon: FileText },
    ],
  },
  {
    title: "FINANZAS",
    items: [
      { label: "Precios", href: "/pricing", icon: DollarSign },
      { label: "Paquetes", href: "/packages", icon: Package },
      { label: "Pagos", href: "/payments", icon: CreditCard },
    ],
  },
  {
    title: "CRECIMIENTO",
    items: [
      { label: "Reseñas", href: "/reviews", icon: Star },
      { label: "Analíticas", href: "/analytics", icon: BarChart3 },
      {
        label: "Perfil Público",
        href: "/public-profile",
        icon: Globe,
      },
      { label: "Configuración", href: "/settings", icon: Settings },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [operatorType, setOperatorType] = useState<string>("venue");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Auth disabled for development - set mock user
    setUser({ email: "felipe@theice.cl" });
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const currentOperator = operatorTypes.find((op) => op.id === operatorType);

  const visibleNavItems = navigationGroups.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.hideWhen || !item.hideWhen(operatorType)
    ),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4F72]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1B4F72] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button for Mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-white"
        >
          <X size={24} />
        </button>

        {/* Sidebar Content */}
        <div className="h-full flex flex-col text-white p-6">
          {/* Logo */}
          <div className="mb-6 pt-4">
            <Link href="/dashboard" className="text-2xl font-bold">
              Vows
            </Link>
            <p className="text-xs text-blue-100 mt-1">Wedding OS</p>
          </div>

          {/* Operator Type Selector */}
          <div className="mb-8 relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors text-white text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{currentOperator?.emoji}</span>
                <span className="truncate text-left text-xs font-medium">
                  {currentOperator?.label}
                </span>
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#163a52] rounded-lg shadow-lg z-10 border border-white border-opacity-10 py-1">
                {operatorTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setOperatorType(type.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      operatorType === type.id
                        ? "bg-white bg-opacity-20 text-white"
                        : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <span className="text-lg w-6">{type.emoji}</span>
                    <span className="truncate">{type.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-6 overflow-y-auto">
            {visibleNavItems.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-3 px-4 opacity-70">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-white bg-opacity-20 text-white"
                            : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-white border-opacity-20 pt-4">
            <div className="px-4 py-3 bg-white bg-opacity-10 rounded-lg mb-4">
              <p className="text-xs text-blue-100">Conectado como</p>
              <p className="text-sm font-medium text-white truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-blue-100 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-2xl font-bold text-gray-900 flex-1 text-center lg:text-left">
            {(() => {
              for (const group of visibleNavItems) {
                const item = group.items.find((i) => i.href === pathname);
                if (item) return item.label;
              }
              return "Dashboard";
            })()}
          </h1>

          {/* User Avatar Area */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1B4F72] flex items-center justify-center text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>

      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
