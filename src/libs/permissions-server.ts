'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'
import {
  hasPermission,
  hasMinimumRole,
  getEffectiveRoles,
  getHighestRoleLevel,
  isAdmin,
  type Permission,
  type EffectiveRole,
  type UserWithRoles,
  type PermissionContext
} from './permissions'

/**
 * Obtiene el usuario actual con todas las relaciones de roles
 */
export async function getCurrentUserWithRoles(): Promise<UserWithRoles | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      roles: true,
      networkId: true,
      networkRole: true,
      organizationId: true,
      groupLeaderships: { select: { groupId: true } },
      ledServiceAreas: { select: { serviceAreaId: true } },
      volunteerAreas: { select: { serviceAreaId: true, isActive: true } }
    }
  })

  if (!user) return null

  // Mapear groupLeaderships a ledGroups para compatibilidad con el tipo
  return {
    ...user,
    ledGroups: user.groupLeaderships
  }
}

/**
 * Verifica permiso en server action
 */
export async function checkPermission(permission: Permission, context?: PermissionContext): Promise<boolean> {
  const user = await getCurrentUserWithRoles()

  if (!user) return false

  return hasPermission(user, permission, context)
}

/**
 * Verifica rol mínimo en server action
 */
export async function checkMinimumRole(minimumRole: EffectiveRole): Promise<boolean> {
  const user = await getCurrentUserWithRoles()

  if (!user) return false

  return hasMinimumRole(user, minimumRole)
}

/**
 * Verifica si el usuario actual es admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const user = await getCurrentUserWithRoles()

  if (!user) return false

  return isAdmin(user)
}

/**
 * Obtiene los roles efectivos del usuario actual
 */
export async function getCurrentUserRoles(): Promise<EffectiveRole[]> {
  const user = await getCurrentUserWithRoles()

  if (!user) return []

  return getEffectiveRoles(user)
}

/**
 * Obtiene el nivel de rol más alto del usuario actual
 */
export async function getCurrentUserLevel(): Promise<number> {
  const user = await getCurrentUserWithRoles()

  if (!user) return 0

  return getHighestRoleLevel(user)
}

/**
 * Helper para server actions: lanza error si no tiene permiso
 */
export async function requirePermission(permission: Permission, context?: PermissionContext): Promise<UserWithRoles> {
  const user = await getCurrentUserWithRoles()

  if (!user) {
    throw new Error('No autenticado')
  }

  if (!hasPermission(user, permission, context)) {
    throw new Error('No tienes permisos para realizar esta acción')
  }

  return user
}

/**
 * Helper para server actions: lanza error si no tiene rol mínimo
 */
export async function requireMinimumRole(minimumRole: EffectiveRole): Promise<UserWithRoles> {
  const user = await getCurrentUserWithRoles()

  if (!user) {
    throw new Error('No autenticado')
  }

  if (!hasMinimumRole(user, minimumRole)) {
    throw new Error(`Se requiere rol de ${minimumRole} o superior`)
  }

  return user
}

/**
 * Helper para server actions: lanza error si no es admin
 */
export async function requireAdmin(): Promise<UserWithRoles> {
  const user = await getCurrentUserWithRoles()

  if (!user) {
    throw new Error('No autenticado')
  }

  if (!isAdmin(user)) {
    throw new Error('Se requieren permisos de administrador')
  }

  return user
}

/**
 * Verifica si el usuario actual puede acceder a recursos de una red específica
 */
export async function canAccessNetwork(networkId: string): Promise<boolean> {
  const user = await getCurrentUserWithRoles()

  if (!user) return false

  // Admin y pastor pueden acceder a todo
  if (isAdmin(user) || user.roles.includes('pastor')) return true

  // Líder de red solo puede acceder a su red
  if (user.networkRole === 'leader' && user.networkId === networkId) return true

  // Miembro de la red puede ver (lectura)
  if (user.networkId === networkId) return true

  return false
}

/**
 * Verifica si el usuario actual puede acceder a recursos de un grupo específico
 */
export async function canAccessGroup(groupId: string): Promise<boolean> {
  const user = await getCurrentUserWithRoles()

  if (!user) return false

  // Admin y pastor pueden acceder a todo
  if (isAdmin(user) || user.roles.includes('pastor')) return true

  // Líder de grupo puede acceder
  if (user.ledGroups?.some(g => g.groupId === groupId)) return true

  return false
}

/**
 * Verifica si el usuario actual puede acceder a recursos de un área de servicio específica
 */
export async function canAccessServiceArea(areaId: string): Promise<boolean> {
  const user = await getCurrentUserWithRoles()

  if (!user) return false

  // Admin y pastor pueden acceder a todo
  if (isAdmin(user) || user.roles.includes('pastor')) return true

  // Líder de área puede acceder
  if (user.ledServiceAreas?.some(a => a.serviceAreaId === areaId)) return true

  // Voluntario activo puede acceder
  if (user.volunteerAreas?.some(a => a.serviceAreaId === areaId && a.isActive)) return true

  return false
}
