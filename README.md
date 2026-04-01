# Vows: Wedding OS - Frontend

Panel de administración para proveedores de eventos de bodas. Conectado a Supabase.

## Requisitos

- Node.js 18+ (recomendado 20)
- npm o yarn
- Cuenta en [Supabase](https://supabase.com) con el schema de Vows ya instalado

## Instalación paso a paso

### 1. Instalar dependencias

```bash
cd vows-frontend
npm install
```

### 2. Configurar Supabase

Copia el archivo de ejemplo y agrega tus credenciales:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus datos de Supabase (los encuentras en Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 3. Crear usuario de prueba en Supabase

Ve a tu proyecto en Supabase → Authentication → Users → Add User:

- Email: `admin@vows.cl`
- Password: `Vows2026!`

Luego vincula ese usuario con el provider de prueba. Ve a SQL Editor y ejecuta:

```sql
-- Reemplaza USER_ID con el UUID del usuario que acabas de crear
UPDATE providers SET id = 'USER_ID' WHERE company_name = 'Eventos del Valle SpA';
```

### 4. Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Login

- Email: `admin@vows.cl`
- Password: `Vows2026!`

## Estructura del proyecto

```
vows-frontend/
├── src/
│   ├── app/
│   │   ├── auth/login/          # Página de login
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # Sidebar + navegación
│   │   │   ├── dashboard/       # KPIs, gráficos, resumen
│   │   │   ├── calendar/        # Calendario de disponibilidad
│   │   │   ├── bookings/        # Pipeline de reservas
│   │   │   ├── leads/           # Kanban de prospectos
│   │   │   ├── conversations/   # CRM WhatsApp/Chat
│   │   │   ├── pricing/         # Reglas de precios
│   │   │   ├── venues/          # Gestión de locales
│   │   │   ├── visits/          # Agenda de visitas
│   │   │   ├── payments/        # Control de pagos
│   │   │   └── settings/        # Configuración
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Redirect a /dashboard
│   │   └── globals.css          # Estilos globales
│   ├── components/
│   │   ├── dashboard/           # StatCard, RevenueChart
│   │   ├── calendar/            # CalendarGrid, DayDetailModal
│   │   ├── bookings/            # BookingCard
│   │   ├── leads/               # LeadCard, LeadFormModal
│   │   └── conversations/       # MessageBubble
│   ├── lib/
│   │   ├── supabase.ts          # Cliente Supabase
│   │   └── utils.ts             # Utilidades (formatCLP, etc.)
│   ├── types/
│   │   └── database.ts          # Tipos TypeScript
│   └── middleware.ts             # Protección de rutas
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── .env.local.example
```

## Páginas incluidas

| Página | Ruta | Descripción |
|--------|------|-------------|
| Login | `/auth/login` | Autenticación con Supabase |
| Dashboard | `/dashboard` | KPIs, revenue chart, actividad reciente |
| Calendario | `/calendar` | Disponibilidad por venue, editar estados |
| Reservas | `/bookings` | Pipeline de bookings por estado |
| Leads | `/leads` | Kanban de prospectos con scoring |
| Conversaciones | `/conversations` | CRM tipo WhatsApp |
| Precios | `/pricing` | Reglas dinámicas + simulador |
| Venues | `/venues` | Gestión de centros de eventos |
| Visitas | `/visits` | Agenda de visitas programadas |
| Pagos | `/payments` | Control de cobros y vencimientos |
| Config | `/settings` | Perfil, agentes, plan |

## Stack técnico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS
- **Base de datos:** Supabase (PostgreSQL)
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **Fechas:** date-fns (locale español)

## Troubleshooting

**"Module not found"** → Ejecuta `npm install` de nuevo

**"Invalid API key"** → Verifica que `.env.local` tenga las credenciales correctas de Supabase

**"No data showing"** → Asegúrate de haber ejecutado el script SQL completo en Supabase (schema + seed data)

**"Login no funciona"** → Crea un usuario en Supabase Auth y vincúlalo al provider con el SQL de arriba
