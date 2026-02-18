/**
 * Script para crear eventos de ejemplo para Casa del Rey
 *
 * Uso: npx tsx src/scripts/seed-calendar.ts
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Buscando organización y admin...')

  // Buscar la organización Casa del Rey
  const organization = await prisma.organization.findFirst({
    where: { name: { contains: 'Casa' } }
  })

  if (!organization) {
    console.error('No se encontró la organización. Ejecuta primero seed-admin.ts')
    process.exit(1)
  }

  // Buscar el admin
  const admin = await prisma.user.findFirst({
    where: {
      organizationId: organization.id,
      role: 'admin'
    }
  })

  if (!admin) {
    console.error('No se encontró el administrador.')
    process.exit(1)
  }

  console.log(`Organización: ${organization.name}`)
  console.log(`Admin: ${admin.email}`)

  // Eliminar eventos existentes
  await prisma.calendarEvent.deleteMany({
    where: { organizationId: organization.id }
  })

  console.log('Creando eventos de calendario...')

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Función para crear fecha
  const createDate = (day: number, hour: number = 0, minute: number = 0, monthOffset: number = 0) => {
    return new Date(currentYear, currentMonth + monthOffset, day, hour, minute)
  }

  const events = [
    // ===== CULTOS DOMINICALES =====
    {
      title: 'Culto Dominical - Primera Servicio',
      description: 'Servicio de adoración con ministración de alabanza y predicación de la Palabra.',
      startDate: createDate(2, 8, 0),
      endDate: createDate(2, 10, 30),
      allDay: false,
      category: 'culto',
      location: 'Auditorio Principal',
    },
    {
      title: 'Culto Dominical - Segundo Servicio',
      description: 'Servicio de adoración con ministración de alabanza y predicación de la Palabra.',
      startDate: createDate(2, 11, 0),
      endDate: createDate(2, 13, 30),
      allDay: false,
      category: 'culto',
      location: 'Auditorio Principal',
    },
    {
      title: 'Culto Dominical - Primera Servicio',
      description: 'Servicio de adoración con ministración de alabanza y predicación de la Palabra.',
      startDate: createDate(9, 8, 0),
      endDate: createDate(9, 10, 30),
      allDay: false,
      category: 'culto',
      location: 'Auditorio Principal',
    },
    {
      title: 'Culto Dominical - Segundo Servicio',
      description: 'Servicio de adoración con ministración de alabanza y predicación de la Palabra.',
      startDate: createDate(9, 11, 0),
      endDate: createDate(9, 13, 30),
      allDay: false,
      category: 'culto',
      location: 'Auditorio Principal',
    },
    {
      title: 'Culto Dominical - Primera Servicio',
      description: 'Servicio de adoración con ministración de alabanza y predicación de la Palabra.',
      startDate: createDate(16, 8, 0),
      endDate: createDate(16, 10, 30),
      allDay: false,
      category: 'culto',
      location: 'Auditorio Principal',
    },
    {
      title: 'Culto Dominical - Segundo Servicio',
      description: 'Servicio de adoración con ministración de alabanza y predicación de la Palabra.',
      startDate: createDate(16, 11, 0),
      endDate: createDate(16, 13, 30),
      allDay: false,
      category: 'culto',
      location: 'Auditorio Principal',
    },
    {
      title: 'Culto Dominical - Primera Servicio',
      description: 'Servicio de adoración con ministración de alabanza y predicación de la Palabra.',
      startDate: createDate(23, 8, 0),
      endDate: createDate(23, 10, 30),
      allDay: false,
      category: 'culto',
      location: 'Auditorio Principal',
    },
    {
      title: 'Culto Dominical - Segundo Servicio',
      description: 'Servicio de adoración con ministración de alabanza y predicación de la Palabra.',
      startDate: createDate(23, 11, 0),
      endDate: createDate(23, 13, 30),
      allDay: false,
      category: 'culto',
      location: 'Auditorio Principal',
    },

    // ===== CULTOS ENTRE SEMANA =====
    {
      title: 'Culto de Oración',
      description: 'Reunión de oración e intercesión por la iglesia y las naciones.',
      startDate: createDate(5, 19, 0),
      endDate: createDate(5, 21, 0),
      allDay: false,
      category: 'culto',
      location: 'Salón de Oración',
    },
    {
      title: 'Culto de Oración',
      description: 'Reunión de oración e intercesión por la iglesia y las naciones.',
      startDate: createDate(12, 19, 0),
      endDate: createDate(12, 21, 0),
      allDay: false,
      category: 'culto',
      location: 'Salón de Oración',
    },
    {
      title: 'Culto de Oración',
      description: 'Reunión de oración e intercesión por la iglesia y las naciones.',
      startDate: createDate(19, 19, 0),
      endDate: createDate(19, 21, 0),
      allDay: false,
      category: 'culto',
      location: 'Salón de Oración',
    },
    {
      title: 'Culto de Oración',
      description: 'Reunión de oración e intercesión por la iglesia y las naciones.',
      startDate: createDate(26, 19, 0),
      endDate: createDate(26, 21, 0),
      allDay: false,
      category: 'culto',
      location: 'Salón de Oración',
    },

    // ===== EVENTOS ESPECIALES =====
    {
      title: 'Noche de Alabanza',
      description: 'Noche especial de adoración y alabanza con el ministerio de música de la iglesia. Invitados especiales.',
      startDate: createDate(8, 18, 30),
      endDate: createDate(8, 21, 30),
      allDay: false,
      category: 'evento',
      location: 'Auditorio Principal',
    },
    {
      title: 'Conferencia de Familias',
      description: 'Conferencia anual para matrimonios y familias. Tema: "Edificando Hogares sobre la Roca".',
      startDate: createDate(14, 0, 0),
      endDate: createDate(15, 23, 59),
      allDay: true,
      category: 'evento',
      location: 'Auditorio Principal',
    },
    {
      title: 'Bautismos',
      description: 'Ceremonia de bautismos. Si deseas bautizarte, inscríbete con tu líder de grupo.',
      startDate: createDate(23, 14, 0),
      endDate: createDate(23, 17, 0),
      allDay: false,
      category: 'evento',
      location: 'Piscina - Zona Jardín',
    },
    {
      title: 'Vigilia de Oración',
      description: 'Noche de búsqueda y oración. Ayuno previo recomendado.',
      startDate: createDate(28, 20, 0),
      endDate: createDate(29, 5, 0),
      allDay: false,
      category: 'evento',
      location: 'Auditorio Principal',
    },

    // ===== REUNIONES DE LÍDERES =====
    {
      title: 'Reunión General de Líderes',
      description: 'Reunión mensual de todos los líderes de grupos y ministerios.',
      startDate: createDate(1, 19, 0),
      endDate: createDate(1, 21, 0),
      allDay: false,
      category: 'reunion',
      location: 'Salón de Conferencias',
    },
    {
      title: 'Reunión de Pastores',
      description: 'Reunión del equipo pastoral para planeación y evaluación.',
      startDate: createDate(4, 10, 0),
      endDate: createDate(4, 12, 0),
      allDay: false,
      category: 'reunion',
      location: 'Oficina Pastoral',
    },
    {
      title: 'Consejo de Ancianos',
      description: 'Reunión del consejo de ancianos de la iglesia.',
      startDate: createDate(18, 18, 0),
      endDate: createDate(18, 20, 0),
      allDay: false,
      category: 'reunion',
      location: 'Sala de Juntas',
    },

    // ===== ACTIVIDADES DE RED =====
    {
      title: 'Encuentro Red de Jóvenes',
      description: 'Actividad mensual de integración para la red de jóvenes. Juegos, comida y testimonios.',
      startDate: createDate(7, 15, 0),
      endDate: createDate(7, 19, 0),
      allDay: false,
      category: 'actividad',
      location: 'Parque Central',
    },
    {
      title: 'Café de Matrimonios',
      description: 'Actividad social para parejas de la red de matrimonios.',
      startDate: createDate(13, 19, 0),
      endDate: createDate(13, 22, 0),
      allDay: false,
      category: 'actividad',
      location: 'Cafetería de la Iglesia',
    },
    {
      title: 'Retiro Red de Mujeres',
      description: 'Retiro espiritual para mujeres. Tema: "Mujeres de Influencia". Incluye hospedaje y alimentación.',
      startDate: createDate(20, 0, 0),
      endDate: createDate(21, 23, 59),
      allDay: true,
      category: 'actividad',
      location: 'Centro de Retiros El Refugio',
      url: 'https://forms.example.com/retiro-mujeres'
    },
    {
      title: 'Torneo de Fútbol - Red de Hombres',
      description: 'Torneo deportivo para hombres de la iglesia. Inscripciones abiertas.',
      startDate: createDate(27, 8, 0),
      endDate: createDate(27, 14, 0),
      allDay: false,
      category: 'actividad',
      location: 'Cancha Deportiva',
    },

    // ===== CAPACITACIONES =====
    {
      title: 'Escuela de Liderazgo - Módulo 3',
      description: 'Tercera sesión de la Escuela de Liderazgo. Tema: "Cómo dirigir grupos efectivos".',
      startDate: createDate(3, 19, 0),
      endDate: createDate(3, 21, 0),
      allDay: false,
      category: 'capacitacion',
      location: 'Salón 201',
    },
    {
      title: 'Taller de Evangelismo',
      description: 'Capacitación práctica sobre cómo compartir el evangelio de manera efectiva.',
      startDate: createDate(10, 9, 0),
      endDate: createDate(10, 13, 0),
      allDay: false,
      category: 'capacitacion',
      location: 'Auditorio Principal',
    },
    {
      title: 'Curso de Consejería Bíblica',
      description: 'Curso de fundamentos para consejería pastoral. Sesión 1 de 4.',
      startDate: createDate(17, 19, 0),
      endDate: createDate(17, 21, 30),
      allDay: false,
      category: 'capacitacion',
      location: 'Salón de Conferencias',
    },
    {
      title: 'Seminario de Finanzas Bíblicas',
      description: 'Aprende a manejar tus finanzas según los principios de la Palabra.',
      startDate: createDate(24, 9, 0),
      endDate: createDate(24, 13, 0),
      allDay: false,
      category: 'capacitacion',
      location: 'Salón 301',
    },

    // ===== EVENTOS DEL PRÓXIMO MES =====
    {
      title: 'Congreso Anual de la Iglesia',
      description: 'Congreso anual con invitados internacionales. "Avivamiento y Reforma".',
      startDate: createDate(5, 0, 0, 1),
      endDate: createDate(8, 23, 59, 1),
      allDay: true,
      category: 'evento',
      location: 'Auditorio Principal',
    },
    {
      title: 'Graduación Escuela de Liderazgo',
      description: 'Ceremonia de graduación para los estudiantes que completaron la Escuela de Liderazgo.',
      startDate: createDate(15, 17, 0, 1),
      endDate: createDate(15, 20, 0, 1),
      allDay: false,
      category: 'evento',
      location: 'Auditorio Principal',
    },
  ]

  // Crear eventos
  for (const event of events) {
    await prisma.calendarEvent.create({
      data: {
        ...event,
        createdById: admin.id,
        organizationId: organization.id
      }
    })
  }

  console.log(`✅ Se crearon ${events.length} eventos de calendario`)

  // Mostrar resumen por categoría
  const categoryCounts = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1

    return acc
  }, {} as Record<string, number>)

  console.log('\nResumen por categoría:')
  console.log(`  - Cultos: ${categoryCounts.culto || 0}`)
  console.log(`  - Eventos Especiales: ${categoryCounts.evento || 0}`)
  console.log(`  - Reuniones de Líderes: ${categoryCounts.reunion || 0}`)
  console.log(`  - Actividades de Red: ${categoryCounts.actividad || 0}`)
  console.log(`  - Capacitaciones: ${categoryCounts.capacitacion || 0}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
