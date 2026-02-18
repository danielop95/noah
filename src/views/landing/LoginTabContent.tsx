'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'

// Type Imports
import type { Locale } from '@configs/i18n'

const loginSchema = object({
  email: pipe(string(), minLength(1, 'El email es requerido'), email('Ingresa un email valido')),
  password: pipe(string(), nonEmpty('La contrasena es requerida'), minLength(5, 'Minimo 5 caracteres'))
})

type LoginFormData = InferInput<typeof loginSchema>

type ErrorType = {
  message: string[]
}

const LoginTabContent = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loginError, setLoginError] = useState<ErrorType | null>(null)

  // Hooks
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()

  const loginForm = useForm<LoginFormData>({
    resolver: valibotResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  const onLoginSubmit: SubmitHandler<LoginFormData> = async data => {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (res && res.ok && res.error === null) {
      try {
        const orgRes = await fetch('/api/user/organization')
        const orgData = await orgRes.json()

        if (orgData.organization?.slug) {
          const domain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
          const protocol = window.location.protocol
          const redirectPath = searchParams.get('redirectTo') ?? '/dashboards'
          const redirectUrl = `${protocol}//${orgData.organization.slug}.${domain}/${locale}${redirectPath}`

          window.location.href = redirectUrl
        } else {
          setLoginError({ message: ['Tu cuenta no está asociada a ninguna iglesia.'] })
        }
      } catch {
        setLoginError({ message: ['Error al obtener información de tu iglesia.'] })
      }
    } else {
      if (res?.error) {
        const error = JSON.parse(res.error)

        setLoginError(error)
      }
    }
  }

  return (
    <>
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
    </>
  )
}

export default LoginTabContent
