# Arquitectura del Proyecto Noah

## Principios de Diseño

Este proyecto sigue una arquitectura **SaaS Multi-tenant** utilizando Next.js 15 (App Router).

### 1. Integridad Estructural

- **Separación de Responsabilidades (SoC):**
  - `UI` (Componentes visuales, sin lógica de negocio compleja).
  - `Lógica` (Hooks, utilidades, servicios).
  - `Datos` (Server Actions, Prisma, API Routes).
- **Agnosticismo de Dependencias:** Wrappers para librerías externas (ej. componentes de UI base, clientes de API).
- **Inmutabilidad:** Uso de estructuras de datos inmutables y Redux Toolkit (donde aplique) para manejo de estado predecible.

### 2. Estructura de Directorios

```
/src
  /app          # Rutas de Next.js (App Router)
  /components   # Componentes React reutilizables
    /ui         # Elementos base (Botones, Inputs, Cards) - Atomic Design
    /shared     # Componentes compartidos entre vistas
  /hooks        # Custom Hooks
  /libs         # Configuraciones de librerías externas (Auth, DB, etc.)
  /prisma       # Esquema de base de datos y migraciones
  /services     # Lógica de negocio y llamadas a APIs externas
  /types        # Definiciones de tipos TypeScript globales
  /utils        # Funciones utilitarias puras
  /views        # Componentes específicos de páginas (Page Views)
```

## Flujo de Datos

1. **Frontend:** Server Components para data fetching inicial -> Client Components para interactividad.
2. **Server Actions:** Para mutaciones y operaciones seguras en el servidor.
3. **Database:** Acceso a PostgreSQL via Prisma ORM.

## Convenciones

- **Nambing:** PascalCase para componentes, camelCase para funciones/variables.
- **Archivos:** `page.tsx` para rutas, `layout.tsx` para estructuras.
- **Estilos:** Tailwind CSS v4 para utilidades, MUI v7 para componentes base.

## Protocolo de Actualización

Toda nueva funcionalidad debe actualizar este documento o los archivos `README.md` y `CHANGELOG.md` pertinentes.

## Identidad Visual (Noah)

- **Paleta de Colores**:
  - Primario: Azul Profundo (`#0466C8`) - Confianza y estabilidad.
  - Secundario: Azul Oxford (`#001845`) - Profesionalismo y profundidad.
- **Tipografía**: `Outfit` (Google Fonts) - Una sans-serif geométrica que aporta un aire moderno y acogedor.
- **Diseño**: Bordes redondeados (10px) y sombras suaves para un acabado premium.

## Estrategia de Pruebas

Para asegurar la solidez del sistema, se utiliza **Playwright** para pruebas de Extremo a Extremo (E2E).

- **Localización de Pruebas:** `/tests`
- **Enfoque:** Pruebas funcionales que simulan el comportamiento real del usuario (registro, login, administración).
- **Herramientas:** Trace Viewer para depuración y Codegen para generación rápida de casos de prueba.
- **Configuración:** Las pruebas levantan automáticamente el servidor de desarrollo (`npm run dev`) si no está corriendo.

- **Iconografía**: Logotipo personalizado inspirado en el Arca y la Paloma (Espíritu Santo/Paz).
