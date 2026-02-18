'use server'

import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'

import prisma from '@/libs/prisma'
import { authOptions } from '@/libs/auth'

export async function getProfileById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) return null

  const { password: _, ...profile } = user

  return profile
}

export async function updateProfile(
  userId: string,
  data: {
    firstName?: string
    lastName?: string
    phone?: string
    documentType?: string
    documentNumber?: string
    gender?: string
    birthDate?: string | null
    maritalStatus?: string
    hasChildren?: boolean
    childrenCount?: number
    country?: string
    city?: string
    address?: string
    neighborhood?: string
    image?: string
  }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.id !== userId) {
    throw new Error('No autorizado')
  }

  const name =
    data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined

  const updateData: Record<string, unknown> = { ...data }

  if (name) updateData.name = name

  if (data.birthDate) {
    updateData.birthDate = new Date(data.birthDate)
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData
  })

  const { password: _, ...profile } = user

  return profile
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.id !== userId) {
    throw new Error('No autorizado')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user || !user.password) {
    throw new Error('Usuario no encontrado o no tiene contraseña configurada')
  }

  const isValid = await bcrypt.compare(currentPassword, user.password)

  if (!isValid) {
    throw new Error('La contraseña actual es incorrecta')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })

  return { success: true }
}
