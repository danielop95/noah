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

type Props = ChildrenType & {
  /** Maximum hierarchy number allowed (lower = more power). Default: 2 (admin + auxiliar) */
  maxHierarchy?: number
  /** Or check for a specific permission string like "usuarios.ver" */
  permission?: string
}

export default async function PermissionGuard({ children, maxHierarchy = 2, permission }: Props) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return <AuthRedirect />
  }

  const userHierarchy = session.user.roleHierarchy ?? 999
  const permissions = session.user.permissions || []

  // Check by permission string if provided
  if (permission && !permissions.includes(permission)) {
    const mode = await getServerMode()

    return <NotAuthorized mode={mode} />
  }

  // Check by hierarchy
  if (!permission && userHierarchy > maxHierarchy) {
    const mode = await getServerMode()

    return <NotAuthorized mode={mode} />
  }

  return <>{children}</>
}
