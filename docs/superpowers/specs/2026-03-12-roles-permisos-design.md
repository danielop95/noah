# Módulo de Roles y Permisos — Design Spec

## Resumen

Sistema dinámico de roles y permisos granulares para Noah (Casa del Rey). Los roles son creados por el admin desde la UI. Cada rol tiene permisos asignables por módulo y acción. Reemplaza el sistema binario actual (`admin`/`user`).

## Modelo de Datos

### Nuevas tablas

**Role**
- id: String (cuid, PK)
- name: String ("Administrador", "Pastor", etc.)
- slug: String @unique ("admin", "pastor", etc.)
- description: String?
- hierarchy: Int (1 = más poder. Admin=1, Aux=2, Pastor=3, Líder=4, Voluntario=5, Usuario=6)
- isSystem: Boolean (true para Admin y Usuario — no se pueden eliminar)
- isActive: Boolean @default(true)
- organizationId: String (FK a Organization)
- permissions: RolePermission[]
- users: User[]

**Permission**
- id: String (cuid, PK)
- module: String ("usuarios", "redes", "grupos", "reportes", "calendario", "configuracion", "roles", "dashboard")
- action: String ("ver", "crear", "editar", "eliminar", "exportar")
- description: String ("Ver lista de usuarios", etc.)
- @@unique([module, action])

**RolePermission**
- roleId: String (FK a Role)
- permissionId: String (FK a Permission)
- @@id([roleId, permissionId])

### Cambio en User

- Eliminar: `role String? @default("user")`
- Agregar: `roleId String?` (FK a Role)
- Agregar: `userRole Role? @relation(fields: [roleId], references: [id])`

### Permisos iniciales (seed)

| Módulo | Acciones |
|--------|----------|
| dashboard | ver |
| usuarios | ver, crear, editar, eliminar, exportar |
| redes | ver, crear, editar, eliminar, exportar |
| grupos | ver, crear, editar, eliminar, exportar |
| reportes | ver, crear, editar, eliminar, exportar |
| calendario | ver, crear, editar, eliminar |
| configuracion | ver, editar |
| roles | ver, crear, editar, eliminar |

Total: 35 permisos.

### Roles predefinidos (seed)

| Rol | Hierarchy | isSystem | Permisos |
|-----|-----------|----------|----------|
| Admin | 1 | true | TODOS (35) |
| Auxiliar Administrativo | 2 | false | Todos excepto roles.eliminar |
| Pastor | 3 | false | dashboard.ver, reportes.*, grupos.ver, redes.ver, calendario.*, usuarios.ver |
| Líder | 4 | false | dashboard.ver, reportes.ver/crear/editar, calendario.ver, grupos.ver |
| Voluntario | 5 | false | dashboard.ver, calendario.ver, reportes.ver |
| Usuario | 6 | true | dashboard.ver |

## Verificación de Permisos (Backend)

### Helpers

```typescript
// helpers.ts
async function checkPermission(userId: string, module: string, action: string): Promise<boolean>
async function requirePermission(module: string, action: string): Promise<Session> // throws si no tiene permiso
```

### Cache en JWT

Permisos del rol se cargan en JWT token al login como array de strings:
```
token.permissions = ["dashboard.ver", "reportes.ver", "reportes.crear", ...]
```

Se refrescan al próximo login. Opción simple primero.

### Migración de server actions

| Server Action | Antes | Después |
|--------------|-------|---------|
| getAllUsers() | requireAdmin() | requirePermission('usuarios', 'ver') |
| updateUserByAdmin() | requireAdmin() | requirePermission('usuarios', 'editar') |
| deactivateUser() | requireAdmin() | requirePermission('usuarios', 'eliminar') |
| getAllGroups() | requireAdmin() | requirePermission('grupos', 'ver') |
| createGroup() | requireAdmin() | requirePermission('grupos', 'crear') |
| getAllReports() | inline admin check | requirePermission('reportes', 'ver') |
| createReport() | admin OR leader | requirePermission('reportes', 'crear') |
| Calendario CRUD | session only | requirePermission('calendario', 'ver/crear/editar/eliminar') |

### Regla de jerarquía

Solo Admin (hierarchy=1) y Auxiliar Administrativo (hierarchy=2) pueden gestionar roles y permisos. Un usuario solo puede asignar roles con hierarchy mayor que el suyo.

## Frontend

### Navegación

Menu items cambian de `roles: ['admin']` a `permission: 'modulo.ver'`. El componente de nav filtra items según `session.user.permissions`.

### Guards

- `AdminGuard` → `PermissionGuard` genérico: `<PermissionGuard module="usuarios" action="ver">`
- `AuthGuard` se mantiene (solo verifica sesión)

### Hook de permisos

```typescript
function usePermission(module: string, action: string): boolean
```

Usado para ocultar/mostrar botones (eliminar, exportar, etc.).

### UI de Administración de Roles

**Ruta**: `/dashboard/admin/roles`

**Lista**: Tabla con nombre, descripción, usuarios (count), jerarquía, estado, acciones.

**Crear/Editar**: Drawer con nombre, slug, descripción, jerarquía y matriz de permisos:
- Filas = módulos, Columnas = acciones
- Checkboxes con "seleccionar todo" por fila y columna

**Asignación a usuario**: Select de rol en drawer de edición de usuario existente (reemplaza select admin/user).

## Migración

1. Crear tablas Role, Permission, RolePermission
2. Seed de 35 permisos
3. Seed de 6 roles predefinidos con permisos
4. Migrar usuarios: role='admin' → roleId(Admin), role='user' → roleId(Usuario)
5. Eliminar campo role String del User
6. Actualizar server actions con requirePermission()
7. Actualizar frontend (nav, guards, hooks)

Compatibilidad temporal: ambas verificaciones conviven durante la migración.
