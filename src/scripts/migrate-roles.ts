/**
 * Script de migración de roles
 * Convierte el campo legacy `role` a `roles[]`
 *
 * Ejecutar con:
 * npx dotenv-cli -e .env -- npx tsx src/scripts/migrate-roles.ts
 */

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, SystemRole } from '@prisma/client'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function migrateRoles() {
  console.log('🔄 Iniciando migración de roles...\n')

  // 1. Obtener todos los usuarios con el campo role antiguo
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      roles: true
    }
  })

  console.log(`📊 Total de usuarios: ${users.length}\n`)

  let migratedAdmins = 0
  let migratedMembers = 0
  let skipped = 0

  for (const user of users) {
    // Si ya tiene roles asignados (no solo el default), saltar
    if (user.roles.length > 0 && !user.roles.every(r => r === 'member')) {
      console.log(`⏭️  ${user.email}: Ya tiene roles [${user.roles.join(', ')}], saltando...`)
      skipped++
      continue
    }

    // Mapear role antiguo a roles nuevo
    let newRoles: SystemRole[] = []

    if (user.role === 'admin') {
      newRoles = [SystemRole.admin]
      migratedAdmins++
    } else {
      newRoles = [SystemRole.member]
      migratedMembers++
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { roles: newRoles }
    })

    console.log(`✅ ${user.email}: ${user.role || 'user'} → [${newRoles.join(', ')}]`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('📈 Resumen de migración:')
  console.log(`   - Admins migrados: ${migratedAdmins}`)
  console.log(`   - Members migrados: ${migratedMembers}`)
  console.log(`   - Saltados (ya tenían roles): ${skipped}`)
  console.log('='.repeat(50))
  console.log('\n✨ Migración completada exitosamente!')
  console.log('\n⚠️  Nota: El campo "role" aún existe por compatibilidad.')
  console.log('   Después de verificar que todo funciona, se puede eliminar.')
}

migrateRoles()
  .catch((error) => {
    console.error('❌ Error durante la migración:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
