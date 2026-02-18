import type { SystemRole } from '@prisma/client'

// Tipos de roles efectivos (calculados desde relaciones)
export type EffectiveRole =
  | 'admin'
  | 'pastor'
  | 'network_leader'
  | 'group_leader'
  | 'area_leader'
  | 'volunteer'
  | 'member'

// Niveles de jerarquía (para herencia)
export const ROLE_LEVELS: Record<EffectiveRole, number> = {
  admin: 100,
  pastor: 80,
  network_leader: 60,
  group_leader: 40,
  area_leader: 40,
  volunteer: 20,
  member: 10
}

// Tipo de usuario con todas las relaciones necesarias para calcular roles
export type UserWithRoles = {
  id: string
  roles: SystemRole[]
  networkId?: string | null
  networkRole?: string | null
  organizationId?: string | null
  ledGroups?: { groupId: string }[]
  ledServiceAreas?: { serviceAreaId: string }[]
  volunteerAreas?: { serviceAreaId: string; isActive: boolean }[]
}

// Permisos del sistema
export type Permission =
  // Usuarios
  | 'users:read:all'
  | 'users:read:network'
  | 'users:read:group'
  | 'users:read:area'
  | 'users:create'
  | 'users:update:all'
  | 'users:update:own'
  | 'users:delete'
  | 'users:assign_roles'
  // Redes
  | 'networks:read:all'
  | 'networks:read:own'
  | 'networks:create'
  | 'networks:update:all'
  | 'networks:update:own'
  | 'networks:delete'
  // Grupos
  | 'groups:read:all'
  | 'groups:read:network'
  | 'groups:read:own'
  | 'groups:create:any'
  | 'groups:create:network'
  | 'groups:update:all'
  | 'groups:update:own'
  | 'groups:delete'
  // Calendario
  | 'calendar:read:public'
  | 'calendar:read:leaders'
  | 'calendar:read:admin'
  | 'calendar:read:area'
  | 'calendar:create:any'
  | 'calendar:create:area'
  | 'calendar:update:all'
  | 'calendar:update:area'
  | 'calendar:delete'
  // Reportes
  | 'reports:read:all'
  | 'reports:read:network'
  | 'reports:read:group'
  | 'reports:create'
  | 'reports:update:own'
  | 'reports:delete:own'
  | 'reports:delete:all'
  // Áreas de servicio
  | 'areas:read:all'
  | 'areas:read:own'
  | 'areas:create'
  | 'areas:update'
  | 'areas:delete'
  | 'areas:assign_volunteers'
  // Configuración
  | 'config:read'
  | 'config:update'

// Contexto para permisos contextuales
export type PermissionContext = {
  networkId?: string
  groupId?: string
  areaId?: string
  resourceOwnerId?: string
}

/**
 * Calcula los roles efectivos de un usuario basándose en sus asignaciones
 */
export function getEffectiveRoles(user: UserWithRoles): EffectiveRole[] {
  const roles: EffectiveRole[] = []

  // Roles base del enum
  if (user.roles.includes('admin')) roles.push('admin')
  if (user.roles.includes('pastor')) roles.push('pastor')

  // Roles contextuales basados en relaciones
  if (user.networkRole === 'leader' && user.networkId) {
    roles.push('network_leader')
  }

  if (user.ledGroups && user.ledGroups.length > 0) {
    roles.push('group_leader')
  }

  if (user.ledServiceAreas && user.ledServiceAreas.length > 0) {
    roles.push('area_leader')
  }

  if (user.volunteerAreas && user.volunteerAreas.some(v => v.isActive)) {
    roles.push('volunteer')
  }

  // Siempre tiene member como base
  if (roles.length === 0) roles.push('member')

  return roles
}

/**
 * Obtiene el nivel más alto del usuario
 */
export function getHighestRoleLevel(user: UserWithRoles): number {
  const roles = getEffectiveRoles(user)

  return Math.max(...roles.map(r => ROLE_LEVELS[r]))
}

/**
 * Verifica si el usuario tiene al menos uno de los roles especificados
 */
export function hasRole(user: UserWithRoles, ...requiredRoles: EffectiveRole[]): boolean {
  const userRoles = getEffectiveRoles(user)

  return requiredRoles.some(r => userRoles.includes(r))
}

/**
 * Verifica si un usuario tiene un nivel de rol mínimo
 */
export function hasMinimumRole(user: UserWithRoles, minimumRole: EffectiveRole): boolean {
  return getHighestRoleLevel(user) >= ROLE_LEVELS[minimumRole]
}

/**
 * Verifica si el usuario es admin
 */
export function isAdmin(user: UserWithRoles): boolean {
  return user.roles.includes('admin')
}

/**
 * Verifica si el usuario tiene un permiso específico
 */
export function hasPermission(
  user: UserWithRoles,
  permission: Permission,
  context?: PermissionContext
): boolean {
  const roles = getEffectiveRoles(user)
  const level = getHighestRoleLevel(user)

  // Admin tiene todos los permisos
  if (roles.includes('admin')) return true

  // Mapeo de permisos
  const permissionMap: Record<Permission, (u: UserWithRoles, ctx?: PermissionContext) => boolean> = {
    // === USUARIOS ===
    'users:read:all': () => level >= ROLE_LEVELS.pastor,
    'users:read:network': (u, ctx) => {
      if (level >= ROLE_LEVELS.pastor) return true
      if (roles.includes('network_leader') && ctx?.networkId === u.networkId) return true

      return false
    },
    'users:read:group': (u, ctx) => {
      if (level >= ROLE_LEVELS.network_leader) return true
      if (roles.includes('group_leader') && u.ledGroups?.some(g => g.groupId === ctx?.groupId)) return true

      return false
    },
    'users:read:area': (u, ctx) => {
      if (level >= ROLE_LEVELS.pastor) return true
      if (roles.includes('area_leader') && u.ledServiceAreas?.some(a => a.serviceAreaId === ctx?.areaId)) return true
      if (roles.includes('volunteer') && u.volunteerAreas?.some(a => a.serviceAreaId === ctx?.areaId && a.isActive))
        return true

      return false
    },
    'users:create': () => level >= ROLE_LEVELS.admin,
    'users:update:all': () => level >= ROLE_LEVELS.admin,
    'users:update:own': () => true, // Todos pueden editar su perfil
    'users:delete': () => level >= ROLE_LEVELS.admin,
    'users:assign_roles': () => level >= ROLE_LEVELS.admin,

    // === REDES ===
    'networks:read:all': () => level >= ROLE_LEVELS.pastor,
    'networks:read:own': (u, ctx) => {
      if (level >= ROLE_LEVELS.pastor) return true

      return u.networkId === ctx?.networkId
    },
    'networks:create': () => level >= ROLE_LEVELS.admin,
    'networks:update:all': () => level >= ROLE_LEVELS.admin,
    'networks:update:own': (u, ctx) => {
      if (level >= ROLE_LEVELS.admin) return true

      return roles.includes('network_leader') && u.networkId === ctx?.networkId
    },
    'networks:delete': () => level >= ROLE_LEVELS.admin,

    // === GRUPOS ===
    'groups:read:all': () => level >= ROLE_LEVELS.pastor,
    'groups:read:network': (u, ctx) => {
      if (level >= ROLE_LEVELS.pastor) return true

      return roles.includes('network_leader') && u.networkId === ctx?.networkId
    },
    'groups:read:own': (u, ctx) => {
      if (level >= ROLE_LEVELS.network_leader) return true

      return roles.includes('group_leader') && (u.ledGroups?.some(g => g.groupId === ctx?.groupId) ?? false)
    },
    'groups:create:any': () => level >= ROLE_LEVELS.admin,
    'groups:create:network': u => {
      if (level >= ROLE_LEVELS.admin) return true

      return roles.includes('network_leader') && !!u.networkId
    },
    'groups:update:all': () => level >= ROLE_LEVELS.admin,
    'groups:update:own': (u, ctx) => {
      if (level >= ROLE_LEVELS.admin) return true
      if (roles.includes('network_leader') && u.networkId === ctx?.networkId) return true

      return roles.includes('group_leader') && (u.ledGroups?.some(g => g.groupId === ctx?.groupId) ?? false)
    },
    'groups:delete': () => level >= ROLE_LEVELS.admin,

    // === CALENDARIO ===
    'calendar:read:public': () => true,
    'calendar:read:leaders': () => level >= ROLE_LEVELS.volunteer,
    'calendar:read:admin': () => level >= ROLE_LEVELS.pastor,
    'calendar:read:area': (u, ctx) => {
      if (level >= ROLE_LEVELS.pastor) return true
      const areaIds = [
        ...(u.ledServiceAreas?.map(a => a.serviceAreaId) || []),
        ...(u.volunteerAreas?.filter(a => a.isActive).map(a => a.serviceAreaId) || [])
      ]

      return areaIds.includes(ctx?.areaId || '')
    },
    'calendar:create:any': () => level >= ROLE_LEVELS.admin,
    'calendar:create:area': (u, ctx) => {
      if (level >= ROLE_LEVELS.admin) return true

      return roles.includes('area_leader') && (u.ledServiceAreas?.some(a => a.serviceAreaId === ctx?.areaId) ?? false)
    },
    'calendar:update:all': () => level >= ROLE_LEVELS.admin,
    'calendar:update:area': (u, ctx) => {
      if (level >= ROLE_LEVELS.admin) return true

      return roles.includes('area_leader') && (u.ledServiceAreas?.some(a => a.serviceAreaId === ctx?.areaId) ?? false)
    },
    'calendar:delete': () => level >= ROLE_LEVELS.admin,

    // === REPORTES ===
    'reports:read:all': () => level >= ROLE_LEVELS.pastor,
    'reports:read:network': (u, ctx) => {
      if (level >= ROLE_LEVELS.pastor) return true

      return roles.includes('network_leader') && u.networkId === ctx?.networkId
    },
    'reports:read:group': (u, ctx) => {
      if (level >= ROLE_LEVELS.network_leader) return true

      return roles.includes('group_leader') && (u.ledGroups?.some(g => g.groupId === ctx?.groupId) ?? false)
    },
    'reports:create': () => level >= ROLE_LEVELS.group_leader,
    'reports:update:own': (u, ctx) => {
      if (level >= ROLE_LEVELS.admin) return true

      return u.id === ctx?.resourceOwnerId
    },
    'reports:delete:own': (u, ctx) => {
      if (level >= ROLE_LEVELS.admin) return true

      return u.id === ctx?.resourceOwnerId
    },
    'reports:delete:all': () => level >= ROLE_LEVELS.admin,

    // === ÁREAS DE SERVICIO ===
    'areas:read:all': () => level >= ROLE_LEVELS.pastor,
    'areas:read:own': (u, ctx) => {
      if (level >= ROLE_LEVELS.pastor) return true
      const areaIds = [
        ...(u.ledServiceAreas?.map(a => a.serviceAreaId) || []),
        ...(u.volunteerAreas?.filter(a => a.isActive).map(a => a.serviceAreaId) || [])
      ]

      return areaIds.includes(ctx?.areaId || '')
    },
    'areas:create': () => level >= ROLE_LEVELS.admin,
    'areas:update': () => level >= ROLE_LEVELS.admin,
    'areas:delete': () => level >= ROLE_LEVELS.admin,
    'areas:assign_volunteers': (u, ctx) => {
      if (level >= ROLE_LEVELS.admin) return true

      return roles.includes('area_leader') && (u.ledServiceAreas?.some(a => a.serviceAreaId === ctx?.areaId) ?? false)
    },

    // === CONFIGURACIÓN ===
    'config:read': () => level >= ROLE_LEVELS.pastor,
    'config:update': () => level >= ROLE_LEVELS.admin
  }

  const checker = permissionMap[permission]

  return checker ? checker(user, context) : false
}

/**
 * Obtiene todos los permisos que tiene un usuario
 */
export function getUserPermissions(user: UserWithRoles): Permission[] {
  const allPermissions: Permission[] = [
    'users:read:all',
    'users:read:network',
    'users:read:group',
    'users:read:area',
    'users:create',
    'users:update:all',
    'users:update:own',
    'users:delete',
    'users:assign_roles',
    'networks:read:all',
    'networks:read:own',
    'networks:create',
    'networks:update:all',
    'networks:update:own',
    'networks:delete',
    'groups:read:all',
    'groups:read:network',
    'groups:read:own',
    'groups:create:any',
    'groups:create:network',
    'groups:update:all',
    'groups:update:own',
    'groups:delete',
    'calendar:read:public',
    'calendar:read:leaders',
    'calendar:read:admin',
    'calendar:read:area',
    'calendar:create:any',
    'calendar:create:area',
    'calendar:update:all',
    'calendar:update:area',
    'calendar:delete',
    'reports:read:all',
    'reports:read:network',
    'reports:read:group',
    'reports:create',
    'reports:update:own',
    'reports:delete:own',
    'reports:delete:all',
    'areas:read:all',
    'areas:read:own',
    'areas:create',
    'areas:update',
    'areas:delete',
    'areas:assign_volunteers',
    'config:read',
    'config:update'
  ]

  return allPermissions.filter(p => hasPermission(user, p))
}
