'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Component Imports
import UserProfileCard from './UserProfileCard'
import UserRecentReports from './UserRecentReports'
import UserEditDrawer from '@/components/UserEditDrawer'
import CustomAvatar from '@core/components/mui/Avatar'

type UserGroup = {
  id: string
  name: string
  network: { id: string; name: string } | null
  members: Array<{ id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null }>
  _count: { reports: number }
}

type GroupReport = {
  id: string
  meetingDate: Date
  totalAttendees: number
  leadersCount: number
  visitorsCount: number
  reportOffering: boolean
  offeringAmount: unknown
  group: { id: string; name: string }
}

type UserData = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  roleId: string | null
  userRole: { id: string; name: string; slug: string; hierarchy: number } | null
  phone: string | null
  city: string | null
  country: string | null
  address: string | null
  neighborhood: string | null
  gender: string | null
  birthDate: Date | null
  maritalStatus: string | null
  documentType: string | null
  documentNumber: string | null
  hasChildren: boolean | null
  childrenCount: number | null
  isActive: boolean
  createdAt: Date
  networkId: string | null
  networkRole: string | null
  network: { id: string; name: string } | null
  organization: { id: string; name: string; logoUrl: string | null } | null
  groupId: string | null
  groupRole: string | null
  group: UserGroup | null
  groupReports: GroupReport[]
  stats: {
    reportsCount: number
    groupsLeading: number
    totalAttendees: number
    totalVisitors: number
    avgAttendees: number
  }
}

type Props = {
  user: UserData
}

const UserDetailView = ({ user }: Props) => {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleEditSaved = () => {
    router.refresh()
  }

  return (
    <>
      <div className='flex flex-col gap-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <IconButton onClick={() => router.push('/dashboard/admin/usuarios')}>
              <i className='ri-arrow-left-line' />
            </IconButton>
            <div>
              <Typography variant='h5'>{displayName}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Miembro desde {formatDate(user.createdAt)}
              </Typography>
            </div>
          </div>
          <Button
            variant='contained'
            startIcon={<i className='ri-edit-line' />}
            onClick={() => setDrawerOpen(true)}
          >
            Editar
          </Button>
        </div>

        {/* Content */}
        <Grid container spacing={6}>
          {/* Left Column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <UserProfileCard user={user} onEdit={() => setDrawerOpen(true)} />
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <div className='flex flex-col gap-6'>
              {user.groupRole === 'leader' ? (
                <>
                  {/* Activity Stats - Solo para lideres de grupo */}
                  <Card>
                    <CardHeader title='Resumen de Actividad' subheader='Estadisticas como lider de grupo' />
                    <CardContent>
                      <Grid container spacing={4}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <div className='text-center p-4 rounded-lg bg-primary-lightOpacity'>
                            <Typography variant='h4' color='primary.main'>
                              {user.stats.reportsCount}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              Reportes Creados
                            </Typography>
                          </div>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <div className='text-center p-4 rounded-lg bg-success-lightOpacity'>
                            <Typography variant='h4' color='success.main'>
                              {user.stats.groupsLeading}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              Grupos Liderados
                            </Typography>
                          </div>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <div className='text-center p-4 rounded-lg bg-info-lightOpacity'>
                            <Typography variant='h4' color='info.main'>
                              {user.stats.totalAttendees}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              Total Asistentes
                            </Typography>
                          </div>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <div className='text-center p-4 rounded-lg bg-warning-lightOpacity'>
                            <Typography variant='h4' color='warning.main'>
                              {user.stats.totalVisitors}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              Total Visitas
                            </Typography>
                          </div>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Recent Reports */}
                  <UserRecentReports reports={user.groupReports} />
                </>
              ) : (
                <Card>
                  <CardHeader title='Informacion del Miembro' />
                  <CardContent>
                    <div className='flex flex-col gap-4'>
                      <div className='flex items-center gap-3'>
                        <CustomAvatar skin='light' color='info' size={40}>
                          <i className='ri-calendar-line' />
                        </CustomAvatar>
                        <div>
                          <Typography variant='body2' color='text.secondary'>Miembro desde</Typography>
                          <Typography variant='body1' fontWeight={500}>{formatDate(user.createdAt)}</Typography>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <CustomAvatar skin='light' color={user.network ? 'primary' : 'secondary'} size={40}>
                          <i className='ri-bubble-chart-line' />
                        </CustomAvatar>
                        <div>
                          <Typography variant='body2' color='text.secondary'>Red</Typography>
                          <Typography variant='body1' fontWeight={500}>
                            {user.network ? user.network.name : 'No asignado'}
                          </Typography>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <CustomAvatar skin='light' color={user.group ? 'success' : 'secondary'} size={40}>
                          <i className='ri-team-line' />
                        </CustomAvatar>
                        <div>
                          <Typography variant='body2' color='text.secondary'>Grupo</Typography>
                          <Typography variant='body1' fontWeight={500}>
                            {user.group ? user.group.name : 'No asignado'}
                          </Typography>
                        </div>
                      </div>
                      {user.groupRole === 'member' && user.group && (
                        <div className='flex items-center gap-3'>
                          <CustomAvatar skin='light' color='warning' size={40}>
                            <i className='ri-user-line' />
                          </CustomAvatar>
                          <div>
                            <Typography variant='body2' color='text.secondary'>Rol en grupo</Typography>
                            <Typography variant='body1' fontWeight={500}>Miembro</Typography>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </Grid>
        </Grid>
      </div>

      {/* Edit Drawer */}
      <UserEditDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onSaved={handleEditSaved}
      />
    </>
  )
}

export default UserDetailView
