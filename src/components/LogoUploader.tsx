'use client'

import { useState, useCallback } from 'react'

import { useDropzone } from 'react-dropzone'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

type LogoUploaderProps = {
  currentLogoUrl?: string | null
  onUpload: (logoUrl: string) => void
  onRemove?: () => void
  isPublic?: boolean // true para registro sin auth, false para admin con auth
  disabled?: boolean
}

/**
 * Componente de subida de logo con drag & drop.
 *
 * Especificaciones del logo:
 * - Formatos: PNG (recomendado), SVG (recomendado), JPG, WebP
 * - Tamaño maximo: 2MB
 * - Dimensiones recomendadas: 200x60px (ratio ~3.3:1)
 * - Dimensiones maximas: 400x120px
 * - Fondo transparente recomendado para mejor integracion
 *
 * El logo se muestra en:
 * - Sidebar del dashboard (junto al nombre de la iglesia)
 * - Pagina de login del subdominio
 */
const LogoUploader = ({ currentLogoUrl, onUpload, onRemove, isPublic = false, disabled = false }: LogoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)

  const uploadEndpoint = isPublic ? '/api/upload/logo-public' : '/api/upload/logo'

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]

      if (!file) return

      // Validar tamaño
      if (file.size > 2 * 1024 * 1024) {
        setError('El archivo es muy grande. Maximo 2MB')

        return
      }

      // Mostrar preview local
      const localPreview = URL.createObjectURL(file)

      setPreview(localPreview)
      setIsUploading(true)
      setError(null)

      try {
        const formData = new FormData()

        formData.append('logo', file)

        const res = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          const data = await res.json()

          throw new Error(data.message || 'Error al subir el logo')
        }

        const data = await res.json()

        setPreview(data.logoUrl)
        onUpload(data.logoUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir el logo')
        setPreview(currentLogoUrl || null)
      } finally {
        setIsUploading(false)
      }
    },
    [uploadEndpoint, onUpload, currentLogoUrl]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    disabled: disabled || isUploading
  })

  const handleRemove = async () => {
    if (!onRemove) return

    setIsUploading(true)

    try {
      if (!isPublic) {
        await fetch('/api/upload/logo', { method: 'DELETE' })
      }

      setPreview(null)
      onRemove()
    } catch {
      setError('Error al eliminar el logo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Box className='flex flex-col gap-2'>
      <Typography variant='caption' className='text-textSecondary font-medium'>
        Logo de la Iglesia
      </Typography>

      {error && (
        <Alert severity='error' onClose={() => setError(null)} className='mb-2'>
          {error}
        </Alert>
      )}

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 2,
          cursor: disabled || isUploading ? 'default' : 'pointer',
          transition: 'all 0.2s',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          opacity: disabled ? 0.6 : 1,
          '&:hover': {
            borderColor: disabled || isUploading ? 'divider' : 'primary.main',
            bgcolor: disabled || isUploading ? 'background.paper' : 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <Box className='flex justify-center items-center py-4'>
            <CircularProgress size={32} />
          </Box>
        ) : preview ? (
          <Box className='flex items-center gap-3'>
            <Box
              component='img'
              src={preview}
              alt='Logo'
              sx={{
                maxWidth: 120,
                maxHeight: 40,
                objectFit: 'contain'
              }}
            />
            <Box className='flex-1'>
              <Typography variant='body2' className='text-textSecondary'>
                Arrastra otro archivo para reemplazar
              </Typography>
            </Box>
            {onRemove && (
              <IconButton
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  handleRemove()
                }}
                color='error'
              >
                <i className='ri-delete-bin-line' />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box className='text-center py-2'>
            <i className='ri-upload-cloud-2-line text-3xl text-textSecondary' />
            <Typography variant='body2' className='text-textPrimary mt-1'>
              {isDragActive ? 'Suelta el archivo aqui' : 'Arrastra tu logo o haz clic para seleccionar'}
            </Typography>
            <Typography variant='caption' className='text-textSecondary'>
              PNG o SVG recomendado • Max 2MB • 200x60px ideal
            </Typography>
          </Box>
        )}
      </Box>

      <Typography variant='caption' className='text-textSecondary' sx={{ fontSize: '0.7rem' }}>
        Recomendado: Logo horizontal con fondo transparente. Dimensiones ideales: 200×60px (ratio 3.3:1)
      </Typography>
    </Box>
  )
}

export default LogoUploader
