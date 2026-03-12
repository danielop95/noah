'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

type UserGroup = {
  id: string
  name: string
  network: { id: string; name: string } | null
  members: Array<{ id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null }>
  _count: { reports: number }
}

type Props = {
  network: { id: string; name: string } | null
  networkRole: string | null
  group: UserGroup | null
  groupRole: string | null
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const getMemberName = (m: { name: string | null; firstName: string | null; lastName: string | null }) =>
  m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || '?'

const ProfileAssignments = ({ network, networkRole, group, groupRole }: Props) => {
  const hasAssignments = network || group

  if (!hasAssignments) {
    return (
      <Card>
        <CardHeader title='Asignaciones' titleTypographyProps={{ variant: 'h5' }} />
        <CardContent>
          <div className='flex flex-col items-center justify-center py-6'>
            <CustomAvatar skin='light' color='secondary' size={56} sx={{ mb: 2 }}>
              <i className='ri-links-line text-2xl' />
            </CustomAvatar>
            <Typography variant='body1' color='text.secondary' className='mbe-1'>
              Sin asignaciones
            </Typography>
            <Typography variant='body2' color='text.disabled'>
              Este usuario no pertenece a ninguna red ni grupo
            </Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Asignaciones' titleTypographyProps={{ variant: 'h5' }} />
      <CardContent className='flex flex-col gap-5'>
        {/* Network */}
        {network && (
          <div className='flex items-center gap-3'>
            <CustomAvatar
              skin='light'
              color={networkRole === 'leader' ? 'warning' : 'info'}
              size={46}
            >
              <i className='ri-bubble-chart-line text-[22px]' />
            </CustomAvatar>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <Typography className='font-medium' color='text.primary'>
                  {network.name}
                </Typography>
                <Chip
                  label={networkRole === 'leader' ? 'Lider' : 'Miembro'}
                  color={networkRole === 'leader' ? 'warning' : 'info'}
                  size='small'
                  variant='tonal'
                  sx={{ height: 22 }}
                />
              </div>
              <Typography variant='body2' color='text.secondary'>
                Red
              </Typography>
            </div>
          </div>
        )}

        {network && group && <Divider />}

        {/* Group */}
        {group && (
          <div>
            <div className='flex items-center gap-3 mbe-3'>
              <CustomAvatar
                skin='light'
                color={groupRole === 'leader' ? 'success' : 'primary'}
                size={46}
              >
                <i className='ri-team-line text-[22px]' />
              </CustomAvatar>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <Typography className='font-medium' color='text.primary'>
                    {group.name}
                  </Typography>
                  <Chip
                    label={groupRole === 'leader' ? 'Lider' : 'Miembro'}
                    color={groupRole === 'leader' ? 'success' : 'primary'}
                    size='small'
                    variant='tonal'
                    sx={{ height: 22 }}
                  />
                </div>
                <Typography variant='body2' color='text.secondary'>
                  Grupo {group._count.reports > 0 ? `• ${group._count.reports} reportes` : ''}
                </Typography>
              </div>
            </div>

            {/* Group members preview */}
            {group.members.length > 0 && (
              <div className='flex items-center gap-3 pis-1'>
                <AvatarGroup max={5} className='pull-up' sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: '0.75rem' } }}>
                  {group.members.map(member => (
                    <Avatar key={member.id} src={member.image || undefined} alt={getMemberName(member)}>
                      {getInitials(getMemberName(member))}
                    </Avatar>
                  ))}
                </AvatarGroup>
                <Typography variant='caption' color='text.secondary'>
                  {group.members.length === 1 ? '1 lider' : `${group.members.length} lideres`}
                </Typography>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProfileAssignments
