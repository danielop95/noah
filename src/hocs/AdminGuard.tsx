// Third-party Imports
import { getServerSession } from 'next-auth'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'
import NotAuthorized from '@/views/NotAuthorized'

// Lib Imports
import { authOptions } from '@/libs/auth'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export default async function AdminGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return <AuthRedirect lang={locale} />
  }

  if (session.user.role !== 'admin') {
    const mode = await getServerMode()

    return <NotAuthorized mode={mode} />
  }

  return <>{children}</>
}
