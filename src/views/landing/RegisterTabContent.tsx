'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

// Component Imports
import LogoUploader from '@/components/LogoUploader'
import ColorPicker from '@/components/ColorPicker'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, nonEmpty, regex, pipe } from 'valibot'
import type { InferInput } from 'valibot'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

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
  adminEmail: pipe(string(), nonEmpty('El email es requerido')),
  adminPassword: pipe(string(), nonEmpty('La contrasena es requerida'), minLength(5, 'Minimo 5 caracteres')),
  confirmPassword: pipe(string(), nonEmpty('Confirma tu contrasena')),
  primaryColor: string(),
  secondaryColor: string()
})

type RegisterChurchData = InferInput<typeof registerChurchSchema>

const RegisterTabContent = () => {
  // States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

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

      const signInRes = await signIn('credentials', {
        email: data.adminEmail,
        password: data.adminPassword,
        redirect: false
      })

      if (signInRes?.ok) {
        const domain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
        const protocol = window.location.protocol
        const redirectUrl = `${protocol}//${data.slug}.${domain}/${locale}/dashboards`

        window.location.href = redirectUrl
      } else {
        router.replace(getLocalizedUrl('/login', locale as Locale))
      }
    } catch {
      setRegisterError('Error de conexion. Intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
    </>
  )
}

export default RegisterTabContent
