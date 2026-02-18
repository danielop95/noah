'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Server Action Imports
import { deactivateUser } from '@/app/server/adminActions'

type UserLeftPanelProps = {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: string | null
    phone: string | null
    city: string | null
    country: string | null
    isActive: boolean
    createdAt: Date
  }
}

const UserLeftPanel = ({ user }: UserLeftPanelProps) => {
  const [isActive, setIsActive] = useState(user.isActive)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDeactivate = async () => {
    try {
      await deactivateUser(user.id)
      setIsActive(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const details = [
    { label: 'Email', value: user.email },
    { label: 'Teléfono', value: user.phone },
    { label: 'Ciudad', value: user.city },
    { label: 'País', value: user.country },
    { label: 'Registrado', value: new Date(user.createdAt).toLocaleDateString('es-CO') }
  ]

  return (
    <Card>
      <CardContent className='flex flex-col items-center gap-4 pbs-8'>
        <Avatar
          src={user.image || ''}
          alt={user.name || ''}
          sx={{ width: 100, height: 100 }}
        />
        <div className='text-center'>
          <Typography variant='h5'>{user.name || 'Sin nombre'}</Typography>
          <div className='flex gap-2 justify-center mbs-2'>
            <Chip
              label={user.role === 'admin' ? 'Admin' : 'Usuario'}
              color={user.role === 'admin' ? 'primary' : 'default'}
              size='small'
              variant='tonal'
            />
            <Chip
              label={isActive ? 'Activo' : 'Inactivo'}
              color={isActive ? 'success' : 'error'}
              size='small'
              variant='tonal'
            />
          </div>
        </div>

        <Divider className='is-full' />

        <div className='is-full flex flex-col gap-3'>
          {details.map(({ label, value }) => (
            <div key={label} className='flex justify-between'>
              <Typography variant='body2' className='font-medium text-textSecondary'>
                {label}
              </Typography>
              <Typography variant='body2'>{value || '-'}</Typography>
            </div>
          ))}
        </div>

        {error && <Alert severity='error' className='is-full'>{error}</Alert>}

        <div className='flex gap-3 is-full'>
          <Button
            fullWidth
            variant='contained'
            color='error'
            onClick={handleDeactivate}
            disabled={!isActive}
          >
            {isActive ? 'Desactivar' : 'Desactivado'}
          </Button>
          <Button fullWidth variant='outlined' onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserLeftPanel
