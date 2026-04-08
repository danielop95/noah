import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('DATABASE_URL or DIRECT_URL is required')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // Obtener la organización
    const org = await prisma.organization.findFirst()
    if (!org) throw new Error('No organization found. Run seed-casa-del-rey.ts first.')

    // Crear curso ADL
    const adl = await prisma.iLCourse.upsert({
      where: { slug: 'adl' },
      update: {},
      create: {
        name: 'ADL — Academia de Liderazgo',
        slug: 'adl',
        description: 'Academia de liderazgo con 4 niveles de formación cristiana',
        evaluationType: 'graded',
        evaluationConfig: {
          type: 'weighted',
          passingGrade: 70,
          components: [
            { key: 'test', label: 'Test', weight: 0.40 },
            { key: 'lectura', label: 'Lectura de libro', weight: 0.35 },
            { key: 'asistencia', label: 'Asistencia', weight: 0.15 },
            { key: 'participacion', label: 'Participación', weight: 0.10 }
          ]
        },
        organizationId: org.id
      }
    })

    // Crear niveles ADL
    const adlNiveles = [
      { name: 'Principios del creyente', slug: 'nivel-1', sortOrder: 1, sessionCount: 13 },
      { name: 'Principios del éxito', slug: 'nivel-2', sortOrder: 2, sessionCount: 9 },
      { name: 'Principios del liderazgo', slug: 'nivel-3', sortOrder: 3, sessionCount: 13 },
      { name: 'El modelo de Jesús', slug: 'nivel-4', sortOrder: 4, sessionCount: 8 },
    ]

    let prevLevelId: string | null = null
    for (const nivel of adlNiveles) {
      const level = await prisma.iLLevel.upsert({
        where: { courseId_slug: { courseId: adl.id, slug: nivel.slug } },
        update: {},
        create: {
          courseId: adl.id,
          name: nivel.name,
          slug: nivel.slug,
          sortOrder: nivel.sortOrder,
          sessionCount: nivel.sessionCount,
          prerequisiteLevelId: prevLevelId
        }
      })
      prevLevelId = level.id
    }

    // Crear curso PEC
    const pec = await prisma.iLCourse.upsert({
      where: { slug: 'pec' },
      update: {},
      create: {
        name: 'PEC — Programa de Edificación del Carácter',
        slug: 'pec',
        description: 'Programa de formación del carácter cristiano en 3 pilares',
        evaluationType: 'pass_fail',
        evaluationConfig: {
          type: 'attendance_threshold',
          maxAbsencesPerLevel: 1,
          failOnExceed: 'course'
        },
        organizationId: org.id
      }
    })

    // Crear pilares PEC
    const pecPilares = [
      { name: 'Identidad', slug: 'pilar-1', sortOrder: 1, sessionCount: 5 },
      { name: 'Carácter', slug: 'pilar-2', sortOrder: 2, sessionCount: 4 },
      { name: 'Propósito', slug: 'pilar-3', sortOrder: 3, sessionCount: 3 },
    ]

    prevLevelId = null
    for (const pilar of pecPilares) {
      const level = await prisma.iLLevel.upsert({
        where: { courseId_slug: { courseId: pec.id, slug: pilar.slug } },
        update: {},
        create: {
          courseId: pec.id,
          name: pilar.name,
          slug: pilar.slug,
          sortOrder: pilar.sortOrder,
          sessionCount: pilar.sessionCount,
          prerequisiteLevelId: prevLevelId
        }
      })
      prevLevelId = level.id
    }

    // Crear permisos del módulo instituto
    const permissions = [
      { module: 'instituto', action: 'ver', description: 'Ver módulo Instituto Life' },
      { module: 'instituto', action: 'crear', description: 'Crear cursos, niveles y cohortes' },
      { module: 'instituto', action: 'editar', description: 'Editar cursos, niveles y cohortes' },
      { module: 'instituto', action: 'eliminar', description: 'Eliminar cursos, niveles y cohortes' },
      { module: 'instituto', action: 'gestionar', description: 'Gestionar inscripciones y tags' },
      { module: 'instituto', action: 'calificar', description: 'Registrar asistencia y calificaciones' },
    ]

    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { module_action: { module: perm.module, action: perm.action } },
        update: {},
        create: perm
      })
    }

    // Asignar permisos al rol Admin (hierarchy 1) y Auxiliar (hierarchy 2)
    const adminRole = await prisma.role.findFirst({ where: { hierarchy: 1 } })
    const auxRole = await prisma.role.findFirst({ where: { hierarchy: 2 } })
    const allPerms = await prisma.permission.findMany({ where: { module: 'instituto' } })

    for (const role of [adminRole, auxRole].filter(Boolean)) {
      for (const perm of allPerms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role!.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role!.id, permissionId: perm.id }
        })
      }
    }

    console.log('Seed Instituto Life completado')
    console.log(`   ADL: ${adlNiveles.length} niveles`)
    console.log(`   PEC: ${pecPilares.length} pilares`)
    console.log(`   Permisos: ${permissions.length} creados`)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
