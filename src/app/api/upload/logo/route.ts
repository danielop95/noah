import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'

// Configuracion del logo
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const LOGO_DIMENSIONS = {
  recommended: { width: 200, height: 60 },
  max: { width: 400, height: 120 }
}

/**
 * POST /api/upload/logo
 * Sube el logo de una organizacion.
 *
 * Especificaciones del logo:
 * - Formatos: PNG, JPG, SVG, WebP
 * - Tamaño maximo: 2MB
 * - Dimensiones recomendadas: 200x60px (ratio ~3.3:1)
 * - Dimensiones maximas: 400x120px
 * - Fondo transparente recomendado (PNG/SVG)
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.roleHierarchy ?? 999) > 2) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    // Obtener organizationId del admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ message: 'No perteneces a ninguna organizacion' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      return NextResponse.json({ message: 'No se proporciono ningún archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          message: `Formato no permitido. Usa: PNG, JPG, SVG o WebP`,
          specs: LOGO_DIMENSIONS
        },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message: `El archivo es muy grande. Maximo 2MB`,
          specs: LOGO_DIMENSIONS
        },
        { status: 400 }
      )
    }

    // Generar nombre unico
    const extension = file.name.split('.').pop() || 'png'
    const filename = `${user.organizationId}-${Date.now()}.${extension}`

    // Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')

    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)

    // URL publica del logo
    const logoUrl = `/uploads/logos/${filename}`

    // Actualizar organizacion con el nuevo logo
    await prisma.organization.update({
      where: { id: user.organizationId },
      data: { logoUrl }
    })

    return NextResponse.json({
      logoUrl,
      message: 'Logo subido exitosamente',
      specs: {
        info: 'Para mejores resultados usa un logo con fondo transparente',
        recommended: LOGO_DIMENSIONS.recommended,
        formats: 'PNG, SVG (preferido), JPG, WebP'
      }
    })
  } catch (error) {
    console.error('Logo upload error:', error)

    return NextResponse.json({ message: 'Error al subir el logo' }, { status: 500 })
  }
}

/**
 * DELETE /api/upload/logo
 * Elimina el logo de la organizacion actual
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.roleHierarchy ?? 999) > 2) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ message: 'No perteneces a ninguna organizacion' }, { status: 400 })
    }

    // Limpiar logoUrl de la organizacion
    await prisma.organization.update({
      where: { id: user.organizationId },
      data: { logoUrl: null }
    })

    return NextResponse.json({ message: 'Logo eliminado' })
  } catch (error) {
    console.error('Logo delete error:', error)

    return NextResponse.json({ message: 'Error al eliminar el logo' }, { status: 500 })
  }
}
