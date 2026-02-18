'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Alert from '@mui/material/Alert'

// Component Imports
import LogoUploader from '@/components/LogoUploader'
import ColorPicker from '@/components/ColorPicker'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty, regex } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Login Schema
const loginSchema = object({
  email: pipe(string(), minLength(1, 'El email es requerido'), email('Ingresa un email valido')),
  password: pipe(string(), nonEmpty('La contrasena es requerida'), minLength(5, 'Minimo 5 caracteres'))
})

// Register Church Schema
const registerChurchSchema = object({
  churchName: pipe(string(), nonEmpty('El nombre de la iglesia es requerido')),
  slug: pipe(
    string(),
    nonEmpty('El subdominio es requerido'),
    minLength(3, 'El subdominio debe tener al menos 3 caracteres'),
    regex(/^[a-z0-9-]+$/, 'Solo letras minusculas, numeros y guiones')
  ),
  adminFirstName: pipe(string(), nonEmpty('El nombre del administrador es requerido')),
  adminLastName: pipe(string(), nonEmpty('El apellido del administrador es requerido')),
  adminEmail: pipe(string(), nonEmpty('El email es requerido'), email('Ingresa un email valido')),
  adminPassword: pipe(string(), nonEmpty('La contrasena es requerida'), minLength(5, 'Minimo 5 caracteres')),
  confirmPassword: pipe(string(), nonEmpty('Confirma tu contrasena')),
  primaryColor: string(),
  secondaryColor: string()
})

type LoginFormData = InferInput<typeof loginSchema>
type RegisterChurchData = InferInput<typeof registerChurchSchema>

type ErrorType = {
  message: string[]
}

const NoahLanding = ({ mode }: { mode: Mode }) => {
  // Tab State
  const [tabValue, setTabValue] = useState('acceder')

  // Login States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loginError, setLoginError] = useState<ErrorType | null>(null)

  // Register States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()

  // Login Form
  const loginForm = useForm<LoginFormData>({
    resolver: valibotResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  // Register Form
  const registerForm = useForm<RegisterChurchData>({
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

  const slugValue = registerForm.watch('slug')

  // Login Submit
  const onLoginSubmit: SubmitHandler<LoginFormData> = async data => {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (res && res.ok && res.error === null) {
      // Obtener la organización del usuario para redirigir al subdominio correcto
      try {
        const orgRes = await fetch('/api/user/organization')
        const orgData = await orgRes.json()

        if (orgData.organization?.slug) {
          // Redirigir al subdominio de la organización del usuario
          const domain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
          const protocol = window.location.protocol
          const redirectPath = searchParams.get('redirectTo') ?? '/dashboards'
          const redirectUrl = `${protocol}//${orgData.organization.slug}.${domain}/${locale}${redirectPath}`

          window.location.href = redirectUrl
        } else {
          // Usuario sin organización - mostrar error
          setLoginError({ message: ['Tu cuenta no está asociada a ninguna iglesia.'] })
        }
      } catch {
        // Error al obtener organización - mostrar error
        setLoginError({ message: ['Error al obtener información de tu iglesia.'] })
      }
    } else {
      if (res?.error) {
        const error = JSON.parse(res.error)

        setLoginError(error)
      }
    }
  }

  // Register Submit
  const onRegisterSubmit = async (data: RegisterChurchData) => {
    if (data.adminPassword !== data.confirmPassword) {
      setRegisterError('Las contrasenas no coinciden')

      return
    }

    setIsSubmitting(true)
    setRegisterError(null)

    try {
      const res = await fetch('/api/register-church', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, logoUrl })
      })

      if (!res.ok) {
        const errorData = await res.json()

        setRegisterError(errorData.message || 'Error al registrar la iglesia')
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
        // Fallback al login
        router.replace(getLocalizedUrl('/login', locale as Locale))
      }
    } catch {
      setRegisterError('Error de conexion. Intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex bs-full justify-center items-center min-bs-[100dvh] bg-backgroundDefault p-6'>
      <div className='flex flex-col items-center is-full sm:is-auto sm:max-is-[580px]'>
        {/* Brand Header */}
        <div className='flex flex-col items-center gap-2 mbe-6'>
          <Typography variant='h2' className='font-extrabold tracking-tight text-noahNavy'>
            Noah
          </Typography>
          <Typography variant='body1' className='text-textSecondary tracking-widest uppercase'>
            Sistema de Gestión de Iglesias
          </Typography>
        </div>

        {/* Tabs Card */}
        <Card className='is-full' sx={{ borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <CardContent className='p-6 sm:p-8'>
            <TabContext value={tabValue}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <TabList onChange={(_, v) => setTabValue(v)} centered variant='fullWidth'>
                  <Tab label='Acceder' value='acceder' />
                  <Tab label='Registrar Iglesia' value='registrar' />
                </TabList>
              </Box>

              {/* Login Tab */}
              <TabPanel value='acceder' sx={{ p: 0 }}>
                <div className='text-center mbe-4'>
                  <Typography variant='h5' className='font-bold text-textPrimary'>
                    Bienvenido
                  </Typography>
                  <Typography className='mt-1 text-textSecondary'>
                    Inicia sesion para gestionar tu iglesia.
                  </Typography>
                </div>

                <form noValidate onSubmit={loginForm.handleSubmit(onLoginSubmit)} className='flex flex-col gap-4'>
                  <Controller
                    name='email'
                    control={loginForm.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        autoFocus
                        type='email'
                        label='Email'
                        onChange={e => {
                          field.onChange(e.target.value)
                          loginError !== null && setLoginError(null)
                        }}
                        {...((loginForm.formState.errors.email || loginError !== null) && {
                          error: true,
                          helperText: loginForm.formState.errors?.email?.message || loginError?.message[0]
                        })}
                      />
                    )}
                  />
                  <Controller
                    name='password'
                    control={loginForm.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Contrasena'
                        type={isPasswordShown ? 'text' : 'password'}
                        onChange={e => {
                          field.onChange(e.target.value)
                          loginError !== null && setLoginError(null)
                        }}
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
                        {...(loginForm.formState.errors.password && {
                          error: true,
                          helperText: loginForm.formState.errors.password.message
                        })}
                      />
                    )}
                  />
                  <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
                    <FormControlLabel control={<Checkbox defaultChecked />} label='Recuerdame' />
                    <Typography
                      className='text-end font-medium'
                      color='primary.main'
                      component={Link}
                      href='/forgot-password'
                    >
                      Olvidaste tu contrasena?
                    </Typography>
                  </div>
                  <Button fullWidth variant='contained' type='submit' className='py-3 font-bold text-lg rounded-xl'>
                    Iniciar Sesion
                  </Button>
                </form>

                <Divider className='gap-3 mbs-4'>o</Divider>
                <div className='flex justify-center mbs-4'>
                  <Button
                    color='secondary'
                    className='text-textPrimary'
                    startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
                    onClick={() => signIn('google')}
                  >
                    Iniciar sesion con Google
                  </Button>
                </div>
              </TabPanel>

              {/* Register Tab */}
              <TabPanel value='registrar' sx={{ p: 0 }}>
                <div className='text-center mbe-4'>
                  <Typography variant='h5' className='font-bold text-textPrimary'>
                    Registra tu Iglesia
                  </Typography>
                  <Typography className='mt-1 text-textSecondary'>
                    Configura tu espacio en Noah para gestionar tu comunidad
                  </Typography>
                </div>

                {registerError && (
                  <Alert severity='error' className='mbe-4' onClose={() => setRegisterError(null)}>
                    {registerError}
                  </Alert>
                )}

                <form noValidate onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  {/* Seccion: Datos de la Iglesia */}
                  <Typography variant='subtitle2' className='font-semibold text-textPrimary mbe-3'>
                    Datos de la Iglesia
                  </Typography>

                  <div className='flex flex-col gap-4 mbe-4'>
                    <Controller
                      name='churchName'
                      control={registerForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Nombre de la Iglesia'
                          error={!!registerForm.formState.errors.churchName}
                          helperText={registerForm.formState.errors.churchName?.message}
                        />
                      )}
                    />
                    <Controller
                      name='slug'
                      control={registerForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Subdominio'
                          error={!!registerForm.formState.errors.slug}
                          helperText={
                            registerForm.formState.errors.slug?.message ||
                            (slugValue
                              ? `Tu iglesia estara en: ${slugValue}.noah.com`
                              : 'Elige un nombre corto para tu URL')
                          }
                          slotProps={{
                            input: {
                              endAdornment: <InputAdornment position='end'>.noah.com</InputAdornment>
                            }
                          }}
                          onChange={e => {
                            const sanitized = e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                              .replace(/[^a-z0-9-]/g, '')

                            field.onChange(sanitized)
                          }}
                        />
                      )}
                    />

                    {/* Logo */}
                    <LogoUploader
                      currentLogoUrl={logoUrl}
                      onUpload={url => setLogoUrl(url)}
                      onRemove={() => setLogoUrl(null)}
                      isPublic={true}
                      disabled={isSubmitting}
                    />

                    {/* Colores */}
                    <Box className='flex flex-col sm:flex-row gap-4'>
                      <Controller
                        name='primaryColor'
                        control={registerForm.control}
                        render={({ field }) => (
                          <ColorPicker
                            label='Color Primario'
                            value={field.value}
                            onChange={field.onChange}
                            previewName={registerForm.watch('churchName') || 'Tu Iglesia'}
                          />
                        )}
                      />
                      <Controller
                        name='secondaryColor'
                        control={registerForm.control}
                        render={({ field }) => (
                          <ColorPicker
                            label='Color Secundario'
                            value={field.value}
                            onChange={field.onChange}
                            previewName={registerForm.watch('churchName') || 'Tu Iglesia'}
                          />
                        )}
                      />
                    </Box>
                  </div>

                  <Divider className='mbe-4' />

                  {/* Seccion: Datos del Administrador */}
                  <Typography variant='subtitle2' className='font-semibold text-textPrimary mbe-3'>
                    Cuenta del Administrador
                  </Typography>

                  <div className='flex flex-col gap-4'>
                    <div className='flex gap-4'>
                      <Controller
                        name='adminFirstName'
                        control={registerForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label='Nombre'
                            error={!!registerForm.formState.errors.adminFirstName}
                            helperText={registerForm.formState.errors.adminFirstName?.message}
                          />
                        )}
                      />
                      <Controller
                        name='adminLastName'
                        control={registerForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label='Apellido'
                            error={!!registerForm.formState.errors.adminLastName}
                            helperText={registerForm.formState.errors.adminLastName?.message}
                          />
                        )}
                      />
                    </div>

                    <Controller
                      name='adminEmail'
                      control={registerForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type='email'
                          label='Email del Administrador'
                          error={!!registerForm.formState.errors.adminEmail}
                          helperText={registerForm.formState.errors.adminEmail?.message}
                        />
                      )}
                    />

                    <Controller
                      name='adminPassword'
                      control={registerForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Contrasena'
                          type={isPasswordShown ? 'text' : 'password'}
                          error={!!registerForm.formState.errors.adminPassword}
                          helperText={registerForm.formState.errors.adminPassword?.message}
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
                      control={registerForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Confirmar Contrasena'
                          type={isPasswordShown ? 'text' : 'password'}
                          error={!!registerForm.formState.errors.confirmPassword}
                          helperText={registerForm.formState.errors.confirmPassword?.message}
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
              </TabPanel>
            </TabContext>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NoahLanding
