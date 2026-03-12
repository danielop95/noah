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
      roleId?: string | null
      roleSlug?: string | null
      roleName?: string | null
      roleHierarchy?: number | null
      permissions?: string[]
      organizationId?: string | null
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    roleId?: string | null
    roleSlug?: string | null
    roleName?: string | null
    roleHierarchy?: number | null
    permissions?: string[]
    organizationId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    roleId?: string | null
    roleSlug?: string | null
    roleName?: string | null
    roleHierarchy?: number | null
    permissions?: string[]
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
          where: { email: credentials.email },
          include: {
            userRole: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
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

        const permissions = user.userRole?.permissions.map(
          rp => `${rp.permission.module}.${rp.permission.action}`
        ) || []

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          roleSlug: user.userRole?.slug || null,
          roleName: user.userRole?.name || null,
          roleHierarchy: user.userRole?.hierarchy || null,
          permissions,
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

  // Cookies con configuración por defecto (single-tenant, sin subdominios)

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
          roleId: user.roleId,
          roleSlug: user.roleSlug,
          roleName: user.roleName,
          roleHierarchy: user.roleHierarchy,
          permissions: user.permissions || [],
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
        session.user.roleId = token.roleId as string | null
        session.user.roleSlug = token.roleSlug as string | null
        session.user.roleName = token.roleName as string | null
        session.user.roleHierarchy = token.roleHierarchy as number | null
        session.user.permissions = (token.permissions as string[]) || []
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
