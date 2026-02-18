// Next Imports
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Libs
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'

const GuestOnlyRoute = async ({ children, lang }: ChildrenType & { lang: Locale }) => {
  const session = await getServerSession(authOptions)

  if (session) {
    const headersList = await headers()
    const currentTenantSlug = headersList.get('x-tenant-slug')
    const host = headersList.get('host') || ''

    // Si el usuario tiene organización, verificar que esté en el subdominio correcto
    if (session.user?.organizationId) {
      const userOrg = await prisma.organization.findUnique({
        where: { id: session.user.organizationId },
        select: { slug: true }
      })

      if (userOrg?.slug && userOrg.slug !== currentTenantSlug) {
        // Usuario no está en su subdominio - redirigir al correcto
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
        const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || host.split('.').slice(-2).join('.')
        const redirectUrl = `${protocol}://${userOrg.slug}.${mainDomain}/${lang}${themeConfig.homePageUrl}`

        redirect(redirectUrl)
      }
    }

    // Usuario está en el subdominio correcto o no tiene organización
    redirect(getLocalizedUrl(themeConfig.homePageUrl, lang))
  }

  return <>{children}</>
}

export default GuestOnlyRoute
