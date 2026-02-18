'use client'

import { useState, useEffect, useCallback } from 'react'

import { useDropzone } from 'react-dropzone'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'

import UserMultiSelect, { type UserOption } from './UserMultiSelect'
import { createNetwork, updateNetwork } from '@/app/server/networkActions'

type NetworkUser = {
  id: string
  name: string | null
  networkRole: string | null
}

type NetworkData = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  users: NetworkUser[]
}

type NetworkDrawerProps = {
  open: boolean
  onClose: () => void
  network: NetworkData | null
  users: UserOption[]
  onRefresh: () => void
}

const NetworkDrawer = ({ open, onClose, network, users, onRefresh }: NetworkDrawerProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [leaderIds, setLeaderIds] = useState<string[]>([])
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!network

  useEffect(() => {
    if (network) {
      setName(network.name)
      setDescription(network.description || '')
      setImageUrl(network.imageUrl)
      setIsActive(network.isActive)
      setLeaderIds(network.users.filter(u => u.networkRole === 'leader').map(u => u.id))
      setMemberIds(network.users.filter(u => u.networkRole === 'member').map(u => u.id))
    } else {
      setName('')
      setDescription('')
      setImageUrl(null)
      setIsActive(true)
      setLeaderIds([])
      setMemberIds([])
    }

    setError(null)
  }, [network, open])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]

    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen es muy grande. Maximo 2MB')

      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()

      formData.append('image', file)
      formData.append('folder', 'networks')

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()

        throw new Error(data.message || 'Error al subir la imagen')
      }

      const data = await res.json()

      setImageUrl(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    disabled: uploading || saving
  })

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido')

      return
    }

    if (leaderIds.length === 0) {
      setError('Debe haber al menos un lider')

      return
    }

    setSaving(true)
    setError(null)

    try {
      if (isEditing) {
        await updateNetwork(network.id, {
          name: name.trim(),
          description: description.trim() || null,
          imageUrl,
          isActive,
          leaderIds,
          memberIds
        })
      } else {
        await createNetwork({
          name: name.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl || undefined,
          leaderIds,
          memberIds
        })
      }

      onRefresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 450 } } }}>
      <Box className='flex flex-col h-full'>
        <Box className='flex justify-between items-center p-4 border-b'>
          <Typography variant='h6'>{isEditing ? 'Editar Red' : 'Nueva Red'}</Typography>
          <IconButton onClick={onClose}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        <Box className='flex-1 overflow-y-auto p-4'>
          <Box className='flex flex-col gap-4'>
            {error && (
              <Alert severity='error' onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              label='Nombre de la Red'
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              required
              error={!name.trim() && !!error}
            />

            <TextField
              label='Descripcion'
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder='Describe el proposito de esta red...'
            />

            <Box>
              <Typography variant='subtitle2' className='font-semibold mb-2'>
                Imagen de la Red
              </Typography>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 2,
                  cursor: uploading || saving ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                  '&:hover': {
                    borderColor: uploading || saving ? 'divider' : 'primary.main'
                  }
                }}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <Box className='flex justify-center items-center py-4'>
                    <CircularProgress size={32} />
                  </Box>
                ) : imageUrl ? (
                  <Box className='flex items-center gap-3'>
                    <Avatar src={imageUrl} variant='rounded' sx={{ width: 64, height: 64 }}>
                      <i className='ri-image-line' />
                    </Avatar>
                    <Box className='flex-1'>
                      <Typography variant='body2'>Imagen cargada</Typography>
                      <Typography variant='caption' className='text-textSecondary'>
                        Arrastra otra imagen para reemplazar
                      </Typography>
                    </Box>
                    <IconButton
                      size='small'
                      onClick={e => {
                        e.stopPropagation()
                        setImageUrl(null)
                      }}
                      color='error'
                    >
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </Box>
                ) : (
                  <Box className='text-center py-2'>
                    <i className='ri-image-add-line text-3xl text-textSecondary' />
                    <Typography variant='body2' className='text-textPrimary mt-1'>
                      {isDragActive ? 'Suelta la imagen aqui' : 'Arrastra una imagen o haz clic'}
                    </Typography>
                    <Typography variant='caption' className='text-textSecondary'>
                      PNG, JPG, SVG o WebP - Max 2MB
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {isEditing && (
              <FormControlLabel
                control={<Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
                label={isActive ? 'Red Activa' : 'Red Inactiva'}
              />
            )}

            <Divider className='my-2' />

            <Typography variant='subtitle2' className='font-semibold'>
              Lideres
            </Typography>
            <UserMultiSelect
              label='Seleccionar Lideres'
              users={users}
              selectedIds={leaderIds}
              onChange={setLeaderIds}
              excludeIds={memberIds}
              error={leaderIds.length === 0 && !!error}
              helperText={leaderIds.length === 0 ? 'Selecciona al menos un lider' : undefined}
            />

            <Typography variant='subtitle2' className='font-semibold'>
              Miembros
            </Typography>
            <UserMultiSelect
              label='Seleccionar Miembros'
              users={users}
              selectedIds={memberIds}
              onChange={setMemberIds}
              excludeIds={leaderIds}
            />

            <Typography variant='caption' className='text-textSecondary'>
              Un usuario solo puede pertenecer a una red. Los usuarios ya asignados a otra red no aparecen en la lista.
            </Typography>
          </Box>
        </Box>

        <Box className='flex gap-3 p-4 border-t'>
          <Button variant='contained' onClick={handleSubmit} disabled={saving} fullWidth>
            {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Red'}
          </Button>
          <Button variant='outlined' onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default NetworkDrawer
