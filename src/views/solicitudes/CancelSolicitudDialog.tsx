'use client'

import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

import { cancelSolicitud } from '@/app/server/solicitudesActions'

type Props = {
  open: boolean
  solicitudId: string
  onClose: () => void
  onSuccess: () => void
}

const CancelSolicitudDialog = ({ open, solicitudId, onClose, onSuccess }: Props) => {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMotivo('')
      setError(null)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!motivo.trim()) {
      setError('El motivo es obligatorio')

      return
    }

    setSaving(true)
    setError(null)

    try {
      await cancelSolicitud(solicitudId, motivo)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Cancelar solicitud</DialogTitle>
      <DialogContent>
        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label='Motivo de la cancelación'
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          fullWidth
          multiline
          rows={3}
          required
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Volver
        </Button>
        <Button onClick={handleSubmit} color='error' variant='contained' disabled={saving}>
          {saving ? 'Cancelando...' : 'Cancelar solicitud'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CancelSolicitudDialog
