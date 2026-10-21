'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { createSolicitud, updateSolicitud } from '@/app/server/solicitudesActions'
import type { CreateSolicitudInput } from '@/app/server/solicitudesActions'

type AreaOption = { id: string; name: string; slug: string; icon: string | null; color: string | null }

type ExistingSolicitud = {
  id: string
  areaSolicitanteId: string
  cargoRol: string | null
  telefonoContacto: string | null
  emailContacto: string | null
  nombreEvento: string
  tipoEvento: string
  tipoEventoOtro: string | null
  fechaEvento: Date
  horaInicio: string
  horaFin: string
  lugar: string
  descripcionActividad: string
  materialesDisponibles: string | null
  propositoEvento: string
  objetivoEspecifico: string
  dirigidoA: string
  resultadoEsperado: string
  fechaLimite: Date
  requiereDifusion: boolean
  inicioComunicacion: Date | null
  confirmacion15Dias: boolean
  areas: Array<{ areaId: string; detalleEspecifico: string }>
}

type Props = {
  mode: 'create' | 'edit'
  areas: AreaOption[]
  defaults: { cargoRol: string | null; telefonoContacto: string | null; emailContacto: string | null }
  solicitud?: ExistingSolicitud
}

const toIsoDate = (d: Date | string | null | undefined): string => {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d

  return date.toISOString().split('T')[0]
}

const SolicitudFormView = ({ mode, areas, defaults, solicitud }: Props) => {
  const router = useRouter()
  const editing = mode === 'edit'

  const [areaSolicitanteId, setAreaSolicitanteId] = useState(solicitud?.areaSolicitanteId ?? '')
  const [cargoRol, setCargoRol] = useState(solicitud?.cargoRol ?? defaults.cargoRol ?? '')
  const [telefonoContacto, setTelefonoContacto] = useState(solicitud?.telefonoContacto ?? defaults.telefonoContacto ?? '')
  const [emailContacto, setEmailContacto] = useState(solicitud?.emailContacto ?? defaults.emailContacto ?? '')

  const [nombreEvento, setNombreEvento] = useState(solicitud?.nombreEvento ?? '')
  const [tipoEvento, setTipoEvento] = useState<CreateSolicitudInput['tipoEvento']>(
    (solicitud?.tipoEvento as CreateSolicitudInput['tipoEvento']) ?? 'EVENTO_ESPECIAL'
  )
  const [tipoEventoOtro, setTipoEventoOtro] = useState(solicitud?.tipoEventoOtro ?? '')
  const [fechaEvento, setFechaEvento] = useState(toIsoDate(solicitud?.fechaEvento))
  const [horaInicio, setHoraInicio] = useState(solicitud?.horaInicio ?? '')
  const [horaFin, setHoraFin] = useState(solicitud?.horaFin ?? '')
  const [lugar, setLugar] = useState(solicitud?.lugar ?? '')

  const [descripcionActividad, setDescripcionActividad] = useState(solicitud?.descripcionActividad ?? '')
  const [materialesDisponibles, setMaterialesDisponibles] = useState(solicitud?.materialesDisponibles ?? '')

  const [propositoEvento, setPropositoEvento] = useState(solicitud?.propositoEvento ?? '')
  const [objetivoEspecifico, setObjetivoEspecifico] = useState(solicitud?.objetivoEspecifico ?? '')
  const [dirigidoA, setDirigidoA] = useState(solicitud?.dirigidoA ?? '')
  const [resultadoEsperado, setResultadoEsperado] = useState(solicitud?.resultadoEsperado ?? '')

  const [fechaLimite, setFechaLimite] = useState(toIsoDate(solicitud?.fechaLimite))
  const [requiereDifusion, setRequiereDifusion] = useState(solicitud?.requiereDifusion ?? false)
  const [inicioComunicacion, setInicioComunicacion] = useState(toIsoDate(solicitud?.inicioComunicacion))
  const [confirmacion15Dias, setConfirmacion15Dias] = useState(solicitud?.confirmacion15Dias ?? false)

  const [areasDestino, setAreasDestino] = useState<Array<{ areaId: string; detalleEspecifico: string }>>(
    solicitud?.areas ?? []
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date()
  const diff = fechaEvento ? Math.floor((new Date(fechaEvento).getTime() - today.getTime()) / 86400000) : Infinity
  const showUrgenteAlert = fechaEvento && diff >= 0 && diff < 15

  const toggleArea = (areaId: string) => {
    setAreasDestino(prev =>
      prev.some(a => a.areaId === areaId)
        ? prev.filter(a => a.areaId !== areaId)
        : [...prev, { areaId, detalleEspecifico: '' }]
    )
  }

  const updateDetalle = (areaId: string, value: string) => {
    setAreasDestino(prev => prev.map(a => (a.areaId === areaId ? { ...a, detalleEspecifico: value } : a)))
  }

  const handleSubmit = async () => {
    setError(null)

    if (!areaSolicitanteId) return setError('Selecciona el área solicitante')
    if (!nombreEvento.trim()) return setError('El nombre del evento es obligatorio')
    if (!fechaEvento) return setError('La fecha del evento es obligatoria')
    if (!horaInicio || !horaFin) return setError('Las horas de inicio y fin son obligatorias')
    if (!lugar.trim()) return setError('El lugar es obligatorio')
    if (!descripcionActividad.trim()) return setError('Describe la actividad o dinámica del evento')
    if (!propositoEvento.trim() || !objetivoEspecifico.trim() || !dirigidoA.trim() || !resultadoEsperado.trim())
      return setError('Completa la sección "Enfoque del evento"')
    if (!fechaLimite) return setError('La fecha límite es obligatoria')
    if (requiereDifusion && !inicioComunicacion) return setError('Indica desde cuándo se debe comunicar')
    if (areasDestino.length === 0) return setError('Selecciona al menos un área destino')
    if (areasDestino.some(a => !a.detalleEspecifico.trim()))
      return setError('Describe qué necesitas de cada área seleccionada')

    setSaving(true)

    try {
      const payload: CreateSolicitudInput = {
        areaSolicitanteId,
        cargoRol: cargoRol.trim() || null,
        telefonoContacto: telefonoContacto.trim() || null,
        emailContacto: emailContacto.trim() || null,
        nombreEvento: nombreEvento.trim(),
        tipoEvento,
        tipoEventoOtro: tipoEvento === 'OTRO' ? tipoEventoOtro.trim() || null : null,
        fechaEvento,
        horaInicio,
        horaFin,
        lugar: lugar.trim(),
        descripcionActividad: descripcionActividad.trim(),
        materialesDisponibles: materialesDisponibles.trim() || null,
        propositoEvento: propositoEvento.trim(),
        objetivoEspecifico: objetivoEspecifico.trim(),
        dirigidoA: dirigidoA.trim(),
        resultadoEsperado: resultadoEsperado.trim(),
        fechaLimite,
        requiereDifusion,
        inicioComunicacion: requiereDifusion ? inicioComunicacion : null,
        confirmacion15Dias,
        areas: areasDestino.map(a => ({ areaId: a.areaId, detalleEspecifico: a.detalleEspecifico.trim() }))
      }

      if (editing && solicitud) {
        await updateSolicitud(solicitud.id, payload)
        router.push(`/dashboard/solicitudes/${solicitud.id}`)
      } else {
        const created = await createSolicitud(payload)

        router.push(`/dashboard/solicitudes/${created.id}`)
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-3'>
        <IconButton onClick={() => router.back()}>
          <i className='solar-arrow-left-linear' />
        </IconButton>
        <div>
          <Typography variant='h4'>{editing ? 'Editar Solicitud' : 'Nueva Solicitud Interáreas'}</Typography>
          <Typography variant='body2' color='text.secondary'>
            Solicita apoyo de las áreas operativas de Casa del Rey. Las solicitudes con menos de 15 días de
            anticipación se marcan como urgentes.
          </Typography>
        </div>
      </div>

      {error && <Alert severity='error'>{error}</Alert>}
      {showUrgenteAlert && (
        <Alert severity='warning'>
          Esta solicitud tiene menos de 15 días de anticipación. Se marcará como <strong>urgente</strong>.
        </Alert>
      )}

      {/* Sección 1: Solicitante */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            1. Información del solicitante
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label='Área / Ministerio solicitante'
                value={areaSolicitanteId}
                onChange={e => setAreaSolicitanteId(e.target.value)}
                fullWidth
                required
              >
                <MenuItem value=''>Selecciona...</MenuItem>
                {areas.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    <div className='flex items-center gap-2'>
                      <i className={a.icon || 'solar-folder-linear'} />
                      <span>{a.name}</span>
                    </div>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label='Cargo o rol' value={cargoRol} onChange={e => setCargoRol(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='Número de contacto'
                value={telefonoContacto}
                onChange={e => setTelefonoContacto(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='Correo electrónico'
                value={emailContacto}
                onChange={e => setEmailContacto(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sección 2: Evento */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            2. Información del evento
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='Nombre del evento o actividad'
                value={nombreEvento}
                onChange={e => setNombreEvento(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label='Tipo de evento'
                value={tipoEvento}
                onChange={e => setTipoEvento(e.target.value as CreateSolicitudInput['tipoEvento'])}
                fullWidth
              >
                <MenuItem value='SERVICIO'>Servicio</MenuItem>
                <MenuItem value='EVENTO_ESPECIAL'>Evento especial</MenuItem>
                <MenuItem value='REUNION_INTERNA'>Reunión interna</MenuItem>
                <MenuItem value='OTRO'>Otro</MenuItem>
              </TextField>
            </Grid>
            {tipoEvento === 'OTRO' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Especifica el tipo'
                  value={tipoEventoOtro}
                  onChange={e => setTipoEventoOtro(e.target.value)}
                  fullWidth
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                type='date'
                label='Fecha del evento'
                value={fechaEvento}
                onChange={e => setFechaEvento(e.target.value)}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField
                type='time'
                label='Hora inicio'
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField
                type='time'
                label='Hora fin'
                value={horaFin}
                onChange={e => setHoraFin(e.target.value)}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label='Lugar del evento'
                value={lugar}
                onChange={e => setLugar(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label='Describe brevemente la actividad o dinámica del evento'
                value={descripcionActividad}
                onChange={e => setDescripcionActividad(e.target.value)}
                fullWidth
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label='¿Qué materiales ya tienes? (textos, fotos, videos, referencias)'
                value={materialesDisponibles}
                onChange={e => setMaterialesDisponibles(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder='Pega aquí enlaces a Drive, YouTube, etc.'
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sección 3: Áreas destino */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-1'>
            3. Solicitud de apoyo
          </Typography>
          <Typography variant='body2' color='text.secondary' className='mb-3'>
            Selecciona las áreas que necesitas y describe qué requieres específicamente de cada una.
          </Typography>
          <div className='flex flex-wrap gap-2 mb-4'>
            {areas.map(a => {
              const selected = areasDestino.some(d => d.areaId === a.id)

              return (
                <Chip
                  key={a.id}
                  icon={<i className={a.icon || 'solar-folder-linear'} />}
                  label={a.name}
                  onClick={() => toggleArea(a.id)}
                  variant={selected ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: selected ? a.color || undefined : undefined,
                    color: selected ? '#fff' : undefined,
                    cursor: 'pointer'
                  }}
                />
              )
            })}
          </div>
          {areasDestino.length === 0 ? (
            <Alert severity='info'>Selecciona al menos un área destino arriba.</Alert>
          ) : (
            <div className='flex flex-col gap-3'>
              {areasDestino.map(a => {
                const area = areas.find(x => x.id === a.areaId)

                return (
                  <Box
                    key={a.areaId}
                    sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: area?.color || 'primary.main', color: '#fff' }}
                        variant='rounded'
                      >
                        <i className={area?.icon || 'solar-folder-linear'} />
                      </Avatar>
                      <Typography variant='subtitle2' className='font-semibold'>
                        {area?.name}
                      </Typography>
                    </div>
                    <TextField
                      label='¿Qué necesitas específicamente?'
                      placeholder='Ej: diseño de piezas, cobertura fotográfica, montaje de sillas, sonido...'
                      value={a.detalleEspecifico}
                      onChange={e => updateDetalle(a.areaId, e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      required
                    />
                  </Box>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección 4: Enfoque */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            4. Enfoque del evento
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='¿Cuál es el propósito del evento?'
                value={propositoEvento}
                onChange={e => setPropositoEvento(e.target.value)}
                fullWidth
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='¿Qué objetivo específico tiene?'
                value={objetivoEspecifico}
                onChange={e => setObjetivoEspecifico(e.target.value)}
                fullWidth
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='¿A quién está dirigido?'
                value={dirigidoA}
                onChange={e => setDirigidoA(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='¿Qué resultado esperas lograr?'
                placeholder='Ej: asistencia, ministración, integración...'
                value={resultadoEsperado}
                onChange={e => setResultadoEsperado(e.target.value)}
                fullWidth
                multiline
                rows={2}
                required
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sección 5: Tiempos */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            5. Tiempos
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                type='date'
                label='Fecha límite para tenerlo listo'
                value={fechaLimite}
                onChange={e => setFechaLimite(e.target.value)}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch checked={requiereDifusion} onChange={e => setRequiereDifusion(e.target.checked)} />
                }
                label='¿Requiere difusión previa?'
              />
            </Grid>
            {requiereDifusion && (
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  type='date'
                  label='¿Desde cuándo se debe comunicar?'
                  value={inicioComunicacion}
                  onChange={e => setInicioComunicacion(e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Sección 6: Confirmación */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-2'>
            6. Confirmación
          </Typography>
          <FormControlLabel
            control={
              <Checkbox checked={confirmacion15Dias} onChange={e => setConfirmacion15Dias(e.target.checked)} />
            }
            label='Confirmo que estoy realizando esta solicitud con al menos 15 días de anticipación.'
          />
        </CardContent>
      </Card>

      <div className='flex justify-end gap-3'>
        <Button variant='outlined' onClick={() => router.back()} disabled={saving}>
          Cancelar
        </Button>
        <Button variant='contained' onClick={handleSubmit} disabled={saving}>
          {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear solicitud'}
        </Button>
      </div>
    </div>
  )
}

export default SolicitudFormView
