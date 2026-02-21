// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import BlankLayout from '@layouts/BlankLayout'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

const PublicLayout = async ({ children }: ChildrenType) => {
  const systemMode = await getSystemMode()

  return <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
}

export default PublicLayout
