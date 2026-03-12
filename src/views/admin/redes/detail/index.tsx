'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import NetworkProfileCard from './NetworkProfileCard'
import NetworkLeadersTab from './NetworkLeadersTab'
import NetworkGroupsTab from './NetworkGroupsTab'
import NetworkMembersTab from './NetworkMembersTab'

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
  createdAt: Date
}

type GroupLeader = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  email: string | null
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
    activeGroups: number
    totalLeaders: number
    totalMembers: number
    totalUsers: number
    totalReports: number
    totalAttendees: number
    totalVisitors: number
    avgAttendees: number
    newMembersThisMonth: number
    memberGrowth: number
    reportsThisMonth: number
    groupsReportedThisMonth: number
    reportingPercentage: number
  }
}

type Props = {
  network: NetworkData
}

const NetworkDetailView = ({ network }: Props) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('leaders')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const leaders = network.users.filter(u => u.networkRole === 'leader')
  const members = network.users.filter(u => u.networkRole === 'member')

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <IconButton onClick={() => router.push('/dashboard/admin/redes')}>
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
          onClick={() => router.push('/dashboard/admin/redes')}
        >
          Editar Red
        </Button>
      </div>

      {/* Content */}
      <Grid container spacing={6}>
        {/* Left Column - Profile Card */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <NetworkProfileCard network={network} />
        </Grid>

        {/* Right Column - Tabs */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <TabContext value={activeTab}>
              <TabList
                onChange={(_, value) => setActiveTab(value)}
                className='border-be'
                variant='scrollable'
                scrollButtons='auto'
              >
                <Tab
                  label={`Lideres (${leaders.length})`}
                  value='leaders'
                  icon={<i className='ri-star-line' />}
                  iconPosition='start'
                />
                <Tab
                  label={`Grupos (${network.groups.length})`}
                  value='groups'
                  icon={<i className='ri-team-line' />}
                  iconPosition='start'
                />
                <Tab
                  label={`Miembros (${members.length})`}
                  value='members'
                  icon={<i className='ri-group-line' />}
                  iconPosition='start'
                />
              </TabList>
              <TabPanel value='leaders' className='p-0'>
                <NetworkLeadersTab
                  leaders={leaders}
                  networkId={network.id}
                />
              </TabPanel>
              <TabPanel value='groups' className='p-0'>
                <NetworkGroupsTab
                  groups={network.groups}
                  networkId={network.id}
                />
              </TabPanel>
              <TabPanel value='members' className='p-0'>
                <NetworkMembersTab
                  members={members}
                  networkId={network.id}
                />
              </TabPanel>
            </TabContext>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default NetworkDetailView
