# 🚀 Configuración de NextAuth - Guía de Completado

## ✅ Resumen de Cambios Realizados

### 1. Variables de Entorno (`.env.local`)
- `NEXTAUTH_URL` - URL de tu aplicación
- `NEXTAUTH_SECRET` - Clave secreta para JWT (genera una nueva para producción)
- `DATABASE_URL` - Conexión a PostgreSQL
- `GOOGLE_CLIENT_ID` - Client ID de Google OAuth
- `GOOGLE_CLIENT_SECRET` - Client Secret de Google OAuth
- `API_URL` - URL base para APIs internas

### 2. Configuración de Auth (`src/libs/auth.ts`)
- ✅ Extensiones de tipos para NextAuth (Session, User, JWT)
- ✅ Mejor manejo de errores en el provider de credenciales
- ✅ Configuración mejorada de Google OAuth con parámetros de autorización
- ✅ Callbacks mejorados: `signIn`, `jwt`, `session`, `redirect`
- ✅ Modo debug para desarrollo
- ✅ Eventos de logging para signIn, signOut, createUser

### 3. Provider de NextAuth (`src/contexts/nextAuthProvider.tsx`)
- ✅ Configuración de refetch interval (5 minutos)
- ✅ Refetch on window focus habilitado
- ✅ Mejoras en tipos TypeScript

### 4. Schema de Prisma (`src/prisma/schema.prisma`)
- ✅ Campo `role` agregado al modelo User (default: "user")
- ✅ Configuración actualizada para Prisma 7

### 5. Configuración de Prisma (`prisma.config.ts`)
- ✅ Actualizado para usar `DATABASE_URL`

---

## 🔧 Pasos para Completar la Configuración

### 1. Generar NEXTAUTH_SECRET

```bash
# Genera una clave segura para producción
openssl rand -base64 32
```

Copia el resultado y pégalo en `.env.local`:
```env
NEXTAUTH_SECRET=tu_clave_generada_aqui
```

### 2. Configurar Base de Datos PostgreSQL

Asegúrate de tener PostgreSQL instalado y ejecutándose. Luego actualiza `DATABASE_URL`:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_base_datos"
```

### 3. Ejecutar Migraciones de Prisma

```bash
# Crear y aplicar migraciones
npx prisma migrate dev --name init_nextauth

# Generar cliente Prisma (ya completado)
npx prisma generate
```

### 4. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ o Google Identity Toolkit
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth"
5. Configura los URIs de redirección:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://tudominio.com/api/auth/callback/google` (producción)
6. Copia el Client ID y Client Secret a `.env.local`

### 5. Configurar Página de Login

Asegúrate de tener una página de login en `/login` o actualiza la ruta en `src/libs/auth.ts`:

```typescript
pages: {
  signIn: '/login' // o la ruta que prefieras
}
```

---

## 🧪 Probar la Autenticación

### 1. Iniciar el servidor de desarrollo

```bash
npm run dev
# o
pnpm dev
```

### 2. Probar Login con Credenciales

1. Ve a `http://localhost:3000/login`
2. Usa las credenciales de prueba del mock (ver `src/app/api/login/users.ts`)
3. Verifica que la sesión se crea correctamente

### 3. Probar Login con Google

1. Ve a `http://localhost:3000/login`
2. Haz clic en "Sign in with Google"
3. Completa el flujo de OAuth
4. Verifica que el usuario se crea en la base de datos

### 4. Verificar Sesión

Puedes verificar la sesión en cualquier componente cliente:

```typescript
'use client'

import { useSession } from 'next-auth/react'

export default function Profile() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not authenticated</div>

  return (
    <div>
      <p>Welcome {session?.user?.name}</p>
      <p>Email: {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  )
}
```

---

## 🔒 Seguridad - Checklist para Producción

- [ ] Cambiar `NEXTAUTH_SECRET` por una clave segura y única
- [ ] Configurar HTTPS en producción
- [ ] Actualizar URLs de callback de Google OAuth para producción
- [ ] Configurar variables de entorno en el servidor de producción
- [ ] Deshabilitar `debug: true` en `src/libs/auth.ts` para producción
- [ ] Implementar rate limiting en la API de login
- [ ] Agregar validación de email más estricta
- [ ] Considerar implementar refresh token rotation
- [ ] Configurar CORS apropiadamente

---

## 📚 Recursos Adicionales

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js Providers](https://next-auth.js.org/providers/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google OAuth 2.0 Setup](https://support.google.com/cloud/answer/6158849?hl=en)

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: "Database connection failed"
- Verifica que PostgreSQL esté ejecutándose
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que la base de datos exista

### Error: "NEXTAUTH_SECRET is not set"
- Asegúrate de tener `NEXTAUTH_SECRET` en `.env.local`
- Reinicia el servidor después de cambiar variables de entorno

### Error: "Invalid provider"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos
- Asegúrate de que los URIs de redirección estén configurados en Google Cloud Console

---

## 📝 Notas

- El sistema usa JWT para sesiones (strategy: 'jwt')
- Las sesiones expiran después de 30 días
- El token se refresca cada 5 minutos o cuando la ventana recupera el foco
- El campo `role` permite implementar RBAC (Role-Based Access Control)
