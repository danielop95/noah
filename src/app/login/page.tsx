// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Login from '@views/Login'
import BlankLayout from '@layouts/BlankLayout'

// HOC Imports
import GuestOnlyRoute from '@/hocs/GuestOnlyRoute'

// Util Imports
import { getServerMode, getSystemMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Iniciar Sesion - Noah',
  description: 'Inicia sesion en tu cuenta'
}

const LoginPage = async () => {
  const mode = await getServerMode()
  const systemMode = await getSystemMode()

  return (
    <GuestOnlyRoute>
      <BlankLayout systemMode={systemMode}>
        <Login mode={mode} />
      </BlankLayout>
    </GuestOnlyRoute>
  )
}

export default LoginPage
