'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'

import { createGroup, updateGroup } from '@/app/server/groupActions'
import type { GroupWithDetails, NetworkOption } from '@/app/server/groupActions'

type GroupDrawerProps = {
  open: boolean
  onClose: () => void
  group: GroupWithDetails | null
  networks: NetworkOption[]
  onRefresh: () => void
}

const DAYS_OF_WEEK = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miercoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sabado' },
  { value: 'domingo', label: 'Domingo' }
]

type UserOption = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  email: string | null
  groupId: string | null
  groupRole: string | null
}

const getDisplayName = (user: UserOption) => {
  if (user.name) return user.name
  if (user.firstName || user.lastName) return `${user.firstName || ''} ${user.lastName || ''}`.trim()

  return user.email || 'Usuario'
}

const getInitials = (user: UserOption) => {
  const name = getDisplayName(user)

  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const GroupDrawer = ({ open, onClose, group, networks, onRefresh }: GroupDrawerProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [networkId, setNetworkId] = useState<string>('')
  const [modality, setModality] = useState<string>('presencial')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [meetingDay, setMeetingDay] = useState<string>('')
  const [meetingTime, setMeetingTime] = useState('')
  const [leaderIds, setLeaderIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!group

  // Usuarios disponibles: de la red seleccionada y sin grupo asignado (o del grupo actual en edición)
  const availableUsers = useMemo(() => {
    const network = networks.find(n => n.id === networkId)

    if (!network) return []

    return network.users.filter(u => !u.groupId || u.groupId === group?.id)
  }, [networks, networkId, group])

  // Usuarios seleccionados como objetos
  const selectedLeaders = useMemo(() => {
    return availableUsers.filter(u => leaderIds.includes(u.id))
  }, [availableUsers, leaderIds])

  useEffect(() => {
    if (group) {
      setName(group.name)
      setDescription(group.description || '')
      setImageUrl(group.imageUrl)
      setIsActive(group.isActive)
      setNetworkId(group.networkId)
      setModality(group.modality)
      setCity(group.city || '')
      setAddress(group.address || '')
      setNeighborhood(group.neighborhood || '')
      setMeetingDay(group.meetingDay || '')
      setMeetingTime(group.meetingTime || '')
      setLeaderIds(group.leaders.map(l => l.id))
    } else {
      setName('')
      setDescription('')
      setImageUrl(null)
      setIsActive(true)
      setNetworkId('')
      setModality('presencial')
      setCity('')
      setAddress('')
      setNeighborhood('')
      setMeetingDay('')
      setMeetingTime('')
      setLeaderIds([])
    }

    setError(null)
  }, [group, open])

  // Limpiar líderes cuando cambia la red
  const handleNetworkChange = (newNetworkId: string) => {
    setNetworkId(newNetworkId)
    setLeaderIds([])
  }

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
      formData.append('folder', 'groups')

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

    if (!networkId) {
      setError('Debe seleccionar una red')

      return
    }

    if (leaderIds.length === 0) {
      setError('Debe haber al menos un lider')

      return
    }

    if (modality === 'presencial' && !city.trim()) {
      setError('Para grupos presenciales, el municipio/ciudad es requerido')

      return
    }

    setSaving(true)
    setError(null)

    try {
      if (isEditing) {
        await updateGroup(group.id, {
          name: name.trim(),
          description: description.trim() || null,
          imageUrl,
          isActive,
          networkId,
          modality,
          city: modality === 'presencial' ? city.trim() : null,
          address: modality === 'presencial' ? address.trim() || null : null,
          neighborhood: modality === 'presencial' ? neighborhood.trim() || null : null,
          meetingDay: meetingDay || null,
          meetingTime: meetingTime || null,
          leaderIds
        })
      } else {
        await createGroup({
          name: name.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl || undefined,
          networkId,
          modality,
          city: modality === 'presencial' ? city.trim() : undefined,
          address: modality === 'presencial' ? address.trim() || undefined : undefined,
          neighborhood: modality === 'presencial' ? neighborhood.trim() || undefined : undefined,
          meetingDay: meetingDay || undefined,
          meetingTime: meetingTime || undefined,
          leaderIds
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
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
      <Box className='flex flex-col h-full'>
        <Box className='flex justify-between items-center p-4 border-b'>
          <Typography variant='h6'>{isEditing ? 'Editar Grupo' : 'Nuevo Grupo'}</Typography>
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

            {/* Información básica */}
            <TextField
              label='Nombre del Grupo'
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
              rows={2}
              placeholder='Describe el proposito de este grupo...'
            />

            {/* Imagen */}
            <Box>
              <Typography variant='subtitle2' className='font-semibold mb-2'>
                Imagen del Grupo
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

            <Divider className='my-2' />

            {/* Red */}
            <Typography variant='subtitle2' className='font-semibold'>
              Red
            </Typography>
            <FormControl fullWidth required error={!networkId && !!error}>
              <InputLabel>Seleccionar Red</InputLabel>
              <Select
                value={networkId}
                onChange={e => handleNetworkChange(e.target.value)}
                label='Seleccionar Red'
                renderValue={selected => {
                  const network = networks.find(n => n.id === selected)

                  if (!network) return ''

                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={network.imageUrl || undefined} sx={{ width: 24, height: 24 }}>
                        <i className='ri-bubble-chart-line text-sm' />
                      </Avatar>
                      {network.name} ({network.users.length} miembros)
                    </Box>
                  )
                }}
              >
                {networks.map(network => (
                  <MenuItem key={network.id} value={network.id} sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={network.imageUrl || undefined} sx={{ width: 32, height: 32 }}>
                        <i className='ri-bubble-chart-line' />
                      </Avatar>
                      <Box>
                        <Typography variant='body2'>{network.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {network.users.length} miembros
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Líderes */}
            <Typography variant='subtitle2' className='font-semibold'>
              Lideres
            </Typography>
            <Autocomplete
              multiple
              options={availableUsers}
              value={selectedLeaders}
              onChange={(_, newValue) => setLeaderIds(newValue.map(u => u.id))}
              getOptionLabel={getDisplayName}
              disabled={!networkId}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Seleccionar Lideres'
                  placeholder={networkId ? 'Buscar miembros...' : 'Primero selecciona una red'}
                  error={leaderIds.length === 0 && !!error}
                  helperText={leaderIds.length === 0 ? 'Selecciona al menos un lider' : undefined}
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component='li'
                  {...props}
                  key={option.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2 }}
                >
                  <Avatar src={option.image || undefined} sx={{ width: 36, height: 36, flexShrink: 0 }}>
                    {getInitials(option)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant='body2' noWrap>{getDisplayName(option)}</Typography>
                    {option.email && (
                      <Typography variant='caption' color='text.secondary' noWrap sx={{ display: 'block' }}>
                        {option.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    avatar={<Avatar src={option.image || undefined}>{getInitials(option)}</Avatar>}
                    label={getDisplayName(option)}
                    size='small'
                  />
                ))
              }
            />
            <Typography variant='caption' className='text-textSecondary'>
              Solo puedes seleccionar miembros de la red elegida.
            </Typography>

            <Divider className='my-2' />

            {/* Modalidad */}
            <Typography variant='subtitle2' className='font-semibold'>
              Modalidad
            </Typography>
            <ToggleButtonGroup
              value={modality}
              exclusive
              onChange={(_, value) => value && setModality(value)}
              fullWidth
              size='small'
            >
              <ToggleButton value='presencial'>
                <i className='ri-map-pin-line mr-2' />
                Presencial
              </ToggleButton>
              <ToggleButton value='virtual'>
                <i className='ri-video-line mr-2' />
                Virtual
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Ubicación (solo presencial) */}
            {modality === 'presencial' && (
              <>
                <Typography variant='subtitle2' className='font-semibold'>
                  Ubicacion
                </Typography>
                <TextField
                  label='Municipio / Ciudad'
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  fullWidth
                  required
                  error={modality === 'presencial' && !city.trim() && !!error}
                />
                <TextField
                  label='Direccion'
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  fullWidth
                  placeholder='Calle, numero, etc.'
                />
                <TextField
                  label='Barrio'
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  fullWidth
                />
              </>
            )}

            <Divider className='my-2' />

            {/* Horario */}
            <Typography variant='subtitle2' className='font-semibold'>
              Horario de Reunion
            </Typography>
            <Box className='flex gap-3'>
              <FormControl fullWidth>
                <InputLabel>Dia</InputLabel>
                <Select
                  value={meetingDay}
                  onChange={e => setMeetingDay(e.target.value)}
                  label='Dia'
                >
                  <MenuItem value=''>Sin definir</MenuItem>
                  {DAYS_OF_WEEK.map(day => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label='Hora'
                type='time'
                value={meetingTime}
                onChange={e => setMeetingTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Estado (solo edición) */}
            {isEditing && (
              <>
                <Divider className='my-2' />
                <FormControlLabel
                  control={<Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
                  label={isActive ? 'Grupo Activo' : 'Grupo Inactivo'}
                />
              </>
            )}
          </Box>
        </Box>

        <Box className='flex gap-3 p-4 border-t'>
          <Button variant='contained' onClick={handleSubmit} disabled={saving} fullWidth>
            {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Grupo'}
          </Button>
          <Button variant='outlined' onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default GroupDrawer
