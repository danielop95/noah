'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Third-party Imports
import { useSession } from 'next-auth/react'

// Component Imports
import ProfileOverview from './ProfileOverview'
import AccountTab from './account'
import SecurityTab from './security'

// Server Action Imports
import { getFullProfile } from '@/app/server/actions'

type UserGroup = {
  id: string
  name: string
  network: { id: string; name: string } | null
  _count: { reports: number }
}

type ProfileData = {
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
  networkRole: string | null
  groupRole: string | null
  network: { id: string; name: string } | null
  organization: { id: string; name: string; logoUrl: string | null } | null
  group: UserGroup | null
  stats: {
    reportsCount: number
    groupsLeading: number
    totalAttendees: number
    totalVisitors: number
    avgAttendees: number
  }
}

const AccountSettings = () => {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('account')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      getFullProfile(session.user.id).then(data => {
        setProfile(data as ProfileData)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [session?.user?.id])

  if (loading) {
    return (
      <Box className='flex justify-center items-center min-bs-[400px]'>
        <CircularProgress />
      </Box>
    )
  }

  if (!profile) {
    return (
      <Box className='flex justify-center items-center min-bs-[400px]'>
        <p>No se pudo cargar el perfil</p>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Panel Izquierdo - Perfil */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <ProfileOverview profile={profile} />
      </Grid>

      {/* Panel Derecho - Tabs */}
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
                label='Información Personal'
                value='account'
                icon={<i className='ri-user-3-line' />}
                iconPosition='start'
              />
              <Tab
                label='Seguridad'
                value='security'
                icon={<i className='ri-lock-line' />}
                iconPosition='start'
              />
            </TabList>
            <TabPanel value='account' className='p-0'>
              <AccountTab />
            </TabPanel>
            <TabPanel value='security' className='p-0'>
              <SecurityTab />
            </TabPanel>
          </TabContext>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AccountSettings
