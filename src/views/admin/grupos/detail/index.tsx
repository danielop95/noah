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
import GroupProfileCard from './GroupProfileCard'
import GroupLeadersTab from './GroupLeadersTab'
import GroupMembersTab from './GroupMembersTab'
import GroupReportsTab from './GroupReportsTab'

import type { GroupFullDetails } from '@/app/server/groupActions'

type Props = {
  group: GroupFullDetails
}

const GroupDetailView = ({ group }: Props) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('leaders')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDayLabel = (day: string | null) => {
    const days: Record<string, string> = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo'
    }

    return day ? days[day] || day : null
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div className='flex items-center gap-4'>
          <IconButton onClick={() => router.push('/dashboard/admin/grupos')}>
            <i className='ri-arrow-left-line' />
          </IconButton>
          <div>
            <Typography variant='h5'>{group.name}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {getDayLabel(group.meetingDay)} {group.meetingTime && `• ${group.meetingTime}`}
              {group.city && ` • ${group.city}`}
            </Typography>
          </div>
        </div>
        <Button
          variant='contained'
          startIcon={<i className='ri-edit-line' />}
          onClick={() => router.push('/dashboard/admin/grupos')}
        >
          Editar Grupo
        </Button>
      </div>

      {/* Content */}
      <Grid container spacing={6}>
        {/* Left Column - Profile Card */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <GroupProfileCard group={group} />
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
                  label={`Líderes (${group.leaders.length})`}
                  value='leaders'
                  icon={<i className='ri-star-line' />}
                  iconPosition='start'
                />
                <Tab
                  label={`Miembros (${group.networkMembers.length})`}
                  value='members'
                  icon={<i className='ri-group-line' />}
                  iconPosition='start'
                />
                <Tab
                  label={`Reportes (${group.stats.totalReports})`}
                  value='reports'
                  icon={<i className='ri-file-list-3-line' />}
                  iconPosition='start'
                />
              </TabList>
              <TabPanel value='leaders' className='p-0'>
                <GroupLeadersTab
                  leaders={group.leaders}
                  groupId={group.id}
                  networkId={group.network.id}
                />
              </TabPanel>
              <TabPanel value='members' className='p-0'>
                <GroupMembersTab
                  members={group.networkMembers}
                  groupId={group.id}
                  networkName={group.network.name}
                />
              </TabPanel>
              <TabPanel value='reports' className='p-0'>
                <GroupReportsTab
                  reports={group.recentReports}
                  groupId={group.id}
                  stats={group.stats}
                />
              </TabPanel>
            </TabContext>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default GroupDetailView
