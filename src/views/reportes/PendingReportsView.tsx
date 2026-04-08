'use client'

import { useState, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'

import ReportDrawer from '@/views/reportes/ReportDrawer'
import type { DetailedUnreportedGroup, VacationPeriodInfo, GroupOptionForReports } from '@/app/server/reportActions'

type PendingReportsViewProps = {
  groups: DetailedUnreportedGroup[]
  activeVacation: VacationPeriodInfo
  reportGroups: GroupOptionForReports[]
  isAdmin: boolean
}

const DAYS_LABELS: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
}

const formatDateShort = (date: Date) => {
  return new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

const formatDateWithDay = (date: Date) => {
  return new Date(date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

const formatDateForInput = (date: Date): string => {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

const PendingReportsView = ({ groups, activeVacation, reportGroups, isAdmin }: PendingReportsViewProps) => {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>()
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState('')

  const networks = useMemo(() => {
    const seen = new Set<string>()
    const result: { id: string; name: string }[] = []

    for (const g of groups) {
      if (!seen.has(g.networkId)) {
        seen.add(g.networkId)
        result.push({ id: g.networkId, name: g.networkName })
      }
    }

    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [groups])

  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesNetwork = selectedNetwork === '' || g.networkId === selectedNetwork

      return matchesSearch && matchesNetwork
    })
  }, [groups, searchQuery, selectedNetwork])

  const totalMissingWeeks = filteredGroups.reduce((acc, g) => acc + g.totalMissingWeeks, 0)
  const hasActiveFilters = searchQuery !== '' || selectedNetwork !== ''

  const handleReport = (groupId: string, expectedDate: Date) => {
    setSelectedGroupId(groupId)
    setSelectedDate(formatDateForInput(expectedDate))
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedGroupId(undefined)
    setSelectedDate(undefined)
  }

  const handleRefresh = () => {
    handleDrawerClose()
    router.refresh()
  }

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape' })

    // Título
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Reportes Pendientes — Casa del Rey', 14, 18)

    // Fecha de generación
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    const today = new Date()
    const fechaGeneracion = today.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

    doc.text(`Generado el ${fechaGeneracion}`, 14, 25)

    // Resumen
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(
      `${filteredGroups.length} grupo${filteredGroups.length !== 1 ? 's' : ''} pendiente${filteredGroups.length !== 1 ? 's' : ''} · ${totalMissingWeeks} semana${totalMissingWeeks !== 1 ? 's' : ''} sin reportar`,
      14,
      32
    )

    // Si hay filtros activos, indicarlo
    if (hasActiveFilters) {
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 200)
      const filtrosTexto = [
        searchQuery ? `Búsqueda: "${searchQuery}"` : null,
        selectedNetwork ? `Red: ${networks.find(n => n.id === selectedNetwork)?.name ?? selectedNetwork}` : null
      ]
        .filter(Boolean)
        .join(' · ')

      doc.text(`Filtros activos: ${filtrosTexto}`, 14, 38)
    }

    // Preparar datos de la tabla
    const headers = ['Grupo', 'Red', 'Día / Hora', 'Último Reporte', 'Estado', 'Semanas Pendientes']

    const rows = filteredGroups.map(group => {
      const dia = DAYS_LABELS[group.meetingDay] || group.meetingDay
      const hora = group.meetingTime ? ` ${group.meetingTime}` : ''
      const ultimoReporte = group.lastReportDate ? formatDateWithDay(group.lastReportDate) : 'Sin reportes'
      const estado = group.totalMissingWeeks > 2 ? 'Atrasado' : 'Pendiente'
      const semanas = group.missingWeeks
        .map(w => `${formatDateShort(w.weekStart)} - ${formatDateShort(w.weekEnd)}`)
        .join('\n')

      return [group.name, group.networkName, `${dia}${hora}`, ultimoReporte, estado, semanas]
    })

    // Generar tabla
    ;(doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: hasActiveFilters ? 43 : 38,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        valign: 'top',
        lineColor: [220, 220, 220],
        lineWidth: 0.3
      },
      headStyles: {
        fillColor: [26, 26, 26],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      columnStyles: {
        0: { cellWidth: 45 },  // Grupo
        1: { cellWidth: 35 },  // Red
        2: { cellWidth: 28 },  // Día / Hora
        3: { cellWidth: 38 },  // Último Reporte
        4: { cellWidth: 22, halign: 'center' },  // Estado
        5: { cellWidth: 'auto' }  // Semanas Pendientes
      },
      didDrawCell: (data: any) => {
        // Colorear celda "Estado"
        if (data.section === 'body' && data.column.index === 4) {
          const estado = data.cell.text?.[0]

          if (estado === 'Atrasado') {
            data.doc.setFillColor(254, 226, 226)
            data.doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F')
            data.doc.setTextColor(185, 28, 28)
            data.doc.setFontSize(8)
            data.doc.text('Atrasado', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' })
          }
        }
      }
    })

    // Nombre del archivo con fecha
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')

    doc.save(`reportes-pendientes-${yyyy}-${mm}-${dd}.pdf`)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedNetwork('')
  }

  return (
    <div className='flex flex-col gap-6'>
      <Box className='flex items-center gap-2 print-hide'>
        <Button
          variant='text'
          size='small'
          startIcon={<i className='solar-arrow-left-linear' />}
          href='/dashboard/reportes'
        >
          Volver a Reportes
        </Button>
      </Box>

      <Box className='flex items-start justify-between gap-4 flex-wrap'>
        <div>
          <Typography variant='h4'>Reportes Pendientes</Typography>
          <Typography variant='body2' color='textSecondary'>
            {isAdmin
              ? 'Detalle de grupos que no han reportado sus reuniones'
              : 'Reuniones pendientes por reportar'}
          </Typography>
        </div>
        {groups.length > 0 && (
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='solar-file-download-linear' />}
            onClick={handleExportPDF}
            className='print-hide'
          >
            Exportar PDF
          </Button>
        )}
      </Box>

      {activeVacation && (
        <Alert severity='info' icon={<i className='solar-calendar-mark-linear' />} className='print-hide'>
          Periodo de vacaciones activo{activeVacation.name ? `: ${activeVacation.name}` : ''} (
          {formatDateShort(activeVacation.startDate)} — {formatDateShort(activeVacation.endDate)}). No se requieren
          reportes durante este periodo.
        </Alert>
      )}

      {groups.length === 0 ? (
        <Card>
          <CardContent>
            <Box className='flex flex-col items-center gap-3 py-8'>
              <Box
                className='flex items-center justify-center rounded-full'
                sx={{ width: 64, height: 64, bgcolor: 'success.lighter' }}
              >
                <i className='solar-check-read-linear text-[32px]' style={{ color: 'var(--mui-palette-success-main)' }} />
              </Box>
              <Typography variant='h6' color='success.main'>
                Todos los grupos están al día
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                No hay reportes pendientes en las últimas 4 semanas
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className='print-hide'>
            <CardContent>
              <Box className='flex flex-wrap gap-3 items-center'>
                <TextField
                  size='small'
                  placeholder='Buscar grupo...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='solar-magnifer-linear text-base' />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  select
                  size='small'
                  label='Red'
                  value={selectedNetwork}
                  onChange={e => setSelectedNetwork(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value=''>Todas las redes</MenuItem>
                  {networks.map(n => (
                    <MenuItem key={n.id} value={n.id}>
                      {n.name}
                    </MenuItem>
                  ))}
                </TextField>
                {hasActiveFilters && (
                  <Button variant='text' size='small' onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          <Box className='flex flex-wrap gap-3 print-hide'>
            <Chip
              icon={<i className='solar-clipboard-text-linear' />}
              label={`${filteredGroups.length} grupo${filteredGroups.length !== 1 ? 's' : ''} pendiente${filteredGroups.length !== 1 ? 's' : ''}`}
              color='warning'
              variant='tonal'
            />
            <Chip
              icon={<i className='solar-calendar-linear' />}
              label={`${totalMissingWeeks} semana${totalMissingWeeks !== 1 ? 's' : ''} sin reportar`}
              color='error'
              variant='tonal'
            />
            {hasActiveFilters && (
              <Chip
                label='Filtros activos'
                size='small'
                variant='outlined'
                color='primary'
                onDelete={handleClearFilters}
              />
            )}
          </Box>

          <div data-print-area=''>
            <Typography variant='h5' sx={{ display: 'none', '@media print': { display: 'block' }, mb: 2 }}>
              Reportes Pendientes — Casa del Rey
            </Typography>

            {filteredGroups.length === 0 ? (
              <Card>
                <CardContent>
                  <Box className='flex flex-col items-center gap-2 py-6'>
                    <i className='solar-magnifer-zoom-out-linear text-[32px]' style={{ color: 'var(--mui-palette-text-secondary)' }} />
                    <Typography variant='body1' color='textSecondary'>
                      No hay grupos que coincidan con los filtros
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Box className='flex flex-col gap-4'>
                {filteredGroups.map(group => (
                  <Card key={group.id}>
                    <CardContent>
                      <Box className='flex gap-4'>
                        <Box className='flex gap-3 flex-1 min-w-0'>
                          <Avatar
                            src={group.imageUrl || undefined}
                            alt={group.name}
                            sx={{ width: 52, height: 52, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.main' }}
                          >
                            {group.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box className='flex-1 min-w-0'>
                            <Typography variant='h6' noWrap>
                              {group.name}
                            </Typography>
                            <Box className='flex flex-wrap gap-1 mt-1'>
                              <Chip label={group.networkName} size='small' variant='outlined' color='primary' />
                              <Chip
                                label={group.modality === 'virtual' ? 'Virtual' : 'Presencial'}
                                size='small'
                                variant='outlined'
                                color={group.modality === 'virtual' ? 'info' : 'default'}
                                icon={
                                  group.modality === 'virtual'
                                    ? <i className='solar-video-frame-linear' />
                                    : <i className='solar-map-point-linear' />
                                }
                              />
                              {group.totalMissingWeeks > 2 && (
                                <Chip
                                  label='Atrasado'
                                  size='small'
                                  color='error'
                                  icon={<i className='solar-danger-triangle-linear' />}
                                />
                              )}
                            </Box>
                            <Box className='flex flex-wrap gap-x-4 gap-y-1 mt-2'>
                              <Box className='flex items-center gap-1'>
                                <i className='solar-calendar-linear text-sm' style={{ color: 'var(--mui-palette-text-secondary)' }} />
                                <Typography variant='body2' color='textSecondary'>
                                  {DAYS_LABELS[group.meetingDay] || group.meetingDay}
                                  {group.meetingTime && <> · {group.meetingTime}</>}
                                </Typography>
                              </Box>
                              <Box className='flex items-center gap-1'>
                                <i className='solar-clipboard-text-linear text-sm' style={{ color: 'var(--mui-palette-text-secondary)' }} />
                                <Typography variant='body2' color='textSecondary'>
                                  {group.lastReportDate
                                    ? `Último reporte: ${formatDateWithDay(group.lastReportDate)}`
                                    : 'Sin reportes'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

                        <Box sx={{ minWidth: 280, maxWidth: 360 }}>
                          <Typography variant='caption' color='textSecondary' fontWeight={600} textTransform='uppercase'>
                            Semanas pendientes ({group.totalMissingWeeks})
                          </Typography>
                          <Box className='flex flex-col gap-2 mt-2'>
                            {group.missingWeeks.map((week, idx) => (
                              <Box
                                key={week.weekStart instanceof Date ? week.weekStart.toISOString() : String(week.weekStart)}
                                className='flex items-center justify-between gap-2 p-2 rounded-lg'
                                sx={{ bgcolor: 'action.hover' }}
                              >
                                <Box className='min-w-0'>
                                  <Typography variant='body2' fontWeight={500}>
                                    {formatDateShort(week.weekStart)} — {formatDateShort(week.weekEnd)}
                                  </Typography>
                                  <Typography variant='caption' color='textSecondary'>
                                    Esperado: {formatDateWithDay(week.expectedDate)}
                                  </Typography>
                                </Box>
                                {(isAdmin || group.leaderIds.length > 0) && (
                                  <Tooltip title='Crear reporte para esta fecha'>
                                    <Button
                                      variant='outlined'
                                      size='small'
                                      className='print-hide'
                                      onClick={() => handleReport(group.id, week.expectedDate)}
                                    >
                                      Reportar
                                    </Button>
                                  </Tooltip>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </div>
        </>
      )}

      <ReportDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        report={null}
        groups={reportGroups}
        onRefresh={handleRefresh}
        initialGroupId={selectedGroupId}
        initialDate={selectedDate}
      />
    </div>
  )
}

export default PendingReportsView
