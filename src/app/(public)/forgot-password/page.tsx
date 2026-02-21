// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ForgotPassword from '@views/ForgotPassword'

// HOC Imports
import GuestOnlyRoute from '@/hocs/GuestOnlyRoute'

// Util Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Recuperar Contrasena - Noah',
  description: 'Recupera el acceso a tu cuenta de Noah'
}

const ForgotPasswordPage = async () => {
  const mode = await getServerMode()

  return (
    <GuestOnlyRoute>
      <ForgotPassword mode={mode} />
    </GuestOnlyRoute>
  )
}

export default ForgotPasswordPage
