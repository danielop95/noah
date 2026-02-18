'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useSession } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, nonEmpty, minLength } from 'valibot'
import type { InferInput } from 'valibot'

// Server Action Imports
import { changePassword } from '@/app/server/actions'

const schema = object({
  currentPassword: pipe(string(), nonEmpty('La contraseña actual es requerida')),
  newPassword: pipe(
    string(),
    nonEmpty('La nueva contraseña es requerida'),
    minLength(5, 'La contraseña debe tener al menos 5 caracteres')
  ),
  confirmPassword: pipe(string(), nonEmpty('Confirma tu nueva contraseña'))
})

type FormData = InferInput<typeof schema>

const SecurityTab = () => {
  const { data: session } = useSession()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  })

  const onSubmit = async (data: FormData) => {
    setSuccess(false)
    setError(null)

    if (data.newPassword !== data.confirmPassword) {
      setFormError('confirmPassword', { message: 'Las contraseñas no coinciden' })

      return
    }

    if (!session?.user?.id) return

    try {
      await changePassword(session.user.id, data.currentPassword, data.newPassword)
      setSuccess(true)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña')
    }
  }

  return (
    <Card variant='outlined'>
      <CardHeader title='Cambiar Contraseña' />
      <CardContent>
        {success && (
          <Alert severity='success' className='mbe-4'>
            Contraseña actualizada correctamente
          </Alert>
        )}
        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <Controller
            name='currentPassword'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Contraseña Actual'
                type={showCurrent ? 'text' : 'password'}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => setShowCurrent(s => !s)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={showCurrent ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            )}
          />
          <Controller
            name='newPassword'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Nueva Contraseña'
                type={showNew ? 'text' : 'password'}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => setShowNew(s => !s)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={showNew ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            )}
          />
          <Controller
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Confirmar Nueva Contraseña'
                type={showConfirm ? 'text' : 'password'}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => setShowConfirm(s => !s)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={showConfirm ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            )}
          />

          <div>
            <Typography variant='subtitle2' className='mbe-2'>Requisitos de contraseña:</Typography>
            <ul className='pis-5'>
              <li><Typography variant='body2' className='text-textSecondary'>Mínimo 5 caracteres</Typography></li>
              <li><Typography variant='body2' className='text-textSecondary'>Al menos una letra mayúscula y una minúscula</Typography></li>
              <li><Typography variant='body2' className='text-textSecondary'>Al menos un número o carácter especial</Typography></li>
            </ul>
          </div>

          <div className='flex gap-4'>
            <Button variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Cambiar Contraseña'}
            </Button>
            <Button variant='outlined' onClick={() => reset()} disabled={isSubmitting}>
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default SecurityTab
