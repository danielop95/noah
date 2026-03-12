/**
 * Seed script completo para Casa del Rey.
 * Crea: Usuarios, Redes, Grupos y Reportes de ejemplo.
 * Run with: npx tsx src/scripts/seed-full-data.ts
 */
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

// ============================================
// DATOS DE PRUEBA
// ============================================

const sampleUsers = [
  // Líderes de red y grupo
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
  // Miembros adicionales
  { firstName: 'Andres', lastName: 'Rivera', email: 'andres.rivera@example.com', gender: 'male' },
  { firstName: 'Camila', lastName: 'Gomez', email: 'camila.gomez@example.com', gender: 'female' },
  { firstName: 'Sebastian', lastName: 'Diaz', email: 'sebastian.diaz@example.com', gender: 'male' },
  { firstName: 'Isabella', lastName: 'Morales', email: 'isabella.morales@example.com', gender: 'female' },
  { firstName: 'Daniel', lastName: 'Jimenez', email: 'daniel.jimenez@example.com', gender: 'male' },
  { firstName: 'Lucia', lastName: 'Ruiz', email: 'lucia.ruiz@example.com', gender: 'female' },
  { firstName: 'Gabriel', lastName: 'Vargas', email: 'gabriel.vargas@example.com', gender: 'male' },
  { firstName: 'Emma', lastName: 'Castro', email: 'emma.castro@example.com', gender: 'female' },
  { firstName: 'Nicolas', lastName: 'Ortiz', email: 'nicolas.ortiz@example.com', gender: 'male' },
  { firstName: 'Mariana', lastName: 'Mendoza', email: 'mariana.mendoza@example.com', gender: 'female' },
  { firstName: 'Felipe', lastName: 'Rojas', email: 'felipe.rojas@example.com', gender: 'male' },
  { firstName: 'Paula', lastName: 'Herrera', email: 'paula.herrera@example.com', gender: 'female' },
  { firstName: 'Alejandro', lastName: 'Cardenas', email: 'alejandro.cardenas@example.com', gender: 'male' },
  { firstName: 'Daniela', lastName: 'Perez', email: 'daniela.perez@example.com', gender: 'female' },
  { firstName: 'Mateo', lastName: 'Silva', email: 'mateo.silva@example.com', gender: 'male' }
]

const networks = [
  { name: 'Red Familiar', description: 'Fortalecimiento de lazos familiares y crecimiento espiritual en el hogar.' },
  { name: 'Jóvenes Activos', description: 'Comunidad juvenil llena de energía y propósito.' },
  { name: 'Mujeres de Fe', description: 'Mujeres que se apoyan y crecen juntas en su fe.' },
  { name: 'Hombres de Valor', description: 'Hombres comprometidos con su familia y su fe.' },
  { name: 'Matrimonios', description: 'Parejas fortaleciendo su relación y su hogar.' }
]

// Grupos por red
const groupsByNetwork: Record<string, Array<{
  name: string
  description: string
  modality: string
  city?: string
  address?: string
  neighborhood?: string
  meetingDay: string
  meetingTime: string
}>> = {
  'Red Familiar': [
    {
      name: 'Familia Unida Norte',
      description: 'Grupo familiar del sector norte de la ciudad',
      modality: 'presencial',
      city: 'Bogotá',
      address: 'Calle 127 #45-12',
      neighborhood: 'Usaquén',
      meetingDay: 'miercoles',
      meetingTime: '19:00'
    },
    {
      name: 'Familia Unida Sur',
      description: 'Grupo familiar del sector sur',
      modality: 'presencial',
      city: 'Bogotá',
      address: 'Carrera 68 #12-34',
      neighborhood: 'Kennedy',
      meetingDay: 'jueves',
      meetingTime: '19:30'
    }
  ],
  'Jóvenes Activos': [
    {
      name: 'Juventud en Fuego',
      description: 'Jóvenes apasionados por Cristo',
      modality: 'presencial',
      city: 'Bogotá',
      address: 'Av. 19 #100-50',
      neighborhood: 'Chapinero',
      meetingDay: 'viernes',
      meetingTime: '20:00'
    },
    {
      name: 'Connect Online',
      description: 'Grupo virtual para jóvenes que no pueden asistir presencialmente',
      modality: 'virtual',
      meetingDay: 'sabado',
      meetingTime: '18:00'
    }
  ],
  'Mujeres de Fe': [
    {
      name: 'Amigas de Oración',
      description: 'Mujeres reunidas para orar y apoyarse',
      modality: 'presencial',
      city: 'Bogotá',
      address: 'Calle 85 #15-20',
      neighborhood: 'Chicó',
      meetingDay: 'martes',
      meetingTime: '10:00'
    },
    {
      name: 'Café con Propósito',
      description: 'Encuentros de mujeres profesionales',
      modality: 'presencial',
      city: 'Bogotá',
      address: 'Carrera 11 #82-45',
      neighborhood: 'Zona G',
      meetingDay: 'sabado',
      meetingTime: '09:00'
    }
  ],
  'Hombres de Valor': [
    {
      name: 'Desayuno de Campeones',
      description: 'Hombres reunidos para fortalecer su liderazgo',
      modality: 'presencial',
      city: 'Bogotá',
      address: 'Calle 93 #14-20',
      neighborhood: 'Chicó Norte',
      meetingDay: 'sabado',
      meetingTime: '07:00'
    }
  ],
  'Matrimonios': [
    {
      name: 'Amor que Perdura',
      description: 'Parejas construyendo un matrimonio sólido',
      modality: 'presencial',
      city: 'Bogotá',
      address: 'Av. Suba #115-30',
      neighborhood: 'Suba',
      meetingDay: 'viernes',
      meetingTime: '19:00'
    },
    {
      name: 'Matrimonios Jóvenes',
      description: 'Parejas recién casadas aprendiendo juntas',
      modality: 'virtual',
      meetingDay: 'domingo',
      meetingTime: '16:00'
    }
  ]
}

// Función para generar reportes aleatorios
function generateReports(
  groupId: string,
  reporterId: string,
  organizationId: string,
  weeksBack: number = 8
): Array<{
  groupId: string
  reporterId: string
  organizationId: string
  meetingDate: Date
  totalAttendees: number
  leadersCount: number
  visitorsCount: number
  reportOffering: boolean
  offeringAmount: number | null
  notes: string | null
}> {
  const reports = []
  const today = new Date()

  for (let i = 0; i < weeksBack; i++) {
    const meetingDate = new Date(today)
    meetingDate.setDate(today.getDate() - (i * 7) - Math.floor(Math.random() * 3))
    meetingDate.setHours(0, 0, 0, 0)

    // Generar datos aleatorios realistas
    const totalAttendees = 8 + Math.floor(Math.random() * 12) // 8-20 personas
    const leadersCount = 1 + Math.floor(Math.random() * 3) // 1-3 líderes
    const visitorsCount = Math.floor(Math.random() * 4) // 0-3 visitas
    const reportOffering = Math.random() > 0.3 // 70% reportan ofrenda
    const offeringAmount = reportOffering
      ? Math.round((50000 + Math.random() * 200000) / 1000) * 1000 // $50,000 - $250,000 COP
      : null

    const notes = [
      'Excelente reunión, mucha participación',
      'Tiempo de oración muy especial',
      'Dos personas aceptaron a Cristo',
      'Compartimos testimonios poderosos',
      null,
      null,
      'Celebramos cumpleaños de varios miembros',
      null
    ][Math.floor(Math.random() * 8)]

    reports.push({
      groupId,
      reporterId,
      organizationId,
      meetingDate,
      totalAttendees,
      leadersCount,
      visitorsCount,
      reportOffering,
      offeringAmount,
      notes
    })
  }

  return reports
}

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
    // ============================================
    // 1. OBTENER ORGANIZACIÓN
    // ============================================
    let organization = await prisma.organization.findFirst({
      where: { name: 'Casa del Rey' }
    })

    if (!organization) {
      console.log('Creando organización Casa del Rey...')
      organization = await prisma.organization.create({
        data: {
          name: 'Casa del Rey',
          slug: 'casadelrey',
          colors: { primary: '#1976d2', secondary: '#dc004e' }
        }
      })
    }

    console.log(`\n🏠 Organización: ${organization.name} (${organization.id})`)

    // ============================================
    // 2. CREAR USUARIOS
    // ============================================
    console.log('\n👥 Creando usuarios...')
    const defaultPassword = await bcrypt.hash('Usuario123!', 12)
    const createdUsers: { id: string; firstName: string; lastName: string; gender: string; email: string }[] = []

    for (const userData of sampleUsers) {
      let user = await prisma.user.findUnique({ where: { email: userData.email } })

      if (!user) {
        user = await prisma.user.create({
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
            city: 'Bogotá'
          }
        })
        console.log(`  + ${user.name}`)
      } else {
        console.log(`  - ${user.name} (ya existe)`)
      }

      createdUsers.push({
        id: user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        email: userData.email
      })
    }

    console.log(`  Total: ${createdUsers.length} usuarios`)

    // ============================================
    // 3. CREAR REDES Y ASIGNAR USUARIOS
    // ============================================
    console.log('\n🌐 Creando redes...')
    const createdNetworks: { id: string; name: string }[] = []

    // Distribución de usuarios por red
    const networkAssignments: Record<string, { leaders: number[]; members: number[] }> = {
      'Red Familiar': { leaders: [0, 1], members: [10, 11, 12] },
      'Jóvenes Activos': { leaders: [2, 3], members: [13, 14, 20, 21] },
      'Mujeres de Fe': { leaders: [5, 7], members: [9, 15, 17, 19, 23] },
      'Hombres de Valor': { leaders: [4, 6], members: [8, 16, 18, 22, 24] },
      'Matrimonios': { leaders: [0, 1], members: [2, 3, 4, 5] } // Algunos comparten
    }

    for (const networkData of networks) {
      let network = await prisma.network.findFirst({
        where: { name: networkData.name, organizationId: organization.id }
      })

      if (!network) {
        network = await prisma.network.create({
          data: {
            name: networkData.name,
            description: networkData.description,
            organizationId: organization.id,
            isActive: true
          }
        })
      }

      createdNetworks.push({ id: network.id, name: network.name })

      // Asignar usuarios a la red
      const assignment = networkAssignments[networkData.name]

      if (assignment) {
        const leaderIds = assignment.leaders.map(i => createdUsers[i]?.id).filter(Boolean)
        const memberIds = assignment.members.map(i => createdUsers[i]?.id).filter(Boolean)

        // Solo actualizar usuarios que no tienen red asignada
        for (const leaderId of leaderIds) {
          const user = await prisma.user.findUnique({ where: { id: leaderId }, select: { networkId: true } })
          if (!user?.networkId) {
            await prisma.user.update({
              where: { id: leaderId },
              data: { networkId: network.id, networkRole: 'leader' }
            })
          }
        }

        for (const memberId of memberIds) {
          const user = await prisma.user.findUnique({ where: { id: memberId }, select: { networkId: true } })
          if (!user?.networkId) {
            await prisma.user.update({
              where: { id: memberId },
              data: { networkId: network.id, networkRole: 'member' }
            })
          }
        }

        console.log(`  + ${network.name} (${leaderIds.length} líderes, ${memberIds.length} miembros)`)
      }
    }

    // ============================================
    // 4. CREAR GRUPOS
    // ============================================
    console.log('\n📍 Creando grupos...')
    const createdGroups: { id: string; name: string; networkName: string; leaderId: string }[] = []

    // Índice de líder para asignar a grupos
    let leaderIndex = 0

    for (const network of createdNetworks) {
      const groupsForNetwork = groupsByNetwork[network.name] || []

      for (const groupData of groupsForNetwork) {
        let group = await prisma.group.findFirst({
          where: { name: groupData.name, organizationId: organization.id }
        })

        if (!group) {
          group = await prisma.group.create({
            data: {
              name: groupData.name,
              description: groupData.description,
              modality: groupData.modality,
              city: groupData.city || null,
              address: groupData.address || null,
              neighborhood: groupData.neighborhood || null,
              meetingDay: groupData.meetingDay,
              meetingTime: groupData.meetingTime,
              networkId: network.id,
              organizationId: organization.id,
              isActive: true
            }
          })
        }

        // Asignar líder al grupo
        const leaderUserId = createdUsers[leaderIndex % createdUsers.length].id

        // Asignar líder al grupo via campos en User
        const leaderUser = await prisma.user.findUnique({ where: { id: leaderUserId }, select: { groupId: true } })

        if (!leaderUser?.groupId) {
          await prisma.user.update({
            where: { id: leaderUserId },
            data: { groupId: group.id, groupRole: 'leader' }
          })
        }

        createdGroups.push({
          id: group.id,
          name: group.name,
          networkName: network.name,
          leaderId: leaderUserId
        })

        console.log(`  + ${group.name} (${network.name}) - Líder: ${createdUsers[leaderIndex % createdUsers.length].firstName}`)
        leaderIndex++
      }
    }

    // ============================================
    // 5. CREAR REPORTES
    // ============================================
    console.log('\n📊 Creando reportes...')
    let totalReports = 0

    for (const group of createdGroups) {
      // Verificar si ya hay reportes para este grupo
      const existingReports = await prisma.groupReport.count({
        where: { groupId: group.id }
      })

      if (existingReports > 0) {
        console.log(`  - ${group.name}: ya tiene ${existingReports} reportes`)
        continue
      }

      // Generar reportes de las últimas 8 semanas
      const reports = generateReports(group.id, group.leaderId, organization.id, 8)

      for (const reportData of reports) {
        try {
          await prisma.groupReport.create({
            data: reportData
          })
          totalReports++
        } catch (e) {
          // Ignorar duplicados por fecha
        }
      }

      console.log(`  + ${group.name}: ${reports.length} reportes generados`)
    }

    console.log(`  Total: ${totalReports} reportes creados`)

    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log('\n' + '='.repeat(50))
    console.log('✅ SEED COMPLETADO EXITOSAMENTE')
    console.log('='.repeat(50))
    console.log(`\n📊 Resumen:`)
    console.log(`  • Organización: Casa del Rey`)
    console.log(`  • Usuarios: ${createdUsers.length}`)
    console.log(`  • Redes: ${createdNetworks.length}`)
    console.log(`  • Grupos: ${createdGroups.length}`)
    console.log(`  • Reportes: ${totalReports}`)
    console.log(`\n🔑 Credenciales de prueba:`)
    console.log(`  Email: [nombre].[apellido]@example.com`)
    console.log(`  Password: Usuario123!`)
    console.log(`\n  Ejemplos:`)
    console.log(`  • carlos.rodriguez@example.com`)
    console.log(`  • maria.garcia@example.com`)
    console.log(`  • laura.gonzalez@example.com`)

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(console.error)
