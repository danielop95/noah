import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 10000
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

/**
 * Seed de Roles y Permisos para Casa del Rey
 * Ejecutar: npx tsx src/scripts/seed-roles.ts
 */

// Definición de todos los permisos por módulo
const PERMISSIONS: Array<{ module: string; action: string; description: string }> = [
  // Dashboard
  { module: 'dashboard', action: 'ver', description: 'Ver dashboard principal' },

  // Usuarios
  { module: 'usuarios', action: 'ver', description: 'Ver lista de usuarios' },
  { module: 'usuarios', action: 'crear', description: 'Crear nuevos usuarios' },
  { module: 'usuarios', action: 'editar', description: 'Editar información de usuarios' },
  { module: 'usuarios', action: 'eliminar', description: 'Desactivar o eliminar usuarios' },
  { module: 'usuarios', action: 'exportar', description: 'Exportar datos de usuarios' },

  // Redes
  { module: 'redes', action: 'ver', description: 'Ver lista de redes' },
  { module: 'redes', action: 'crear', description: 'Crear nuevas redes' },
  { module: 'redes', action: 'editar', description: 'Editar información de redes' },
  { module: 'redes', action: 'eliminar', description: 'Eliminar redes' },
  { module: 'redes', action: 'exportar', description: 'Exportar datos de redes' },

  // Grupos
  { module: 'grupos', action: 'ver', description: 'Ver lista de grupos' },
  { module: 'grupos', action: 'crear', description: 'Crear nuevos grupos' },
  { module: 'grupos', action: 'editar', description: 'Editar información de grupos' },
  { module: 'grupos', action: 'eliminar', description: 'Eliminar grupos' },
  { module: 'grupos', action: 'exportar', description: 'Exportar datos de grupos' },

  // Reportes
  { module: 'reportes', action: 'ver', description: 'Ver reportes de grupos' },
  { module: 'reportes', action: 'crear', description: 'Crear nuevos reportes' },
  { module: 'reportes', action: 'editar', description: 'Editar reportes existentes' },
  { module: 'reportes', action: 'eliminar', description: 'Eliminar reportes' },
  { module: 'reportes', action: 'exportar', description: 'Exportar datos de reportes' },

  // Calendario
  { module: 'calendario', action: 'ver', description: 'Ver eventos del calendario' },
  { module: 'calendario', action: 'crear', description: 'Crear eventos en el calendario' },
  { module: 'calendario', action: 'editar', description: 'Editar eventos del calendario' },
  { module: 'calendario', action: 'eliminar', description: 'Eliminar eventos del calendario' },

  // Configuración
  { module: 'configuracion', action: 'ver', description: 'Ver configuración de la organización' },
  { module: 'configuracion', action: 'editar', description: 'Editar configuración de la organización' },

  // Roles
  { module: 'roles', action: 'ver', description: 'Ver lista de roles' },
  { module: 'roles', action: 'crear', description: 'Crear nuevos roles' },
  { module: 'roles', action: 'editar', description: 'Editar roles y permisos' },
  { module: 'roles', action: 'eliminar', description: 'Eliminar roles' },
]

// Definición de roles predefinidos con sus permisos
const ROLES: Array<{
  name: string
  slug: string
  description: string
  hierarchy: number
  isSystem: boolean
  permissions: Array<{ module: string; action: string }>
}> = [
  {
    name: 'Administrador',
    slug: 'admin',
    description: 'Acceso total a todas las funcionalidades del sistema',
    hierarchy: 1,
    isSystem: true,
    permissions: PERMISSIONS.map(p => ({ module: p.module, action: p.action })) // TODOS
  },
  {
    name: 'Auxiliar Administrativo',
    slug: 'auxiliar-administrativo',
    description: 'Apoyo administrativo con acceso amplio a la plataforma',
    hierarchy: 2,
    isSystem: false,
    permissions: PERMISSIONS
      .filter(p => !(p.module === 'roles' && p.action === 'eliminar'))
      .map(p => ({ module: p.module, action: p.action }))
  },
  {
    name: 'Pastor',
    slug: 'pastor',
    description: 'Líder pastoral con acceso a reportes, calendario y vista de estructura',
    hierarchy: 3,
    isSystem: false,
    permissions: [
      { module: 'dashboard', action: 'ver' },
      { module: 'usuarios', action: 'ver' },
      { module: 'redes', action: 'ver' },
      { module: 'grupos', action: 'ver' },
      { module: 'reportes', action: 'ver' },
      { module: 'reportes', action: 'crear' },
      { module: 'reportes', action: 'editar' },
      { module: 'reportes', action: 'eliminar' },
      { module: 'reportes', action: 'exportar' },
      { module: 'calendario', action: 'ver' },
      { module: 'calendario', action: 'crear' },
      { module: 'calendario', action: 'editar' },
      { module: 'calendario', action: 'eliminar' },
    ]
  },
  {
    name: 'Líder',
    slug: 'lider',
    description: 'Líder de grupo con acceso a reportes de su grupo y calendario',
    hierarchy: 4,
    isSystem: false,
    permissions: [
      { module: 'dashboard', action: 'ver' },
      { module: 'grupos', action: 'ver' },
      { module: 'reportes', action: 'ver' },
      { module: 'reportes', action: 'crear' },
      { module: 'reportes', action: 'editar' },
      { module: 'calendario', action: 'ver' },
    ]
  },
  {
    name: 'Voluntario',
    slug: 'voluntario',
    description: 'Voluntario con acceso de solo lectura a calendario y reportes',
    hierarchy: 5,
    isSystem: false,
    permissions: [
      { module: 'dashboard', action: 'ver' },
      { module: 'calendario', action: 'ver' },
      { module: 'reportes', action: 'ver' },
    ]
  },
  {
    name: 'Usuario',
    slug: 'usuario',
    description: 'Usuario básico con acceso mínimo al dashboard',
    hierarchy: 6,
    isSystem: true,
    permissions: [
      { module: 'dashboard', action: 'ver' },
    ]
  },
]

async function main() {
  console.log('=== SEED: Roles y Permisos ===\n')

  // 1. Obtener organización
  const org = await prisma.organization.findFirst({ where: { slug: 'casadelrey' } })

  if (!org) {
    console.error('Error: Organización Casa del Rey no encontrada. Ejecuta seed-casa-del-rey.ts primero.')
    process.exit(1)
  }

  console.log(`✓ Organización: ${org.name}\n`)

  // 2. Crear permisos
  console.log('--- Creando permisos ---')
  const permissionMap = new Map<string, string>() // "module.action" → id

  for (const perm of PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { module_action: { module: perm.module, action: perm.action } }
    })

    if (existing) {
      permissionMap.set(`${perm.module}.${perm.action}`, existing.id)
      continue
    }

    const created = await prisma.permission.create({
      data: perm
    })

    permissionMap.set(`${perm.module}.${perm.action}`, created.id)
  }

  console.log(`✓ ${permissionMap.size} permisos listos\n`)

  // 3. Crear roles con permisos
  console.log('--- Creando roles ---')
  const roleMap = new Map<string, string>() // slug → id

  for (const roleData of ROLES) {
    let role = await prisma.role.findUnique({ where: { slug: roleData.slug } })

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleData.name,
          slug: roleData.slug,
          description: roleData.description,
          hierarchy: roleData.hierarchy,
          isSystem: roleData.isSystem,
          organizationId: org.id
        }
      })
      console.log(`  ✓ Rol "${role.name}" creado (jerarquía: ${role.hierarchy})`)
    } else {
      console.log(`  ↳ Rol "${role.name}" ya existe`)
    }

    roleMap.set(roleData.slug, role.id)

    // Asignar permisos al rol (upsert)
    for (const perm of roleData.permissions) {
      const permId = permissionMap.get(`${perm.module}.${perm.action}`)

      if (!permId) continue

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
        update: {},
        create: { roleId: role.id, permissionId: permId }
      })
    }
  }

  console.log('')

  // 4. Migrar usuarios sin rol asignado
  console.log('--- Migrando usuarios a roles ---')

  const userRoleId = roleMap.get('usuario')!

  // Migrar cualquier usuario sin rol asignado
  const nullResult = await prisma.user.updateMany({
    where: { roleId: null },
    data: { roleId: userRoleId }
  })

  if (nullResult.count > 0) {
    console.log(`  ✓ ${nullResult.count} usuarios sin rol asignados a Usuario`)
  }

  // 5. Resumen
  console.log('\n=== RESUMEN ===')
  const totalPerms = await prisma.permission.count()
  const totalRoles = await prisma.role.count({ where: { organizationId: org.id } })
  const totalAssignments = await prisma.rolePermission.count()

  console.log(`  Permisos:     ${totalPerms}`)
  console.log(`  Roles:        ${totalRoles}`)
  console.log(`  Asignaciones: ${totalAssignments}`)
  console.log('\n=== SEED COMPLETO ===')
}

main()
  .catch(e => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
