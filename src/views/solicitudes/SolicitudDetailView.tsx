'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { addComentario, approveSolicitudArea } from '@/app/server/solicitudesActions'
import {
  CUMPLIMIENTO_LABEL,
  ESTADO_COLOR,
  ESTADO_LABEL,
  SOLICITUD_AREA_ESTADO_COLOR,
  SOLICITUD_AREA_ESTADO_LABEL,
  SOLICITUD_EVENTO_LABEL,
  TIPO_EVENTO_LABEL,
  formatDate,
  formatDateTime,
  getDisplayName
} from './estadoUtils'
import RejectAreaDialog from './RejectAreaDialog'
import CancelSolicitudDialog from './CancelSolicitudDialog'

// Tipo amplio para evitar repetir todo el shape
type Solicitud = any

type Props = {
  solicitud: Solicitud
}

const SolicitudDetailView = ({ solicitud }: Props) => {
  const router = useRouter()
  const [rejectTarget, setRejectTarget] = useState<{ id: string; areaName: string } | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [comentario, setComentario] = useState('')
  const [posting, setPosting] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const estadoLabel = ESTADO_LABEL[solicitud.estadoGlobal as keyof typeof ESTADO_LABEL]
  const estadoColor = ESTADO_COLOR[solicitud.estadoGlobal as keyof typeof ESTADO_COLOR]

  const handleApprove = async (saId: string) => {
    setApproving(saId)
    setError(null)

    try {
      await approveSolicitudArea(saId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar')
    } finally {
      setApproving(null)
    }
  }

  const handleComentario = async () => {
    if (!comentario.trim()) return
    setPosting(true)
    setError(null)

    try {
      await addComentario(solicitud.id, comentario)
      setComentario('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comentar')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-start justify-between flex-wrap gap-3'>
        <div className='flex items-center gap-3'>
          <IconButton onClick={() => router.push('/dashboard/solicitudes')}>
            <i className='solar-arrow-left-linear' />
          </IconButton>
          <div>
            <div className='flex items-center gap-2 flex-wrap'>
              <Typography variant='h5'>{solicitud.nombreEvento}</Typography>
              <Chip label={estadoLabel} color={estadoColor} size='small' variant='tonal' />
              {solicitud.urgente && !solicitud.cancelada && (
                <Chip label='Urgente' color='error' size='small' variant='tonal' />
              )}
            </div>
            <Typography variant='body2' color='text.secondary'>
              Creada por {getDisplayName(solicitud.createdBy)} • {formatDateTime(solicitud.createdAt)}
            </Typography>
          </div>
        </div>
        <div className='flex gap-2 flex-wrap'>
          {solicitud.permissions.canEdit && (
            <Button
              variant='outlined'
              startIcon={<i className='solar-pen-new-square-linear' />}
              onClick={() => router.push(`/dashboard/solicitudes/${solicitud.id}/editar`)}
            >
              Editar
            </Button>
          )}
          {solicitud.permissions.canCancel && (
            <Button
              variant='outlined'
              color='error'
              startIcon={<i className='solar-close-circle-linear' />}
              onClick={() => setCancelOpen(true)}
            >
              Cancelar
            </Button>
          )}
          {(solicitud.permissions.canCreateInforme || solicitud.permissions.canEditInforme || solicitud.informe) && (
            <Button
              variant='contained'
              startIcon={<i className='solar-clipboard-check-linear' />}
              onClick={() => router.push(`/dashboard/solicitudes/${solicitud.id}/informe`)}
            >
              {solicitud.informe ? 'Ver Informe' : 'Crear Informe'}
            </Button>
          )}
        </div>
      </div>

      {error && <Alert severity='error'>{error}</Alert>}

      {solicitud.cancelada && (
        <Alert severity='warning' icon={<i className='solar-info-circle-linear' />}>
          Solicitud cancelada por {getDisplayName(solicitud.canceladaBy)} el {formatDateTime(solicitud.canceladaAt)}.
          <br />
          <strong>Motivo:</strong> {solicitud.canceladaMotivo}
        </Alert>
      )}

      <Grid container spacing={6}>
        {/* Columna info evento */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent>
              <Typography variant='subtitle1' className='font-semibold mb-3'>
                Información del evento
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant='caption' color='text.secondary'>Tipo</Typography>
                  <Typography variant='body2'>
                    {TIPO_EVENTO_LABEL[solicitud.tipoEvento]}
                    {solicitud.tipoEventoOtro && ` — ${solicitud.tipoEventoOtro}`}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant='caption' color='text.secondary'>Fecha</Typography>
                  <Typography variant='body2'>{formatDate(solicitud.fechaEvento)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant='caption' color='text.secondary'>Horario</Typography>
                  <Typography variant='body2'>{solicitud.horaInicio} – {solicitud.horaFin}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant='caption' color='text.secondary'>Lugar</Typography>
                  <Typography variant='body2'>{solicitud.lugar}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant='caption' color='text.secondary'>Área solicitante</Typography>
                  <div className='flex items-center gap-2 mt-1'>
                    <Avatar
                      sx={{ width: 28, height: 28, bgcolor: solicitud.areaSolicitante.color || 'primary.main', color: '#fff' }}
                      variant='rounded'
                    >
                      <i className={solicitud.areaSolicitante.icon || 'solar-folder-linear'} />
                    </Avatar>
                    <Typography variant='body2' className='font-medium'>
                      {solicitud.areaSolicitante.name}
                    </Typography>
                  </div>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant='caption' color='text.secondary'>Contacto</Typography>
                  <Typography variant='body2'>{solicitud.cargoRol || '-'}</Typography>
                  <Typography variant='body2'>{solicitud.telefonoContacto || '-'}</Typography>
                  <Typography variant='body2'>{solicitud.emailContacto || '-'}</Typography>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant='caption' color='text.secondary'>Descripción de la actividad</Typography>
                  <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>{solicitud.descripcionActividad}</Typography>
                </Grid>
                {solicitud.materialesDisponibles && (
                  <Grid size={12}>
                    <Typography variant='caption' color='text.secondary'>Materiales disponibles</Typography>
                    <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>{solicitud.materialesDisponibles}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant='subtitle1' className='font-semibold mb-3'>
                Enfoque y tiempos
              </Typography>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant='caption' color='text.secondary'>Propósito</Typography>
                  <Typography variant='body2'>{solicitud.propositoEvento}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant='caption' color='text.secondary'>Objetivo específico</Typography>
                  <Typography variant='body2'>{solicitud.objetivoEspecifico}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant='caption' color='text.secondary'>Dirigido a</Typography>
                  <Typography variant='body2'>{solicitud.dirigidoA}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant='caption' color='text.secondary'>Resultado esperado</Typography>
                  <Typography variant='body2'>{solicitud.resultadoEsperado}</Typography>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={6}>
                  <Typography variant='caption' color='text.secondary'>Fecha límite</Typography>
                  <Typography variant='body2'>{formatDate(solicitud.fechaLimite)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant='caption' color='text.secondary'>Difusión previa</Typography>
                  <Typography variant='body2'>
                    {solicitud.requiereDifusion
                      ? `Sí, desde ${formatDate(solicitud.inicioComunicacion)}`
                      : 'No requiere'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Columna áreas + comentarios + timeline */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent>
              <Typography variant='subtitle1' className='font-semibold mb-3'>
                Áreas destino ({solicitud.areas.length})
              </Typography>
              <div className='flex flex-col gap-3'>
                {solicitud.areas.map((sa: any) => {
                  const canApprove = solicitud.permissions.canApproveAreaIds.includes(sa.id)

                  return (
                    <Card key={sa.id} variant='outlined'>
                      <CardContent>
                        <div className='flex items-start justify-between gap-3 flex-wrap'>
                          <div className='flex items-start gap-3'>
                            <Avatar
                              sx={{ width: 40, height: 40, bgcolor: sa.area.color || 'primary.main', color: '#fff' }}
                              variant='rounded'
                            >
                              <i className={sa.area.icon || 'solar-folder-linear'} />
                            </Avatar>
                            <div>
                              <Typography variant='subtitle2' className='font-semibold'>
                                {sa.area.name}
                              </Typography>
                              <Chip
                                label={SOLICITUD_AREA_ESTADO_LABEL[sa.estado]}
                                color={SOLICITUD_AREA_ESTADO_COLOR[sa.estado]}
                                size='small'
                                variant='tonal'
                                sx={{ mt: 0.5 }}
                              />
                            </div>
                          </div>
                          {canApprove && !solicitud.cancelada && (
                            <div className='flex gap-2'>
                              <Button
                                size='small'
                                color='success'
                                variant='contained'
                                disabled={approving === sa.id}
                                onClick={() => handleApprove(sa.id)}
                              >
                                {approving === sa.id ? 'Aprobando...' : 'Aprobar'}
                              </Button>
                              <Button
                                size='small'
                                color='error'
                                variant='outlined'
                                onClick={() => setRejectTarget({ id: sa.id, areaName: sa.area.name })}
                              >
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </div>
                        <Typography variant='body2' sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                          {sa.detalleEspecifico}
                        </Typography>
                        {sa.estado !== 'PENDIENTE' && sa.revisadoBy && (
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                            {sa.estado === 'APROBADA' ? 'Aprobado' : 'Rechazado'} por {getDisplayName(sa.revisadoBy)} •{' '}
                            {formatDateTime(sa.revisadoAt)}
                          </Typography>
                        )}
                        {sa.motivoRechazo && (
                          <Alert severity='error' sx={{ mt: 1 }}>
                            <strong>Motivo:</strong> {sa.motivoRechazo}
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant='subtitle1' className='font-semibold mb-3'>
                Comentarios ({solicitud.comentarios.length})
              </Typography>
              <div className='flex flex-col gap-3 mb-3'>
                {solicitud.comentarios.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    Aún no hay comentarios. Inicia la conversación.
                  </Typography>
                ) : (
                  solicitud.comentarios.map((c: any) => (
                    <div key={c.id} className='flex items-start gap-2'>
                      <Avatar src={c.autor.image || undefined} sx={{ width: 32, height: 32 }}>
                        {getDisplayName(c.autor).charAt(0)}
                      </Avatar>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <Typography variant='body2' className='font-semibold'>
                            {getDisplayName(c.autor)}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {formatDateTime(c.createdAt)}
                          </Typography>
                        </div>
                        <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                          {c.texto}
                        </Typography>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className='flex gap-2'>
                <TextField
                  placeholder='Escribe un comentario...'
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  fullWidth
                  multiline
                  size='small'
                  disabled={posting}
                />
                <IconButton color='primary' onClick={handleComentario} disabled={posting || !comentario.trim()}>
                  <i className='solar-plain-2-linear' />
                </IconButton>
              </div>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant='subtitle1' className='font-semibold mb-3'>
                Historial
              </Typography>
              <div className='flex flex-col gap-2'>
                {solicitud.eventos.map((e: any) => (
                  <div key={e.id} className='flex items-start gap-2'>
                    <Tooltip title={e.actor ? getDisplayName(e.actor) : ''}>
                      <Avatar src={e.actor?.image || undefined} sx={{ width: 24, height: 24 }}>
                        <i className='solar-history-2-linear' style={{ fontSize: 14 }} />
                      </Avatar>
                    </Tooltip>
                    <div className='flex-1'>
                      <Typography variant='body2'>
                        <strong>{SOLICITUD_EVENTO_LABEL[e.tipo] || e.tipo}</strong>
                        {e.solicitudArea?.area && <> — {e.solicitudArea.area.name}</>}
                        {e.motivo && <span className='text-textSecondary'> · {e.motivo}</span>}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {formatDateTime(e.createdAt)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <RejectAreaDialog
        target={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSuccess={() => {
          setRejectTarget(null)
          router.refresh()
        }}
      />

      <CancelSolicitudDialog
        open={cancelOpen}
        solicitudId={solicitud.id}
        onClose={() => setCancelOpen(false)}
        onSuccess={() => {
          setCancelOpen(false)
          router.refresh()
        }}
      />
    </div>
  )
}

export default SolicitudDetailView
