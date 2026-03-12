'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

type Props = {
  stats: {
    reportsCount: number
    groupsLeading: number
    totalAttendees: number
    totalVisitors: number
    avgAttendees: number
  }
}

const statItems = [
  { key: 'reportsCount', label: 'Reportes', icon: 'ri-file-list-3-line', color: 'primary' as const },
  { key: 'groupsLeading', label: 'Grupos', icon: 'ri-team-line', color: 'success' as const },
  { key: 'totalAttendees', label: 'Asistentes', icon: 'ri-user-follow-line', color: 'info' as const },
  { key: 'totalVisitors', label: 'Visitas', icon: 'ri-user-add-line', color: 'warning' as const },
  { key: 'avgAttendees', label: 'Promedio', icon: 'ri-line-chart-line', color: 'error' as const }
]

const ProfileStats = ({ stats }: Props) => {
  return (
    <Card>
      <CardContent>
        <Grid container spacing={4}>
          {statItems.map(item => (
            <Grid key={item.key} size={{ xs: 6, sm: 4, md: 'grow' }}>
              <div className='flex items-center gap-3'>
                <CustomAvatar skin='light' color={item.color} size={46}>
                  <i className={`${item.icon} text-[22px]`} />
                </CustomAvatar>
                <div>
                  <Typography variant='h5'>
                    {stats[item.key as keyof typeof stats]}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {item.label}
                  </Typography>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProfileStats
