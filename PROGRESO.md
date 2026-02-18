# Noah - Progreso del Proyecto

> Sistema de Gestión de Iglesia
> Última actualización: 18 de febrero de 2026 (v4)

---

## Resumen General

Noah es un sistema de gestión de iglesias multi-tenant construido con **Next.js 16.1** (App Router + Turbopack), **MUI v7**, **Prisma 7.4** y **NextAuth 4**. El sistema soporta una arquitectura SaaS donde cada iglesia tiene su propio subdominio (ej: `iglesia.noah.com`), marca y base de usuarios. La interfaz principal es en **español** por defecto, con soporte para inglés.

---

## Stack Tecnológico

| Capa           | Tecnología                       | Versión    |
| -------------- | -------------------------------- | ---------- |
| Framework      | Next.js (App Router + Turbopack) | 16.1.1     |
| UI             | MUI (Material UI)                | 7.3.6      |
| Estilos        | Tailwind CSS                     | 4.1.17     |
| Base de datos  | Supabase PostgreSQL              | -          |
| ORM            | Prisma (driver adapter pattern)  | 7.4        |
| Autenticación  | NextAuth.js (JWT, 30 días)       | 4.24       |
| Formularios    | react-hook-form + valibot        | 7.68 / 1.2 |
| Tablas         | TanStack Table                   | 8.21       |
| Estado global  | Redux Toolkit                    | 2.11       |
| Notificaciones | react-toastify                   | 11.0       |
| Pruebas (E2E)  | Playwright                       | 1.x        |
| Lenguaje       | TypeScript                       | -          |

---

## Estructura del Proyecto

```
src/
├── @core/              # Utilidades del framework (hooks, estilos, SVGs)
├── @layouts/           # Wrappers de layout (Vertical, Horizontal, Blank)
├── @menu/              # Sistema de menú (componentes, contextos)
├── app/
│   ├── [lang]/         # Rutas internacionalizadas (es, en)
│   │   ├── (dashboard)/(private)/    # Dashboard consolidado, Ajustes y Admin
│   │   └── (blank-layout-pages)/     # Login, Registro, Registro de Iglesia
│   ├── api/            # Endpoints API (auth, registro, multi-tenancy)
│   └── server/         # Server Actions (lógica pesada del lado del servidor)
├── components/         # Componentes reutilizables (layout, theme, providers)
├── configs/            # Configuración (i18n, tema, colores)
├── contexts/           # Contextos React (auth, tenant, redux, intersection)
├── data/               # Datos estáticos (navegación, diccionarios)
├── hocs/               # Higher-Order Components (AuthGuard, AdminGuard, GuestOnlyRoute)
├── hooks/              # Hooks personalizados
├── libs/               # Configuraciones de librerías (auth.ts, prisma.ts)
├── prisma/             # Esquema de base de datos
├── redux-store/        # Store de Redux (configurado, sin reducers activos)
├── scripts/            # Scripts utilitarios (seed admin)
├── types/              # Tipos TypeScript
├── utils/              # Utilidades puras (getDictionary, i18n, strings)
└── views/              # Componentes de vista por página
```

---

## Base de Datos (Prisma Schema)

### Modelo `User` (usuario/miembro)

| Campo                             | Tipo             | Descripción                                   |
| --------------------------------- | ---------------- | --------------------------------------------- |
| `id`                              | String (CUID)    | Identificador único                           |
| `firstName`, `lastName`           | String?          | Nombre y apellido                             |
| `name`                            | String?          | Nombre completo (auto-calculado)              |
| `email`                           | String? (unique) | Correo electrónico                            |
| `password`                        | String?          | Contraseña (bcrypt, 12 rounds)                |
| `role`                            | String?          | `"user"` o `"admin"`                          |
| `image`                           | String?          | URL del avatar                                |
| `documentType`                    | String?          | CC, CE, TI, PP                                |
| `documentNumber`                  | String?          | Número de documento                           |
| `phone`                           | String?          | Teléfono                                      |
| `gender`                          | String?          | male, female, other                           |
| `birthDate`                       | DateTime?        | Fecha de nacimiento                           |
| `maritalStatus`                   | String?          | single, married, divorced, widowed, commonLaw |
| `hasChildren`                     | Boolean          | Tiene hijos                                   |
| `childrenCount`                   | Int              | Cantidad de hijos                             |
| `country`                         | String?          | País (CO, VE, EC, PE, MX, AR, CL, US)         |
| `city`, `address`, `neighborhood` | String?          | Ubicación                                     |
| `isActive`                        | Boolean          | Estado de la cuenta                           |
| `organizationId`                  | String?          | ID de la iglesia/organización asociada        |
| `networkId`                       | String?          | ID de la red a la que pertenece               |
| `networkRole`                     | String?          | Rol en la red (`leader` o `member`)           |
| `createdAt`, `updatedAt`          | DateTime         | Timestamps                                    |

### Modelo `Organization` (iglesia/tenant)

| Campo       | Tipo          | Descripción                               |
| ----------- | ------------- | ----------------------------------------- |
| `id`        | String (CUID) | Identificador único                       |
| `name`      | String        | Nombre de la iglesia                      |
| `slug`      | String        | Subdominio único (ej: `iglesia-central`)  |
| `logoUrl`   | String?       | URL del logo de la iglesia                |
| `colors`    | Json?         | Colores de marca (`primary`, `secondary`) |
| `createdAt` | DateTime      | Fecha de creación                         |
| `updatedAt` | DateTime      | Fecha de actualización                    |

### Modelo `Network` (redes/grupos de interés)

| Campo            | Tipo          | Descripción                                |
| ---------------- | ------------- | ------------------------------------------ |
| `id`             | String (CUID) | Identificador único                        |
| `name`           | String        | Nombre de la red                           |
| `description`    | String?       | Descripción del propósito de la red        |
| `imageUrl`       | String?       | URL de la imagen/logo de la red            |
| `isActive`       | Boolean       | Estado de la red (activa/inactiva)         |
| `organizationId` | String        | ID de la iglesia a la que pertenece        |
| `users`          | User[]        | Usuarios que pertenecen a esta red         |
| `createdAt`      | DateTime      | Fecha de creación                          |
| `updatedAt`      | DateTime      | Fecha de actualización                     |

**Restricción importante**: Un usuario solo puede pertenecer a UNA red (como líder o miembro).

### Modelos de soporte NextAuth

- **Account** - Cuentas OAuth vinculadas (Google, etc.)
- **Session** - Sesiones de usuario
- **VerificationToken** - Tokens de verificación de email

---

## Funcionalidades Completadas

### 1. Autenticación y Registro

| Funcionalidad                 | Estado | Descripción                                            |
| ----------------------------- | ------ | ------------------------------------------------------ |
| Login con credenciales        | Listo  | Email + contraseña con validación, manejo de errores   |
| Login con Google OAuth        | Listo  | Configurado con `prompt: consent`                      |
| Registro multi-paso           | Listo  | Formulario de 4 pasos con validación completa          |
| Protección de rutas           | Listo  | AuthGuard (server component) redirige a login          |
| Protección admin              | Listo  | AdminGuard verifica rol, muestra 401 si no es admin    |
| Rutas solo invitados          | Listo  | GuestOnlyRoute redirige al dashboard si ya autenticado |
| Verificación de cuenta activa | Listo  | Login rechaza cuentas desactivadas                     |
| Sesiones JWT (30 días)        | Listo  | Token con id, name, email, role, provider              |
| Auto-login post-registro      | Listo  | Después de registrarse, inicia sesión automáticamente  |

**Flujo de registro (4 pasos):**

1. **Datos Personales** - nombre, apellido, tipo/número de documento, género, fecha de nacimiento
2. **Familia** - estado civil, hijos, cantidad de hijos
3. **Contacto** - teléfono, país, ciudad, dirección, barrio
4. **Cuenta** - email, contraseña, confirmar contraseña, aceptar términos

### 2. Gestión de Cuenta (Mi Cuenta)

| Funcionalidad         | Estado | Descripción                                            |
| --------------------- | ------ | ------------------------------------------------------ |
| Editar perfil         | Listo  | Todos los campos del usuario editables (excepto email) |
| Cambiar contraseña    | Listo  | Verifica contraseña actual, valida nueva contraseña    |
| Interfaz con pestañas | Listo  | Tab "Cuenta" + Tab "Seguridad"                         |

### 3. Administración de Usuarios (Solo Admin)

| Funcionalidad            | Estado | Descripción                                                       |
| ------------------------ | ------ | ----------------------------------------------------------------- |
| Lista de usuarios        | Listo  | Tabla completa con TanStack Table                                 |
| Búsqueda global          | Listo  | Filtro de texto en toda la tabla                                  |
| Filtro por rol           | Listo  | Dropdown: todos / user / admin                                    |
| Filtro por estado        | Listo  | Dropdown: todos / activo / inactivo                               |
| Paginación               | Listo  | 10 filas por página por defecto                                   |
| Drawer de edición        | Listo  | Panel lateral para cambiar rol y estado                           |
| Vista detalle de usuario | Listo  | Panel izquierdo (info básica) + tabs derecho (personal/ubicación) |
| Desactivar usuario       | Listo  | Con protección: admin no puede desactivarse a sí mismo            |
| Cambiar rol de usuario   | Listo  | Asignar user/admin desde el drawer                                |

**Columnas de la tabla de usuarios:**

- Avatar + Nombre
- Email
- Teléfono
- Rol (chip con color)
- Estado (chip activo/inactivo)
- Ciudad
- Acciones (ver detalle, editar)

### 4. Interfaz y Layout

| Funcionalidad              | Estado | Descripción                                             |
| -------------------------- | ------ | ------------------------------------------------------- |
| Primacía del Español       | Listo  | Español es el idioma por defecto ignorando el navegador |
| Layout vertical/horizontal | Listo  | Soporta ambos estilos de navegación                     |
| **Modo Claro Forzado**     | Listo  | Solo modo claro (modo oscuro deshabilitado)             |
| Tema Noah (Blue)           | Listo  | Primario `#0466C8`, Tipografía "Outfit"                 |
| Logo dinámico              | Listo  | Texto "Noah" con branding premium                       |
| Persistencia de Idioma     | Listo  | Cookie `locale` para recordar preferencia del usuario   |

### 5. Navegación (Rutas Consolidadas)

- **Inicio**: `/dashboards` (Ruta base del panel)
- **Ajustes**: `/account-settings` (Perfil y Seguridad)
- **Admin**: `/admin/usuarios` (Gestión de miembros) | `/admin/redes` (Grupos de interés) | `/admin/configuracion` (Colores y nombre)
- **Público**: `/landing` (Acceso + Registro de iglesia) | `/login` (redirige a landing en dominio principal) | `/register`

### 6. Internacionalización (i18n)

| Idioma  | Código | Dirección | Predeterminado |
| ------- | ------ | --------- | -------------- |
| Español | `es`   | LTR       | Sí             |
| Inglés  | `en`   | LTR       | No             |

Claves de navegación traducidas: `inicio`, `miCuenta`, `administracion`, `usuarios`, `redes`, `configuracion`

### 7. API Routes

| Endpoint                  | Método   | Descripción                                             |
| ------------------------- | -------- | ------------------------------------------------------- |
| `/api/auth/[...nextauth]` | GET/POST | Handler completo de NextAuth                            |
| `/api/register`           | POST     | Registro de usuario con validación y hash de contraseña |
| `/api/upload/logo`        | POST/DELETE | Upload/eliminar logo de organización                 |
| `/api/upload/image`       | POST     | Upload genérico de imágenes (redes, eventos, etc.)      |

### 8. Server Actions

**Acciones de usuario** (`actions.ts`):

- `getProfileById(userId)` - Obtener perfil (sin contraseña)
- `updateProfile(userId, data)` - Actualizar perfil propio
- `changePassword(userId, currentPassword, newPassword)` - Cambiar contraseña

**Acciones de admin** (`adminActions.ts`):

- `getAllUsers()` - Listar todos los usuarios (incluye red asignada)
- `getUserById(id)` - Obtener usuario por ID
- `updateUserByAdmin(id, data)` - Editar usuario (rol, estado, datos)
- `deactivateUser(id)` - Desactivar usuario
- `updateOrganizationSettings(organizationId, data)` - Actualizar nombre y colores de organización

**Acciones de redes** (`networkActions.ts`):

- `getAllNetworks()` - Listar todas las redes de la organización
- `getNetworkById(id)` - Obtener red por ID con usuarios
- `createNetwork(data)` - Crear red con líderes y miembros
- `updateNetwork(id, data)` - Actualizar red (nombre, imagen, usuarios)
- `deleteNetwork(id)` - Eliminar red (usuarios quedan sin asignar)
- `getOrganizationUsers(excludeNetworkId?)` - Usuarios disponibles para selector

### 9. Pruebas Automáticas (QA)

| Funcionalidad            | Estado      | Descripción                                                   |
| ------------------------ | ----------- | ------------------------------------------------------------- |
| Pruebas E2E (Playwright) | Configurado | Infraestructura de pruebas de extremo a extremo lista         |
| Test de Registro         | Parcial     | Cubre validaciones de paso 1 y 4, navegación entre pasos      |
| Reportes HTML            | Listo       | Generación automática de reportes detallados en caso de falla |

### 10. Multi-tenancy (Arquitectura SaaS)

| Funcionalidad                            | Estado | Descripción                                                   |
| ---------------------------------------- | ------ | ------------------------------------------------------------- |
| Estructura Multi-tenant (DB)             | Listo  | Modelo `Organization` y vinculación con `User`                |
| Detección de Subdominios                 | Listo  | Middleware detecta el tenant desde la URL (ej: `tenant.noah`) |
| Inyección de Contexto (Headers)          | Listo  | Header `x-tenant-slug` inyectado automáticamente              |
| Registro de Iglesia (`/registrar`)       | Listo  | Flujo completo: crea Organización + Admin en un solo paso     |
| Personalización de Marca (Inicial)       | Listo  | Almacenamiento de colores primarios/secundarios por iglesia   |
| API de Registro de Organización          | Listo  | Endpoint transaccional con validación de slug único           |
| Registro de Usuario Tenant-Aware         | Listo  | El formulario de registro vincula usuarios al tenant actual   |
| Servicio de Resolución de Organizaciones | Listo  | Utilidad para buscar organizaciones por slug o ID             |
| **Branding MUI Dinámico**                | Listo  | Tema MUI usa colores de la organización automáticamente       |
| **TenantContext y useTenant()**          | Listo  | Hook para acceder a branding del tenant en cualquier componente |
| ~~Customizer solo para Admins~~          | Eliminado | Panel de personalización removido completamente            |

### 11. Landing Page y Flujo de Acceso (Nuevo)

| Funcionalidad                          | Estado | Descripción                                                        |
| -------------------------------------- | ------ | ------------------------------------------------------------------ |
| **Página Landing con Tabs**            | Listo  | Tabs "Acceder" y "Registrar Iglesia" en dominio principal          |
| **Redirección /login → /landing**      | Listo  | Middleware redirige login a landing cuando no hay tenant           |
| **Redirección a Subdominio**           | Listo  | Después de registrar iglesia, redirige a `slug.domain/dashboards`  |
| **Cookies Cross-Subdomain**            | Listo  | Sesión persiste entre subdominios (dominio: `.noah.app`)           |
| **Formulario de Login en Landing**     | Listo  | Login completo con validación en tab "Acceder"                     |
| **Formulario de Registro en Landing**  | Listo  | Registro de iglesia con colores en tab "Registrar Iglesia"         |

### 12. Módulo de Configuración de Iglesia (Solo Admin)

| Funcionalidad                          | Estado | Descripción                                                        |
| -------------------------------------- | ------ | ------------------------------------------------------------------ |
| **Vista de Configuración**             | Listo  | Formulario para nombre, color primario y secundario                |
| **Vista Previa de Colores**            | Listo  | Muestra preview de colores antes de guardar                        |
| **Server Action updateOrganizationSettings** | Listo | Actualiza colores y nombre de organización en DB             |
| **Ruta /admin/configuracion**          | Listo  | Página protegida con AdminGuard                                    |
| **Recarga Automática**                 | Listo  | Página recarga para aplicar nuevos colores al tema                 |

### 13. Navegación Filtrada por Rol

| Funcionalidad                          | Estado | Descripción                                                        |
| -------------------------------------- | ------ | ------------------------------------------------------------------ |
| **Tipos con roles opcionales**         | Listo  | `roles?: string[]` agregado a todos los tipos de menú              |
| **Utilidad filterMenuByRole**          | Listo  | Filtra menú recursivamente según rol del usuario                   |
| **Sección Administración (Admin)**     | Listo  | Solo visible para usuarios con rol `admin`                         |
| **Menú Usuarios (Admin)**              | Listo  | Enlace a `/admin/usuarios` solo para admins                        |
| **Menú Configuración (Admin)**         | Listo  | Enlace a `/admin/configuracion` solo para admins                   |
| **Propagación de userRole**            | Listo  | Layout pasa rol a Navigation → VerticalMenu/HorizontalMenu         |

### 14. Subida de Logo de Iglesia

| Funcionalidad                          | Estado | Descripción                                                        |
| -------------------------------------- | ------ | ------------------------------------------------------------------ |
| **API de Upload (`/api/upload/logo`)** | Listo  | Endpoint autenticado para admins con validaciones                  |
| **API Pública para Registro**          | Listo  | `/api/upload/logo-public` para formulario de registro              |
| **Componente LogoUploader**            | Listo  | Drag & drop con react-dropzone, preview, validaciones              |
| **Logo en Registro de Iglesia**        | Listo  | Campo de logo en NoahLanding (tab Registrar)                       |
| **Logo en Configuración**              | Listo  | Sección de logo con preview en `/admin/configuracion`              |
| **Logo en Sidebar**                    | Listo  | Logo.tsx muestra logo del tenant si existe                         |
| **Logo en Login del Tenant**           | Listo  | Página de login muestra logo/nombre del tenant                     |

**Especificaciones del Logo:**

| Propiedad            | Valor                              |
| -------------------- | ---------------------------------- |
| Formatos permitidos  | PNG, JPG, SVG, WebP                |
| Tamaño máximo        | 2MB                                |
| Dimensiones ideales  | 200×60px (ratio ~3.3:1)            |
| Dimensiones máximas  | 400×120px                          |
| Recomendación        | Fondo transparente (PNG/SVG)       |
| Almacenamiento       | `/public/uploads/logos/`           |

### 15. Módulo de Redes (Grupos de Interés)

| Funcionalidad                          | Estado | Descripción                                                        |
| -------------------------------------- | ------ | ------------------------------------------------------------------ |
| **Modelo de datos simplificado**       | Listo  | Un usuario pertenece a máximo UNA red (networkId + networkRole)    |
| **CRUD completo de redes**             | Listo  | Crear, editar, eliminar redes con validaciones                     |
| **Asignación de líderes**              | Listo  | Usuarios con rol `leader` marcados con estrella                    |
| **Asignación de miembros**             | Listo  | Usuarios con rol `member` en la red                                |
| **Upload de imagen por red**           | Listo  | Drag & drop con react-dropzone, validación 2MB                     |
| **Tabla de redes**                     | Listo  | TanStack Table con filtros, paginación, búsqueda                   |
| **Drawer de edición**                  | Listo  | Panel lateral para crear/editar redes                              |
| **Selector múltiple de usuarios**      | Listo  | Autocomplete con chips y avatares                                  |
| **Columna "Red" en tabla de usuarios** | Listo  | Chip con nombre de red y rol (estrella para líderes)               |
| **Validación de unicidad**             | Listo  | Un usuario no puede estar en múltiples redes                       |
| **Filtro por estado**                  | Listo  | Activa/Inactiva                                                    |

**Archivos del módulo:**

| Archivo | Descripción |
|---------|-------------|
| `src/views/admin/redes/index.tsx` | Vista principal del módulo |
| `src/views/admin/redes/NetworkListTable.tsx` | Tabla con TanStack Table |
| `src/views/admin/redes/NetworkDrawer.tsx` | Drawer crear/editar con dropzone |
| `src/views/admin/redes/UserMultiSelect.tsx` | Selector múltiple de usuarios |
| `src/app/server/networkActions.ts` | Server actions CRUD |
| `src/app/[lang]/(dashboard)/(private)/admin/redes/page.tsx` | Ruta de página |
| `src/app/api/upload/image/route.ts` | API de upload genérico |

**Validaciones de negocio:**

- Mínimo 1 líder por red
- Un usuario no puede ser líder Y miembro de la misma red
- Un usuario solo puede pertenecer a UNA red en total
- Solo usuarios de la misma organización pueden ser asignados

**Redes de prueba (seed):**

| Red | Descripción |
|-----|-------------|
| Red Familiar | Fortalecimiento de lazos familiares |
| Esencia | Descubrir propósito en Cristo |
| Refill | Recarga espiritual para jóvenes |
| Red Más | Creciendo juntos en fe |
| Zona Activa | Actividades deportivas y recreativas |
| Red de Mujeres | Comunidad de mujeres |

**Script de seed:** `npx tsx src/scripts/seed-networks.ts`

### 16. Componente ColorPicker Mejorado

| Funcionalidad                          | Estado | Descripción                                                        |
| -------------------------------------- | ------ | ------------------------------------------------------------------ |
| **Componente Compartido**              | Listo  | `src/components/ColorPicker.tsx` usado en registro y configuración |
| **Diseño Moderno**                     | Listo  | Swatch grande (48x48), input hex monospace, icono de paleta        |
| **Borde Interactivo**                  | Listo  | Borde cambia al color seleccionado en hover                        |
| **Tooltip con Vista Previa**           | Listo  | Preview del color con nombre de iglesia, botón y círculo           |
| **Detección de Luminosidad**           | Listo  | Texto claro/oscuro según contraste del color elegido               |
| **Fondo de Tooltip Optimizado**        | Listo  | Fondo slate-800 (`#1e293b`) para mejor contraste                   |
| **Integración con react-hook-form**    | Listo  | Compatible con Controller para formularios validados               |

**Uso del componente:**

```tsx
import ColorPicker from '@/components/ColorPicker'

<ColorPicker
  label='Color Primario'
  value={color}
  onChange={setColor}
  previewName='Nombre Iglesia'
/>
```

**Flujo de Branding Dinámico:**

```
Usuario: iglesia.noah.com
    ↓
Middleware → x-tenant-slug: "iglesia"
    ↓
Layout → getOrganizationBySlug() → { colors: { primary: "#FF6B00" } }
    ↓
Providers → TenantProvider + SettingsProvider(primaryColor)
    ↓
ThemeProvider → Tema MUI con color del tenant
```

**Estructura del campo `colors` en Organization:**

```json
{
  "primary": "#0466C8",
  "secondary": "#001845"
}
```

**Uso del hook `useTenant()`:**

```tsx
import { useTenant } from '@/contexts/TenantContext'

const tenant = useTenant()
// tenant.name, tenant.logoUrl, tenant.colors
```

---

## Funcionalidades Pendientes / En Progreso

| Funcionalidad                      | Estado      | Notas                                                 |
| ---------------------------------- | ----------- | ----------------------------------------------------- |
| Dashboard principal                | Placeholder | Solo muestra tarjeta de bienvenida                    |
| Recuperar contraseña               | Solo UI     | Formulario existe pero no envía emails                |
| Redux store                        | Vacío       | Configurado pero sin reducers                         |
| Módulos de iglesia                 | No iniciado | Gestión de ministerios, eventos, grupos, etc.         |
| Subida de avatar                   | No iniciado | Campo `image` existe en DB pero sin upload            |
| Notificaciones                     | No iniciado | Componente dropdown existe pero sin lógica            |
| Búsqueda global                    | No iniciado | Componente existe pero sin implementación             |
| Calendario                         | No iniciado | Dependencia `@fullcalendar` instalada                 |
| Gráficos/reportes                  | No iniciado | Dependencia `apexcharts` instalada                    |
| Editor de texto                    | No iniciado | Dependencia `@tiptap` instalada                       |

---

## Usuario Admin por Defecto

| Campo          | Valor                               |
| -------------- | ----------------------------------- |
| Email          | `admin@noah.app`                    |
| Contraseña     | `Admin2026!`                        |
| Rol            | `admin`                             |
| Script de seed | `npx tsx src/scripts/seed-admin.ts` |

---

## Comandos Principales

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción
npx prisma db push   # Sincronizar schema con DB (no usar migrate dev)
npx prisma generate  # Regenerar cliente Prisma después de cambios
npx prisma studio    # Explorar datos en navegador
npx tsx src/scripts/seed-admin.ts     # Crear usuario admin
npx tsx src/scripts/seed-networks.ts  # Crear usuarios y redes de prueba
npx playwright test  # Ejecutar todas las pruebas E2E
npx playwright test --ui  # Interfaz gráfica de pruebas
```

---

## Notas Técnicas

- **Prisma 7**: Usa driver adapter. Sincronizar siempre con `npx prisma db push`. No usar `migrate dev` a menos que sea estrictamente necesario para historial.
- **MUI v7**: Usar prefijo `slotProps` para personalización de sub-componentes.
- **Protección de Rutas**: Centralizada en `AuthGuard.tsx` y `AdminGuard.tsx`.
- **Multi-tenancy**: El middleware inyecta `x-tenant-slug`. Las páginas deben leerlo de los headers si necesitan resolver el tenant en el servidor.
- **TenantContext**: Accesible vía `useTenant()` hook. Provee `{ id, name, slug, logoUrl, colors }` del tenant actual.
- **Branding Dinámico**: Los colores del tenant se aplican automáticamente al tema MUI. El color del tenant **siempre prevalece** sobre la cookie del usuario.
- **Navegación por Rol**: El menú se filtra automáticamente según el rol del usuario. La sección "Administración" solo es visible para admins.
- **Landing Page**: En el dominio principal (sin tenant), `/login` redirige a `/landing` que muestra tabs de acceso y registro.
- **Cookies Cross-Subdomain**: La sesión se mantiene entre subdominios usando `domain: '.noah.app'` en producción.
- **Customizer Eliminado**: El engranaje flotante ya no existe. La configuración de colores se hace desde `/admin/configuracion`.
- **Modo Claro Forzado**: El modo oscuro fue deshabilitado porque algunos elementos no se visualizaban correctamente. `themeConfig.ts` usa `mode: 'light'` y `serverHelpers.ts` siempre retorna `'light'`. El selector de modo fue removido de la navbar.
- **Logout con Locale**: El cierre de sesión redirige a `/${locale}/login` del subdominio actual (no a la URL base de la app).
- **Desarrollo de Subdominios**: Para probar localmente, editar `/etc/hosts`:
  ```text
  127.0.0.1 iglesia1.localhost
  127.0.0.1 iglesia2.localhost
  ```

---

## Guía para Agentes AI (Instrucciones Cruciales)

1. **Vibe vs Solidez**: Mantener una estética premium (Sombras suaves, bordes redondeados `1rem`, colores HSL).
2. **Contexto de Tenant**: Si el usuario está en un subdominio, usar `getOrganizationBySlug` de `organizationService.ts`. En componentes client, usar `useTenant()` de `TenantContext.tsx`.
3. **Internacionalización**: Siempre usar `getDictionary` en Server Components y `useParams` + diccionario en Client Components. No hardcodear texto en ningún idioma.
4. **Formularios**: Seguir el patrón de `Register.tsx` (Valibot + React Hook Form).
5. **No Mutar**: Tratar el estado de Redux y la base de datos como inmutables en flujos de diseño.
6. **Seguridad**: Nunca exponer contraseñas. El API de registro debe devolver el objeto `user` excluyendo el campo `password`.
7. **Branding por Tenant**: Los colores se obtienen automáticamente del campo `Organization.colors`. Usar tipos `TenantColors` y `TenantBranding` de `organizationService.ts`.
8. **ColorPicker**: Usar `@/components/ColorPicker` para selección de colores. Incluye preview con tooltip y detección de luminosidad automática.
9. **Modo Claro**: La app está forzada en modo claro. No implementar toggles de modo oscuro ni cambios en `themeConfig.ts` relacionados con temas oscuros.

---

## Archivos Clave Modificados (Sesión 18-Feb-2026)

### Módulo de Redes (nuevo)

| Archivo | Cambio |
|---------|--------|
| `src/prisma/schema.prisma` | Agregado modelo `Network`, campos `networkId`/`networkRole` en `User` |
| `src/views/admin/redes/index.tsx` | **NUEVO** - Vista principal del módulo |
| `src/views/admin/redes/NetworkListTable.tsx` | **NUEVO** - Tabla con TanStack Table |
| `src/views/admin/redes/NetworkDrawer.tsx` | **NUEVO** - Drawer crear/editar con dropzone |
| `src/views/admin/redes/UserMultiSelect.tsx` | **NUEVO** - Selector múltiple de usuarios |
| `src/app/server/networkActions.ts` | **NUEVO** - Server actions CRUD de redes |
| `src/app/api/upload/image/route.ts` | **NUEVO** - API de upload genérico |
| `src/app/[lang]/(dashboard)/(private)/admin/redes/page.tsx` | **NUEVO** - Ruta de página |
| `src/scripts/seed-networks.ts` | **NUEVO** - Script para crear datos de prueba |

### Integración con Usuarios

| Archivo | Cambio |
|---------|--------|
| `src/app/server/adminActions.ts` | `getAllUsers()` ahora incluye `network` y `networkRole` |
| `src/views/apps/user/list/UserListTable.tsx` | Agregada columna "Red" con chip y estrella para líderes |
| `src/views/apps/user/list/index.tsx` | Actualizado tipo para incluir datos de red |
| `src/data/navigation/verticalMenuData.tsx` | Agregado item "Redes" en menú admin |
| `src/data/navigation/horizontalMenuData.tsx` | Agregado item "Redes" en menú admin |
| `src/data/dictionaries/*.json` | Agregada clave `redes` en todos los idiomas |

### Sesión anterior

| Archivo | Cambio |
|---------|--------|
| `src/components/ColorPicker.tsx` | Componente compartido con tooltip mejorado |
| `src/configs/themeConfig.ts` | Forzado `mode: 'light'` |
| `src/@core/utils/serverHelpers.ts` | `getMode()`, `getSystemMode()`, `getServerMode()` retornan `'light'` |
| `src/components/layout/vertical/NavbarContent.tsx` | Removido `ModeDropdown` |
| `src/components/layout/horizontal/NavbarContent.tsx` | Removido `ModeDropdown` |
| `src/components/layout/shared/UserDropdown.tsx` | Logout redirige a `/${locale}/login` |
| `src/views/admin/Configuracion.tsx` | Usa ColorPicker compartido |
| `src/views/NoahLanding.tsx` | Usa ColorPicker compartido, títulos en español |

---

## Próximos Módulos Sugeridos

| Módulo | Descripción | Prioridad |
|--------|-------------|-----------|
| **Eventos** | Crear eventos, asignar a redes, registro de asistencia, calendario | Alta |
| **Asistencia** | Check-in a servicios, reportes, histórico por usuario | Alta |
| **Grupos/Células** | Reuniones semanales, diferente a redes (grupos geográficos) | Media |
| **Finanzas/Diezmos** | Registro de donaciones, reportes, recibos | Media |
| **Comunicaciones** | Notificaciones, mensajes a redes, anuncios | Baja |
| **Dashboard Analítico** | Gráficos de crecimiento, asistencia, participación | Baja |
