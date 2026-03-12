// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ForgotPassword from '@views/ForgotPassword'
import BlankLayout from '@layouts/BlankLayout'

// HOC Imports
import GuestOnlyRoute from '@/hocs/GuestOnlyRoute'

// Util Imports
import { getServerMode, getSystemMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Recuperar Contrasena - Casa del Rey',
  description: 'Recupera el acceso a tu cuenta'
}

const ForgotPasswordPage = async () => {
  const mode = await getServerMode()
  const systemMode = await getSystemMode()

  return (
    <GuestOnlyRoute>
      <BlankLayout systemMode={systemMode}>
        <ForgotPassword mode={mode} />
      </BlankLayout>
    </GuestOnlyRoute>
  )
}

export default ForgotPasswordPage
