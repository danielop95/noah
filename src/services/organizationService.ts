import prisma from '@/libs/prisma'

// Tipos para branding del tenant
export type TenantColors = {
  primary: string
  secondary?: string
}

export type TenantBranding = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  colors: TenantColors | null
}

/**
 * Busca una organización por su slug (subdominio).
 * Retorna null si no se encuentra.
 */
export const getOrganizationBySlug = async (slug: string) => {
  if (!slug) return null

  return prisma.organization.findUnique({
    where: { slug }
  })
}

/**
 * Busca una organización por su ID.
 * Retorna null si no se encuentra.
 */
export const getOrganizationById = async (id: string) => {
  if (!id) return null

  return prisma.organization.findUnique({
    where: { id }
  })
}
