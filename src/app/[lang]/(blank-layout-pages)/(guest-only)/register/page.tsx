// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Register from '@views/Register'

export const metadata: Metadata = {
  title: 'Registro',
  description: 'Crea una cuenta en Noah'
}

const RegisterPage = () => {
  return <Register />
}

export default RegisterPage
