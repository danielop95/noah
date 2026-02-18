'use client'

// Third-party Imports
import { SessionProvider } from 'next-auth/react'
import type { SessionProviderProps } from 'next-auth/react'

// Type Imports
import type { ReactNode } from 'react'

interface NextAuthProviderProps extends Omit<SessionProviderProps, 'children'> {
  children: ReactNode
}

export const NextAuthProvider = ({ children, ...rest }: NextAuthProviderProps) => {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window regains focus
      {...rest}
    >
      {children}
    </SessionProvider>
  )
}
