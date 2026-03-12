// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Type Imports
import type { ChildrenType } from '@core/types'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Libs
import { authOptions } from '@/libs/auth'

const GuestOnlyRoute = async ({ children }: ChildrenType) => {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect(themeConfig.homePageUrl)
  }

  return <>{children}</>
}

export default GuestOnlyRoute
