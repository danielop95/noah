/**
 * Script para crear una organizacion de prueba
 * Ejecutar: npx tsx src/scripts/seed-test-org.ts
 */

import prisma from '../libs/prisma'

async function main() {
  const slug = 'icasadelrey'

  // Verificar si ya existe
  const existing = await prisma.organization.findUnique({
    where: { slug }
  })

  if (existing) {
    console.log('La organizacion ya existe:', existing)
    return
  }

  // Crear organizacion de prueba
  const org = await prisma.organization.create({
    data: {
      name: 'Iglesia Casa del Rey',
      slug: slug,
      colors: {
        primary: '#0466C8',
        secondary: '#001845'
      }
    }
  })

  console.log('Organizacion creada:', org)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
