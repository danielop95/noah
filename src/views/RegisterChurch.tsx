'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, nonEmpty, minLength, email, regex } from 'valibot'
import type { InferInput } from 'valibot'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Schema de validación
const registerChurchSchema = object({
  churchName: pipe(string(), nonEmpty('El nombre de la iglesia es requerido')),
  slug: pipe(
    string(),
    nonEmpty('El subdominio es requerido'),
    minLength(3, 'El subdominio debe tener al menos 3 caracteres'),
    regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones')
  ),
  adminFirstName: pipe(string(), nonEmpty('El nombre del administrador es requerido')),
  adminLastName: pipe(string(), nonEmpty('El apellido del administrador es requerido')),
  adminEmail: pipe(string(), nonEmpty('El email es requerido'), email('Ingresa un email válido')),
  adminPassword: pipe(
    string(),
    nonEmpty('La contraseña es requerida'),
    minLength(5, 'La contraseña debe tener al menos 5 caracteres')
  ),
  confirmPassword: pipe(string(), nonEmpty('Confirma tu contraseña')),
  primaryColor: string(),
  secondaryColor: string()
})

type RegisterChurchData = InferInput<typeof registerChurchSchema>

const RegisterChurch = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const router = useRouter()
  const { lang: locale } = useParams()

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm<RegisterChurchData>({
    resolver: valibotResolver(registerChurchSchema),
    defaultValues: {
      churchName: '',
      slug: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
      primaryColor: '#0466C8',
      secondaryColor: '#001845'
    }
  })

  const slugValue = watch('slug')

  const onSubmit = async (data: RegisterChurchData) => {
    if (data.adminPassword !== data.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden')

      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/register-church', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json()

        setErrorMessage(errorData.message || 'Error al registrar la iglesia')
        setIsSubmitting(false)

        return
      }

      // Auto-login con las credenciales del admin
      const signInRes = await signIn('credentials', {
        email: data.adminEmail,
        password: data.adminPassword,
        redirect: false
      })

      if (signInRes?.ok) {
        // Redirigir al subdominio del tenant creado
        const domain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
        const protocol = window.location.protocol
        const redirectUrl = `${protocol}//${data.slug}.${domain}/${locale}/dashboards`

        window.location.href = redirectUrl
      } else {
        // Fallback al login del subdominio
        const domain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
        const protocol = window.location.protocol

        window.location.href = `${protocol}//${data.slug}.${domain}/${locale}/login`
      }
    } catch {
      setErrorMessage('Error de conexión. Intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex bs-full justify-center items-center min-bs-[100dvh] bg-backgroundDefault p-6'>
      <div className='flex flex-col items-center is-full sm:is-auto sm:max-is-[580px]'>
        {/* Brand Header */}
        <div className='flex flex-col items-center gap-2 mbe-6'>
          <Typography variant='h3' className='font-extrabold tracking-tight text-noahNavy'>
            Noah
          </Typography>
          <Typography variant='body2' className='text-textSecondary tracking-widest uppercase text-xs'>
            Church Management
          </Typography>
        </div>

        <Card className='is-full' sx={{ borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <CardContent className='p-6 sm:p-8'>
            <div className='text-center mbe-4'>
              <Typography variant='h5' className='font-bold text-textPrimary'>
                Registra tu Iglesia
              </Typography>
              <Typography className='mt-1 text-textSecondary'>
                Configura tu espacio en Noah para gestionar tu comunidad
              </Typography>
            </div>

            {errorMessage && (
              <Alert severity='error' className='mbe-4' onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              {/* Sección: Datos de la Iglesia */}
              <Typography variant='subtitle2' className='font-semibold text-textPrimary mbe-3'>
                Datos de la Iglesia
              </Typography>

              <div className='flex flex-col gap-4 mbe-4'>
                <Controller
                  name='churchName'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Nombre de la Iglesia'
                      autoFocus
                      error={!!errors.churchName}
                      helperText={errors.churchName?.message}
                    />
                  )}
                />
                <Controller
                  name='slug'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Subdominio'
                      error={!!errors.slug}
                      helperText={
                        errors.slug?.message ||
                        (slugValue
                          ? `Tu iglesia estará en: ${slugValue}.noah.com`
                          : 'Elige un nombre corto para tu URL')
                      }
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position='end'>.noah.com</InputAdornment>
                        }
                      }}
                      onChange={e => {
                        // Forzar minúsculas y reemplazar espacios por guiones
                        const sanitized = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, '')

                        field.onChange(sanitized)
                      }}
                    />
                  )}
                />

                {/* Colores */}
                <div className='flex gap-4'>
                  <Controller
                    name='primaryColor'
                    control={control}
                    render={({ field }) => (
                      <Box className='flex flex-col gap-1 flex-1'>
                        <Typography variant='caption' className='text-textSecondary'>
                          Color Primario
                        </Typography>
                        <Box className='flex items-center gap-2'>
                          <input
                            type='color'
                            value={field.value}
                            onChange={e => field.onChange(e.target.value)}
                            style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                          />
                          <TextField {...field} size='small' fullWidth />
                        </Box>
                      </Box>
                    )}
                  />
                  <Controller
                    name='secondaryColor'
                    control={control}
                    render={({ field }) => (
                      <Box className='flex flex-col gap-1 flex-1'>
                        <Typography variant='caption' className='text-textSecondary'>
                          Color Secundario
                        </Typography>
                        <Box className='flex items-center gap-2'>
                          <input
                            type='color'
                            value={field.value}
                            onChange={e => field.onChange(e.target.value)}
                            style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                          />
                          <TextField {...field} size='small' fullWidth />
                        </Box>
                      </Box>
                    )}
                  />
                </div>
              </div>

              <Divider className='mbe-4' />

              {/* Sección: Datos del Administrador */}
              <Typography variant='subtitle2' className='font-semibold text-textPrimary mbe-3'>
                Cuenta del Administrador
              </Typography>

              <div className='flex flex-col gap-4'>
                <div className='flex gap-4'>
                  <Controller
                    name='adminFirstName'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Nombre'
                        error={!!errors.adminFirstName}
                        helperText={errors.adminFirstName?.message}
                      />
                    )}
                  />
                  <Controller
                    name='adminLastName'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Apellido'
                        error={!!errors.adminLastName}
                        helperText={errors.adminLastName?.message}
                      />
                    )}
                  />
                </div>

                <Controller
                  name='adminEmail'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type='email'
                      label='Email del Administrador'
                      error={!!errors.adminEmail}
                      helperText={errors.adminEmail?.message}
                    />
                  )}
                />

                <Controller
                  name='adminPassword'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Contraseña'
                      type={isPasswordShown ? 'text' : 'password'}
                      error={!!errors.adminPassword}
                      helperText={errors.adminPassword?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                size='small'
                                edge='end'
                                onClick={() => setIsPasswordShown(s => !s)}
                                onMouseDown={e => e.preventDefault()}
                              >
                                <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
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
                      label='Confirmar Contraseña'
                      type={isPasswordShown ? 'text' : 'password'}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                    />
                  )}
                />
              </div>

              <Button
                variant='contained'
                type='submit'
                fullWidth
                disabled={isSubmitting}
                className='mbs-6'
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? 'Registrando iglesia...' : 'Registrar Iglesia'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterChurch
