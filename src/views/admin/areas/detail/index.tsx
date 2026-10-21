'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import AreaDrawer from '../AreaDrawer'
import AreaMembersTable from './AreaMembersTable'
import AddMemberDialog, { type AvailableUser } from './AddMemberDialog'

type AreaMembership = {
  id: string
  areaId: string
  userId: string
  role: 'LIDER' | 'MIEMBRO'
  createdAt: Date
  user: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
    image: string | null
    isActive: boolean
  }
}

type AreaData = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  isActive: boolean
  createdAt: Date
  memberships: AreaMembership[]
  _count: { memberships: number; solicitudAreas: number }
}

type Props = {
  area: AreaData
  availableUsers: AvailableUser[]
}

const AreaDetailView = ({ area, availableUsers }: Props) => {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)

  const lideres = area.memberships.filter(m => m.role === 'LIDER')
  const miembros = area.memberships.filter(m => m.role === 'MIEMBRO')

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <IconButton onClick={() => router.push('/dashboard/admin/areas')}>
            <i className='solar-arrow-left-linear' />
          </IconButton>
          <div className='flex items-center gap-3'>
            <Avatar
              sx={{ width: 56, height: 56, bgcolor: area.color || 'primary.main', color: '#fff' }}
              variant='rounded'
            >
              <i className={area.icon || 'solar-folder-linear'} />
            </Avatar>
            <div>
              <div className='flex items-center gap-2'>
                <Typography variant='h5'>{area.name}</Typography>
                <Chip
                  label={area.isActive ? 'Activa' : 'Inactiva'}
                  color={area.isActive ? 'success' : 'error'}
                  size='small'
                  variant='tonal'
                />
              </div>
              <Typography variant='body2' color='text.secondary'>
                Creada el {formatDate(area.createdAt)}
              </Typography>
            </div>
          </div>
        </div>
        <Button
          variant='contained'
          startIcon={<i className='solar-pen-new-square-linear' />}
          onClick={() => setDrawerOpen(true)}
        >
          Editar Área
        </Button>
      </div>

      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='subtitle1' className='font-semibold mb-3'>
                Información
              </Typography>
              <div className='flex flex-col gap-3'>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    Slug
                  </Typography>
                  <Typography variant='body2'>{area.slug}</Typography>
                </div>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    Descripción
                  </Typography>
                  <Typography variant='body2'>{area.description || 'Sin descripción'}</Typography>
                </div>
                <div className='flex gap-4'>
                  <div>
                    <Typography variant='caption' color='text.secondary'>
                      Líderes
                    </Typography>
                    <Typography variant='h6'>{lideres.length}</Typography>
                  </div>
                  <div>
                    <Typography variant='caption' color='text.secondary'>
                      Miembros
                    </Typography>
                    <Typography variant='h6'>{miembros.length}</Typography>
                  </div>
                  <div>
                    <Typography variant='caption' color='text.secondary'>
                      Solicitudes
                    </Typography>
                    <Typography variant='h6'>{area._count.solicitudAreas}</Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <div className='flex justify-between items-center mb-4'>
                <Typography variant='subtitle1' className='font-semibold'>
                  Miembros del Área
                </Typography>
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<i className='solar-add-circle-linear' />}
                  onClick={() => setAddMemberOpen(true)}
                  disabled={availableUsers.length === 0}
                >
                  Añadir Miembro
                </Button>
              </div>
              <AreaMembersTable
                areaId={area.id}
                memberships={area.memberships}
                onChange={() => router.refresh()}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AreaDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        area={{
          id: area.id,
          name: area.name,
          slug: area.slug,
          description: area.description,
          icon: area.icon,
          color: area.color,
          isActive: area.isActive,
          createdAt: area.createdAt,
          updatedAt: area.createdAt,
          _count: { memberships: 0, solicitudAreas: 0 }
        }}
        onSuccess={() => {
          setDrawerOpen(false)
          router.refresh()
        }}
      />

      <AddMemberDialog
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        areaId={area.id}
        availableUsers={availableUsers}
        onSuccess={() => {
          setAddMemberOpen(false)
          router.refresh()
        }}
      />
    </div>
  )
}

export default AreaDetailView
