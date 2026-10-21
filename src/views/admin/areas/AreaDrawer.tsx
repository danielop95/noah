'use client'

import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { createArea, updateArea } from '@/app/server/areasActions'
import type { AreaRow } from './AreaListTable'

const ICON_OPTIONS = [
  { value: 'solar-chat-round-line-linear', label: 'Comunicación' },
  { value: 'solar-box-linear', label: 'Caja / Logística' },
  { value: 'solar-tuning-2-linear', label: 'Producción / Audio' },
  { value: 'solar-camera-linear', label: 'Cámara / Foto' },
  { value: 'solar-users-group-rounded-linear', label: 'Personas' },
  { value: 'solar-widget-add-linear', label: 'Otro' },
  { value: 'solar-buildings-3-linear', label: 'Edificios' },
  { value: 'solar-microphone-3-linear', label: 'Micrófono' },
  { value: 'solar-music-note-2-linear', label: 'Música' },
  { value: 'solar-presentation-graph-linear', label: 'Presentación' },
  { value: 'solar-pen-new-square-linear', label: 'Diseño' },
  { value: 'solar-folder-linear', label: 'Carpeta (default)' }
]

const COLOR_PRESETS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#EF4444', '#6B7280', '#0EA5E9']

type Props = {
  open: boolean
  onClose: () => void
  area: AreaRow | null
  onSuccess: () => void
}

const AreaDrawer = ({ open, onClose, area, onSuccess }: Props) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<string>('solar-folder-linear')
  const [color, setColor] = useState<string>('#3B82F6')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!area

  useEffect(() => {
    if (area) {
      setName(area.name)
      setDescription(area.description || '')
      setIcon(area.icon || 'solar-folder-linear')
      setColor(area.color || '#3B82F6')
      setIsActive(area.isActive)
    } else {
      setName('')
      setDescription('')
      setIcon('solar-folder-linear')
      setColor('#3B82F6')
      setIsActive(true)
    }

    setError(null)
  }, [area, open])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido')

      return
    }

    setSaving(true)
    setError(null)

    try {
      if (isEditing && area) {
        await updateArea(area.id, {
          name: name.trim(),
          description: description.trim() || null,
          icon,
          color,
          isActive
        })
      } else {
        await createArea({
          name: name.trim(),
          description: description.trim() || null,
          icon,
          color
        })
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEditing ? 'Editar Área' : 'Nueva Área'}
        <IconButton onClick={onClose}>
          <i className='solar-close-square-linear' />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='flex flex-col gap-4'>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Preview */}
          <Box className='flex items-center gap-3 p-3 rounded-md bg-actionHover'>
            <Avatar sx={{ width: 48, height: 48, bgcolor: color, color: '#fff' }} variant='rounded'>
              <i className={icon} />
            </Avatar>
            <div>
              <Typography variant='subtitle1' className='font-semibold'>
                {name || 'Vista previa'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Así se verá esta área en listados
              </Typography>
            </div>
          </Box>

          <TextField
            label='Nombre del Área'
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
            error={!name.trim() && !!error}
          />

          <TextField
            label='Descripción'
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder='Describe el propósito de esta área...'
          />

          <TextField select label='Icono' value={icon} onChange={e => setIcon(e.target.value)} fullWidth>
            {ICON_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                <div className='flex items-center gap-2'>
                  <i className={opt.value} />
                  <span>{opt.label}</span>
                </div>
              </MenuItem>
            ))}
          </TextField>

          <div>
            <Typography variant='subtitle2' className='font-semibold mb-2'>
              Color
            </Typography>
            <div className='flex flex-wrap gap-2'>
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type='button'
                  aria-label={`Color ${c}`}
                  onClick={() => setColor(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: c,
                    border: color === c ? '3px solid #000' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                />
              ))}
              <TextField
                size='small'
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder='#000000'
                className='w-32'
              />
            </div>
          </div>

          {isEditing && (
            <FormControlLabel
              control={<Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
              label={isActive ? 'Área Activa' : 'Área Inactiva'}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant='outlined' onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant='contained' onClick={handleSubmit} disabled={saving} fullWidth>
          {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Área'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AreaDrawer
