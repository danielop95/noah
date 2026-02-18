# Noah - SaaS B2B para Iglesias

Plataforma de gestión para iglesias, construida con tecnologías modernas para escalabilidad y experiencia de usuario premium.

## Stack Tecnológico

- **Frontend:** Next.js 15, React 19, TypeScript
- **UI:** MUI v7, Tailwind CSS v4
- **Database:** PostgreSQL (Supabase), Prisma ORM
- **Auth:** NextAuth.js v4
- **Package Manager:** pnpm

## Requisitos Previos

- Node.js 20+
- pnpm (activar con `corepack enable`)

## Instalación

1.  Clonar el repositorio (o usar este directorio).
2.  Instalar dependencias:
    ```bash
    pnpm install
    # Si pnpm no está disponible:
    # npm install -g pnpm
    ```
3.  Configurar variables de entorno:
    ```bash
    cp .env.example .env
    ```
    (Editar `.env` con las credenciales de Supabase y otros servicios).

## Desarrollo

```bash
pnpm dev
```

## Estructura

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles sobre la organización del código y principios de diseño.

## Scripts

- `pnpm dev`: Iniciar servidor de desarrollo.
- `pnpm build`: Construir para producción.
- `pnpm start`: Iniciar servidor de producción.
- `pnpm lint`: Ejecutar linter.
