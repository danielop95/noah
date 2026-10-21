'use client'

import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import type { SolicitudListItem } from '@/app/server/solicitudesActions'
import { ESTADO_COLOR, ESTADO_LABEL, SOLICITUD_AREA_ESTADO_COLOR, formatDate } from './estadoUtils'

type Props = {
  solicitudes: SolicitudListItem[]
  areas: Array<{ id: string; name: string }>
  showAreaSolicitanteFilter?: boolean
  emptyMessage?: string
}

const SolicitudesTable = ({ solicitudes, areas, showAreaSolicitanteFilter = true, emptyMessage }: Props) => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return solicitudes.filter(s => {
      if (q && !s.nombreEvento.toLowerCase().includes(q) && !s.lugar.toLowerCase().includes(q)) return false
      if (estadoFilter && s.estadoGlobal !== estadoFilter) return false
      if (areaFilter && s.areaSolicitante.id !== areaFilter && !s.areas.some(a => a.areaId === areaFilter)) return false

      return true
    })
  }, [solicitudes, search, areaFilter, estadoFilter])

  const paginated = useMemo(() => filtered.slice(page * pageSize, (page + 1) * pageSize), [filtered, page, pageSize])

  return (
    <>
      <div className='flex flex-wrap gap-3 p-4'>
        <TextField
          size='small'
          placeholder='Buscar evento o lugar...'
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className='min-is-[220px]'
          slotProps={{ input: { startAdornment: <i className='solar-magnifer-linear text-textSecondary mie-2' /> } }}
        />
        {showAreaSolicitanteFilter && (
          <TextField
            select
            size='small'
            label='Área'
            value={areaFilter}
            onChange={e => {
              setAreaFilter(e.target.value)
              setPage(0)
            }}
            className='min-is-[160px]'
          >
            <MenuItem value=''>Todas</MenuItem>
            {areas.map(a => (
              <MenuItem key={a.id} value={a.id}>
                {a.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          select
          size='small'
          label='Estado'
          value={estadoFilter}
          onChange={e => {
            setEstadoFilter(e.target.value)
            setPage(0)
          }}
          className='min-is-[160px]'
        >
          <MenuItem value=''>Todos</MenuItem>
          {Object.entries(ESTADO_LABEL).map(([k, v]) => (
            <MenuItem key={k} value={k}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className='overflow-x-auto'>
        <table className='is-full' style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className='border-be bg-backgroundDefault'>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Evento</th>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Área solicitante</th>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Áreas destino</th>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Fecha</th>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Estado</th>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Comentarios</th>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className='text-center plb-8 text-textSecondary'>
                  {emptyMessage || 'No se encontraron solicitudes'}
                </td>
              </tr>
            ) : (
              paginated.map(s => (
                <tr
                  key={s.id}
                  className='border-be hover:bg-actionHover cursor-pointer'
                  onClick={() => router.push(`/dashboard/solicitudes/${s.id}`)}
                >
                  <td className='plb-3 pli-4'>
                    <div className='flex items-center gap-2'>
                      <Typography variant='body2' className='font-medium'>
                        {s.nombreEvento}
                      </Typography>
                      {s.urgente && !s.cancelada && (
                        <Tooltip title='Menos de 15 días de anticipación'>
                          <Chip label='Urgente' color='error' size='small' variant='tonal' />
                        </Tooltip>
                      )}
                    </div>
                    <Typography variant='caption' color='text.secondary'>
                      {s.lugar}
                    </Typography>
                  </td>
                  <td className='plb-3 pli-4'>
                    <Chip
                      icon={<i className={s.areaSolicitante.icon || 'solar-folder-linear'} />}
                      label={s.areaSolicitante.name}
                      size='small'
                      sx={{ bgcolor: s.areaSolicitante.color || undefined, color: '#fff' }}
                    />
                  </td>
                  <td className='plb-3 pli-4'>
                    <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
                      {s.areas.map(a => (
                        <Tooltip
                          key={a.id}
                          title={
                            <>
                              <div>{a.area.name}</div>
                              <div style={{ opacity: 0.8 }}>
                                {a.estado === 'PENDIENTE' && 'Pendiente'}
                                {a.estado === 'APROBADA' && 'Aprobada'}
                                {a.estado === 'RECHAZADA' && 'Rechazada'}
                              </div>
                            </>
                          }
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: a.area.color || '#999',
                              color: '#fff',
                              border: `2px solid var(--mui-palette-${SOLICITUD_AREA_ESTADO_COLOR[a.estado]}-main, #999) !important`
                            }}
                          >
                            <i className={a.area.icon || 'solar-folder-linear'} style={{ fontSize: 14 }} />
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </td>
                  <td className='plb-3 pli-4'>
                    <Typography variant='body2'>{formatDate(s.fechaEvento)}</Typography>
                  </td>
                  <td className='plb-3 pli-4'>
                    <Chip
                      label={ESTADO_LABEL[s.estadoGlobal]}
                      color={ESTADO_COLOR[s.estadoGlobal]}
                      size='small'
                      variant='tonal'
                    />
                  </td>
                  <td className='plb-3 pli-4'>
                    <Typography variant='body2'>{s._count.comentarios}</Typography>
                  </td>
                  <td className='plb-3 pli-4' onClick={e => e.stopPropagation()}>
                    <Tooltip title='Ver'>
                      <IconButton size='small' onClick={() => router.push(`/dashboard/solicitudes/${s.id}`)}>
                        <i className='solar-eye-linear text-textSecondary' />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        component='div'
        count={filtered.length}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={e => {
          setPageSize(Number(e.target.value))
          setPage(0)
        }}
        labelRowsPerPage='Filas por página'
      />
    </>
  )
}

export default SolicitudesTable
