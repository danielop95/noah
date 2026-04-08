'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'
import { requirePermission, getAdminOrganizationId, requireInstituteTag } from './helpers'

// =================== TIPOS ===================

export type CourseWithLevels = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  evaluationType: string
  evaluationConfig: unknown
  isActive: boolean
  levels: {
    id: string
    name: string
    slug: string
    sortOrder: number
    sessionCount: number
    prerequisiteLevelId: string | null
    isActive: boolean
    _count: { cohorts: number }
  }[]
  _count: { cohorts: number }
}

export type CohortWithDetails = {
  id: string
  name: string | null
  weekDay: string
  startTime: string
  startDate: Date
  endDate: Date
  maxCapacity: number
  status: string
  level: {
    id: string
    name: string
    sortOrder: number
    sessionCount: number
    course: {
      id: string
      name: string
      slug: string
      evaluationType: string
      evaluationConfig: unknown
    }
  }
  teacher: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
  }
  _count: { enrollments: number; sessions: number }
}

export type EnrollmentWithDetails = {
  id: string
  status: string
  enrolledAt: Date
  approvedAt: Date | null
  completedAt: Date | null
  finalGrade: number | null
  passed: boolean | null
  user: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
    email: string | null
  }
  cohort: {
    id: string
    name: string | null
    level: { name: string; course: { name: string } }
  }
  approvedBy: { name: string | null } | null
}

// =================== HELPERS PRIVADOS ===================

const DAY_MAP: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6
}

function normalizeDay(day: string): string {
  return day
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

async function generateCohortSessions(
  cohortId: string,
  startDate: Date,
  endDate: Date,
  weekDay: string,
  sessionCount: number
): Promise<void> {
  const targetDay = DAY_MAP[normalizeDay(weekDay)]

  if (targetDay === undefined) return

  const sessions: { cohortId: string; sessionNumber: number; scheduledDate: Date }[] = []

  let current = new Date(startDate)
  let sessionNumber = 1

  // Avanzar al primer día que coincida con el weekDay
  while (current.getDay() !== targetDay) {
    current = new Date(current.getTime() + 86400000)
  }

  while (current <= endDate && sessionNumber <= sessionCount) {
    sessions.push({
      cohortId,
      sessionNumber,
      scheduledDate: new Date(current)
    })
    sessionNumber++
    current = new Date(current.getTime() + 7 * 86400000) // +1 semana
  }

  if (sessions.length > 0) {
    await prisma.iLSession.createMany({ data: sessions })
  }
}

// =================== CURSOS ===================

export async function getAllCourses(): Promise<CourseWithLevels[]> {
  const session = await requirePermission('instituto', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  return prisma.iLCourse.findMany({
    where: { organizationId },
    include: {
      levels: {
        include: {
          _count: { select: { cohorts: true } }
        },
        orderBy: { sortOrder: 'asc' }
      },
      _count: { select: { cohorts: true } }
    },
    orderBy: { name: 'asc' }
  }) as unknown as CourseWithLevels[]
}

export async function getCourseById(id: string): Promise<CourseWithLevels | null> {
  const session = await requirePermission('instituto', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const course = await prisma.iLCourse.findUnique({
    where: { id },
    include: {
      levels: {
        include: {
          _count: { select: { cohorts: true } }
        },
        orderBy: { sortOrder: 'asc' }
      },
      _count: { select: { cohorts: true } }
    }
  })

  if (!course || course.organizationId !== organizationId) return null

  return course as unknown as CourseWithLevels
}

export async function createCourse(data: {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  evaluationType: string
  evaluationConfig: unknown
}): Promise<void> {
  const session = await requirePermission('instituto', 'crear')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  await prisma.iLCourse.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      evaluationType: data.evaluationType,
      evaluationConfig: data.evaluationConfig as object,
      organizationId
    }
  })
}

export async function updateCourse(
  id: string,
  data: {
    name?: string
    description?: string | null
    imageUrl?: string | null
    evaluationType?: string
    evaluationConfig?: unknown
    isActive?: boolean
  }
): Promise<void> {
  const session = await requirePermission('instituto', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const course = await prisma.iLCourse.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (!course || course.organizationId !== organizationId) {
    throw new Error('Curso no encontrado o no autorizado')
  }

  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
  if (data.evaluationType !== undefined) updateData.evaluationType = data.evaluationType
  if (data.evaluationConfig !== undefined) updateData.evaluationConfig = data.evaluationConfig
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  await prisma.iLCourse.update({ where: { id }, data: updateData })
}

export async function deleteCourse(id: string): Promise<void> {
  const session = await requirePermission('instituto', 'eliminar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const course = await prisma.iLCourse.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (!course || course.organizationId !== organizationId) {
    throw new Error('Curso no encontrado o no autorizado')
  }

  await prisma.iLCourse.delete({ where: { id } })
}

// =================== NIVELES ===================

export async function getLevelsByCourse(courseId: string) {
  const session = await requirePermission('instituto', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  return prisma.iLLevel.findMany({
    where: { courseId },
    include: {
      _count: { select: { cohorts: true } }
    },
    orderBy: { sortOrder: 'asc' }
  })
}

export async function createLevel(data: {
  courseId: string
  name: string
  slug: string
  sortOrder: number
  sessionCount: number
  prerequisiteLevelId?: string
  evaluationConfig?: unknown
}): Promise<void> {
  const session = await requirePermission('instituto', 'crear')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  // Verificar que el curso pertenece a la organización
  const course = await prisma.iLCourse.findUnique({
    where: { id: data.courseId },
    select: { organizationId: true }
  })

  if (!course || course.organizationId !== organizationId) {
    throw new Error('Curso no encontrado o no autorizado')
  }

  await prisma.iLLevel.create({
    data: {
      courseId: data.courseId,
      name: data.name,
      slug: data.slug,
      sortOrder: data.sortOrder,
      sessionCount: data.sessionCount,
      prerequisiteLevelId: data.prerequisiteLevelId ?? null,
      evaluationConfig: data.evaluationConfig as object | undefined ?? undefined
    }
  })
}

export async function updateLevel(
  id: string,
  data: {
    name?: string
    sortOrder?: number
    sessionCount?: number
    prerequisiteLevelId?: string | null
    evaluationConfig?: unknown
    isActive?: boolean
  }
): Promise<void> {
  const session = await requirePermission('instituto', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  const level = await prisma.iLLevel.findUnique({
    where: { id },
    select: { course: { select: { organizationId: true } } }
  })

  if (!level || level.course.organizationId !== organizationId) {
    throw new Error('Nivel no encontrado o no autorizado')
  }

  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder
  if (data.sessionCount !== undefined) updateData.sessionCount = data.sessionCount
  if (data.prerequisiteLevelId !== undefined) updateData.prerequisiteLevelId = data.prerequisiteLevelId
  if (data.evaluationConfig !== undefined) updateData.evaluationConfig = data.evaluationConfig
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  await prisma.iLLevel.update({ where: { id }, data: updateData })
}

export async function deleteLevel(id: string): Promise<void> {
  const session = await requirePermission('instituto', 'eliminar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  const level = await prisma.iLLevel.findUnique({
    where: { id },
    select: { course: { select: { organizationId: true } } }
  })

  if (!level || level.course.organizationId !== organizationId) {
    throw new Error('Nivel no encontrado o no autorizado')
  }

  await prisma.iLLevel.delete({ where: { id } })
}

// =================== COHORTES ===================

export async function getAllCohorts(): Promise<CohortWithDetails[]> {
  const session = await requirePermission('instituto', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const hierarchy = session.user.roleHierarchy ?? 99
  const instituteTags = session.user.instituteTags ?? []
  const isTeacherOnly = hierarchy > 2 && instituteTags.includes('maestro') && !instituteTags.includes('coordinador')

  const where: Record<string, unknown> = { organizationId }

  if (isTeacherOnly) {
    where.teacherId = session.user.id
  }

  const cohorts = await prisma.iLCohort.findMany({
    where,
    include: {
      level: {
        select: {
          id: true,
          name: true,
          sortOrder: true,
          sessionCount: true,
          course: {
            select: {
              id: true,
              name: true,
              slug: true,
              evaluationType: true,
              evaluationConfig: true
            }
          }
        }
      },
      teacher: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true
        }
      },
      _count: {
        select: {
          enrollments: true,
          sessions: true
        }
      }
    },
    orderBy: { startDate: 'desc' }
  })

  return cohorts as unknown as CohortWithDetails[]
}

export async function getCohortById(id: string): Promise<(CohortWithDetails & { sessions: unknown[] }) | null> {
  const session = await requirePermission('instituto', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const cohort = await prisma.iLCohort.findUnique({
    where: { id },
    include: {
      level: {
        select: {
          id: true,
          name: true,
          sortOrder: true,
          sessionCount: true,
          course: {
            select: {
              id: true,
              name: true,
              slug: true,
              evaluationType: true,
              evaluationConfig: true
            }
          }
        }
      },
      teacher: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true
        }
      },
      sessions: {
        orderBy: { sessionNumber: 'asc' }
      },
      _count: {
        select: {
          enrollments: true,
          sessions: true
        }
      }
    }
  })

  if (!cohort || cohort.organizationId !== organizationId) return null

  return cohort as unknown as CohortWithDetails & { sessions: unknown[] }
}

export async function createCohort(data: {
  levelId: string
  courseId: string
  teacherId: string
  name?: string
  weekDay: string
  startTime: string
  startDate: Date
  endDate: Date
  maxCapacity: number
}): Promise<{ id: string }> {
  const session = await requirePermission('instituto', 'crear')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  // Verificar que el nivel existe y el curso corresponde
  const level = await prisma.iLLevel.findUnique({
    where: { id: data.levelId },
    select: { sessionCount: true, courseId: true }
  })

  if (!level) {
    throw new Error('Nivel no encontrado')
  }

  const cohort = await prisma.iLCohort.create({
    data: {
      levelId: data.levelId,
      courseId: data.courseId,
      teacherId: data.teacherId,
      name: data.name,
      weekDay: data.weekDay,
      startTime: data.startTime,
      startDate: data.startDate,
      endDate: data.endDate,
      maxCapacity: data.maxCapacity,
      organizationId
    }
  })

  await generateCohortSessions(
    cohort.id,
    data.startDate,
    data.endDate,
    data.weekDay,
    level.sessionCount
  )

  return { id: cohort.id }
}

export async function updateCohort(
  id: string,
  data: Partial<{
    name: string
    teacherId: string
    weekDay: string
    startTime: string
    startDate: Date
    endDate: Date
    maxCapacity: number
    status: string
  }>
): Promise<void> {
  const session = await requirePermission('instituto', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const cohort = await prisma.iLCohort.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (!cohort || cohort.organizationId !== organizationId) {
    throw new Error('Cohorte no encontrada o no autorizada')
  }

  await prisma.iLCohort.update({ where: { id }, data })
}

export async function deleteCohort(id: string): Promise<void> {
  const session = await requirePermission('instituto', 'eliminar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const cohort = await prisma.iLCohort.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (!cohort || cohort.organizationId !== organizationId) {
    throw new Error('Cohorte no encontrada o no autorizada')
  }

  await prisma.iLCohort.delete({ where: { id } })
}

// =================== INSCRIPCIONES ===================

export async function requestEnrollment(cohortId: string): Promise<void> {
  const authSession = await getServerSession(authOptions)

  if (!authSession?.user) {
    throw new Error('No autenticado')
  }

  const userId = authSession.user.id

  // Verificar que el usuario no tenga ningún enrollment activo en ningún otro curso
  const activeEnrollment = await prisma.iLEnrollment.findFirst({
    where: {
      userId,
      status: { in: ['pending', 'approved', 'active'] }
    }
  })
  if (activeEnrollment) {
    throw new Error('Ya tienes una inscripción activa o pendiente en otro curso. Completa o retira tu inscripción actual antes de inscribirte a otro.')
  }

  // Verificar que no tenga ya un enrollment activo en esta cohorte
  const existing = await prisma.iLEnrollment.findUnique({
    where: { userId_cohortId: { userId, cohortId } }
  })

  if (existing && existing.status !== 'rejected' && existing.status !== 'withdrawn') {
    throw new Error('Ya tienes una inscripción en esta cohorte')
  }

  // Verificar cupo disponible
  const cohort = await prisma.iLCohort.findUnique({
    where: { id: cohortId },
    select: {
      maxCapacity: true,
      _count: {
        select: {
          enrollments: {
            where: { status: { in: ['approved', 'active', 'completed'] } }
          }
        }
      }
    }
  })

  if (!cohort) {
    throw new Error('Cohorte no encontrada')
  }

  if (cohort._count.enrollments >= cohort.maxCapacity) {
    throw new Error('La cohorte no tiene cupos disponibles')
  }

  if (existing) {
    // Re-inscribir si estaba rechazado o retirado
    await prisma.iLEnrollment.update({
      where: { id: existing.id },
      data: { status: 'pending', enrolledAt: new Date() }
    })
  } else {
    await prisma.iLEnrollment.create({
      data: { userId, cohortId, status: 'pending' }
    })
  }
}

export async function approveEnrollment(enrollmentId: string): Promise<void> {
  const session = await requirePermission('instituto', 'gestionar')

  await prisma.iLEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      approvedById: session.user.id
    }
  })
}

export async function rejectEnrollment(enrollmentId: string): Promise<void> {
  await requirePermission('instituto', 'gestionar')

  await prisma.iLEnrollment.update({
    where: { id: enrollmentId },
    data: { status: 'rejected' }
  })
}

export async function withdrawEnrollment(enrollmentId: string): Promise<void> {
  const authSession = await getServerSession(authOptions)

  if (!authSession?.user) {
    throw new Error('No autenticado')
  }

  // Verificar que el enrollment pertenece al usuario actual
  const enrollment = await prisma.iLEnrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true }
  })

  if (!enrollment) {
    throw new Error('Inscripción no encontrada')
  }

  if (enrollment.userId !== authSession.user.id) {
    throw new Error('No autorizado para retirar esta inscripción')
  }

  await prisma.iLEnrollment.update({
    where: { id: enrollmentId },
    data: { status: 'withdrawn' }
  })
}

export async function getPendingEnrollments(): Promise<EnrollmentWithDetails[]> {
  await requirePermission('instituto', 'gestionar')

  const enrollments = await prisma.iLEnrollment.findMany({
    where: { status: 'pending' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          email: true
        }
      },
      cohort: {
        select: {
          id: true,
          name: true,
          level: {
            select: {
              name: true,
              course: { select: { name: true } }
            }
          }
        }
      },
      approvedBy: { select: { name: true } }
    },
    orderBy: { enrolledAt: 'asc' }
  })

  return enrollments.map(e => ({
    ...e,
    finalGrade: e.finalGrade ? Number(e.finalGrade) : null
  })) as unknown as EnrollmentWithDetails[]
}

export async function getEnrollmentsByUser(userId: string): Promise<EnrollmentWithDetails[]> {
  await requirePermission('instituto', 'ver')

  const enrollments = await prisma.iLEnrollment.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          email: true
        }
      },
      cohort: {
        select: {
          id: true,
          name: true,
          level: {
            select: {
              name: true,
              course: { select: { name: true } }
            }
          }
        }
      },
      approvedBy: { select: { name: true } }
    },
    orderBy: { enrolledAt: 'desc' }
  })

  return enrollments.map(e => ({
    ...e,
    finalGrade: e.finalGrade ? Number(e.finalGrade) : null
  })) as unknown as EnrollmentWithDetails[]
}

export async function getEnrollmentsByCohort(cohortId: string): Promise<EnrollmentWithDetails[]> {
  await requirePermission('instituto', 'ver')

  const enrollments = await prisma.iLEnrollment.findMany({
    where: { cohortId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          email: true
        }
      },
      cohort: {
        select: {
          id: true,
          name: true,
          level: {
            select: {
              name: true,
              course: { select: { name: true } }
            }
          }
        }
      },
      approvedBy: { select: { name: true } }
    },
    orderBy: { enrolledAt: 'asc' }
  })

  return enrollments.map(e => ({
    ...e,
    finalGrade: e.finalGrade ? Number(e.finalGrade) : null
  })) as unknown as EnrollmentWithDetails[]
}

// =================== ASISTENCIA ===================

export async function markAttendance(
  sessionId: string,
  records: { enrollmentId: string; present: boolean }[]
): Promise<void> {
  const session = await requireInstituteTag('maestro')

  // Obtener la sesión y verificar que el maestro es el teacher de la cohorte
  const ilSession = await prisma.iLSession.findUnique({
    where: { id: sessionId },
    include: {
      cohort: {
        select: { teacherId: true }
      }
    }
  })

  if (!ilSession) {
    throw new Error('Sesión no encontrada')
  }

  const hierarchy = session.user.roleHierarchy ?? 99

  if (hierarchy > 2 && ilSession.cohort.teacherId !== session.user.id) {
    throw new Error('Solo el maestro de la cohorte puede registrar asistencia')
  }

  // Upsert ILAttendance para cada record
  await Promise.all(
    records.map(record =>
      prisma.iLAttendance.upsert({
        where: {
          sessionId_enrollmentId: {
            sessionId,
            enrollmentId: record.enrollmentId
          }
        },
        update: {
          present: record.present,
          markedById: session.user.id,
          markedAt: new Date()
        },
        create: {
          sessionId,
          enrollmentId: record.enrollmentId,
          present: record.present,
          markedById: session.user.id
        }
      })
    )
  )

  // Si la sesión estaba programada, marcarla como completada
  if (ilSession.status === 'scheduled') {
    await prisma.iLSession.update({
      where: { id: sessionId },
      data: { status: 'completed' }
    })
  }
}

export async function getAttendanceByCohort(cohortId: string): Promise<{
  sessions: { id: string; sessionNumber: number; scheduledDate: Date; status: string }[]
  students: {
    enrollmentId: string
    userId: string
    name: string
    attendance: { sessionId: string; present: boolean }[]
  }[]
}> {
  await requirePermission('instituto', 'ver')

  const [sessions, enrollments] = await Promise.all([
    prisma.iLSession.findMany({
      where: { cohortId },
      orderBy: { sessionNumber: 'asc' },
      select: { id: true, sessionNumber: true, scheduledDate: true, status: true }
    }),
    prisma.iLEnrollment.findMany({
      where: { cohortId, status: { in: ['approved', 'active', 'completed', 'failed'] } },
      include: {
        user: {
          select: { id: true, name: true, firstName: true, lastName: true }
        },
        attendance: {
          select: { sessionId: true, present: true }
        }
      }
    })
  ])

  const students = enrollments.map(e => ({
    enrollmentId: e.id,
    userId: e.user.id,
    name: e.user.name || `${e.user.firstName ?? ''} ${e.user.lastName ?? ''}`.trim(),
    attendance: e.attendance
  }))

  return { sessions, students }
}

export async function getAttendanceByEnrollment(enrollmentId: string): Promise<{
  present: number
  absent: number
  total: number
  percentage: number
  records: { sessionId: string; sessionNumber: number; scheduledDate: Date; present: boolean }[]
}> {
  await requirePermission('instituto', 'ver')

  const enrollment = await prisma.iLEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      cohort: {
        include: {
          sessions: {
            orderBy: { sessionNumber: 'asc' }
          }
        }
      },
      attendance: true
    }
  })

  if (!enrollment) {
    throw new Error('Inscripción no encontrada')
  }

  const attendanceMap = new Map(enrollment.attendance.map(a => [a.sessionId, a.present]))

  const records = enrollment.cohort.sessions.map(s => ({
    sessionId: s.id,
    sessionNumber: s.sessionNumber,
    scheduledDate: s.scheduledDate,
    present: attendanceMap.get(s.id) ?? false
  }))

  const completedSessions = enrollment.cohort.sessions.filter(s => s.status === 'completed')
  const total = completedSessions.length
  const present = completedSessions.filter(s => attendanceMap.get(s.id) === true).length
  const absent = total - present
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0

  return { present, absent, total, percentage, records }
}

// =================== CALIFICACIONES ===================

export async function saveGrades(
  enrollmentId: string,
  grades: { component: string; score: number }[]
): Promise<void> {
  const session = await requireInstituteTag('maestro')

  // Verificar que el enrollment pertenece a una cohorte del maestro actual (o es admin)
  const hierarchy = session.user.roleHierarchy ?? 99

  if (hierarchy > 2) {
    const enrollment = await prisma.iLEnrollment.findUnique({
      where: { id: enrollmentId },
      select: { cohort: { select: { teacherId: true } } }
    })

    if (!enrollment || enrollment.cohort.teacherId !== session.user.id) {
      throw new Error('No tienes permisos para calificar inscripciones de otras cohortes')
    }
  }

  await Promise.all(
    grades.map(grade =>
      prisma.iLGrade.upsert({
        where: {
          enrollmentId_component: {
            enrollmentId,
            component: grade.component
          }
        },
        update: {
          score: grade.score,
          gradedById: session.user.id,
          gradedAt: new Date()
        },
        create: {
          enrollmentId,
          component: grade.component,
          score: grade.score,
          gradedById: session.user.id
        }
      })
    )
  )
}

export async function getGradesByEnrollment(enrollmentId: string) {
  await requirePermission('instituto', 'ver')

  return prisma.iLGrade.findMany({
    where: { enrollmentId },
    select: {
      id: true,
      component: true,
      score: true,
      gradedAt: true,
      gradedBy: {
        select: { id: true, name: true }
      }
    }
  })
}

export async function getGradesByCohort(cohortId: string) {
  await requirePermission('instituto', 'ver')

  const enrollments = await prisma.iLEnrollment.findMany({
    where: { cohortId, status: { in: ['approved', 'active', 'completed', 'failed'] } },
    include: {
      user: {
        select: { id: true, name: true, firstName: true, lastName: true }
      },
      grades: {
        select: { component: true, score: true }
      }
    }
  })

  return enrollments.map(e => ({
    enrollmentId: e.id,
    userId: e.user.id,
    name: e.user.name || `${e.user.firstName ?? ''} ${e.user.lastName ?? ''}`.trim(),
    grades: e.grades,
    finalGrade: e.finalGrade ? Number(e.finalGrade) : null,
    passed: e.passed
  }))
}

// =================== MOTOR DE EVALUACIÓN ===================

export async function computeEnrollmentResult(enrollmentId: string): Promise<{
  passed: boolean
  finalGrade: number | null
}> {
  await requireInstituteTag('maestro')

  const enrollment = await prisma.iLEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      cohort: {
        include: {
          level: {
            include: {
              course: true
            }
          }
        }
      },
      grades: true,
      attendance: true
    }
  })

  if (!enrollment) {
    throw new Error('Inscripción no encontrada')
  }

  const { course } = enrollment.cohort.level
  const evaluationType = course.evaluationType
  const config = course.evaluationConfig as Record<string, unknown>

  let passed = false
  let finalGrade: number | null = null

  if (evaluationType === 'weighted') {
    // Suma ponderada: score * weight para cada componente
    const components = (config.components as { component: string; weight: number }[]) ?? []
    const passingGrade = (config.passingGrade as number) ?? 60

    let total = 0

    for (const comp of components) {
      const grade = enrollment.grades.find(g => g.component === comp.component)
      const score = grade ? Number(grade.score) : 0

      total += score * (comp.weight / 100)
    }

    finalGrade = Math.round(total * 100) / 100
    passed = finalGrade >= passingGrade
  } else if (evaluationType === 'attendance_threshold') {
    // Verificar asistencia por nivel/pilar.
    // Cada cohorte corresponde a UN solo nivel (pilar). Cuando el estudiante termina
    // el Pilar 1, se inscribe en una nueva cohorte para el Pilar 2. Por tanto,
    // filtrar sesiones por cohortId ya equivale a filtrar por nivel/pilar —
    // no existe bug de conteo global; el límite maxAbsencesPerLevel aplica
    // correctamente sobre la cohorte (pilar) que se está evaluando.
    const maxAbsencesPerLevel = (config.maxAbsencesPerLevel as number) ?? 2

    // Obtener todas las sesiones completadas de esta cohorte (= este pilar)
    const sessions = await prisma.iLSession.findMany({
      where: { cohortId: enrollment.cohortId, status: 'completed' }
    })

    const totalSessions = sessions.length
    const presentCount = enrollment.attendance.filter(a => a.present).length
    const absences = totalSessions - presentCount

    passed = absences <= maxAbsencesPerLevel
    finalGrade = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : null
  } else {
    // Default: pass_fail — requiere que todos los componentes estén aprobados
    const passingGrade = (config.passingGrade as number) ?? 60

    if (enrollment.grades.length > 0) {
      const avgScore = enrollment.grades.reduce((sum, g) => sum + Number(g.score), 0) / enrollment.grades.length

      finalGrade = Math.round(avgScore * 100) / 100
      passed = finalGrade >= passingGrade
    }
  }

  // Actualizar enrollment
  const newStatus = passed ? 'completed' : 'failed'

  await prisma.iLEnrollment.update({
    where: { id: enrollmentId },
    data: {
      finalGrade: finalGrade ?? undefined,
      passed,
      completedAt: new Date(),
      status: newStatus
    }
  })

  // Si aprobó: generar badge de nivel
  if (passed) {
    const levelId = enrollment.cohort.levelId
    const courseId = course.id
    const userId = enrollment.userId

    // Badge de nivel
    await prisma.iLBadge.upsert({
      where: {
        userId_badgeType_courseId_levelId: {
          userId,
          badgeType: 'level_completed',
          courseId,
          levelId
        }
      },
      update: {},
      create: {
        userId,
        badgeType: 'level_completed',
        courseId,
        levelId
      }
    })

    // Verificar si todos los niveles del curso están aprobados
    const courseLevels = await prisma.iLLevel.findMany({
      where: { courseId, isActive: true },
      select: { id: true }
    })

    const levelBadges = await prisma.iLBadge.findMany({
      where: {
        userId,
        badgeType: 'level_completed',
        courseId
      },
      select: { levelId: true }
    })

    const completedLevelIds = new Set(levelBadges.map(b => b.levelId))
    const allLevelsCompleted = courseLevels.every(l => completedLevelIds.has(l.id))

    if (allLevelsCompleted) {
      // course_completed badge has no levelId (null) — use findFirst+create pattern
      const existingCourseBadge = await prisma.iLBadge.findFirst({
        where: { userId, badgeType: 'course_completed', courseId, levelId: null }
      })

      if (!existingCourseBadge) {
        await prisma.iLBadge.create({
          data: {
            userId,
            badgeType: 'course_completed',
            courseId,
            levelId: null
          }
        })
      }
    }
  }

  return { passed, finalGrade }
}

// =================== COMPLETAR SESIÓN / COHORTE ===================

export async function completeSession(sessionId: string): Promise<void> {
  await requireInstituteTag('maestro')

  await prisma.iLSession.update({
    where: { id: sessionId },
    data: { status: 'completed' }
  })
}

export async function completeCohort(cohortId: string): Promise<void> {
  await requirePermission('instituto', 'gestionar')

  // Obtener todos los enrollments activos/aprobados
  const enrollments = await prisma.iLEnrollment.findMany({
    where: {
      cohortId,
      status: { in: ['approved', 'active'] }
    },
    select: { id: true }
  })

  // Calcular resultado para cada enrollment
  await Promise.all(enrollments.map(e => computeEnrollmentResult(e.id)))

  // Marcar la cohorte como completada
  await prisma.iLCohort.update({
    where: { id: cohortId },
    data: { status: 'completed' }
  })
}

// =================== TAGS ===================

export async function assignTag(
  userId: string,
  tag: 'coordinador' | 'maestro' | 'estudiante'
): Promise<void> {
  const session = await requirePermission('instituto', 'gestionar')

  await prisma.iLUserTag.upsert({
    where: { userId_tag: { userId, tag } },
    update: { isActive: true, assignedById: session.user.id, assignedAt: new Date() },
    create: {
      userId,
      tag,
      assignedById: session.user.id,
      isActive: true
    }
  })
}

export async function revokeTag(
  userId: string,
  tag: 'coordinador' | 'maestro' | 'estudiante'
): Promise<void> {
  await requirePermission('instituto', 'gestionar')

  await prisma.iLUserTag.updateMany({
    where: { userId, tag },
    data: { isActive: false }
  })
}

export async function getUserTags(userId: string): Promise<string[]> {
  await requirePermission('instituto', 'ver')

  const tags = await prisma.iLUserTag.findMany({
    where: { userId, isActive: true },
    select: { tag: true }
  })

  return tags.map(t => t.tag)
}

// =================== DASHBOARD STATS ===================

export async function getInstitutoDashboardStats() {
  const session = await requirePermission('instituto', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const now = new Date()

  const [
    totalCourses,
    activeCohorts,
    enrollmentStats,
    upcomingCohorts,
    distinctStudents
  ] = await Promise.all([
    prisma.iLCourse.count({ where: { organizationId, isActive: true } }),
    prisma.iLCohort.count({ where: { organizationId, status: 'active' } }),
    prisma.iLEnrollment.groupBy({
      by: ['status'],
      where: {
        cohort: { organizationId }
      },
      _count: { id: true }
    }),
    prisma.iLCohort.findMany({
      where: {
        organizationId,
        status: 'upcoming',
        startDate: { gte: now }
      },
      include: {
        level: {
          select: {
            name: true,
            course: { select: { name: true } }
          }
        },
        teacher: {
          select: { id: true, name: true, firstName: true, lastName: true }
        },
        _count: { select: { enrollments: true } }
      },
      orderBy: { startDate: 'asc' },
      take: 5
    }),
    prisma.iLEnrollment.groupBy({
      by: ['userId'],
      where: { cohort: { organizationId } }
    })
  ])

  const statusCounts = Object.fromEntries(enrollmentStats.map(s => [s.status, s._count.id]))

  return {
    totalCourses,
    activeCohorts,
    totalEnrollments: Object.values(statusCounts).reduce((a, b) => a + b, 0),
    approvedEnrollments: (statusCounts['approved'] ?? 0) + (statusCounts['active'] ?? 0),
    completedEnrollments: statusCounts['completed'] ?? 0,
    failedEnrollments: statusCounts['failed'] ?? 0,
    totalStudents: distinctStudents.length,
    upcomingCohorts
  }
}

// =================== PERFIL DE USUARIO ===================

export async function getUserInstituteProfile(userId: string): Promise<{
  tags: string[]
  activeEnrollment: EnrollmentWithDetails | null
  completedEnrollments: EnrollmentWithDetails[]
  badges: {
    id: string
    badgeType: string
    courseId: string
    courseName: string
    levelId: string | null
    levelName: string | null
    earnedAt: Date
  }[]
}> {
  await requirePermission('instituto', 'ver')

  const [tags, enrollments, badges] = await Promise.all([
    prisma.iLUserTag.findMany({
      where: { userId, isActive: true },
      select: { tag: true }
    }),
    prisma.iLEnrollment.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            email: true
          }
        },
        cohort: {
          select: {
            id: true,
            name: true,
            level: {
              select: {
                name: true,
                course: { select: { name: true } }
              }
            }
          }
        },
        approvedBy: { select: { name: true } }
      },
      orderBy: { enrolledAt: 'desc' }
    }),
    prisma.iLBadge.findMany({
      where: { userId },
      include: {
        course: { select: { name: true } },
        level: { select: { name: true } }
      },
      orderBy: { earnedAt: 'desc' }
    })
  ])

  const mapEnrollment = (e: (typeof enrollments)[0]): EnrollmentWithDetails => ({
    ...e,
    finalGrade: e.finalGrade ? Number(e.finalGrade) : null
  })

  const activeStatuses = ['pending', 'approved', 'active']
  const activeEnrollment = enrollments.find(e => activeStatuses.includes(e.status))
  const completedEnrollments = enrollments.filter(e => e.status === 'completed' || e.status === 'failed')

  return {
    tags: tags.map(t => t.tag),
    activeEnrollment: activeEnrollment ? mapEnrollment(activeEnrollment) : null,
    completedEnrollments: completedEnrollments.map(mapEnrollment),
    badges: badges.map(b => ({
      id: b.id,
      badgeType: b.badgeType,
      courseId: b.courseId,
      courseName: b.course.name,
      levelId: b.levelId,
      levelName: b.level?.name ?? null,
      earnedAt: b.earnedAt
    }))
  }
}

// =================== USUARIOS CON TAG MAESTRO ===================

export async function getTeacherUsers(): Promise<
  {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
  }[]
> {
  const session = await requirePermission('instituto', 'crear')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  // Obtener IDs de usuarios con tag maestro activo
  const teacherTags = await prisma.iLUserTag.findMany({
    where: { tag: 'maestro', isActive: true },
    select: { userId: true }
  })

  const teacherIds = new Set(teacherTags.map(t => t.userId))

  // Obtener usuarios con tag maestro o con jerarquía de admin (hierarchy <= 2)
  const users = await prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      OR: [
        { id: { in: Array.from(teacherIds) } },
        { userRole: { hierarchy: { lte: 2 } } }
      ]
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      image: true
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { name: 'asc' }]
  })

  return users
}
