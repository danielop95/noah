# Variables de Entorno — Deploy Servidor de Pruebas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

---

## Obligatorias

### NextAuth

```env
# URL pública del servidor (sin barra al final)
NEXTAUTH_URL=http://TU_IP_O_DOMINIO:3000

# Clave secreta para JWT — genera una nueva con:
# openssl rand -base64 32
NEXTAUTH_SECRET=GENERA_UNA_CLAVE_SEGURA
```

### Base de datos (Supabase / PostgreSQL)

```env
# URL de conexión Transaction Pooler (puerto 6543) — para la app en producción
DATABASE_URL=postgresql://USER:PASSWORD@HOST:6543/DATABASE

# URL de conexión directa (puerto 5432) — solo para migraciones/schema push
DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

> Las credenciales de Supabase se obtienen en: **Supabase Dashboard → Settings → Database → Connection string**

### App URL

```env
# URL pública del servidor (mismo valor que NEXTAUTH_URL sin /api/auth)
NEXT_PUBLIC_APP_URL=http://TU_IP_O_DOMINIO:3000

# Dominio principal (sin protocolo ni barra)
NEXT_PUBLIC_MAIN_DOMAIN=TU_IP_O_DOMINIO:3000
```

---

## Google OAuth (requerido si se usa login con Google)

```env
# Obtener en: https://console.cloud.google.com/ → APIs → Credenciales → OAuth 2.0
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
```

> En Google Cloud Console, agrega como URI de redirección autorizada:
> `http://TU_IP_O_DOMINIO:3000/api/auth/callback/google`

---

## Supabase Storage (requerido para subida de imágenes/logos)

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

> Las claves se obtienen en: **Supabase Dashboard → Settings → API**

---

## Opcionales / No requeridas en pruebas

```env
# No se usa actualmente en el proyecto
MAPBOX_ACCESS_TOKEN=

# Si el servidor corre en un subdirectorio (normalmente vacío)
BASEPATH=
```

---

## Ejemplo completo `.env.local`

```env
NEXTAUTH_URL=http://192.168.1.100:3000
NEXTAUTH_SECRET=REEMPLAZA_CON_CLAVE_GENERADA_POR_OPENSSL

DATABASE_URL=postgresql://postgres.TUPROJECTID:TUPASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.TUPROJECTID:TUPASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres

NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000
NEXT_PUBLIC_MAIN_DOMAIN=192.168.1.100:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_SUPABASE_URL=https://TUPROJECTID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=

BASEPATH=
```

---

## Comandos para levantar el servidor

```bash
# Instalar dependencias
npm install

# Construir la aplicación
npm run build

# Iniciar en producción
npm run start

# O con PM2 (recomendado para servidor de pruebas)
pm2 start npm --name "noah" -- start
pm2 save
```

> El servidor escucha en el puerto **3000** por defecto.
> Para cambiar el puerto: `npm run start -- -p 8080`
