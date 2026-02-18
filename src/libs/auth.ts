// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'

import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import type { SystemRole } from '@prisma/client'
import prisma from '@/libs/prisma'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string // @deprecated - usar roles[]
      roles: SystemRole[]
      organizationId?: string | null
      networkId?: string | null
      networkRole?: string | null
      ledGroups?: { groupId: string }[]
      ledServiceAreas?: { serviceAreaId: string }[]
      volunteerAreas?: { serviceAreaId: string; isActive: boolean }[]
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    role?: string
    roles?: SystemRole[]
    organizationId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    roles?: SystemRole[]
    organizationId?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  // Secreto absoluto para evitar el error NO_SECRET si Vercel falla al leer la variable
  secret: process.env.NEXTAUTH_SECRET || 'noah-security-fallback-2026-v1',
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
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            isActive: true,
            roles: true,
            role: true,
            image: true,
            organizationId: true
          }
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
          roles: user.roles,
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
        // Permitir cookies en subdominios si se define el dominio, o usar por defecto para .vercel.app
        domain: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_COOKIE_DOMAIN : undefined
      }
    }
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') {
        return true
      }

      return true
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user', // @deprecated
          roles: user.roles || ['member'],
          organizationId: user.organizationId,
          provider: account.provider
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        // Cargar datos completos del usuario con relaciones de roles
        const userWithRoles = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            roles: true,
            organizationId: true,
            networkId: true,
            networkRole: true,
            groupLeaderships: { select: { groupId: true } },
            ledServiceAreas: { select: { serviceAreaId: true } },
            volunteerAreas: { select: { serviceAreaId: true, isActive: true } }
          }
        })

        if (userWithRoles) {
          session.user = {
            id: userWithRoles.id,
            name: userWithRoles.name,
            email: userWithRoles.email,
            image: userWithRoles.image,
            role: userWithRoles.role || 'user',
            roles: userWithRoles.roles,
            organizationId: userWithRoles.organizationId,
            networkId: userWithRoles.networkId,
            networkRole: userWithRoles.networkRole,
            ledGroups: userWithRoles.groupLeaderships,
            ledServiceAreas: userWithRoles.ledServiceAreas,
            volunteerAreas: userWithRoles.volunteerAreas
          }
        }
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url

      return baseUrl
    }
  },

  debug: process.env.NODE_ENV === 'development',

  events: {
    async signIn(message) {
      console.log('User signed in:', message.user.email)
    },
    async signOut(message) {
      console.log('User signed out:', message.token?.email)
    },
    async createUser(message) {
      console.log('User created:', message.user.email)
    }
  }
}
