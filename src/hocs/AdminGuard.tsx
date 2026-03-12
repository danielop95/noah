// Third-party Imports
import { getServerSession } from 'next-auth'

// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'
import NotAuthorized from '@/views/NotAuthorized'

// Lib Imports
import { authOptions } from '@/libs/auth'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export default async function AdminGuard({ children }: ChildrenType) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return <AuthRedirect />
  }

  if ((session.user.roleHierarchy ?? 999) > 1) {
    const mode = await getServerMode()

    return <NotAuthorized mode={mode} />
  }

  return <>{children}</>
}
