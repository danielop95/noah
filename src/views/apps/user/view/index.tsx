'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Component Imports
import UserLeftPanel from './UserLeftPanel'
import UserRightTabs from './UserRightTabs'

type UserViewProps = {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    documentType: string | null
    documentNumber: string | null
    gender: string | null
    birthDate: Date | null
    maritalStatus: string | null
    hasChildren: boolean
    childrenCount: number
    country: string | null
    city: string | null
    address: string | null
    neighborhood: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  } | null
}

const UserView = ({ user }: UserViewProps) => {
  if (!user) {
    return (
      <div className='flex justify-center items-center min-bs-[400px]'>
        <Typography variant='h6' className='text-textSecondary'>
          Usuario no encontrado
        </Typography>
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 4 }}>
        <UserLeftPanel user={user} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <UserRightTabs user={user} />
      </Grid>
    </Grid>
  )
}

export default UserView
