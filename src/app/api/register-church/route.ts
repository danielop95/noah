import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

import prisma from '@/libs/prisma'

/**
 * API Route para registrar una nueva iglesia (Organization) y su administrador.
 * Se accede desde /registrar en el dominio principal.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      churchName,
      slug,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword,
      primaryColor,
      secondaryColor,
      logoUrl
    } = body

    // Validar campos requeridos
    if (!churchName || !slug || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
      return NextResponse.json({ message: 'Todos los campos obligatorios son requeridos' }, { status: 400 })
    }

    // Validar formato del slug (solo letras minúsculas, números y guiones)
    const slugRegex = /^[a-z0-9-]+$/

    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { message: 'El subdominio solo puede contener letras minúsculas, números y guiones' },
        { status: 400 }
      )
    }

    // Verificar que el slug no esté en uso
    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    })

    if (existingOrg) {
      return NextResponse.json({ message: 'Este subdominio ya está en uso. Elige otro.' }, { status: 409 })
    }

    // Verificar que el email del admin no exista
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Ya existe una cuenta con este email' }, { status: 409 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Crear organización y usuario admin en una transacción
    const result = await prisma.$transaction(async tx => {
      const organization = await tx.organization.create({
        data: {
          name: churchName,
          slug,
          logoUrl: logoUrl || null,
          colors: {
            primary: primaryColor || '#0466C8',
            secondary: secondaryColor || '#001845'
          }
        }
      })

      const adminUser = await tx.user.create({
        data: {
          firstName: adminFirstName,
          lastName: adminLastName,
          name: `${adminFirstName} ${adminLastName}`,
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          organizationId: organization.id
        }
      })

      return { organization, adminUser }
    })

    // Retornar sin contraseña
    const { password: _, ...adminWithoutPassword } = result.adminUser

    return NextResponse.json(
      {
        organization: result.organization,
        admin: adminWithoutPassword
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Church registration error:', error)

    return NextResponse.json({ message: 'Error al registrar la iglesia. Intenta de nuevo.' }, { status: 500 })
  }
}
