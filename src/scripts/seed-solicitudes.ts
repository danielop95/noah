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

const PERMISOS = [
  { module: 'solicitudes', action: 'ver', description: 'Ver solicitudes propias y aquellas a las que se tiene acceso' },
  { module: 'solicitudes', action: 'crear', description: 'Crear nuevas solicitudes interáreas' },
  { module: 'solicitudes', action: 'editarPropia', description: 'Editar solicitudes propias mientras estén pendientes' },
  { module: 'solicitudes', action: 'aprobar', description: 'Aprobar o rechazar solicitudes dirigidas al área que lidera' },
  { module: 'solicitudes', action: 'verTodas', description: 'Ver todas las solicitudes de la organización' },
  { module: 'solicitudes', action: 'eliminar', description: 'Eliminar solicitudes (operación administrativa)' },
  { module: 'areas', action: 'ver', description: 'Ver áreas/ministerios de la organización' },
  { module: 'areas', action: 'crear', description: 'Crear nuevas áreas/ministerios' },
  { module: 'areas', action: 'editar', description: 'Editar áreas/ministerios existentes' },
  { module: 'areas', action: 'eliminar', description: 'Eliminar áreas/ministerios' },
  { module: 'areas', action: 'gestionarMiembros', description: 'Agregar, eliminar y cambiar el rol de miembros de un área' },
] as const

const ROLE_PERMISOS: Record<string, Array<{ module: string; action: string }>> = {
  'admin': PERMISOS.map(p => ({ module: p.module, action: p.action })),
  'auxiliar-administrativo': PERMISOS
    .filter(p => !(p.module === 'solicitudes' && p.action === 'eliminar') && !(p.module === 'areas' && p.action === 'eliminar'))
    .map(p => ({ module: p.module, action: p.action })),
  'pastor': [
    { module: 'solicitudes', action: 'ver' },
    { module: 'solicitudes', action: 'verTodas' },
    { module: 'solicitudes', action: 'crear' },
    { module: 'solicitudes', action: 'aprobar' },
    { module: 'areas', action: 'ver' },
  ],
  'lider': [
    { module: 'solicitudes', action: 'ver' },
    { module: 'solicitudes', action: 'crear' },
    { module: 'solicitudes', action: 'editarPropia' },
    { module: 'areas', action: 'ver' },
  ],
  'voluntario': [
    { module: 'solicitudes', action: 'ver' },
    { module: 'solicitudes', action: 'crear' },
    { module: 'solicitudes', action: 'editarPropia' },
  ],
  'usuario': [
    { module: 'solicitudes', action: 'ver' },
    { module: 'solicitudes', action: 'crear' },
    { module: 'solicitudes', action: 'editarPropia' },
  ],
}

const AREAS_SEED = [
  { slug: 'comunicaciones', name: 'Comunicaciones', description: 'Diseño, redes sociales, mensajería oficial', icon: 'solar-chat-round-line-linear', color: '#3B82F6' },
  { slug: 'logistica', name: 'Logística', description: 'Montaje, recursos, transporte y operaciones', icon: 'solar-box-linear', color: '#F59E0B' },
  { slug: 'produccion', name: 'Producción', description: 'Audio, luces, pantallas y producción técnica', icon: 'solar-tuning-2-linear', color: '#8B5CF6' },
  { slug: 'foto-video', name: 'Foto/Video', description: 'Cobertura fotográfica y audiovisual', icon: 'solar-camera-linear', color: '#EC4899' },
  { slug: 'ministerio-especifico', name: 'Ministerio Específico', description: 'Apoyo de un ministerio puntual', icon: 'solar-users-group-rounded-linear', color: '#10B981' },
  { slug: 'otro', name: 'Otro', description: 'Otras áreas o necesidades no listadas', icon: 'solar-widget-add-linear', color: '#6B7280' },
]

async function main() {
  console.log('=== SEED: Solicitudes Interáreas ===\n')

  const org = await prisma.organization.findFirst({ where: { slug: 'casadelrey' } })
  if (!org) throw new Error('Organización casadelrey no encontrada. Ejecute seed-casa-del-rey.ts primero.')
  console.log(`✓ Organización: ${org.name}`)

  // 1. Permisos
  console.log('\n--- Permisos ---')
  for (const p of PERMISOS) {
    await prisma.permission.upsert({
      where: { module_action: { module: p.module, action: p.action } },
      update: { description: p.description },
      create: p,
    })
  }
  console.log(`✓ ${PERMISOS.length} permisos upsert`)

  // 2. Asignaciones a roles
  console.log('\n--- Asignaciones de permisos a roles ---')
  let totalAsignaciones = 0
  for (const [roleSlug, perms] of Object.entries(ROLE_PERMISOS)) {
    const role = await prisma.role.findUnique({ where: { slug: roleSlug } })
    if (!role) {
      console.log(`  ⚠ Rol "${roleSlug}" no existe, saltando`)
      continue
    }
    for (const ref of perms) {
      const perm = await prisma.permission.findUnique({
        where: { module_action: { module: ref.module, action: ref.action } },
      })
      if (!perm) continue
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      })
      totalAsignaciones++
    }
    console.log(`  ✓ ${role.name}: ${perms.length} permisos`)
  }
  console.log(`✓ ${totalAsignaciones} asignaciones totales`)

  // 3. Áreas seed
  console.log('\n--- Áreas ---')
  for (const a of AREAS_SEED) {
    await prisma.area.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: a.slug } },
      update: {
        name: a.name,
        description: a.description,
        icon: a.icon,
        color: a.color,
      },
      create: {
        organizationId: org.id,
        slug: a.slug,
        name: a.name,
        description: a.description,
        icon: a.icon,
        color: a.color,
        isActive: true,
      },
    })
    console.log(`  ✓ ${a.name}`)
  }

  // 4. Resumen
  console.log('\n=== RESUMEN ===')
  const totalAreas = await prisma.area.count({ where: { organizationId: org.id } })
  const totalPerms = await prisma.permission.count({ where: { module: { in: ['solicitudes', 'areas'] } } })
  console.log(`  Áreas:      ${totalAreas}`)
  console.log(`  Permisos:   ${totalPerms} (módulos solicitudes + areas)`)
  console.log('\n=== SEED COMPLETO ===')
}

main()
  .catch(e => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
