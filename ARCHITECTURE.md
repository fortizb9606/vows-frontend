# Vows Platform - Architecture Overview

## Technology Stack
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Authentication:** Supabase Auth
- **Styling:** TailwindCSS
- **Icons:** lucide-react
- **Database:** Supabase (PostgreSQL)

## Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout with metadata & fonts
│   ├── page.tsx                 # Root page (redirects to /dashboard)
│   ├── globals.css              # Global styles
│   ├── auth/
│   │   └── login/
│   │       └── page.tsx         # Login page
│   └── (dashboard)/             # Protected dashboard routes
│       ├── layout.tsx           # Dashboard layout with sidebar
│       ├── page.tsx             # Dashboard home
│       ├── venues/              # Venue management
│       ├── calendar/            # Calendar management
│       ├── bookings/            # Booking management
│       ├── leads/               # Lead management
│       ├── messages/            # Messaging system
│       ├── pricing/             # Pricing management
│       ├── visits/              # Visit tracking
│       ├── payments/            # Payment management
│       └── settings/            # Settings management
├── lib/
│   ├── supabase.ts             # Supabase client initialization
│   └── utils.ts                # Utility functions
├── types/
│   └── database.ts             # TypeScript database types
└── middleware.ts               # Route protection middleware
```

## Authentication Flow

### Entry Points
1. **Root Path (`/`)** → Auto-redirects to `/dashboard`
2. **Login (`/auth/login`)** → Public, shows to unauthenticated users
3. **Dashboard (`/dashboard/*`)** → Protected, requires authentication

### Session Management
- Supabase handles authentication
- Session stored as HTTP-only cookie (`sb-auth-token`)
- Middleware checks for session on protected routes
- Client-side components verify auth state and redirect if needed

### Protected Routes
```typescript
// Middleware pattern
if (pathname.startsWith("/dashboard") && !authToken) {
  redirect("/auth/login")
}
```

## UI Components

### Dashboard Layout
```
┌─────────────────────────────────────┐
│         Top Navigation Bar          │  (Page title, user avatar)
├──────────────┬──────────────────────┤
│              │                      │
│   Sidebar    │    Main Content      │
│   (fixed)    │    Area              │
│              │                      │
│  - Dashboard │                      │
│  - Venues    │                      │
│  - Calendar  │                      │
│  - Etc.      │                      │
│              │                      │
└──────────────┴──────────────────────┘
```

### Navigation Structure
- **Sidebar** (collapsible on mobile)
  - Logo/brand at top
  - 10 navigation items with icons
  - Active state highlighting
  - User info and logout at bottom

- **Top Bar** (fixed)
  - Hamburger menu (mobile only)
  - Page title
  - User avatar with initials

## Styling System

### Color Palette
| Color | Value | Usage |
|-------|-------|-------|
| Primary | `#1B4F72` | Sidebar, buttons, accents |
| Gray 50 | `#F9FAFB` | Page backgrounds |
| Gray 600 | `#4B5563` | Body text |
| Gray 900 | `#111827` | Headings |
| White | `#FFFFFF` | Cards, inputs |
| Red 50 | `#FEF2F2` | Error backgrounds |
| Red 700 | `#B91C1C` | Error text |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings (H1) | Inter | 2.25rem | Bold |
| Headings (H2) | Inter | 1.875rem | Bold |
| Headings (H3) | Inter | 1.125rem | Bold |
| Body | Inter | 1rem | Regular |
| Labels | Inter | 0.875rem | Medium |
| Small | Inter | 0.75rem | Regular |

### Responsive Breakpoints
- **Mobile:** < 768px (sm)
- **Tablet:** 768px - 1024px (md)
- **Desktop:** > 1024px (lg)

## State Management

### Authentication State
```typescript
// Check auth on mount (dashboard layout)
const { data: { session } } = await supabase.auth.getSession()
if (!session) router.push("/auth/login")
```

### Component State
- Form inputs: useState
- Loading states: useState
- Sidebar mobile toggle: useState
- Navigation state: derived from pathname

## Security Considerations

### Authentication
- Uses Supabase secure auth system
- Password hashing on backend
- Session tokens in HTTP-only cookies
- Client-side session verification

### Protected Routes
- Middleware checks for auth token
- Dashboard layout verifies session
- Unauthenticated redirect to login
- Authenticated users cannot access login page

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon key
```

## Performance Optimizations

### Code Splitting
- Route-based code splitting via App Router
- Each page loads only necessary code

### Client Components
- 'use client' used selectively:
  - Login page (form interaction)
  - Dashboard layout (auth check, navigation)
  - Individual dashboard pages (interactive features)

### Image Optimization
- Next.js Image component ready for use
- Automatic image optimization

### Font Loading
- Inter font optimized with next/font/google
- Font subsetting to Latin
- Variable font usage via CSS custom property

## API Integration Points

### Supabase Auth
```typescript
// Sign in
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// Get session
const { data: { session } } = await supabase.auth.getSession()

// Sign out
await supabase.auth.signOut()
```

### Database (Ready for Integration)
```typescript
// Example: fetch venues
const { data } = await supabase
  .from('venues')
  .select('*')
  .eq('owner_id', user.id)
```

## Localization

### Language: Spanish
- HTML lang="es"
- All labels in Spanish
- Spanish error messages
- Spanish button text

### Example Translations
- "Iniciar Sesión" → Sign In
- "Correo Electrónico" → Email
- "Espacios" → Venues
- "Reservas" → Bookings

## Development Workflow

### Local Development
```bash
npm install
cp .env.example .env.local
npm run dev  # http://localhost:3000
```

### Build & Deploy
```bash
npm run build
npm run start
npm run lint
npm run type-check
```

### Environment Setup
1. Create Supabase project
2. Get project URL and anon key
3. Add to `.env.local`
4. Run dev server
5. Test login flow

## Testing Considerations

### Unit Testing
- Components can be tested with React Testing Library
- Utility functions with Jest

### Integration Testing
- Auth flow with Supabase
- Middleware routing
- Protected routes

### E2E Testing
- Login and navigation
- Sidebar interactions
- Mobile responsiveness

## Future Enhancements

### Phase 2
- Additional dashboard pages
- Form validation and submission
- Database schema and queries
- Real-time features

### Phase 3
- Payment integration
- Email notifications
- Advanced analytics
- Mobile app

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

### Environment Variables (Production)
- Same as development but with production Supabase credentials
- Ensure API keys are production keys, not dev keys
