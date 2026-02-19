'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

// Custom Components
import CustomAvatar from '@core/components/mui/Avatar'

type ReportData = {
  id: string
  meetingDate: Date
  totalAttendees: number
  leadersCount: number
  visitorsCount: number
  reportOffering: boolean
  offeringAmount: number | null
  notes: string | null
  createdAt: Date
  reporter: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
  }
}

type Props = {
  reports: ReportData[]
  groupId: string
  stats: {
    totalReports: number
    avgAttendees: number
    totalVisitors: number
    reportsThisMonth: number
  }
}

const getDisplayName = (reporter: ReportData['reporter']) =>
  reporter.name || `${reporter.firstName || ''} ${reporter.lastName || ''}`.trim() || 'Sin nombre'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const GroupReportsTab = ({ reports, groupId, stats }: Props) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, report: ReportData) => {
    setAnchorEl(event.currentTarget)
    setSelectedReport(report)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedReport(null)
  }

  const handleViewReport = () => {
    // TODO: Implementar vista de detalle del reporte
    console.log('Ver reporte:', selectedReport?.id)
    handleMenuClose()
  }

  const handleEditReport = () => {
    // TODO: Implementar edición de reporte
    console.log('Editar reporte:', selectedReport?.id)
    handleMenuClose()
  }

  const handleDeleteReport = () => {
    // TODO: Implementar eliminación de reporte
    console.log('Eliminar reporte:', selectedReport?.id)
    handleMenuClose()
  }

  if (reports.length === 0) {
    return (
      <Box className='flex flex-col items-center justify-center py-12'>
        <CustomAvatar skin='light' color='info' size={64} sx={{ mb: 2 }}>
          <i className='ri-file-list-3-line text-3xl' />
        </CustomAvatar>
        <Typography variant='h6' className='mbe-1'>
          Sin reportes
        </Typography>
        <Typography variant='body2' color='text.secondary' className='mbe-4'>
          Este grupo aún no tiene reportes registrados
        </Typography>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => router.push('/dashboard/reportes')}
        >
          Crear Reporte
        </Button>
      </Box>
    )
  }

  return (
    <Box className='p-4'>
      {/* Header con estadísticas rápidas y acción */}
      <Box className='flex items-center justify-between mbe-4 flex-wrap gap-4'>
        <Box className='flex items-center gap-4'>
          <Chip
            icon={<i className='ri-file-list-3-line' />}
            label={`${stats.totalReports} reportes`}
            color='primary'
            variant='tonal'
          />
          <Chip
            icon={<i className='ri-group-line' />}
            label={`Prom. ${stats.avgAttendees} asistentes`}
            color='success'
            variant='tonal'
          />
        </Box>
        <Button
          size='small'
          variant='outlined'
          startIcon={<i className='ri-add-line' />}
          onClick={() => router.push('/dashboard/reportes')}
        >
          Nuevo Reporte
        </Button>
      </Box>

      {/* Lista de reportes */}
      <Typography variant='subtitle2' color='text.secondary' className='mbe-3'>
        Últimos 10 reportes
      </Typography>

      <Box className='flex flex-col gap-2'>
        {reports.map(report => {
          const reporterName = getDisplayName(report.reporter)

          return (
            <Box
              key={report.id}
              className='flex items-center gap-3 p-3 rounded-lg'
              sx={{
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              {/* Fecha */}
              <Box
                className='flex flex-col items-center justify-center p-2 rounded-lg'
                sx={{
                  bgcolor: 'success.main',
                  minWidth: 56
                }}
              >
                <Typography variant='h6' fontWeight={700} sx={{ color: 'success.contrastText' }}>
                  {new Date(report.meetingDate).getDate()}
                </Typography>
                <Typography variant='caption' sx={{ color: 'success.contrastText', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  {new Date(report.meetingDate).toLocaleDateString('es-CO', { month: 'short' })}
                </Typography>
              </Box>

              {/* Info del reporte */}
              <Box className='flex-1 min-w-0'>
                <Box className='flex items-center gap-2 flex-wrap'>
                  <Typography variant='body2' fontWeight={500}>
                    {report.totalAttendees} asistentes
                  </Typography>
                  {report.visitorsCount > 0 && (
                    <Chip
                      label={`${report.visitorsCount} visitas`}
                      size='small'
                      color='success'
                      variant='tonal'
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                  {report.reportOffering && report.offeringAmount && (
                    <Chip
                      icon={<i className='ri-money-dollar-circle-line text-xs' />}
                      label={formatCurrency(report.offeringAmount)}
                      size='small'
                      color='warning'
                      variant='tonal'
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                <Box className='flex items-center gap-2 mbs-1'>
                  <Typography variant='caption' color='text.secondary'>
                    {report.leadersCount} {report.leadersCount === 1 ? 'líder' : 'líderes'}
                  </Typography>
                  <Typography variant='caption' color='text.disabled'>•</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Por {reporterName}
                  </Typography>
                </Box>
                {report.notes && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    noWrap
                    className='block mbs-1'
                    sx={{ maxWidth: 300 }}
                  >
                    {report.notes}
                  </Typography>
                )}
              </Box>

              {/* Acciones */}
              <IconButton
                size='small'
                onClick={(e) => handleMenuOpen(e, report)}
              >
                <i className='ri-more-2-line' />
              </IconButton>
            </Box>
          )
        })}
      </Box>

      {/* Ver todos los reportes */}
      {stats.totalReports > 10 && (
        <Box className='text-center mbs-4'>
          <Button
            variant='text'
            endIcon={<i className='ri-arrow-right-line' />}
            onClick={() => router.push('/dashboard/reportes')}
          >
            Ver todos los reportes ({stats.totalReports})
          </Button>
        </Box>
      )}

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleViewReport}>
          <ListItemIcon>
            <i className='ri-eye-line' />
          </ListItemIcon>
          <ListItemText>Ver detalle</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditReport}>
          <ListItemIcon>
            <i className='ri-edit-line' />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteReport} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <i className='ri-delete-bin-line' />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default GroupReportsTab
