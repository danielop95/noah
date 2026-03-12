'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

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

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'

// Type Imports
import type { Mode } from '@core/types'

type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>

const schema = object({
  email: pipe(string(), minLength(1, 'Este campo es requerido'), email('Ingresa un correo válido')),
  password: pipe(
    string(),
    nonEmpty('Este campo es requerido'),
    minLength(5, 'La contraseña debe tener al menos 5 caracteres')
  )
})

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (res && res.ok && res.error === null) {
      const redirectURL = searchParams.get('redirectTo') ?? '/dashboard'

      router.replace(redirectURL)
    } else {
      if (res?.error) {
        const error = JSON.parse(res.error)

        setErrorState(error)
      }
    }
  }

  return (
    <div className='flex bs-full justify-center items-center min-bs-[100dvh] bg-backgroundDefault p-6'>
      <div className='flex flex-col items-center is-full sm:is-auto sm:max-is-[460px]'>
        {/* Brand Header */}
        <div className='flex flex-col items-center gap-3 mbe-8'>
          <img
            src='/images/logo-casa-del-rey.png'
            alt='Casa del Rey'
            style={{ width: 80, height: 80, objectFit: 'contain' }}
          />
          <Typography
            variant='h4'
            className='font-extrabold tracking-tight'
            sx={{ color: 'var(--mui-palette-text-primary)' }}
          >
            Noah
          </Typography>
        </div>

        {/* Login Card */}
        <Card className='is-full' sx={{ borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <CardContent className='p-8 sm:p-10'>
            {/* Welcome Text */}
            <div className='text-center mbe-6'>
              <Typography variant='h5' className='font-bold text-textPrimary'>
                Bienvenido
              </Typography>
              <Typography className='mt-1 text-textSecondary'>
                Inicia sesión para gestionar tu iglesia.
              </Typography>
            </div>

            <form
              noValidate
              action={() => {}}
              autoComplete='off'
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col gap-5'
            >
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    autoFocus
                    type='email'
                    label='Email'
                    onChange={e => {
                      field.onChange(e.target.value)
                      errorState !== null && setErrorState(null)
                    }}
                    {...((errors.email || errorState !== null) && {
                      error: true,
                      helperText: errors?.email?.message || errorState?.message[0]
                    })}
                  />
                )}
              />
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Contraseña'
                    id='login-password'
                    type={isPasswordShown ? 'text' : 'password'}
                    onChange={e => {
                      field.onChange(e.target.value)
                      errorState !== null && setErrorState(null)
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              size='small'
                              edge='end'
                              onClick={handleClickShowPassword}
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                    {...(errors.password && { error: true, helperText: errors.password.message })}
                  />
                )}
              />
              <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
                <FormControlLabel control={<Checkbox defaultChecked />} label='Recuérdame' />
                <Link href='/forgot-password' className='text-end font-medium' style={{ color: 'var(--mui-palette-primary-main)' }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Button fullWidth variant='contained' type='submit' className='py-3 font-bold text-lg rounded-xl'>
                Iniciar Sesión
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>¿Eres nuevo?</Typography>
                <Link href='/register' className='font-bold' style={{ color: 'var(--mui-palette-primary-main)' }}>
                  Crea una cuenta
                </Link>
              </div>
            </form>
            <Divider className='gap-3 mbs-5'>o</Divider>
            <div className='flex justify-center mbs-5'>
              <Button
                color='secondary'
                className='text-textPrimary'
                startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
                sx={{ '& .MuiButton-startIcon': { marginInlineEnd: 3 } }}
                onClick={() => signIn('google')}
              >
                Iniciar sesión con Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
