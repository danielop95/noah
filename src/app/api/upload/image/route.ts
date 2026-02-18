import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

import { authOptions } from '@/libs/auth'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

/**
 * POST /api/upload/image
 * Sube una imagen generica (para redes, eventos, etc.)
 * No actualiza la base de datos, solo retorna la URL.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File | null
    const folder = (formData.get('folder') as string) || 'general'

    if (!file) {
      return NextResponse.json({ message: 'No se proporciono ningun archivo' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'Formato no permitido. Usa: PNG, JPG, SVG o WebP' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'El archivo es muy grande. Maximo 2MB' }, { status: 400 })
    }

    const extension = file.name.split('.').pop() || 'png'
    const filename = `${randomUUID()}-${Date.now()}.${extension}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)

    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)

    const imageUrl = `/uploads/${folder}/${filename}`

    return NextResponse.json({
      imageUrl,
      message: 'Imagen subida exitosamente'
    })
  } catch (error) {
    console.error('Image upload error:', error)

    return NextResponse.json({ message: 'Error al subir la imagen' }, { status: 500 })
  }
}
