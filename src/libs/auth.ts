// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'

import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import prisma from '@/libs/prisma'

// Definir el secreto fuera para asegurar su existencia
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'noah-security-fallback-permanent-2026'

export const authOptions: NextAuthOptions = {
  // Forzar el secreto aquí
  secret: NEXTAUTH_SECRET,
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

        // Usamos una consulta cruda o deshabilitamos chequeo estricto para evitar errores de tipos en Vercel
        const user = (await prisma.user.findUnique({
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
        })) as any

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
          roles: user.roles || ['member'],
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

  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_COOKIE_DOMAIN : undefined
      }
    }
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user as any).role || 'user',
          roles: (user as any).roles || ['member'],
          organizationId: (user as any).organizationId,
          provider: account.provider
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        const userWithRoles = (await prisma.user.findUnique({
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
        })) as any

        if (userWithRoles) {
          session.user = {
            ...session.user,
            id: userWithRoles.id,
            name: userWithRoles.name,
            email: userWithRoles.email,
            image: userWithRoles.image,
            role: userWithRoles.role || 'user',
            roles: userWithRoles.roles || ['member'],
            organizationId: userWithRoles.organizationId,
            networkId: userWithRoles.networkId,
            networkRole: userWithRoles.networkRole,
            ledGroups: userWithRoles.groupLeaderships,
            ledServiceAreas: userWithRoles.ledServiceAreas,
            volunteerAreas: userWithRoles.volunteerAreas
          } as any
        }
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}
