'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/libs/prisma'
import { requireAdmin, getCurrentUserWithRoles } from '@/libs/permissions-server'
import { getEffectiveRoles, type EffectiveRole } from '@/libs/permissions'
import type { SystemRole } from '@prisma/client'

/**
 * Asignar roles base a un usuario
 */
export async function assignRoles(userId: string, roles: SystemRole[]) {
  await requireAdmin()

  // Validar que los roles sean válidos
  const validRoles: SystemRole[] = ['admin', 'pastor', 'member']
  const filteredRoles = roles.filter(r => validRoles.includes(r))

  if (filteredRoles.length === 0) {
    filteredRoles.push('member')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roles: filteredRoles }
  })

  revalidatePath('/admin/usuarios')
  revalidatePath(`/admin/usuarios/${userId}`)
}

/**
 * Agregar un rol a un usuario
 */
export async function addRole(userId: string, role: SystemRole) {
  await requireAdmin()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true }
  })

  if (!user) throw new Error('Usuario no encontrado')

  // Verificar si ya tiene el rol
  if (user.roles.includes(role)) {
    throw new Error('El usuario ya tiene este rol')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roles: [...user.roles, role] }
  })

  revalidatePath('/admin/usuarios')
  revalidatePath(`/admin/usuarios/${userId}`)
}

/**
 * Remover un rol de un usuario
 */
export async function removeRole(userId: string, role: SystemRole) {
  await requireAdmin()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true }
  })

  if (!user) throw new Error('Usuario no encontrado')

  // No permitir quedarse sin roles
  const newRoles = user.roles.filter(r => r !== role)

  if (newRoles.length === 0) {
    newRoles.push('member')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roles: newRoles }
  })

  revalidatePath('/admin/usuarios')
  revalidatePath(`/admin/usuarios/${userId}`)
}

/**
 * Promover a líder de red
 */
export async function promoteToNetworkLeader(userId: string, networkId: string) {
  await requireAdmin()

  // Verificar que el usuario no sea ya líder de otra red
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { networkId: true, networkRole: true }
  })

  if (user?.networkRole === 'leader' && user.networkId !== networkId) {
    throw new Error('El usuario ya es líder de otra red')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { networkId, networkRole: 'leader' }
  })

  revalidatePath('/admin/redes')
  revalidatePath('/admin/usuarios')
}

/**
 * Remover de líder de red (mantener como miembro)
 */
export async function removeNetworkLeader(userId: string) {
  await requireAdmin()

  await prisma.user.update({
    where: { id: userId },
    data: { networkRole: 'member' }
  })

  revalidatePath('/admin/redes')
  revalidatePath('/admin/usuarios')
}

/**
 * Promover a líder de grupo
 */
export async function promoteToGroupLeader(userId: string, groupId: string) {
  await requireAdmin()

  // Verificar si ya es líder
  const existing = await prisma.groupLeader.findUnique({
    where: { groupId_userId: { groupId, userId } }
  })

  if (existing) {
    throw new Error('El usuario ya es líder de este grupo')
  }

  await prisma.groupLeader.create({
    data: { userId, groupId }
  })

  revalidatePath('/admin/grupos')
  revalidatePath('/admin/usuarios')
}

/**
 * Remover de líder de grupo
 */
export async function removeFromGroupLeader(userId: string, groupId: string) {
  await requireAdmin()

  await prisma.groupLeader.delete({
    where: { groupId_userId: { groupId, userId } }
  })

  revalidatePath('/admin/grupos')
  revalidatePath('/admin/usuarios')
}

/**
 * Obtener resumen de roles de un usuario
 */
export async function getUserRoleSummary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      network: { select: { id: true, name: true } },
      groupLeaderships: {
        include: {
          group: { select: { id: true, name: true } }
        }
      },
      ledServiceAreas: {
        include: {
          serviceArea: { select: { id: true, name: true, color: true, icon: true } }
        }
      },
      volunteerAreas: {
        where: { isActive: true },
        include: {
          serviceArea: { select: { id: true, name: true, color: true, icon: true } }
        }
      }
    }
  })

  if (!user) return null

  // Calcular roles efectivos
  const effectiveRoles = getEffectiveRoles({
    id: user.id,
    roles: user.roles,
    networkId: user.networkId,
    networkRole: user.networkRole,
    ledGroups: user.groupLeaderships.map(g => ({ groupId: g.groupId })),
    ledServiceAreas: user.ledServiceAreas.map(a => ({ serviceAreaId: a.serviceAreaId })),
    volunteerAreas: user.volunteerAreas.map(a => ({ serviceAreaId: a.serviceAreaId, isActive: a.isActive }))
  })

  return {
    user,
    effectiveRoles,
    summary: {
      baseRoles: user.roles,
      isNetworkLeader: user.networkRole === 'leader',
      network: user.network,
      groupsLed: user.groupLeaderships.map(g => g.group),
      areasLed: user.ledServiceAreas.map(a => a.serviceArea),
      volunteerIn: user.volunteerAreas.map(a => a.serviceArea)
    }
  }
}

/**
 * Obtener todos los usuarios con sus roles efectivos
 */
export async function getAllUsersWithRoles() {
  await requireAdmin()

  const currentUser = await getCurrentUserWithRoles()

  if (!currentUser?.organizationId) throw new Error('No autenticado')

  const users = await prisma.user.findMany({
    where: { organizationId: currentUser.organizationId },
    include: {
      network: { select: { id: true, name: true } },
      groupLeaderships: {
        include: {
          group: { select: { id: true, name: true } }
        }
      },
      ledServiceAreas: {
        include: {
          serviceArea: { select: { id: true, name: true } }
        }
      },
      volunteerAreas: {
        where: { isActive: true },
        include: {
          serviceArea: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return users.map(user => {
    const effectiveRoles = getEffectiveRoles({
      id: user.id,
      roles: user.roles,
      networkId: user.networkId,
      networkRole: user.networkRole,
      ledGroups: user.groupLeaderships.map(g => ({ groupId: g.groupId })),
      ledServiceAreas: user.ledServiceAreas.map(a => ({ serviceAreaId: a.serviceAreaId })),
      volunteerAreas: user.volunteerAreas.map(a => ({ serviceAreaId: a.serviceAreaId, isActive: a.isActive }))
    })

    return {
      ...user,
      effectiveRoles
    }
  })
}

/**
 * Obtener estadísticas de roles
 */
export async function getRoleStats() {
  await requireAdmin()

  const currentUser = await getCurrentUserWithRoles()

  if (!currentUser?.organizationId) throw new Error('No autenticado')

  const [totalUsers, admins, pastors, networkLeaders, groupLeaders, areaLeaders, volunteers] = await Promise.all([
    prisma.user.count({ where: { organizationId: currentUser.organizationId, isActive: true } }),
    prisma.user.count({
      where: { organizationId: currentUser.organizationId, isActive: true, roles: { has: 'admin' } }
    }),
    prisma.user.count({
      where: { organizationId: currentUser.organizationId, isActive: true, roles: { has: 'pastor' } }
    }),
    prisma.user.count({
      where: { organizationId: currentUser.organizationId, isActive: true, networkRole: 'leader' }
    }),
    prisma.groupLeader.count({
      where: { user: { organizationId: currentUser.organizationId, isActive: true } }
    }),
    prisma.serviceAreaLeader.count({
      where: { user: { organizationId: currentUser.organizationId, isActive: true } }
    }),
    prisma.volunteerAssignment.count({
      where: { isActive: true, user: { organizationId: currentUser.organizationId, isActive: true } }
    })
  ])

  return {
    totalUsers,
    admins,
    pastors,
    networkLeaders,
    groupLeaders,
    areaLeaders,
    volunteers,
    members: totalUsers - admins - pastors // Aproximado
  }
}
