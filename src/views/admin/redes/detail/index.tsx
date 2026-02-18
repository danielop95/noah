'use client'

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

// Component Imports
import NetworkOverviewCard from './NetworkOverviewCard'
import NetworkGroupsList from './NetworkGroupsList'

// Type Imports
import type { Locale } from '@configs/i18n'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

type NetworkUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  phone: string | null
  networkRole: string | null
  isActive: boolean
}

type GroupLeader = {
  user: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
  }
}

type GroupData = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  modality: string | null
  city: string | null
  meetingDay: string | null
  meetingTime: string | null
  leaders: GroupLeader[]
  _count: { reports: number }
}

type NetworkData = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  users: NetworkUser[]
  groups: GroupData[]
  stats: {
    totalGroups: number
    totalLeaders: number
    totalMembers: number
    totalReports: number
    totalAttendees: number
    totalVisitors: number
    avgAttendees: number
  }
}

type Props = {
  network: NetworkData
}

const NetworkDetailView = ({ network }: Props) => {
  const router = useRouter()
  const { lang: locale } = useParams()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <IconButton onClick={() => router.push(getLocalizedUrl('/admin/redes', locale as Locale))}>
            <i className='ri-arrow-left-line' />
          </IconButton>
          <div>
            <Typography variant='h5'>{network.name}</Typography>
            <Typography variant='body2' color='text.secondary'>
              Creada el {formatDate(network.createdAt)}
            </Typography>
          </div>
        </div>
        <Button
          variant='contained'
          startIcon={<i className='ri-edit-line' />}
          onClick={() => router.push(getLocalizedUrl('/admin/redes', locale as Locale))}
        >
          Editar Red
        </Button>
      </div>

      {/* Content */}
      <Grid container spacing={6}>
        {/* Left Column - Overview */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <NetworkOverviewCard network={network} />
        </Grid>

        {/* Right Column - Groups */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <div className='flex flex-col gap-6'>
            {/* Stats Cards */}
            <Grid container spacing={4}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card>
                  <CardContent className='text-center'>
                    <Typography variant='h4' color='primary.main'>
                      {network.stats.totalGroups}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Grupos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card>
                  <CardContent className='text-center'>
                    <Typography variant='h4' color='success.main'>
                      {network.stats.totalReports}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Reportes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card>
                  <CardContent className='text-center'>
                    <Typography variant='h4' color='info.main'>
                      {network.stats.totalAttendees}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Asistentes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card>
                  <CardContent className='text-center'>
                    <Typography variant='h4' color='warning.main'>
                      {network.stats.avgAttendees}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Prom. Asist.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Groups List */}
            <NetworkGroupsList groups={network.groups} />
          </div>
        </Grid>
      </Grid>
    </div>
  )
}

export default NetworkDetailView
