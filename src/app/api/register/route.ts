import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

import prisma from '@/libs/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      firstName,
      lastName,
      email,
      password,
      documentType,
      documentNumber,
      phone,
      gender,
      birthDate,
      maritalStatus,
      hasChildren,
      childrenCount,
      country,
      city,
      address,
      neighborhood,
      organizationId
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'Nombre, apellido, email y contraseña son requeridos' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Ya existe una cuenta con este email' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        documentType: documentType || null,
        documentNumber: documentNumber || null,
        phone: phone || null,
        gender: gender || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        maritalStatus: maritalStatus || null,
        hasChildren: hasChildren || false,
        childrenCount: childrenCount || 0,
        country: country || null,
        city: city || null,
        address: address || null,
        neighborhood: neighborhood || null,
        organizationId: organizationId || null,
        role: 'user',
        isActive: true
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)

    return NextResponse.json({ message: 'Error al crear la cuenta. Intenta de nuevo.' }, { status: 500 })
  }
}
