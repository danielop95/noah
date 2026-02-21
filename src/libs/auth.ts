// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'

import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import prisma from '@/libs/prisma'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      organizationId?: string | null
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    role?: string
    organizationId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    organizationId?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(JSON.stringify({ message: ['Email y contraseña son requeridos'] }))
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error(JSON.stringify({ message: ['Email o contraseña inválidos'] }))
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error(JSON.stringify({ message: ['Email o contraseña inválidos'] }))
        }

        if (!user.isActive) {
          throw new Error(JSON.stringify({ message: ['Tu cuenta ha sido desactivada. Contacta al administrador.'] }))
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'user',
          image: user.image,
          organizationId: user.organizationId
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  pages: {
    signIn: '/login'
  },

  // Configuración de cookies para soporte de subdominios
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Permitir cookies en todos los subdominios
        domain: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_MAIN_DOMAIN
          ? `.${process.env.NEXT_PUBLIC_MAIN_DOMAIN}`
          : undefined
      }
    }
  },

  callbacks: {
    async signIn() {
      return true
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          organizationId: user.organizationId,
          provider: account.provider
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = (token.role as string) || 'user'
        session.user.organizationId = token.organizationId as string | null
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url

      return baseUrl
    }
  },

  debug: true
}
