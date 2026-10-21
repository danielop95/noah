'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { createInforme, updateInforme } from '@/app/server/solicitudesActions'
import type { CreateInformeInput } from '@/app/server/solicitudesActions'
import { CUMPLIMIENTO_LABEL, formatDate } from './estadoUtils'

type Mode = 'create' | 'edit' | 'view'

type Props = {
  solicitud: any
  mode: Mode
}

const evalLabels = [
  { key: 'evalOrganizacion', label: 'Organización general' },
  { key: 'evalComunicacion', label: 'Comunicación previa' },
  { key: 'evalTrabajoEquipo', label: 'Trabajo en equipo entre áreas' },
  { key: 'evalTiempos', label: 'Cumplimiento de tiempos' },
  { key: 'evalEjecucion', label: 'Ejecución del evento' }
] as const

const InformeFormView = ({ solicitud, mode }: Props) => {
  const router = useRouter()
  const readOnly = mode === 'view'
  const existing = solicitud.informe

  const [desarrolloTexto, setDesarrolloTexto] = useState(existing?.desarrolloTexto ?? '')
  const [cumplimiento, setCumplimiento] = useState<CreateInformeInput['cumplimiento']>(existing?.cumplimiento ?? 'SI')
  const [cambiosUltimoMomento, setCambiosUltimoMomento] = useState(existing?.cambiosUltimoMomento ?? '')
  const [objetivoCumplido, setObjetivoCumplido] = useState(existing?.objetivoCumplido ?? '')
  const [resultadosDestacados, setResultadosDestacados] = useState(existing?.resultadosDestacados ?? '')
  const [evalOrganizacion, setEvalOrganizacion] = useState<number>(existing?.evalOrganizacion ?? 3)
  const [evalComunicacion, setEvalComunicacion] = useState<number>(existing?.evalComunicacion ?? 3)
  const [evalTrabajoEquipo, setEvalTrabajoEquipo] = useState<number>(existing?.evalTrabajoEquipo ?? 3)
  const [evalTiempos, setEvalTiempos] = useState<number>(existing?.evalTiempos ?? 3)
  const [evalEjecucion, setEvalEjecucion] = useState<number>(existing?.evalEjecucion ?? 3)
  const [saliBien, setSaliBien] = useState(existing?.saliBien ?? '')
  const [noSalio, setNoSalio] = useState(existing?.noSalio ?? '')
  const [mejoras, setMejoras] = useState(existing?.mejoras ?? '')
  const [linkFotos, setLinkFotos] = useState(existing?.linkFotos ?? '')
  const [linkVideos, setLinkVideos] = useState(existing?.linkVideos ?? '')
  const [linkPiezas, setLinkPiezas] = useState(existing?.linkPiezas ?? '')
  const [linkPresentaciones, setLinkPresentaciones] = useState(existing?.linkPresentaciones ?? '')
  const [otrosLinks, setOtrosLinks] = useState(existing?.otrosLinks ?? '')
  const [recomendaciones, setRecomendaciones] = useState(existing?.recomendaciones ?? '')
  const [comentariosAdicionales, setComentariosAdicionales] = useState(existing?.comentariosAdicionales ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const evalSetters: Record<string, (n: number) => void> = {
    evalOrganizacion: setEvalOrganizacion,
    evalComunicacion: setEvalComunicacion,
    evalTrabajoEquipo: setEvalTrabajoEquipo,
    evalTiempos: setEvalTiempos,
    evalEjecucion: setEvalEjecucion
  }

  const evalValues: Record<string, number> = {
    evalOrganizacion,
    evalComunicacion,
    evalTrabajoEquipo,
    evalTiempos,
    evalEjecucion
  }

  const handleSubmit = async () => {
    setError(null)

    if (!desarrolloTexto.trim() || !objetivoCumplido.trim() || !resultadosDestacados.trim()) {
      return setError('Completa la sección de Desarrollo y Resultados')
    }

    if (!saliBien.trim() || !noSalio.trim() || !mejoras.trim()) {
      return setError('Completa la sección de Aprendizajes')
    }

    setSaving(true)

    try {
      const payload: CreateInformeInput = {
        desarrolloTexto,
        cumplimiento,
        cambiosUltimoMomento: cambiosUltimoMomento || null,
        objetivoCumplido,
        resultadosDestacados,
        evalOrganizacion,
        evalComunicacion,
        evalTrabajoEquipo,
        evalTiempos,
        evalEjecucion,
        saliBien,
        noSalio,
        mejoras,
        linkFotos: linkFotos || null,
        linkVideos: linkVideos || null,
        linkPiezas: linkPiezas || null,
        linkPresentaciones: linkPresentaciones || null,
        otrosLinks: otrosLinks || null,
        recomendaciones: recomendaciones || null,
        comentariosAdicionales: comentariosAdicionales || null
      }

      if (mode === 'create') {
        await createInforme(solicitud.id, payload)
      } else if (mode === 'edit') {
        await updateInforme(solicitud.id, payload)
      }

      router.push(`/dashboard/solicitudes/${solicitud.id}`)
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
        <IconButton onClick={() => router.push(`/dashboard/solicitudes/${solicitud.id}`)}>
          <i className='solar-arrow-left-linear' />
        </IconButton>
        <div>
          <Typography variant='h5'>
            {mode === 'create' ? 'Crear Informe Final' : mode === 'edit' ? 'Editar Informe Final' : 'Informe Final'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {solicitud.nombreEvento} • {formatDate(solicitud.fechaEvento)} • {solicitud.lugar}
          </Typography>
        </div>
      </div>

      {error && <Alert severity='error'>{error}</Alert>}

      {/* Desarrollo */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            Desarrollo del evento
          </Typography>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label='Describe brevemente cómo se desarrolló el evento'
                value={desarrolloTexto}
                onChange={e => setDesarrolloTexto(e.target.value)}
                fullWidth
                multiline
                rows={3}
                disabled={readOnly}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label='¿Se cumplió la programación?'
                value={cumplimiento}
                onChange={e => setCumplimiento(e.target.value as CreateInformeInput['cumplimiento'])}
                fullWidth
                disabled={readOnly}
              >
                {Object.entries(CUMPLIMIENTO_LABEL).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label='¿Hubo cambios de último momento? ¿Cuáles?'
                value={cambiosUltimoMomento}
                onChange={e => setCambiosUltimoMomento(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={readOnly}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            Resultados
          </Typography>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label='¿Se cumplió el objetivo del evento?'
                value={objetivoCumplido}
                onChange={e => setObjetivoCumplido(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={readOnly}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label='¿Qué resultados destacas? (asistencia, impacto espiritual, participación, etc.)'
                value={resultadosDestacados}
                onChange={e => setResultadosDestacados(e.target.value)}
                fullWidth
                multiline
                rows={3}
                disabled={readOnly}
                required
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Evaluación 1-5 */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            Evaluación por áreas (1–5)
          </Typography>
          <Grid container spacing={2}>
            {evalLabels.map(({ key, label }) => (
              <Grid key={key} size={{ xs: 12, sm: 6 }}>
                <Box className='flex items-center justify-between gap-2'>
                  <Typography variant='body2'>{label}</Typography>
                  <Rating
                    name={key}
                    value={evalValues[key]}
                    onChange={(_, v) => v && evalSetters[key](v)}
                    max={5}
                    disabled={readOnly}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Aprendizajes */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            Aprendizajes
          </Typography>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label='¿Qué salió bien y se debe repetir?'
                value={saliBien}
                onChange={e => setSaliBien(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={readOnly}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label='¿Qué no salió como se esperaba?'
                value={noSalio}
                onChange={e => setNoSalio(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={readOnly}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label='¿Qué se puede mejorar para próximos eventos?'
                value={mejoras}
                onChange={e => setMejoras(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={readOnly}
                required
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Materiales */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            Materiales y soportes (URLs)
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='Link de fotos'
                value={linkFotos}
                onChange={e => setLinkFotos(e.target.value)}
                fullWidth
                disabled={readOnly}
                placeholder='https://...'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='Link de videos'
                value={linkVideos}
                onChange={e => setLinkVideos(e.target.value)}
                fullWidth
                disabled={readOnly}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='Link de piezas gráficas'
                value={linkPiezas}
                onChange={e => setLinkPiezas(e.target.value)}
                fullWidth
                disabled={readOnly}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='Link de presentaciones'
                value={linkPresentaciones}
                onChange={e => setLinkPresentaciones(e.target.value)}
                fullWidth
                disabled={readOnly}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label='Otros archivos relevantes'
                value={otrosLinks}
                onChange={e => setOtrosLinks(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={readOnly}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Observaciones */}
      <Card>
        <CardContent>
          <Typography variant='subtitle1' className='font-semibold mb-3'>
            Observaciones finales
          </Typography>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label='Recomendaciones para próximos eventos similares'
                value={recomendaciones}
                onChange={e => setRecomendaciones(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={readOnly}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label='Comentarios adicionales'
                value={comentariosAdicionales}
                onChange={e => setComentariosAdicionales(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={readOnly}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {!readOnly && (
        <div className='flex justify-end gap-3'>
          <Button variant='outlined' onClick={() => router.back()} disabled={saving}>
            Cancelar
          </Button>
          <Button variant='contained' onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear informe' : 'Guardar cambios'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default InformeFormView
