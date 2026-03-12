import prisma from '@/libs/prisma'

/**
 * Retorna la única organización configurada (Casa del Rey).
 * Usado en lugar de la detección por subdomain del modelo multi-tenant anterior.
 */
export async function getSingleOrganization() {
  const org = await prisma.organization.findFirst()

  if (!org) throw new Error('Organization not configured. Run the seed script first.')

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    logoUrl: org.logoUrl,
    colors: org.colors as { primary: string; secondary?: string } | null
  }
}
