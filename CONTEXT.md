# Noah — Contexto del Proyecto para Agentes de IA

Este documento contiene todo el contexto necesario para que un agente pueda planificar e implementar nuevas funciones en Noah sin necesidad de explorar el código desde cero.

---

## ¿Qué es Noah?

Sistema de gestión para iglesias. Single-tenant, configurado para **Casa del Rey**. Maneja usuarios, redes, grupos celulares, reportes de reuniones, calendario de eventos, roles y permisos.

**URL local:** `http://localhost:3000`
**Directorio:** `/Users/dan/Documents/Nkrease/Noah`

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.1.1 | Framework (App Router) |
| React | 19.2.1 | UI |
| TypeScript | 5.9.3 | Lenguaje |
| MUI Material | 7.3.6 | Componentes UI |
| NextAuth | 4.24.13 | Autenticación |
| Prisma | 7.4.0 | ORM |
| PostgreSQL (Supabase) | — | Base de datos |
| TailwindCSS | 4.1.17 | Estilos utilitarios |
| React Hook Form | 7.68.0 | Formularios |
| Valibot | 1.2.0 | Validación de esquemas |
| Recharts | 3.5.1 | Gráficos |
| jsPDF + autotable | 4.2.0 / 5.0.7 | Export PDF |
| XLSX | 0.18.5 | Export Excel |
| date-fns | 4.1.0 | Utilidades de fechas |
| React Toastify | 11.0.5 | Notificaciones |
| FullCalendar | 6.1.19 | Calendario |
| @tanstack/react-table | 8.21.3 | Tablas |

**Comandos:**
```bash
npm run dev      # Desarrollo con Turbopack
npm run build    # Build de producción
npm run start    # Servidor de producción
prisma db push   # Aplicar cambios al schema (NO usar migrate dev)
```

---

## Arquitectura General

```
Next.js App Router (Server Components por defecto)
├── Pages: Server Components — fetching de datos, metadata, guards
├── Views: Client Components ('use client') — interactividad, estado
├── Server Actions: ('use server') — lógica de negocio, BD
└── Prisma: ORM con driver adapter (Pool pg)
```

**Flujo típico:**
1. Usuario accede a una ruta → `page.tsx` (server) se ejecuta
2. Page llama server actions para obtener datos
3. Page renderiza `PermissionGuard` + `<XyzView groups={data} />`
4. View (`'use client'`) renderiza UI interactiva con MUI
5. Interacciones del usuario → server actions → `router.refresh()` para revalidar

---

## Base de Datos — Schema Prisma

**Archivo:** `src/prisma/schema.prisma`

### Modelos

#### User
```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String?
  firstName      String?
  lastName       String?
  password       String?        // bcrypt hash
  image          String?
  phone          String?
  documentType   String?
  documentNumber String?
  gender         String?
  maritalStatus  String?
  birthDate      String?
  country        String?
  city           String?
  address        String?
  neighborhood   String?
  hasChildren    Boolean   @default(false)
  childrenCount  Int       @default(0)
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relaciones
  roleId         String?
  userRole       Role?      @relation(fields: [roleId], references: [id])
  organizationId String?
  organization   Organization? @relation(...)
  networkId      String?
  network        Network?   @relation(...)
  networkRole    String?    // 'leader' | 'member'
  groupId        String?
  group          Group?     @relation(...)
  groupRole      String?    // 'leader' | 'member'

  groupReports   GroupReport[]
  calendarEvents CalendarEvent[]
  accounts       Account[]
  sessions       Session[]
}
```

#### Organization
```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  logoUrl   String?
  colors    Json?    // { primary: "#hex", secondary: "#hex" }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users          User[]
  roles          Role[]
  networks       Network[]
  groups         Group[]
  groupReports   GroupReport[]
  calendarEvents CalendarEvent[]
  vacationPeriods VacationPeriod[]
}
```

#### Role
```prisma
model Role {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  description   String?
  hierarchy     Int      // 1=Admin, 2=Auxiliar, 3=Pastor, 4=Líder, 5=Voluntario, 6=Usuario
  isSystem      Boolean  @default(false)  // Admin y Usuario son protegidos
  isActive      Boolean  @default(true)
  organizationId String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  permissions   RolePermission[]
  users         User[]
}
```

#### Permission
```prisma
model Permission {
  id          String @id @default(cuid())
  module      String // "usuarios" | "redes" | "grupos" | "reportes" | "calendario" | "configuracion" | "roles" | "dashboard"
  action      String // "ver" | "crear" | "editar" | "eliminar" | "exportar"
  description String

  @@unique([module, action])
  roles RolePermission[]
}
```

#### Network
```prisma
model Network {
  id             String   @id @default(cuid())
  name           String
  description    String?
  imageUrl       String?
  isActive       Boolean  @default(true)
  organizationId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  users  User[]
  groups Group[]
}
```

#### Group
```prisma
model Group {
  id             String   @id @default(cuid())
  name           String
  description    String?
  imageUrl       String?
  networkId      String   // FK obligatoria
  organizationId String
  modality       String   @default("presencial") // "presencial" | "virtual"
  city           String?  // Solo presencial
  address        String?
  neighborhood   String?
  meetingDay     String?  // "lunes" | "martes" | ... | "domingo"
  meetingTime    String?  // "19:00"
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  members  User[]
  reports  GroupReport[]
  network  Network @relation(...)
}
```

#### GroupReport
```prisma
model GroupReport {
  id             String   @id @default(cuid())
  meetingDate    DateTime @db.Date  // Solo fecha, sin hora
  totalAttendees Int
  leadersCount   Int
  visitorsCount  Int
  reportOffering Boolean  @default(false)
  offeringAmount Decimal? @db.Decimal(10,2)
  notes          String?
  noMeeting      Boolean  @default(false)
  noMeetingReason String?
  groupId        String
  reporterId     String
  organizationId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([groupId, meetingDate])  // Un reporte por fecha por grupo
}
```

#### CalendarEvent
```prisma
model CalendarEvent {
  id             String   @id @default(cuid())
  title          String
  description    String?
  startDate      DateTime
  endDate        DateTime
  allDay         Boolean  @default(false)
  category       String   @default("evento") // "culto"|"evento"|"reunion"|"actividad"|"capacitacion"
  url            String?
  location       String?
  isActive       Boolean  @default(true)
  createdById    String
  organizationId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

#### VacationPeriod
```prisma
model VacationPeriod {
  id             String   @id @default(cuid())
  name           String?
  startDate      DateTime @db.Date
  endDate        DateTime @db.Date
  organizationId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## Autenticación

**Archivo:** `src/libs/auth.ts`

- **Estrategia:** JWT + Credentials + Google OAuth
- **Session max age:** 30 días
- **Login page:** `/login`

### Extensión del User type en sesión

```typescript
// Lo que tiene session.user en cualquier Server Component o Server Action:
session.user = {
  id: string
  name?: string
  email?: string
  image?: string
  roleId?: string
  roleSlug?: string
  roleName?: string
  roleHierarchy?: number    // 1=Admin, 6=Usuario (número menor = más poder)
  permissions?: string[]    // ["grupos.ver", "grupos.crear", "reportes.ver", ...]
  organizationId?: string
}
```

### Obtener sesión

```typescript
// En Server Components y Server Actions:
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

const session = await getServerSession(authOptions)

// O usar los helpers (ver sección siguiente):
const session = await requireAuth()   // Lanza error si no hay sesión
const session = await requireAdmin()  // Lanza error si no es admin (hierarchy > 1)
```

---

## Server Action Helpers

**Archivo:** `src/app/server/helpers.ts`

```typescript
'use server'

// Obtiene el usuario de la sesión o lanza error
getSessionUser() → Promise<Session['user']>

// Requiere sesión válida o lanza error
requireAuth() → Promise<Session>

// Requiere hierarchy <= 1 (Admin) o lanza error
requireAdmin() → Promise<Session>

// Verifica permiso. Retorna false si no tiene sesión o permiso
checkPermission(module: string, action: string) → Promise<boolean>

// Requiere permiso o lanza error
requirePermission(module: string, action: string) → Promise<Session>

// Obtiene organizationId del usuario
getUserOrganizationId(userId: string) → Promise<string | null>

// Obtiene organizationId o lanza error si no tiene org
requireOrganizationId(userId: string) → Promise<string>

// Verifica si el usuario es líder de un grupo específico
isUserGroupLeader(userId: string, groupId: string) → Promise<boolean>
```

---

## Patrón Completo para Crear un Módulo Nuevo

### 1. Server Action (`src/app/server/miModuloActions.ts`)

```typescript
'use server'

import prisma from '@/libs/prisma'
import { requireAuth, requirePermission, getUserOrganizationId } from './helpers'

export type MiEntidad = {
  id: string
  name: string
  // ...
}

// Listar
export async function getAllMiEntidad(): Promise<MiEntidad[]> {
  const session = await requirePermission('mimodulo', 'ver')
  const organizationId = await getUserOrganizationId(session.user.id)

  if (!organizationId) throw new Error('Sin organización')

  return prisma.miEntidad.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' }
  })
}

// Crear
export async function createMiEntidad(data: { name: string }) {
  const session = await requirePermission('mimodulo', 'crear')
  const organizationId = await getUserOrganizationId(session.user.id)

  if (!organizationId) throw new Error('Sin organización')

  return prisma.miEntidad.create({
    data: { ...data, organizationId }
  })
}

// Actualizar
export async function updateMiEntidad(id: string, data: { name: string }) {
  const session = await requirePermission('mimodulo', 'editar')
  const organizationId = await getUserOrganizationId(session.user.id)

  // Validar ownership
  const entidad = await prisma.miEntidad.findFirst({
    where: { id, organizationId }
  })
  if (!entidad) throw new Error('No encontrado')

  return prisma.miEntidad.update({ where: { id }, data })
}

// Eliminar
export async function deleteMiEntidad(id: string) {
  const session = await requirePermission('mimodulo', 'eliminar')
  const organizationId = await getUserOrganizationId(session.user.id)

  const entidad = await prisma.miEntidad.findFirst({
    where: { id, organizationId }
  })
  if (!entidad) throw new Error('No encontrado')

  await prisma.miEntidad.delete({ where: { id } })
}
```

### 2. Página (`src/app/dashboard/admin/mi-modulo/page.tsx`)

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import AuthRedirect from '@/components/AuthRedirect'
import PermissionGuard from '@/hocs/PermissionGuard'
import MiModuloView from '@/views/admin/mi-modulo'
import { getAllMiEntidad } from '@/app/server/miModuloActions'

export const metadata = {
  title: 'Mi Módulo - Noah',
}

const MiModuloPage = async () => {
  const session = await getServerSession(authOptions)
  if (!session) return <AuthRedirect />

  const entidades = await getAllMiEntidad()

  return (
    <PermissionGuard permission='mimodulo.ver'>
      <MiModuloView entidades={entidades} />
    </PermissionGuard>
  )
}

export default MiModuloPage
```

### 3. View (`src/views/admin/mi-modulo/index.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import type { MiEntidad } from '@/app/server/miModuloActions'

type Props = {
  entidades: MiEntidad[]
}

const MiModuloView = ({ entidades }: Props) => {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleRefresh = () => {
    router.refresh() // Re-ejecuta page.tsx para datos frescos
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Typography variant='h4'>Mi Módulo</Typography>
          <Typography variant='body2' color='textSecondary'>
            {entidades.length} entidades registradas
          </Typography>
        </div>
        <Button variant='contained' onClick={() => setDrawerOpen(true)}>
          Nueva entidad
        </Button>
      </div>

      <Card>
        <CardContent>
          {/* Tabla o lista */}
        </CardContent>
      </Card>

      {/* Drawer para crear/editar */}
    </div>
  )
}

export default MiModuloView
```

### 4. Navegación (`src/data/navigation/verticalMenuData.tsx` + `horizontalMenuData.tsx`)

```typescript
// Agregar dentro del isSection "administracion" si es módulo admin:
{
  label: dictionary['navigation'].miModulo,
  icon: 'solar-ICON-NAME-linear',
  href: '/dashboard/admin/mi-modulo',
  maxHierarchy: 2
}

// O como item principal si está disponible para todos:
{
  label: dictionary['navigation'].miModulo,
  icon: 'solar-ICON-NAME-linear',
  href: '/dashboard/mi-modulo'
}
```

### 5. Diccionarios (`src/data/dictionaries/*.json`)

Agregar en todos los archivos (es, en, fr, ar) dentro de `"navigation"`:
```json
"miModulo": "Mi Módulo"
```

---

## Convenciones Críticas

### MUI v7 Grid
```tsx
// ✅ CORRECTO (v7):
<Grid size={{ xs: 12, md: 6 }}>

// ❌ INCORRECTO (v5/v6 - NO usar):
<Grid item xs={12} md={6}>
```

### Prisma — URL de conexión
La URL NO va en `schema.prisma`. Va en `prisma.config.ts` y en `.env.local`:
```
DATABASE_URL=postgresql://...   # Transaction Pooler puerto 6543
DIRECT_URL=postgresql://...     # Direct/Session puerto 5432
```

### Operaciones multi-tabla
```typescript
// Usar transacciones para garantizar atomicidad:
await prisma.$transaction(async (tx) => {
  const grupo = await tx.group.create({ ... })
  await tx.user.updateMany({ where: { id: { in: leaderIds } }, data: { groupId: grupo.id } })
})
```

### Importar Server Actions en Client Components
```typescript
// En un Client Component ('use client'):
import { createMiEntidad } from '@/app/server/miModuloActions'

// Las server actions pueden llamarse directamente como funciones async:
const handleSubmit = async (data) => {
  try {
    await createMiEntidad(data)
    onRefresh()
  } catch (error) {
    console.error(error)
  }
}
```

### Refrescar datos
```typescript
// En views (Client Components), para recargar los datos del page.tsx:
const router = useRouter()
router.refresh() // Vuelve a ejecutar el page.tsx server-side

// NO usar: router.push(router.pathname) — eso navega y pierde estado
```

### Validación de ownership
**Siempre** filtrar por `organizationId` en queries. Nunca buscar solo por `id`:
```typescript
// ✅ Correcto:
const entidad = await prisma.miEntidad.findFirst({
  where: { id, organizationId }  // Doble validación
})

// ❌ Inseguro:
const entidad = await prisma.miEntidad.findUnique({
  where: { id }  // Podría acceder datos de otra org
})
```

### Permisos en strings
Formato: `"modulo.accion"` (siempre minúsculas, separado por punto)

Módulos disponibles: `usuarios`, `redes`, `grupos`, `reportes`, `calendario`, `configuracion`, `roles`, `dashboard`

Acciones disponibles: `ver`, `crear`, `editar`, `eliminar`, `exportar`

### Roles y jerarquía
- Número **menor** = **más poder** (`1` es Admin, `6` es Usuario básico)
- `maxHierarchy: 2` en menú/guards = solo admins (1) y auxiliares (2) ven el ítem
- Verificar con: `(session.user.roleHierarchy ?? 999) <= 2`

### Iconos
El proyecto usa iconos de Solar Icon Set vía Iconify. Formato: `solar-NOMBRE-linear`

Ejemplos:
- `solar-users-group-rounded-linear` — usuarios
- `solar-share-circle-linear` — redes
- `solar-widget-2-linear` — grupos
- `solar-chart-square-linear` — reportes
- `solar-calendar-linear` — calendario
- `solar-settings-minimalistic-linear` — configuración
- `solar-shield-keyhole-linear` — roles/admin
- `solar-clipboard-text-linear` — reportes pendientes
- `solar-home-smile-linear` — inicio

---

## Estructura de Archivos Clave

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (font, theme, providers)
│   ├── globals.css                   # Estilos globales + @media print
│   ├── dashboard/
│   │   ├── layout.tsx                # Layout con nav, navbar, auth guard
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── calendario/page.tsx
│   │   ├── reportes/
│   │   │   ├── page.tsx
│   │   │   └── pendientes/page.tsx
│   │   ├── account-settings/page.tsx
│   │   └── admin/
│   │       ├── usuarios/[page.tsx, [id]/page.tsx]
│   │       ├── redes/[page.tsx, [id]/page.tsx]
│   │       ├── grupos/[page.tsx, [id]/page.tsx]
│   │       ├── roles/page.tsx
│   │       └── configuracion/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── upload/[image|logo|logo-public]/route.ts
│   └── server/
│       ├── helpers.ts                # Auth + permission helpers
│       ├── actions.ts                # General (register, profile)
│       ├── adminActions.ts           # Admin operations
│       ├── groupActions.ts           # CRUD grupos
│       ├── networkActions.ts         # CRUD redes
│       ├── reportActions.ts          # Reportes y semanas pendientes
│       ├── roleActions.ts            # CRUD roles y permisos
│       ├── calendarActions.ts        # CRUD eventos
│       └── dashboardActions.ts       # Stats del dashboard
├── views/
│   ├── Dashboard.tsx
│   ├── Login.tsx, ForgotPassword.tsx, NotAuthorized.tsx
│   ├── admin/
│   │   ├── usuarios/detail/          # Perfil usuario (6 componentes por tab)
│   │   ├── redes/[index, drawer, detail]
│   │   ├── grupos/[index, drawer, detail/]
│   │   ├── roles/[index, drawer]
│   │   └── configuracion/
│   ├── reportes/
│   │   ├── index.tsx                 # Vista principal reportes
│   │   ├── PendingReportsView.tsx    # Reportes pendientes
│   │   ├── ReportDrawer.tsx          # Crear/editar reporte
│   │   ├── ReportListTable.tsx
│   │   └── ReportStatsCards.tsx
│   └── calendario/
├── components/
│   ├── Providers.tsx
│   ├── ExportButton.tsx              # Export PDF/Excel genérico
│   ├── UserEditDrawer.tsx
│   ├── ColorPicker.tsx
│   ├── LogoUploader.tsx
│   └── layout/[vertical|horizontal|shared]/
├── libs/
│   ├── auth.ts                       # NextAuth config
│   └── prisma.ts                     # Prisma singleton
├── hocs/
│   ├── AuthGuard.tsx                 # Requiere sesión
│   ├── PermissionGuard.tsx           # Requiere permiso o hierarchy
│   └── AdminGuard.tsx                # Requiere hierarchy <= 1
├── data/
│   ├── navigation/
│   │   ├── verticalMenuData.tsx      # Menú sidebar
│   │   └── horizontalMenuData.tsx    # Menú horizontal
│   └── dictionaries/
│       ├── es.json, en.json, fr.json, ar.json
├── prisma/
│   └── schema.prisma
├── utils/
│   ├── getDictionary.ts              # getLocaleFromCookie, getDictionaryFromCookie
│   └── getOrganization.ts            # getSingleOrganization() → Casa del Rey
└── contexts/
    └── LocaleContext.tsx
```

---

## Checklist para Crear un Módulo Nuevo

1. **Schema** — Agregar modelo en `src/prisma/schema.prisma` + `prisma db push`
2. **Server Action** — Crear `src/app/server/[nombre]Actions.ts` con CRUD
3. **Page** — Crear `src/app/dashboard/[ruta]/page.tsx` (server)
4. **View** — Crear `src/views/[ruta]/index.tsx` (client)
5. **Diccionarios** — Agregar clave en los 4 archivos JSON
6. **Navegación** — Agregar ítem en `verticalMenuData.tsx` + `horizontalMenuData.tsx`
7. **Permisos** — Si el módulo tiene permisos propios, agregar en `Permission` model via seed o admin UI
8. **Admin user de prueba:** `admin@noah.app` / `Admin2026!`

---

## Componente ExportButton (Reutilizable)

Para agregar export PDF/Excel a cualquier tabla:

```tsx
import ExportButton, { type ExportColumn } from '@/components/ExportButton'

const columns: ExportColumn[] = [
  { header: 'Nombre', accessor: row => row.name },
  { header: 'Email', accessor: row => row.email },
  { header: 'Red', accessor: row => row.networkName },
]

<ExportButton
  data={filteredRows}
  columns={columns}
  fileName='mi-modulo'
  title='Mi Módulo — Casa del Rey'
/>
```

---

## Variables de Entorno Requeridas

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=CLAVE_SEGURA

DATABASE_URL=postgresql://USER:PASS@HOST:6543/DATABASE   # Puerto 6543 para app
DIRECT_URL=postgresql://USER:PASS@HOST:5432/DATABASE     # Puerto 5432 para migrations

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAIN_DOMAIN=localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
