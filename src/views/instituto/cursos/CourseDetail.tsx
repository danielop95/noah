'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'

import { createLevel, updateLevel, deleteLevel } from '@/app/server/institutoActions'
import type { CourseWithLevels } from '@/app/server/institutoActions'

type Level = CourseWithLevels['levels'][number]

type LevelDialogState = {
  open: boolean
  level: Level | null
}

type DeleteDialogState = {
  open: boolean
  level: Level | null
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

type EvalConfig = {
  type?: string
  passingGrade?: number
  maxAbsencesPerLevel?: number
  failOnExceed?: string
  components?: { key: string; label: string; weight: number }[]
}

const CourseDetailView = ({ course }: { course: CourseWithLevels }) => {
  const router = useRouter()

  const [levels, setLevels] = useState<Level[]>(course.levels)
  const [levelDialog, setLevelDialog] = useState<LevelDialogState>({ open: false, level: null })
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ open: false, level: null })

  // Level form state
  const [levelName, setLevelName] = useState('')
  const [levelSessions, setLevelSessions] = useState(8)
  const [levelOrder, setLevelOrder] = useState(1)
  const [levelSaving, setLevelSaving] = useState(false)
  const [levelError, setLevelError] = useState<string | null>(null)

  // Delete state
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const openCreateLevel = () => {
    const nextOrder = levels.length > 0 ? Math.max(...levels.map(l => l.sortOrder)) + 1 : 1

    setLevelName('')
    setLevelSessions(8)
    setLevelOrder(nextOrder)
    setLevelError(null)
    setLevelDialog({ open: true, level: null })
  }

  const openEditLevel = (level: Level) => {
    setLevelName(level.name)
    setLevelSessions(level.sessionCount)
    setLevelOrder(level.sortOrder)
    setLevelError(null)
    setLevelDialog({ open: true, level })
  }

  const closeLevelDialog = () => {
    setLevelDialog({ open: false, level: null })
  }

  const handleSaveLevel = async () => {
    if (!levelName.trim()) {
      setLevelError('El nombre es requerido')

      return
    }

    setLevelSaving(true)
    setLevelError(null)

    try {
      if (levelDialog.level) {
        await updateLevel(levelDialog.level.id, {
          name: levelName.trim(),
          sessionCount: levelSessions,
          sortOrder: levelOrder
        })
      } else {
        await createLevel({
          courseId: course.id,
          name: levelName.trim(),
          slug: generateSlug(levelName),
          sortOrder: levelOrder,
          sessionCount: levelSessions
        })
      }

      router.refresh()
      closeLevelDialog()
    } catch (err) {
      setLevelError(err instanceof Error ? err.message : 'Error al guardar el nivel')
    } finally {
      setLevelSaving(false)
    }
  }

  const handleDeleteLevel = async () => {
    if (!deleteDialog.level) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteLevel(deleteDialog.level.id)
      setLevels(prev => prev.filter(l => l.id !== deleteDialog.level!.id))
      setDeleteDialog({ open: false, level: null })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el nivel')
    } finally {
      setDeleting(false)
    }
  }

  const config = course.evaluationConfig as EvalConfig | null

  const renderEvalConfig = () => {
    if (!config) return <Typography variant='body2' color='text.secondary'>Sin configuración</Typography>

    if (config.type === 'weighted') {
      return (
        <Box className='flex flex-col gap-2'>
          <Typography variant='body2'>
            <strong>Nota mínima:</strong> {config.passingGrade ?? 70}/100
          </Typography>
          {config.components && config.components.length > 0 && (
            <Box>
              <Typography variant='body2' className='font-medium mb-1'>Componentes:</Typography>
              {config.components.map(c => (
                <Box key={c.key} className='flex justify-between'>
                  <Typography variant='caption'>{c.label}</Typography>
                  <Typography variant='caption'>{Math.round(c.weight * 100)}%</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )
    }

    if (config.type === 'attendance_threshold') {
      return (
        <Box className='flex flex-col gap-1'>
          <Typography variant='body2'>
            <strong>Máx. ausencias por nivel:</strong> {config.maxAbsencesPerLevel ?? 1}
          </Typography>
          <Typography variant='body2'>
            <strong>Reprueba:</strong> {config.failOnExceed === 'course' ? 'el curso completo' : 'el nivel'}
          </Typography>
        </Box>
      )
    }

    return <Typography variant='body2' color='text.secondary'>Configuración personalizada</Typography>
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <Box className='flex items-center gap-3'>
        <Button
          variant='outlined'
          size='small'
          startIcon={<i className='ri-arrow-left-line' />}
          onClick={() => router.push('/dashboard/instituto/cursos')}
        >
          Volver
        </Button>
        <Box className='flex-1'>
          <Typography variant='h5'>{course.name}</Typography>
          {course.description && (
            <Typography variant='body2' color='text.secondary'>
              {course.description}
            </Typography>
          )}
        </Box>
        <Chip
          label={course.isActive ? 'Activo' : 'Inactivo'}
          color={course.isActive ? 'success' : 'default'}
          variant='tonal'
        />
      </Box>

      <Grid container spacing={4}>
        {/* Información del curso */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardHeader title='Información del curso' />
            <CardContent>
              <Box className='flex flex-col gap-3'>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Slug</Typography>
                  <Typography variant='body2'>{course.slug}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant='caption' color='text.secondary'>Tipo de evaluación</Typography>
                  <Box className='mt-1'>
                    <Chip
                      label={course.evaluationType === 'graded' ? 'Con calificaciones' : 'Solo asistencia'}
                      size='small'
                      color={course.evaluationType === 'graded' ? 'success' : 'warning'}
                      variant='tonal'
                    />
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Typography variant='caption' color='text.secondary' className='mb-2 block'>
                    Configuración de evaluación
                  </Typography>
                  {renderEvalConfig()}
                </Box>
                <Divider />
                <Box className='flex gap-4'>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>Niveles</Typography>
                    <Typography variant='body2' className='font-medium'>{levels.length}</Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>Cohortes</Typography>
                    <Typography variant='body2' className='font-medium'>{course._count.cohorts}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Niveles */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardHeader
              title='Niveles'
              action={
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<i className='ri-add-line' />}
                  onClick={openCreateLevel}
                >
                  Agregar nivel
                </Button>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {levels.length === 0 ? (
                <Box className='flex flex-col items-center gap-2 py-8'>
                  <i className='solar-notebook-linear text-5xl text-textSecondary' />
                  <Typography variant='body2' color='text.secondary'>
                    No hay niveles aún
                  </Typography>
                  <Button variant='outlined' size='small' onClick={openCreateLevel}>
                    Agregar primer nivel
                  </Button>
                </Box>
              ) : (
                <List disablePadding>
                  {[...levels].sort((a, b) => a.sortOrder - b.sortOrder).map((level, index) => (
                    <Box key={level.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        disablePadding
                        sx={{ py: 1.5 }}
                        secondaryAction={
                          <Box className='flex gap-1'>
                            <Tooltip title='Editar'>
                              <IconButton size='small' onClick={() => openEditLevel(level)}>
                                <i className='ri-edit-line' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Eliminar'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => {
                                  setDeleteError(null)
                                  setDeleteDialog({ open: true, level })
                                }}
                              >
                                <i className='ri-delete-bin-line' />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      >
                        <Box className='flex items-center gap-3 flex-1 pr-16'>
                          <Box
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            {level.sortOrder}
                          </Box>
                          <ListItemText
                            primary={level.name}
                            secondary={`${level.sessionCount} sesiones · ${level._count.cohorts} cohorte${level._count.cohorts !== 1 ? 's' : ''}`}
                          />
                          <Chip
                            label={level.isActive ? 'Activo' : 'Inactivo'}
                            size='small'
                            color={level.isActive ? 'success' : 'default'}
                            variant='tonal'
                            sx={{ flexShrink: 0 }}
                          />
                        </Box>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog: crear/editar nivel */}
      <Dialog open={levelDialog.open} onClose={closeLevelDialog} maxWidth='xs' fullWidth>
        <DialogTitle>{levelDialog.level ? 'Editar Nivel' : 'Nuevo Nivel'}</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 pt-2'>
            {levelError && (
              <Alert severity='error' onClose={() => setLevelError(null)}>
                {levelError}
              </Alert>
            )}
            <TextField
              label='Nombre del nivel'
              value={levelName}
              onChange={e => setLevelName(e.target.value)}
              fullWidth
              required
              autoFocus
              error={!levelName.trim() && !!levelError}
            />
            <TextField
              label='Número de sesiones'
              type='number'
              value={levelSessions}
              onChange={e => setLevelSessions(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1, max: 52 }}
            />
            <TextField
              label='Orden'
              type='number'
              value={levelOrder}
              onChange={e => setLevelOrder(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
              helperText='Posición en la secuencia del curso'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLevelDialog} disabled={levelSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSaveLevel} variant='contained' disabled={levelSaving}>
            {levelSaving ? 'Guardando...' : levelDialog.level ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: eliminar nivel */}
      <Dialog open={deleteDialog.open} onClose={() => !deleting && setDeleteDialog({ open: false, level: null })}>
        <DialogTitle>Eliminar Nivel</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de eliminar el nivel <strong>{deleteDialog.level?.name}</strong>? Esta acción no se puede deshacer.
          </Typography>
          {deleteError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, level: null })} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteLevel} color='error' variant='contained' disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default CourseDetailView
