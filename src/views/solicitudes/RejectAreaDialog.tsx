'use client'

import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

import { rejectSolicitudArea } from '@/app/server/solicitudesActions'

type Props = {
  target: { id: string; areaName: string } | null
  onClose: () => void
  onSuccess: () => void
}

const RejectAreaDialog = ({ target, onClose, onSuccess }: Props) => {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (target) {
      setMotivo('')
      setError(null)
    }
  }, [target])

  const handleSubmit = async () => {
    if (!target) return
    if (!motivo.trim()) {
      setError('El motivo es obligatorio')

      return
    }

    setSaving(true)
    setError(null)

    try {
      await rejectSolicitudArea(target.id, motivo)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!target} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Rechazar apoyo {target?.areaName ? `de ${target.areaName}` : ''}</DialogTitle>
      <DialogContent>
        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label='Motivo del rechazo'
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
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color='error' variant='contained' disabled={saving}>
          {saving ? 'Rechazando...' : 'Rechazar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RejectAreaDialog
