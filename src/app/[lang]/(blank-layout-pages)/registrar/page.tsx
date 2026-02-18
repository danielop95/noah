// Next Imports
import type { Metadata } from 'next'

// Component Imports
import RegisterChurch from '@views/RegisterChurch'

export const metadata: Metadata = {
  title: 'Registrar Iglesia - Noah',
  description: 'Registra tu iglesia en Noah y gestiona tu comunidad'
}

const RegisterChurchPage = () => {
  return <RegisterChurch />
}

export default RegisterChurchPage
