'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Typography from '@mui/material/Typography'

import type { SolicitudListItem } from '@/app/server/solicitudesActions'
import SolicitudesTable from './SolicitudesTable'

type AreaOption = { id: string; name: string }

type Counts = { mis: number; miAreaLider: number; miAreaMiembro: number; todas: number }

type Props = {
  mis: SolicitudListItem[]
  miAreaLider: SolicitudListItem[]
  miAreaMiembro: SolicitudListItem[]
  todas: SolicitudListItem[]
  counts: Counts
  areas: AreaOption[]
  canVerTodas: boolean
  canCrear: boolean
}

const BandejaView = ({ mis, miAreaLider, miAreaMiembro, todas, counts, areas, canVerTodas, canCrear }: Props) => {
  const router = useRouter()
  const [tab, setTab] = useState<'mis' | 'lider' | 'miembro' | 'todas'>(
    miAreaLider.length > 0 ? 'lider' : 'mis'
  )

  const TabLabel = ({ label, count }: { label: string; count: number }) =>
    count > 0 ? (
      <Badge badgeContent={count} color='error' sx={{ '& .MuiBadge-badge': { right: -16 } }}>
        {label}
      </Badge>
    ) : (
      <>{label}</>
    )

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-start justify-between flex-wrap gap-3'>
        <div>
          <Typography variant='h4'>Solicitudes Interáreas</Typography>
          <Typography variant='body2' color='text.secondary'>
            Centraliza las solicitudes de apoyo entre áreas y ministerios de Casa del Rey
          </Typography>
        </div>
        {canCrear && (
          <Button
            variant='contained'
            startIcon={<i className='solar-add-circle-linear' />}
            onClick={() => router.push('/dashboard/solicitudes/nueva')}
          >
            Nueva Solicitud
          </Button>
        )}
      </div>

      <Card>
        <TabContext value={tab}>
          <TabList
            onChange={(_, v) => setTab(v)}
            className='border-be'
            variant='scrollable'
            scrollButtons='auto'
          >
            <Tab
              value='mis'
              label={<TabLabel label='Mis solicitudes' count={counts.mis} />}
              icon={<i className='solar-user-linear' />}
              iconPosition='start'
            />
            <Tab
              value='lider'
              label={<TabLabel label='Solicitudes a mi área (líder)' count={counts.miAreaLider} />}
              icon={<i className='solar-star-linear' />}
              iconPosition='start'
            />
            <Tab
              value='miembro'
              label={<TabLabel label='Solicitudes a mi área' count={counts.miAreaMiembro} />}
              icon={<i className='solar-users-group-rounded-linear' />}
              iconPosition='start'
            />
            {canVerTodas && (
              <Tab
                value='todas'
                label={<TabLabel label='Todas' count={counts.todas} />}
                icon={<i className='solar-list-linear' />}
                iconPosition='start'
              />
            )}
          </TabList>

          <TabPanel value='mis' className='p-0'>
            <SolicitudesTable
              solicitudes={mis}
              areas={areas}
              emptyMessage='No has creado solicitudes todavía.'
            />
          </TabPanel>
          <TabPanel value='lider' className='p-0'>
            <SolicitudesTable
              solicitudes={miAreaLider}
              areas={areas}
              emptyMessage='No tienes solicitudes pendientes de aprobación en tus áreas de liderazgo.'
            />
          </TabPanel>
          <TabPanel value='miembro' className='p-0'>
            <SolicitudesTable
              solicitudes={miAreaMiembro}
              areas={areas}
              emptyMessage='No hay solicitudes dirigidas a las áreas en las que eres miembro.'
            />
          </TabPanel>
          {canVerTodas && (
            <TabPanel value='todas' className='p-0'>
              <SolicitudesTable solicitudes={todas} areas={areas} emptyMessage='No hay solicitudes en el sistema.' />
            </TabPanel>
          )}
        </TabContext>
      </Card>
    </div>
  )
}

export default BandejaView
