'use client'

import { useSession } from 'next-auth/react'
import {
  hasPermission,
  hasMinimumRole,
  hasRole,
  isAdmin,
  type Permission,
  type EffectiveRole,
  type UserWithRoles
} from '@/libs/permissions'

type Props = {
  children: React.ReactNode
  /** Permiso requerido */
  permission?: Permission
  /** Rol mínimo requerido */
  minimumRole?: EffectiveRole
  /** Roles permitidos (cualquiera de ellos) */
  roles?: EffectiveRole[]
  /** Solo admins */
  adminOnly?: boolean
  /** Contexto para permisos contextuales */
  context?: {
    networkId?: string
    groupId?: string
    areaId?: string
    resourceOwnerId?: string
  }
  /** Componente a mostrar si no tiene permisos */
  fallback?: React.ReactNode
}

/**
 * Guard de permisos para componentes cliente
 *
 * @example
 * // Solo admin
 * <PermissionGuard adminOnly>
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * @example
 * // Con permiso específico
 * <PermissionGuard permission="users:create">
 *   <CreateUserButton />
 * </PermissionGuard>
 *
 * @example
 * // Con rol mínimo
 * <PermissionGuard minimumRole="network_leader">
 *   <NetworkStats />
 * </PermissionGuard>
 *
 * @example
 * // Con contexto
 * <PermissionGuard permission="groups:update:own" context={{ groupId: group.id }}>
 *   <EditGroupButton />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  minimumRole,
  roles,
  adminOnly,
  context,
  fallback = null
}: Props) {
  const { data: session, status } = useSession()

  // Si está cargando, no mostrar nada
  if (status === 'loading') return null

  // Si no hay sesión, mostrar fallback
  if (!session?.user) return <>{fallback}</>

  // Convertir usuario de sesión a UserWithRoles
  const user: UserWithRoles = {
    id: session.user.id,
    roles: session.user.roles || [],
    networkId: session.user.networkId,
    networkRole: session.user.networkRole,
    organizationId: session.user.organizationId,
    ledGroups: session.user.ledGroups,
    ledServiceAreas: session.user.ledServiceAreas,
    volunteerAreas: session.user.volunteerAreas
  }

  // Verificar adminOnly
  if (adminOnly && !isAdmin(user)) {
    return <>{fallback}</>
  }

  // Verificar permiso específico
  if (permission && !hasPermission(user, permission, context)) {
    return <>{fallback}</>
  }

  // Verificar rol mínimo
  if (minimumRole && !hasMinimumRole(user, minimumRole)) {
    return <>{fallback}</>
  }

  // Verificar roles permitidos
  if (roles && roles.length > 0 && !hasRole(user, ...roles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook para verificar permisos en componentes cliente
 */
export function usePermissions() {
  const { data: session, status } = useSession()

  const user: UserWithRoles | null =
    session?.user
      ? {
          id: session.user.id,
          roles: session.user.roles || [],
          networkId: session.user.networkId,
          networkRole: session.user.networkRole,
          organizationId: session.user.organizationId,
          ledGroups: session.user.ledGroups,
          ledServiceAreas: session.user.ledServiceAreas,
          volunteerAreas: session.user.volunteerAreas
        }
      : null

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    isAdmin: user ? isAdmin(user) : false,
    hasPermission: (permission: Permission, context?: Props['context']) =>
      user ? hasPermission(user, permission, context) : false,
    hasMinimumRole: (role: EffectiveRole) => (user ? hasMinimumRole(user, role) : false),
    hasRole: (...roles: EffectiveRole[]) => (user ? hasRole(user, ...roles) : false)
  }
}

export default PermissionGuard
