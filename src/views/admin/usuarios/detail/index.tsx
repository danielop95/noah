'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import ProfileHeader from './ProfileHeader'
import ProfileAbout from './ProfileAbout'
import ProfileAssignments from './ProfileAssignments'
import ProfileStats from './ProfileStats'
import ProfileTimeline from './ProfileTimeline'
import UserEditDrawer from '@/components/UserEditDrawer'
import CustomTabList from '@core/components/mui/TabList'

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
  const [activeTab, setActiveTab] = useState('profile')

  const isGroupLeader = user.groupRole === 'leader'

  return (
    <>
      <Grid container spacing={6}>
        {/* Profile Header - Full width */}
        <Grid size={{ xs: 12 }}>
          <ProfileHeader
            user={user}
            onEdit={() => setDrawerOpen(true)}
            onBack={() => router.push('/dashboard/admin/usuarios')}
          />
        </Grid>

        {/* Tabs */}
        <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList
              onChange={(_, value) => setActiveTab(value)}
              variant='scrollable'
              pill='true'
            >
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-user-3-line text-lg' />
                    Perfil
                  </div>
                }
                value='profile'
              />
              {isGroupLeader && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-bar-chart-2-line text-lg' />
                      Actividad
                    </div>
                  }
                  value='activity'
                />
              )}
            </CustomTabList>

            {/* Profile Tab */}
            <TabPanel value='profile' className='p-0'>
              <Grid container spacing={6}>
                {/* Left Column — About + Assignments */}
                <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                  <div className='flex flex-col gap-6'>
                    <ProfileAbout user={user} />
                    <ProfileAssignments
                      network={user.network}
                      networkRole={user.networkRole}
                      group={user.group}
                      groupRole={user.groupRole}
                    />
                  </div>
                </Grid>

                {/* Right Column — Stats + Timeline */}
                <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                  <div className='flex flex-col gap-6'>
                    {isGroupLeader && <ProfileStats stats={user.stats} />}
                    <ProfileTimeline reports={user.groupReports} />
                  </div>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Activity Tab (Group Leaders only) */}
            {isGroupLeader && (
              <TabPanel value='activity' className='p-0'>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12 }}>
                    <ProfileStats stats={user.stats} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <ProfileTimeline reports={user.groupReports} />
                  </Grid>
                </Grid>
              </TabPanel>
            )}
          </TabContext>
        </Grid>
      </Grid>

      {/* Edit Drawer */}
      <UserEditDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onSaved={() => router.refresh()}
      />
    </>
  )
}

export default UserDetailView
