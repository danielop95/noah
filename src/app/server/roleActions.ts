'use server'

import prisma from '@/libs/prisma'
import { requirePermission, requireOrganizationId } from './helpers'

// ==================
// Types
// ==================

export type PermissionData = {
  id: string
  module: string
  action: string
  description: string
}

export type RoleWithPermissions = {
  id: string
  name: string
  slug: string
  description: string | null
  hierarchy: number
  isSystem: boolean
  isActive: boolean
  createdAt: Date
  _count: { users: number }
  permissions: Array<{
    permission: PermissionData
  }>
}

export type RoleListItem = {
  id: string
  name: string
  slug: string
  description: string | null
  hierarchy: number
  isSystem: boolean
  isActive: boolean
  createdAt: Date
  _count: { users: number; permissions: number }
}

// ==================
// Queries
// ==================

/**
 * Obtener todos los roles de la organización
 */
export async function getAllRoles(): Promise<RoleListItem[]> {
  const session = await requirePermission('roles', 'ver')
  const orgId = await requireOrganizationId(session.user.id)

  const roles = await prisma.role.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { users: true, permissions: true } }
    },
    orderBy: { hierarchy: 'asc' }
  })

  return roles
}

/**
 * Obtener un rol por ID con sus permisos
 */
export async function getRoleById(roleId: string): Promise<RoleWithPermissions | null> {
  const session = await requirePermission('roles', 'ver')
  const orgId = await requireOrganizationId(session.user.id)

  const role = await prisma.role.findFirst({
    where: { id: roleId, organizationId: orgId },
    include: {
      permissions: {
        include: { permission: true }
      },
      _count: { select: { users: true } }
    }
  })

  return role
}

/**
 * Obtener todos los permisos disponibles
 */
export async function getAllPermissions(): Promise<PermissionData[]> {
  await requirePermission('roles', 'ver')

  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }]
  })

  return permissions
}

// ==================
// Mutations
// ==================

/**
 * Crear un nuevo rol
 */
export async function createRole(data: {
  name: string
  slug: string
  description?: string
  hierarchy: number
  permissionIds: string[]
}): Promise<{ id: string }> {
  const session = await requirePermission('roles', 'crear')
  const orgId = await requireOrganizationId(session.user.id)

  // Validar que la jerarquía sea mayor que la del usuario actual
  const userHierarchy = session.user.roleHierarchy ?? 999

  if (data.hierarchy <= userHierarchy) {
    throw new Error('No puedes crear un rol con jerarquía mayor o igual a la tuya')
  }

  // Validar slug único
  const existingSlug = await prisma.role.findUnique({ where: { slug: data.slug } })

  if (existingSlug) {
    throw new Error('Ya existe un rol con ese identificador')
  }

  const role = await prisma.role.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      hierarchy: data.hierarchy,
      organizationId: orgId,
      permissions: {
        create: data.permissionIds.map(permissionId => ({ permissionId }))
      }
    }
  })

  return { id: role.id }
}

/**
 * Actualizar un rol existente
 */
export async function updateRole(
  roleId: string,
  data: {
    name?: string
    description?: string
    hierarchy?: number
    isActive?: boolean
    permissionIds?: string[]
  }
): Promise<void> {
  const session = await requirePermission('roles', 'editar')
  const orgId = await requireOrganizationId(session.user.id)

  const role = await prisma.role.findFirst({
    where: { id: roleId, organizationId: orgId }
  })

  if (!role) throw new Error('Rol no encontrado')

  // No se puede editar la jerarquía de roles del sistema
  if (role.isSystem && data.hierarchy !== undefined && data.hierarchy !== role.hierarchy) {
    throw new Error('No se puede cambiar la jerarquía de un rol del sistema')
  }

  // Validar jerarquía
  const userHierarchy = session.user.roleHierarchy ?? 999

  if (role.hierarchy <= userHierarchy) {
    throw new Error('No puedes editar un rol con jerarquía mayor o igual a la tuya')
  }

  if (data.hierarchy !== undefined && data.hierarchy <= userHierarchy) {
    throw new Error('No puedes asignar una jerarquía mayor o igual a la tuya')
  }

  await prisma.$transaction(async tx => {
    // Actualizar datos del rol
    await tx.role.update({
      where: { id: roleId },
      data: {
        name: data.name,
        description: data.description,
        hierarchy: data.hierarchy,
        isActive: data.isActive
      }
    })

    // Si se envían permisos, reemplazar todos
    if (data.permissionIds !== undefined) {
      await tx.rolePermission.deleteMany({ where: { roleId } })

      if (data.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: data.permissionIds.map(permissionId => ({ roleId, permissionId }))
        })
      }
    }
  })
}

/**
 * Eliminar un rol
 */
export async function deleteRole(roleId: string): Promise<void> {
  const session = await requirePermission('roles', 'eliminar')
  const orgId = await requireOrganizationId(session.user.id)

  const role = await prisma.role.findFirst({
    where: { id: roleId, organizationId: orgId },
    include: { _count: { select: { users: true } } }
  })

  if (!role) throw new Error('Rol no encontrado')

  if (role.isSystem) {
    throw new Error('No se puede eliminar un rol del sistema')
  }

  const userHierarchy = session.user.roleHierarchy ?? 999

  if (role.hierarchy <= userHierarchy) {
    throw new Error('No puedes eliminar un rol con jerarquía mayor o igual a la tuya')
  }

  if (role._count.users > 0) {
    throw new Error(`No se puede eliminar: hay ${role._count.users} usuarios con este rol. Reasígnalos primero.`)
  }

  await prisma.role.delete({ where: { id: roleId } })
}

/**
 * Obtener roles disponibles para asignar a usuarios
 * Solo muestra roles con jerarquía menor (número mayor) que la del usuario actual
 */
export async function getRolesForAssignment(): Promise<Array<{ id: string; name: string; slug: string; hierarchy: number }>> {
  const session = await requirePermission('usuarios', 'editar')
  const orgId = await requireOrganizationId(session.user.id)
  const userHierarchy = session.user.roleHierarchy ?? 999

  const roles = await prisma.role.findMany({
    where: {
      organizationId: orgId,
      isActive: true,
      hierarchy: { gt: userHierarchy }
    },
    select: { id: true, name: true, slug: true, hierarchy: true },
    orderBy: { hierarchy: 'asc' }
  })

  return roles
}
