'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

// Component Imports
import UserProfileCard from './UserProfileCard'
import UserRecentReports from './UserRecentReports'

// Server Action Imports
import { updateUserByAdmin } from '@/app/server/adminActions'

// Type Imports
import type { Locale } from '@configs/i18n'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

type GroupLeadership = {
  group: {
    id: string
    name: string
    network: { id: string; name: string } | null
    leaders: Array<{
      user: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null }
    }>
    _count: { reports: number }
  }
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
  role: string | null
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
  networkRole: string | null
  network: { id: string; name: string } | null
  organization: { id: string; name: string; logoUrl: string | null } | null
  groupLeaderships: GroupLeadership[]
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

const UserDetailView = ({ user: initialUser }: Props) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const [user, setUser] = useState(initialUser)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [editRole, setEditRole] = useState(user.role || 'user')
  const [editActive, setEditActive] = useState(user.isActive)
  const [editFirstName, setEditFirstName] = useState(user.firstName || '')
  const [editLastName, setEditLastName] = useState(user.lastName || '')
  const [editPhone, setEditPhone] = useState(user.phone || '')
  const [editCity, setEditCity] = useState(user.city || '')
  const [editCountry, setEditCountry] = useState(user.country || '')

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'

  const handleOpenEdit = () => {
    setEditRole(user.role || 'user')
    setEditActive(user.isActive)
    setEditFirstName(user.firstName || '')
    setEditLastName(user.lastName || '')
    setEditPhone(user.phone || '')
    setEditCity(user.city || '')
    setEditCountry(user.country || '')
    setError(null)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      await updateUserByAdmin(user.id, {
        role: editRole,
        isActive: editActive,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        city: editCity,
        country: editCountry
      })

      // Update local state
      setUser(prev => ({
        ...prev,
        role: editRole,
        isActive: editActive,
        firstName: editFirstName,
        lastName: editLastName,
        name: `${editFirstName} ${editLastName}`.trim(),
        phone: editPhone,
        city: editCity,
        country: editCountry
      }))

      setDrawerOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
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
            onClick={handleOpenEdit}
          >
            Editar
          </Button>
        </div>

        {/* Content */}
        <Grid container spacing={6}>
          {/* Left Column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <UserProfileCard user={user} onEdit={handleOpenEdit} />
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <div className='flex flex-col gap-6'>
              {/* Activity Stats */}
              <Card>
                <CardHeader title='Resumen de Actividad' />
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
            </div>
          </Grid>
        </Grid>
      </div>

      {/* Edit Drawer */}
      <Drawer
        anchor='right'
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 450 } } }}
      >
        <div className='flex flex-col gap-6 p-6'>
          <div className='flex justify-between items-center'>
            <Typography variant='h6'>Editar Usuario</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <i className='ri-close-line' />
            </IconButton>
          </div>

          {error && <Alert severity='error'>{error}</Alert>}

          {/* Role & Status */}
          <div>
            <Typography variant='subtitle2' className='mbe-3'>Rol y Estado</Typography>
            <div className='flex flex-col gap-4'>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select value={editRole} label='Rol' onChange={e => setEditRole(e.target.value)}>
                  <MenuItem value='user'>Usuario</MenuItem>
                  <MenuItem value='admin'>Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={editActive ? 'active' : 'inactive'}
                  label='Estado'
                  onChange={e => setEditActive(e.target.value === 'active')}
                >
                  <MenuItem value='active'>Activo</MenuItem>
                  <MenuItem value='inactive'>Inactivo</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <Divider />

          {/* Personal Info */}
          <div>
            <Typography variant='subtitle2' className='mbe-3'>Información Personal</Typography>
            <div className='flex flex-col gap-4'>
              <TextField
                fullWidth
                label='Nombre'
                value={editFirstName}
                onChange={e => setEditFirstName(e.target.value)}
              />
              <TextField
                fullWidth
                label='Apellido'
                value={editLastName}
                onChange={e => setEditLastName(e.target.value)}
              />
              <TextField
                fullWidth
                label='Teléfono'
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
              />
            </div>
          </div>

          <Divider />

          {/* Location */}
          <div>
            <Typography variant='subtitle2' className='mbe-3'>Ubicación</Typography>
            <div className='flex flex-col gap-4'>
              <TextField
                fullWidth
                label='Ciudad'
                value={editCity}
                onChange={e => setEditCity(e.target.value)}
              />
              <TextField
                fullWidth
                select
                label='País'
                value={editCountry}
                onChange={e => setEditCountry(e.target.value)}
              >
                <MenuItem value=''>Seleccionar</MenuItem>
                <MenuItem value='CO'>Colombia</MenuItem>
                <MenuItem value='VE'>Venezuela</MenuItem>
                <MenuItem value='EC'>Ecuador</MenuItem>
                <MenuItem value='PE'>Perú</MenuItem>
                <MenuItem value='MX'>México</MenuItem>
                <MenuItem value='AR'>Argentina</MenuItem>
              </TextField>
            </div>
          </div>

          {/* Network & Groups Info (read-only) */}
          {(user.network || user.groupLeaderships.length > 0) && (
            <>
              <Divider />
              <div>
                <Typography variant='subtitle2' className='mbe-3'>Asignaciones</Typography>
                {user.network && (
                  <div className='flex items-center gap-2 mbe-2'>
                    <Typography variant='body2' color='text.secondary'>Red:</Typography>
                    <Chip
                      label={user.network.name}
                      size='small'
                      color={user.networkRole === 'leader' ? 'warning' : 'info'}
                      variant='tonal'
                      icon={user.networkRole === 'leader' ? <i className='ri-star-fill text-xs' /> : undefined}
                    />
                  </div>
                )}
                {user.groupLeaderships.length > 0 && (
                  <div className='flex items-center gap-2 flex-wrap'>
                    <Typography variant='body2' color='text.secondary'>Grupos:</Typography>
                    {user.groupLeaderships.map(({ group }) => (
                      <Chip
                        key={group.id}
                        label={group.name}
                        size='small'
                        variant='outlined'
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className='flex gap-4 mbs-4'>
            <Button
              variant='contained'
              onClick={handleSave}
              disabled={saving}
              fullWidth
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              variant='outlined'
              onClick={() => setDrawerOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default UserDetailView
