// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Register from '@views/Register'
import BlankLayout from '@layouts/BlankLayout'

// HOC Imports
import GuestOnlyRoute from '@/hocs/GuestOnlyRoute'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Crear Cuenta - Casa del Rey',
  description: 'Crea tu cuenta para acceder a Casa del Rey'
}

const RegisterPage = async () => {
  const systemMode = await getSystemMode()

  return (
    <GuestOnlyRoute>
      <BlankLayout systemMode={systemMode}>
        <Register />
      </BlankLayout>
    </GuestOnlyRoute>
  )
}

export default RegisterPage
