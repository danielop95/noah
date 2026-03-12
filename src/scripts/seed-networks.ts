/**
 * Seed script to create sample users and networks.
 * Run with: npx tsx src/scripts/seed-networks.ts
 */
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

// Usuarios ficticios con nombres latinos
const sampleUsers = [
  { firstName: 'Carlos', lastName: 'Rodriguez', email: 'carlos.rodriguez@example.com', gender: 'male' },
  { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@example.com', gender: 'female' },
  { firstName: 'Juan', lastName: 'Martinez', email: 'juan.martinez@example.com', gender: 'male' },
  { firstName: 'Ana', lastName: 'Lopez', email: 'ana.lopez@example.com', gender: 'female' },
  { firstName: 'Pedro', lastName: 'Hernandez', email: 'pedro.hernandez@example.com', gender: 'male' },
  { firstName: 'Laura', lastName: 'Gonzalez', email: 'laura.gonzalez@example.com', gender: 'female' },
  { firstName: 'Diego', lastName: 'Sanchez', email: 'diego.sanchez@example.com', gender: 'male' },
  { firstName: 'Sofia', lastName: 'Ramirez', email: 'sofia.ramirez@example.com', gender: 'female' },
  { firstName: 'Miguel', lastName: 'Torres', email: 'miguel.torres@example.com', gender: 'male' },
  { firstName: 'Valentina', lastName: 'Flores', email: 'valentina.flores@example.com', gender: 'female' },
  { firstName: 'Andres', lastName: 'Rivera', email: 'andres.rivera@example.com', gender: 'male' },
  { firstName: 'Camila', lastName: 'Gomez', email: 'camila.gomez@example.com', gender: 'female' },
  { firstName: 'Sebastian', lastName: 'Diaz', email: 'sebastian.diaz@example.com', gender: 'male' },
  { firstName: 'Isabella', lastName: 'Morales', email: 'isabella.morales@example.com', gender: 'female' },
  { firstName: 'Daniel', lastName: 'Jimenez', email: 'daniel.jimenez@example.com', gender: 'male' },
  { firstName: 'Lucia', lastName: 'Ruiz', email: 'lucia.ruiz@example.com', gender: 'female' },
  { firstName: 'Gabriel', lastName: 'Vargas', email: 'gabriel.vargas@example.com', gender: 'male' },
  { firstName: 'Emma', lastName: 'Castro', email: 'emma.castro@example.com', gender: 'female' },
  { firstName: 'Nicolas', lastName: 'Ortiz', email: 'nicolas.ortiz@example.com', gender: 'male' },
  { firstName: 'Mariana', lastName: 'Mendoza', email: 'mariana.mendoza@example.com', gender: 'female' }
]

// Redes a crear
const networks = [
  { name: 'Red Familiar', description: 'Red dedicada al fortalecimiento de los lazos familiares y el crecimiento espiritual en el hogar.' },
  { name: 'Esencia', description: 'Un espacio para descubrir tu esencia y proposito en Cristo.' },
  { name: 'Refill', description: 'Recarga espiritual para jovenes y adultos jovenes.' },
  { name: 'Red Mas', description: 'Siempre mas, creciendo juntos en fe y comunidad.' },
  { name: 'Zona Activa', description: 'Actividades deportivas y recreativas para mantener cuerpo y espiritu activos.' },
  { name: 'Red de Mujeres', description: 'Comunidad de mujeres que se apoyan y crecen juntas en su fe.' }
]

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
    // Obtener la organizacion Casa del Rey
    const organization = await prisma.organization.findFirst({
      where: { name: 'Casa del Rey' }
    })

    if (!organization) {
      console.error('No se encontro la organizacion "Casa del Rey". Primero registra una iglesia con ese nombre.')
      process.exit(1)
    }

    console.log(`Usando organizacion: ${organization.name} (${organization.id})`)

    // Crear usuarios
    console.log('\nCreando usuarios...')
    const defaultPassword = await bcrypt.hash('Usuario123!', 12)
    const createdUsers: { id: string; firstName: string; lastName: string; gender: string }[] = []

    for (const userData of sampleUsers) {
      const existing = await prisma.user.findUnique({ where: { email: userData.email } })

      if (existing) {
        console.log(`  - ${userData.firstName} ${userData.lastName} ya existe`)
        createdUsers.push({
          id: existing.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          gender: userData.gender
        })
        continue
      }

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: defaultPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: `${userData.firstName} ${userData.lastName}`,
          gender: userData.gender,
          isActive: true,
          organizationId: organization.id,
          country: 'CO',
          city: 'Bogota'
        }
      })

      console.log(`  + ${user.name} creado`)
      createdUsers.push({
        id: user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender
      })
    }

    console.log(`\nTotal usuarios: ${createdUsers.length}`)

    // Crear redes
    console.log('\nCreando redes...')

    // Separar usuarios por genero para asignaciones mas realistas
    const femaleUsers = createdUsers.filter(u => u.gender === 'female')

    for (let i = 0; i < networks.length; i++) {
      const networkData = networks[i]

      // Verificar si ya existe
      const existing = await prisma.network.findFirst({
        where: { name: networkData.name, organizationId: organization.id }
      })

      if (existing) {
        console.log(`  - ${networkData.name} ya existe`)
        continue
      }

      // Asignar lideres y miembros segun la red
      let leaderIds: string[] = []
      let memberIds: string[] = []

      switch (networkData.name) {
        case 'Red Familiar':
          // Parejas como lideres
          leaderIds = [createdUsers[0].id, createdUsers[1].id] // Carlos y Maria
          memberIds = createdUsers.slice(2, 5).map(u => u.id)
          break
        case 'Esencia':
          leaderIds = [createdUsers[5].id] // Laura
          memberIds = [createdUsers[6].id, createdUsers[7].id]
          break
        case 'Refill':
          leaderIds = [createdUsers[8].id] // Miguel
          memberIds = [createdUsers[9].id, createdUsers[10].id]
          break
        case 'Red Mas':
          leaderIds = [createdUsers[11].id] // Camila
          memberIds = [createdUsers[12].id, createdUsers[13].id]
          break
        case 'Zona Activa':
          leaderIds = [createdUsers[14].id] // Daniel
          memberIds = [createdUsers[15].id, createdUsers[16].id]
          break
        case 'Red de Mujeres':
          // Solo mujeres
          leaderIds = [femaleUsers[5].id] // Emma
          memberIds = [createdUsers[18].id, createdUsers[19].id]
          break
      }

      // Crear la red
      const network = await prisma.network.create({
        data: {
          name: networkData.name,
          description: networkData.description,
          organizationId: organization.id,
          isActive: true
        }
      })

      // Asignar líderes
      await prisma.user.updateMany({
        where: { id: { in: leaderIds } },
        data: { networkId: network.id, networkRole: 'leader' }
      })

      // Asignar miembros
      await prisma.user.updateMany({
        where: { id: { in: memberIds } },
        data: { networkId: network.id, networkRole: 'member' }
      })

      console.log(`  + ${network.name} creada (${leaderIds.length} lideres, ${memberIds.length} miembros)`)
    }

    console.log('\n Seed completado exitosamente!')
    console.log('\nCredenciales de usuarios de prueba:')
    console.log('  Email: [nombre].[apellido]@example.com')
    console.log('  Password: Usuario123!')
  } catch (error) {
    console.error('Error durante el seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(console.error)
