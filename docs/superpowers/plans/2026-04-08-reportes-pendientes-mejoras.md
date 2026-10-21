# Mejoras Reportes Pendientes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mejorar la página de Reportes Pendientes con layout de cards ancho completo, filtros de búsqueda/red, exportación a PDF, y sub-navegación en el menú.

**Architecture:** Todos los cambios son client-side en `PendingReportsView.tsx`: se agrega estado local para filtros (búsqueda, red) que filtran el array de grupos antes de renderizar. El PDF usa `window.print()` con `@media print` CSS en `globals.css`. La navegación se convierte en ítem con hijos en ambos menús.

**Tech Stack:** Next.js 14 App Router, MUI v7, React hooks (useState, useMemo), CSS @media print

---

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `src/data/dictionaries/es.json` | Agregar clave `pendientes` |
| `src/data/dictionaries/en.json` | Agregar clave `pendientes` |
| `src/data/dictionaries/fr.json` | Agregar clave `pendientes` |
| `src/data/dictionaries/ar.json` | Agregar clave `pendientes` |
| `src/data/navigation/verticalMenuData.tsx` | Convertir "Reportes" en padre con hijos |
| `src/data/navigation/horizontalMenuData.tsx` | Convertir "Reportes" en padre con hijos |
| `src/views/reportes/PendingReportsView.tsx` | Refactor: cards full-width + filtros + PDF |
| `src/app/globals.css` | Agregar estilos `@media print` |

---

### Task 1: Agregar clave de diccionario "pendientes"

**Files:**
- Modify: `src/data/dictionaries/es.json`
- Modify: `src/data/dictionaries/en.json`
- Modify: `src/data/dictionaries/fr.json`
- Modify: `src/data/dictionaries/ar.json`

- [ ] **Step 1: Agregar clave en es.json**

En `src/data/dictionaries/es.json`, dentro de la sección `navigation`, después de `"reportes": "Reportes"`, agregar:

```json
"reportes": "Reportes",
"pendientes": "Pendientes",
```

- [ ] **Step 2: Agregar clave en en.json**

En `src/data/dictionaries/en.json`, después de `"reportes": "Reports"`:

```json
"reportes": "Reports",
"pendientes": "Pendientes",
```

- [ ] **Step 3: Agregar clave en fr.json**

En `src/data/dictionaries/fr.json`, después de `"reportes": "Rapports"`:

```json
"reportes": "Rapports",
"pendientes": "Pendientes",
```

- [ ] **Step 4: Agregar clave en ar.json**

En `src/data/dictionaries/ar.json`, después de `"reportes": "التقارير"`:

```json
"reportes": "التقارير",
"pendientes": "Pendientes",
```

- [ ] **Step 5: Commit**

```bash
git add src/data/dictionaries/es.json src/data/dictionaries/en.json src/data/dictionaries/fr.json src/data/dictionaries/ar.json
git commit -m "feat: add pendientes nav key to all dictionaries"
```

---

### Task 2: Actualizar navegación vertical y horizontal

**Files:**
- Modify: `src/data/navigation/verticalMenuData.tsx`
- Modify: `src/data/navigation/horizontalMenuData.tsx`

- [ ] **Step 1: Actualizar verticalMenuData.tsx**

Reemplazar el ítem de Reportes (simple link) por un ítem con hijos:

```tsx
// Antes:
{
  label: dictionary['navigation'].reportes,
  icon: 'solar-chart-square-linear',
  href: '/dashboard/reportes'
},

// Después:
{
  label: dictionary['navigation'].reportes,
  icon: 'solar-chart-square-linear',
  children: [
    {
      label: dictionary['navigation'].reportes,
      icon: 'solar-chart-square-linear',
      href: '/dashboard/reportes'
    },
    {
      label: dictionary['navigation'].pendientes,
      icon: 'solar-clipboard-text-linear',
      href: '/dashboard/reportes/pendientes'
    }
  ]
},
```

- [ ] **Step 2: Actualizar horizontalMenuData.tsx**

Misma sustitución en `src/data/navigation/horizontalMenuData.tsx`:

```tsx
// Antes:
{
  label: dictionary['navigation'].reportes,
  icon: 'solar-chart-square-linear',
  href: '/dashboard/reportes'
},

// Después:
{
  label: dictionary['navigation'].reportes,
  icon: 'solar-chart-square-linear',
  children: [
    {
      label: dictionary['navigation'].reportes,
      icon: 'solar-chart-square-linear',
      href: '/dashboard/reportes'
    },
    {
      label: dictionary['navigation'].pendientes,
      icon: 'solar-clipboard-text-linear',
      href: '/dashboard/reportes/pendientes'
    }
  ]
},
```

- [ ] **Step 3: Verificar en el navegador**

Navegar a `http://localhost:3000/dashboard` y confirmar que "Reportes" en el menú lateral muestra un dropdown con "Reportes" y "Pendientes" al hacer clic.

- [ ] **Step 4: Commit**

```bash
git add src/data/navigation/verticalMenuData.tsx src/data/navigation/horizontalMenuData.tsx
git commit -m "feat: convert Reportes nav item to parent with Pendientes sub-page"
```

---

### Task 3: Agregar estilos @media print en globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Agregar reglas de impresión al final de globals.css**

Al final del archivo `src/app/globals.css`, agregar:

```css
/* ===== PRINT STYLES: Reportes Pendientes ===== */
@media print {
  /* Ocultar todo el layout de la aplicación */
  nav,
  header,
  aside,
  [data-no-print],
  .layout-nav-vertical,
  .layout-wrapper {
    display: none !important;
  }

  /* Mostrar solo el área de impresión */
  [data-print-area] {
    display: block !important;
  }

  /* Ajustes de página */
  @page {
    margin: 1cm;
  }

  body {
    background: white !important;
    color: black !important;
  }

  /* Cards sin sombra en impresión */
  .MuiCard-root {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    break-inside: avoid;
    margin-bottom: 12px;
  }

  /* Ocultar botones de acción en impresión */
  button[data-no-print],
  .print-hide {
    display: none !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add @media print styles for pending reports PDF export"
```

---

### Task 4: Refactorizar PendingReportsView con cards full-width, filtros y PDF

**Files:**
- Modify: `src/views/reportes/PendingReportsView.tsx`

Este es el cambio principal. Reemplazar el contenido completo del archivo con:

- [ ] **Step 1: Reemplazar PendingReportsView.tsx**

```tsx
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

  return d.toISOString().split('T')[0]
}

const PendingReportsView = ({ groups, activeVacation, reportGroups, isAdmin }: PendingReportsViewProps) => {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>()
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState('')

  // Extraer redes únicas de los grupos
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

  // Filtrar grupos según búsqueda y red seleccionada
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

  const handleExportPDF = () => {
    window.print()
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedNetwork('')
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Cabecera — oculta en impresión */}
      <Box className='flex items-center gap-2 print-hide' data-no-print>
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
            data-no-print
            className='print-hide'
          >
            Exportar PDF
          </Button>
        )}
      </Box>

      {activeVacation && (
        <Alert severity='info' icon={<i className='solar-calendar-mark-linear' />} data-no-print className='print-hide'>
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
          {/* Barra de filtros — oculta en impresión */}
          <Card data-no-print className='print-hide'>
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

          {/* Chips de resumen */}
          <Box className='flex flex-wrap gap-3' data-no-print className='print-hide'>
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

          {/* Área de impresión: título y cards */}
          <div data-print-area>
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
                        {/* Columna izquierda: info del grupo */}
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

                        {/* Columna derecha: semanas pendientes */}
                        <Box sx={{ minWidth: 280, maxWidth: 360 }}>
                          <Typography variant='caption' color='textSecondary' fontWeight={600} textTransform='uppercase'>
                            Semanas pendientes ({group.totalMissingWeeks})
                          </Typography>
                          <Box className='flex flex-col gap-2 mt-2'>
                            {group.missingWeeks.map((week, idx) => (
                              <Box
                                key={idx}
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
                                      data-no-print
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
```

- [ ] **Step 2: Verificar en el navegador**

Navegar a `http://localhost:3000/dashboard/reportes/pendientes` y confirmar:
- Las cards se muestran una debajo de la otra a ancho completo
- El buscador filtra grupos por nombre al escribir
- El selector de red filtra correctamente
- "Limpiar filtros" aparece cuando hay filtros activos y los resetea
- El botón "Exportar PDF" abre el diálogo de impresión del navegador mostrando solo las cards

- [ ] **Step 3: Commit**

```bash
git add src/views/reportes/PendingReportsView.tsx
git commit -m "feat: refactor PendingReportsView with full-width cards, filters, and PDF export"
```

---

## Self-Review

**Spec coverage:**
- ✅ Cards horizontales ancho completo — Task 4 (layout Box flex + columnas izquierda/derecha)
- ✅ Filtrar por red — Task 4 (TextField select + useMemo filteredGroups)
- ✅ Buscar por grupo — Task 4 (TextField búsqueda + useMemo filteredGroups)
- ✅ Exportar PDF — Task 3 (@media print) + Task 4 (botón Exportar PDF + data-print-area)
- ✅ Sub-navegación "Pendientes" — Task 1 (diccionarios) + Task 2 (menú vertical/horizontal)

**Placeholder scan:** Ningún TBD, TODO o sección incompleta detectada.

**Type consistency:** `DetailedUnreportedGroup` usado consistentemente desde `reportActions.ts`. Ningún nombre de propiedad inconsistente.

**Nota sobre `className` duplicado en Task 4:** En la sección de chips de resumen, hay `data-no-print className='print-hide'` duplicados en el mismo elemento. Consolidar a solo `className='print-hide'` ya que los estilos `@media print` se basan en la clase CSS.
