'use server'

import { getServerSession } from 'next-auth'

import prisma from '@/libs/prisma'
import { authOptions } from '@/libs/auth'

/**
 * Get current session user or throw error
 */
export async function getSessionUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error('No autorizado: debe iniciar sesión')
  }

  return session.user
}

/**
 * Require authenticated session
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error('No autorizado')
  }

  return session
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    throw new Error('No autorizado: se requiere rol de administrador')
  }

  return session
}

/**
 * Get organization ID for a user
 */
export async function getUserOrganizationId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true }
  })

  return user?.organizationId || null
}

/**
 * Get organization ID for current admin user
 * Alias for getUserOrganizationId for semantic clarity
 */
export const getAdminOrganizationId = getUserOrganizationId

/**
 * Get organization ID for current user or throw
 */
export async function requireOrganizationId(userId: string): Promise<string> {
  const organizationId = await getUserOrganizationId(userId)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  return organizationId
}

/**
 * Check if user is leader of a specific group
 */
export async function isUserGroupLeader(userId: string, groupId: string): Promise<boolean> {
  const leadership = await prisma.groupLeader.findUnique({
    where: { groupId_userId: { groupId, userId } }
  })

  return !!leadership
}
