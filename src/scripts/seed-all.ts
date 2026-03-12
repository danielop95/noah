import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import bcrypt from 'bcryptjs'
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
 * Seed completo: Usuarios, Redes, Grupos, Reportes y Eventos de Calendario
 * para la organización Casa del Rey.
 *
 * Ejecutar: npx tsx src/scripts/seed-all.ts
 */

const SALT_ROUNDS = 10
const DEFAULT_PASSWORD = 'User2026!'

// Nombres colombianos realistas
const USERS_DATA = [
  { firstName: 'Carlos', lastName: 'Mendoza', email: 'carlos.mendoza@gmail.com', phone: '3001234567', city: 'Bogotá', gender: 'male' },
  { firstName: 'María', lastName: 'López', email: 'maria.lopez@gmail.com', phone: '3109876543', city: 'Bogotá', gender: 'female' },
  { firstName: 'Andrés', lastName: 'García', email: 'andres.garcia@gmail.com', phone: '3205551234', city: 'Bogotá', gender: 'male' },
  { firstName: 'Laura', lastName: 'Martínez', email: 'laura.martinez@gmail.com', phone: '3157778899', city: 'Bogotá', gender: 'female' },
  { firstName: 'Juan', lastName: 'Rodríguez', email: 'juan.rodriguez@gmail.com', phone: '3001112233', city: 'Soacha', gender: 'male' },
  { firstName: 'Camila', lastName: 'Hernández', email: 'camila.hernandez@gmail.com', phone: '3114445566', city: 'Bogotá', gender: 'female' },
  { firstName: 'Santiago', lastName: 'Torres', email: 'santiago.torres@gmail.com', phone: '3209998877', city: 'Bogotá', gender: 'male' },
  { firstName: 'Valentina', lastName: 'Ramírez', email: 'valentina.ramirez@gmail.com', phone: '3156667788', city: 'Chía', gender: 'female' },
  { firstName: 'David', lastName: 'Moreno', email: 'david.moreno@gmail.com', phone: '3003334455', city: 'Bogotá', gender: 'male' },
  { firstName: 'Daniela', lastName: 'Castro', email: 'daniela.castro@gmail.com', phone: '3118889900', city: 'Bogotá', gender: 'female' },
  { firstName: 'Felipe', lastName: 'Vargas', email: 'felipe.vargas@gmail.com', phone: '3202223344', city: 'Zipaquirá', gender: 'male' },
  { firstName: 'Isabella', lastName: 'Díaz', email: 'isabella.diaz@gmail.com', phone: '3155556677', city: 'Bogotá', gender: 'female' },
  { firstName: 'Sebastián', lastName: 'Rojas', email: 'sebastian.rojas@gmail.com', phone: '3007778899', city: 'Bogotá', gender: 'male' },
  { firstName: 'Sofía', lastName: 'Gutiérrez', email: 'sofia.gutierrez@gmail.com', phone: '3111234567', city: 'Bogotá', gender: 'female' },
  { firstName: 'Mateo', lastName: 'Sánchez', email: 'mateo.sanchez@gmail.com', phone: '3209871234', city: 'Funza', gender: 'male' },
  { firstName: 'Gabriela', lastName: 'Pineda', email: 'gabriela.pineda@gmail.com', phone: '3154567890', city: 'Bogotá', gender: 'female' },
  { firstName: 'Nicolás', lastName: 'Ortiz', email: 'nicolas.ortiz@gmail.com', phone: '3006543210', city: 'Bogotá', gender: 'male' },
  { firstName: 'Mariana', lastName: 'Peña', email: 'mariana.pena@gmail.com', phone: '3119876543', city: 'Bogotá', gender: 'female' },
  { firstName: 'Alejandro', lastName: 'Suárez', email: 'alejandro.suarez@gmail.com', phone: '3201239876', city: 'Mosquera', gender: 'male' },
  { firstName: 'Paula', lastName: 'Ríos', email: 'paula.rios@gmail.com', phone: '3158765432', city: 'Bogotá', gender: 'female' },
  { firstName: 'Tomás', lastName: 'Cardona', email: 'tomas.cardona@gmail.com', phone: '3004321098', city: 'Bogotá', gender: 'male' },
  { firstName: 'Ana', lastName: 'Velásquez', email: 'ana.velasquez@gmail.com', phone: '3112345678', city: 'Bogotá', gender: 'female' },
  { firstName: 'Miguel', lastName: 'Ospina', email: 'miguel.ospina@gmail.com', phone: '3208765432', city: 'Cajicá', gender: 'male' },
  { firstName: 'Carolina', lastName: 'Aguilar', email: 'carolina.aguilar@gmail.com', phone: '3156789012', city: 'Bogotá', gender: 'female' },
  { firstName: 'Daniel', lastName: 'Restrepo', email: 'daniel.restrepo@gmail.com', phone: '3003456789', city: 'Bogotá', gender: 'male' },
  { firstName: 'Natalia', lastName: 'Cárdenas', email: 'natalia.cardenas@gmail.com', phone: '3117890123', city: 'Bogotá', gender: 'female' },
  { firstName: 'Julián', lastName: 'Mejía', email: 'julian.mejia@gmail.com', phone: '3204567890', city: 'Cota', gender: 'male' },
  { firstName: 'Valeria', lastName: 'Castaño', email: 'valeria.castano@gmail.com', phone: '3159012345', city: 'Bogotá', gender: 'female' },
  { firstName: 'Esteban', lastName: 'Quintero', email: 'esteban.quintero@gmail.com', phone: '3002345678', city: 'Bogotá', gender: 'male' },
  { firstName: 'Lucía', lastName: 'Duarte', email: 'lucia.duarte@gmail.com', phone: '3115678901', city: 'Bogotá', gender: 'female' },
]

const NETWORKS_DATA = [
  { name: 'Red de Jóvenes', description: 'Ministerio dirigido a jóvenes entre 15 y 30 años' },
  { name: 'Red de Matrimonios', description: 'Grupos enfocados en parejas casadas y su crecimiento espiritual' },
  { name: 'Red de Mujeres', description: 'Ministerio de mujeres, restauración y liderazgo femenino' },
  { name: 'Red de Hombres', description: 'Discipulado y formación para hombres' },
  { name: 'Red Infantil', description: 'Ministerio para niños de 4 a 12 años' },
]

// Grupos por red (index de red → grupos)
const GROUPS_DATA: Record<number, Array<{
  name: string
  description: string
  modality: string
  meetingDay: string
  meetingTime: string
  city: string
  address: string
  neighborhood: string
}>> = {
  0: [ // Red de Jóvenes
    { name: 'Generación Radical', description: 'Grupo de jóvenes universitarios', modality: 'presencial', meetingDay: 'viernes', meetingTime: '19:00', city: 'Bogotá', address: 'Cra 15 #82-30', neighborhood: 'Chapinero' },
    { name: 'Fuego Joven', description: 'Jóvenes del sur de Bogotá', modality: 'presencial', meetingDay: 'sabado', meetingTime: '16:00', city: 'Bogotá', address: 'Cll 40 Sur #25-10', neighborhood: 'San Cristóbal' },
    { name: 'Conexión Digital', description: 'Grupo virtual para jóvenes', modality: 'virtual', meetingDay: 'miercoles', meetingTime: '20:00', city: 'Bogotá', address: '', neighborhood: '' },
  ],
  1: [ // Red de Matrimonios
    { name: 'Unidos en Cristo', description: 'Parejas recién casadas', modality: 'presencial', meetingDay: 'sabado', meetingTime: '17:00', city: 'Bogotá', address: 'Cra 7 #120-15', neighborhood: 'Usaquén' },
    { name: 'Hogares de Pacto', description: 'Matrimonios con más de 5 años', modality: 'presencial', meetingDay: 'viernes', meetingTime: '19:30', city: 'Chía', address: 'Cll 3 #5-20', neighborhood: 'Centro' },
  ],
  2: [ // Red de Mujeres
    { name: 'Esther', description: 'Grupo de mujeres profesionales', modality: 'presencial', meetingDay: 'martes', meetingTime: '18:30', city: 'Bogotá', address: 'Cll 100 #15-40', neighborhood: 'Santa Bárbara' },
    { name: 'Rut', description: 'Grupo para mujeres cabeza de hogar', modality: 'presencial', meetingDay: 'jueves', meetingTime: '10:00', city: 'Bogotá', address: 'Cra 50 #12-30', neighborhood: 'Kennedy' },
    { name: 'Débora', description: 'Mujeres en formación de liderazgo', modality: 'virtual', meetingDay: 'lunes', meetingTime: '20:00', city: 'Bogotá', address: '', neighborhood: '' },
  ],
  3: [ // Red de Hombres
    { name: 'Guerreros de Fe', description: 'Hombres en discipulado', modality: 'presencial', meetingDay: 'miercoles', meetingTime: '19:00', city: 'Bogotá', address: 'Cll 72 #10-20', neighborhood: 'Chapinero' },
    { name: 'Hijos del Rey', description: 'Hombres jóvenes padres de familia', modality: 'presencial', meetingDay: 'sabado', meetingTime: '08:00', city: 'Soacha', address: 'Cra 3 #18-45', neighborhood: 'Centro' },
  ],
  4: [ // Red Infantil
    { name: 'Pequeños Valientes', description: 'Niños de 4 a 7 años', modality: 'presencial', meetingDay: 'domingo', meetingTime: '09:00', city: 'Bogotá', address: 'Sede Principal', neighborhood: 'Centro' },
    { name: 'Exploradores', description: 'Niños de 8 a 12 años', modality: 'presencial', meetingDay: 'domingo', meetingTime: '09:00', city: 'Bogotá', address: 'Sede Principal', neighborhood: 'Centro' },
  ],
}

const CALENDAR_EVENTS = [
  { title: 'Culto Dominical', description: 'Servicio principal de adoración', category: 'culto', allDay: false, location: 'Sede Principal', hoursStart: 9, hoursEnd: 12, dayOffset: 0, recurring: 'sunday' },
  { title: 'Culto de Oración', description: 'Servicio de oración y ayuno', category: 'culto', allDay: false, location: 'Sede Principal', hoursStart: 18, hoursEnd: 20, dayOffset: 3 },
  { title: 'Noche de Alabanza', description: 'Noche especial de adoración con banda completa', category: 'evento', allDay: false, location: 'Sede Principal', hoursStart: 19, hoursEnd: 22, dayOffset: 5 },
  { title: 'Retiro de Líderes', description: 'Retiro espiritual para líderes de redes y grupos', category: 'capacitacion', allDay: true, location: 'Centro de Retiros - Melgar', dayOffset: 14, durationDays: 3 },
  { title: 'Bazar Solidario', description: 'Evento de recaudación para misiones', category: 'actividad', allDay: true, location: 'Parqueadero Sede Principal', dayOffset: 21 },
  { title: 'Reunión de Pastores', description: 'Reunión mensual del equipo pastoral', category: 'reunion', allDay: false, location: 'Oficina Pastoral', hoursStart: 10, hoursEnd: 12, dayOffset: 7 },
  { title: 'Escuela de Liderazgo', description: 'Módulo 3: Formación de discípulos', category: 'capacitacion', allDay: false, location: 'Salón de Conferencias', hoursStart: 14, hoursEnd: 17, dayOffset: 10 },
  { title: 'Culto Especial de Jóvenes', description: 'Servicio especial con invitado internacional', category: 'culto', allDay: false, location: 'Sede Principal', hoursStart: 18, hoursEnd: 21, dayOffset: 12 },
  { title: 'Jornada de Servicio Comunitario', description: 'Limpieza y embellecimiento del barrio', category: 'actividad', allDay: true, location: 'Barrio San Cristóbal', dayOffset: 18 },
  { title: 'Conferencia de Matrimonios', description: 'Conferencia anual para parejas', category: 'evento', allDay: false, location: 'Auditorio Central', hoursStart: 8, hoursEnd: 17, dayOffset: 25, durationDays: 2 },
  { title: 'Vigilia de Año Nuevo Espiritual', description: 'Vigilia especial de inicio de temporada', category: 'culto', allDay: false, location: 'Sede Principal', hoursStart: 21, hoursEnd: 24, dayOffset: -5 },
  { title: 'Reunión Administrativa', description: 'Revisión de presupuesto trimestral', category: 'reunion', allDay: false, location: 'Oficina Administrativa', hoursStart: 9, hoursEnd: 11, dayOffset: -3 },
]

async function main() {
  console.log('=== SEED COMPLETO: Casa del Rey ===\n')

  // 1. Obtener organización
  let org = await prisma.organization.findFirst({ where: { slug: 'casadelrey' } })

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Casa del Rey',
        slug: 'casadelrey',
        colors: { primary: '#1A1A1A', secondary: '#757575' }
      }
    })
    console.log('✓ Organización Casa del Rey creada')
  } else {
    console.log('✓ Organización Casa del Rey encontrada')
  }

  // 2. Verificar admin
  const admin = await prisma.user.findUnique({ where: { email: 'admin@noah.app' } })

  if (!admin) {
    const hash = await bcrypt.hash('Admin2026!', SALT_ROUNDS)

    await prisma.user.create({
      data: {
        email: 'admin@noah.app',
        name: 'Administrador',
        firstName: 'Admin',
        lastName: 'Noah',
        password: hash,
                isActive: true,
        organizationId: org.id,
        city: 'Bogotá',
        phone: '3000000000'
      }
    })
    console.log('✓ Admin creado (admin@noah.app / Admin2026!)')
  } else {
    console.log('✓ Admin ya existe')
  }

  // 3. Crear usuarios
  console.log('\n--- Creando usuarios ---')
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS)
  const createdUsers: Array<{ id: string; firstName: string; lastName: string; email: string }> = []

  for (const userData of USERS_DATA) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } })

    if (existing) {
      createdUsers.push({ id: existing.id, firstName: userData.firstName, lastName: userData.lastName, email: userData.email })
      continue
    }

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: passwordHash,
                isActive: true,
        organizationId: org.id,
        phone: userData.phone,
        city: userData.city,
        gender: userData.gender,
        maritalStatus: ['single', 'married', 'married', 'single'][Math.floor(Math.random() * 4)],
      }
    })

    createdUsers.push({ id: user.id, firstName: userData.firstName, lastName: userData.lastName, email: userData.email })
  }

  console.log(`✓ ${createdUsers.length} usuarios listos`)

  // 4. Crear redes
  console.log('\n--- Creando redes ---')
  const createdNetworks: Array<{ id: string; name: string; index: number }> = []

  for (let i = 0; i < NETWORKS_DATA.length; i++) {
    const netData = NETWORKS_DATA[i]
    const existing = await prisma.network.findFirst({
      where: { name: netData.name, organizationId: org.id }
    })

    if (existing) {
      createdNetworks.push({ id: existing.id, name: existing.name, index: i })
      console.log(`  ↳ Red "${existing.name}" ya existe`)
      continue
    }

    const network = await prisma.network.create({
      data: {
        name: netData.name,
        description: netData.description,
        isActive: true,
        organizationId: org.id
      }
    })

    createdNetworks.push({ id: network.id, name: network.name, index: i })
    console.log(`  ✓ Red "${network.name}" creada`)
  }

  // 5. Asignar usuarios a redes (distribuir)
  console.log('\n--- Asignando usuarios a redes ---')

  // Líderes de red: primeros 2 usuarios por red
  // Miembros: resto distribuido
  let userIndex = 0

  for (const net of createdNetworks) {
    // 2 líderes por red
    for (let j = 0; j < 2 && userIndex < createdUsers.length; j++) {
      const u = createdUsers[userIndex]

      await prisma.user.update({
        where: { id: u.id },
        data: { networkId: net.id, networkRole: 'leader' }
      })
      userIndex++
    }

    // 4 miembros por red
    for (let j = 0; j < 4 && userIndex < createdUsers.length; j++) {
      const u = createdUsers[userIndex]

      await prisma.user.update({
        where: { id: u.id },
        data: { networkId: net.id, networkRole: 'member' }
      })
      userIndex++
    }
  }

  console.log(`✓ ${userIndex} usuarios asignados a redes`)

  // 6. Crear grupos
  console.log('\n--- Creando grupos ---')
  const createdGroups: Array<{ id: string; name: string; networkIndex: number; leaderIds: string[] }> = []

  for (const net of createdNetworks) {
    const groupsForNet = GROUPS_DATA[net.index] || []

    for (const groupData of groupsForNet) {
      const existing = await prisma.group.findFirst({
        where: { name: groupData.name, organizationId: org.id }
      })

      if (existing) {
        const leaders = await prisma.user.findMany({ where: { groupId: existing.id, groupRole: 'leader' }, select: { id: true } })

        createdGroups.push({ id: existing.id, name: existing.name, networkIndex: net.index, leaderIds: leaders.map(l => l.id) })
        console.log(`  ↳ Grupo "${existing.name}" ya existe`)
        continue
      }

      const group = await prisma.group.create({
        data: {
          name: groupData.name,
          description: groupData.description,
          modality: groupData.modality,
          meetingDay: groupData.meetingDay,
          meetingTime: groupData.meetingTime,
          city: groupData.city || null,
          address: groupData.address || null,
          neighborhood: groupData.neighborhood || null,
          isActive: true,
          networkId: net.id,
          organizationId: org.id
        }
      })

      createdGroups.push({ id: group.id, name: group.name, networkIndex: net.index, leaderIds: [] })
      console.log(`  ✓ Grupo "${group.name}" creado`)
    }
  }

  // 7. Asignar líderes a grupos
  console.log('\n--- Asignando líderes a grupos ---')

  // Los líderes de red son líderes de los grupos de su red
  for (const group of createdGroups) {
    if (group.leaderIds.length > 0) continue // ya tiene líderes

    const net = createdNetworks[group.networkIndex]

    // Buscar líderes de esta red
    const networkLeaders = await prisma.user.findMany({
      where: { networkId: net.id, networkRole: 'leader' },
      select: { id: true, firstName: true }
    })

    // Asignar 1 líder por grupo (cada usuario solo puede liderar 1 grupo)
    const groupsInNetwork = createdGroups.filter(g => g.networkIndex === group.networkIndex)
    const groupIdx = groupsInNetwork.indexOf(group)
    const leaderToAssign = networkLeaders[groupIdx % networkLeaders.length]

    if (leaderToAssign) {
      // Verificar que no sea ya líder de otro grupo
      const alreadyLeading = await prisma.user.findUnique({ where: { id: leaderToAssign.id }, select: { groupId: true } })

      if (!alreadyLeading?.groupId) {
        await prisma.user.update({
          where: { id: leaderToAssign.id },
          data: { groupId: group.id, groupRole: 'leader' }
        })
        group.leaderIds.push(leaderToAssign.id)
        console.log(`  ✓ ${leaderToAssign.firstName} → líder de "${group.name}"`)
      } else {
        // Buscar un miembro de la red que no tenga grupo
        const availableMember = await prisma.user.findFirst({
          where: { networkId: net.id, groupId: null },
          select: { id: true, firstName: true }
        })

        if (availableMember) {
          await prisma.user.update({
            where: { id: availableMember.id },
            data: { groupId: group.id, groupRole: 'leader' }
          })
          group.leaderIds.push(availableMember.id)
          console.log(`  ✓ ${availableMember.firstName} → líder de "${group.name}"`)
        }
      }
    }
  }

  // 8. Crear reportes (últimas 8 semanas)
  console.log('\n--- Creando reportes ---')
  let reportCount = 0
  const today = new Date()

  for (const group of createdGroups) {
    if (group.leaderIds.length === 0) continue

    const reporterId = group.leaderIds[0]

    // 8 semanas de reportes
    for (let week = 1; week <= 8; week++) {
      const meetingDate = new Date(today)

      meetingDate.setDate(today.getDate() - (week * 7))

      // Formato YYYY-MM-DD para el unique constraint
      const dateStr = meetingDate.toISOString().split('T')[0]
      const meetingDateClean = new Date(dateStr + 'T00:00:00.000Z')

      // Verificar si ya existe
      const existing = await prisma.groupReport.findUnique({
        where: { groupId_meetingDate: { groupId: group.id, meetingDate: meetingDateClean } }
      })

      if (existing) continue

      const totalAttendees = 8 + Math.floor(Math.random() * 20) // 8-27
      const leadersCount = 1 + Math.floor(Math.random() * 3) // 1-3
      const visitorsCount = Math.floor(Math.random() * 5) // 0-4
      const reportOffering = Math.random() > 0.3 // 70% reportan ofrenda
      const offeringAmount = reportOffering ? (20000 + Math.floor(Math.random() * 180000)) : null // 20k-200k COP

      const notes = [
        'Buen ambiente de adoración, varios testimonios compartidos',
        'Grupo nuevo integrado, se sienten bienvenidos',
        'Se oraron por peticiones de sanidad',
        'Estudiamos el libro de Romanos capítulo 8',
        'Reunión especial con compartir de alimentos',
        'Varios nuevos asistentes del barrio',
        'Se planificó actividad de servicio comunitario',
        null,
        null,
        null, // 30% sin notas
      ][Math.floor(Math.random() * 10)]

      await prisma.groupReport.create({
        data: {
          meetingDate: meetingDateClean,
          totalAttendees,
          leadersCount,
          visitorsCount,
          reportOffering,
          offeringAmount,
          notes,
          groupId: group.id,
          reporterId,
          organizationId: org.id
        }
      })

      reportCount++
    }
  }

  console.log(`✓ ${reportCount} reportes creados`)

  // 9. Crear eventos de calendario
  console.log('\n--- Creando eventos de calendario ---')
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@noah.app' } })

  if (adminUser) {
    let eventCount = 0

    for (const eventData of CALENDAR_EVENTS) {
      const startDate = new Date(today)

      startDate.setDate(today.getDate() + eventData.dayOffset)

      if (!eventData.allDay && eventData.hoursStart !== undefined) {
        startDate.setHours(eventData.hoursStart, 0, 0, 0)
      } else {
        startDate.setHours(0, 0, 0, 0)
      }

      const endDate = new Date(startDate)

      if (eventData.durationDays) {
        endDate.setDate(endDate.getDate() + eventData.durationDays)
      }

      if (!eventData.allDay && eventData.hoursEnd !== undefined) {
        endDate.setHours(eventData.hoursEnd, 0, 0, 0)
      } else if (eventData.allDay) {
        endDate.setHours(23, 59, 59, 0)
      }

      // Verificar si ya existe un evento con el mismo título y fecha
      const existing = await prisma.calendarEvent.findFirst({
        where: {
          title: eventData.title,
          startDate,
          organizationId: org.id
        }
      })

      if (existing) continue

      await prisma.calendarEvent.create({
        data: {
          title: eventData.title,
          description: eventData.description,
          startDate,
          endDate,
          allDay: eventData.allDay,
          category: eventData.category,
          location: eventData.location || null,
          isActive: true,
          createdById: adminUser.id,
          organizationId: org.id
        }
      })

      eventCount++
    }

    console.log(`✓ ${eventCount} eventos de calendario creados`)
  }

  // 10. Resumen
  console.log('\n=== RESUMEN ===')
  const totalUsers = await prisma.user.count({ where: { organizationId: org.id } })
  const totalNetworks = await prisma.network.count({ where: { organizationId: org.id } })
  const totalGroups = await prisma.group.count({ where: { organizationId: org.id } })
  const totalReports = await prisma.groupReport.count({ where: { organizationId: org.id } })
  const totalEvents = await prisma.calendarEvent.count({ where: { organizationId: org.id } })

  console.log(`  Usuarios:    ${totalUsers}`)
  console.log(`  Redes:       ${totalNetworks}`)
  console.log(`  Grupos:      ${totalGroups}`)
  console.log(`  Reportes:    ${totalReports}`)
  console.log(`  Eventos:     ${totalEvents}`)
  console.log(`\n  Password para todos los usuarios: ${DEFAULT_PASSWORD}`)
  console.log(`  Admin: admin@noah.app / Admin2026!`)
  console.log('\n=== SEED COMPLETO ===')
}

main()
  .catch(e => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
