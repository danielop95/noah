'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

const AuthRedirect = () => {
  const pathname = usePathname()

  // Si ya estamos en /login, no redirigir en bucle
  if (pathname === '/login') {
    return null
  }

  redirect(`/login?redirectTo=${pathname}`)
}

export default AuthRedirect
