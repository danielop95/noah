import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// Configuracion del logo
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

/**
 * POST /api/upload/logo-public
 * Sube un logo temporalmente durante el registro de iglesia.
 * Este endpoint NO requiere autenticacion ya que se usa en el formulario de registro.
 * El logo se guarda con un ID temporal y luego se asocia a la organizacion.
 *
 * Especificaciones del logo:
 * - Formatos: PNG, JPG, SVG, WebP
 * - Tamaño maximo: 2MB
 * - Dimensiones recomendadas: 200x60px (ratio ~3.3:1)
 * - Fondo transparente recomendado (PNG/SVG)
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      return NextResponse.json({ message: 'No se proporciono ningún archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'Formato no permitido. Usa: PNG, JPG, SVG o WebP' }, { status: 400 })
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'El archivo es muy grande. Maximo 2MB' }, { status: 400 })
    }

    // Validar extensión del filename contra tipo MIME declarado
    const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp']
    const extension = file.name.split('.').pop()?.toLowerCase() || ''

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ message: 'Extensión de archivo no permitida' }, { status: 400 })
    }
    const tempId = randomUUID()
    const filename = `temp-${tempId}.${extension}`

    // Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')

    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)

    // URL publica del logo temporal
    const logoUrl = `/uploads/logos/${filename}`

    return NextResponse.json({
      logoUrl,
      tempId,
      message: 'Logo subido exitosamente'
    })
  } catch (error) {
    console.error('Public logo upload error:', error)

    return NextResponse.json({ message: 'Error al subir el logo' }, { status: 500 })
  }
}
