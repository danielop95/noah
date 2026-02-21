'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import Switch from '@mui/material/Switch'
import FormHelperText from '@mui/material/FormHelperText'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, nonEmpty, minLength, email, boolean, literal, optional, number } from 'valibot'
import type { SubmitHandler, UseFormReturn } from 'react-hook-form'
import type { InferInput } from 'valibot'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Step schemas
const step1Schema = object({
  firstName: pipe(string(), nonEmpty('El nombre es requerido')),
  lastName: pipe(string(), nonEmpty('El apellido es requerido')),
  documentType: optional(string()),
  documentNumber: optional(string()),
  gender: optional(string()),
  birthDate: optional(string())
})

const step2Schema = object({
  maritalStatus: optional(string()),
  hasChildren: optional(boolean()),
  childrenCount: optional(number())
})

const step3Schema = object({
  phone: optional(string()),
  country: optional(string()),
  city: optional(string()),
  address: optional(string()),
  neighborhood: optional(string())
})

const step4Schema = object({
  email: pipe(string(), nonEmpty('El email es requerido'), email('Ingresa un email válido')),
  password: pipe(
    string(),
    nonEmpty('La contraseña es requerida'),
    minLength(5, 'La contraseña debe tener al menos 5 caracteres')
  ),
  confirmPassword: pipe(string(), nonEmpty('Confirma tu contraseña')),
  agreeTerms: literal(true, 'Debes aceptar los términos y condiciones')
})

type Step1Data = InferInput<typeof step1Schema>
type Step2Data = InferInput<typeof step2Schema>
type Step3Data = InferInput<typeof step3Schema>
type Step4Data = InferInput<typeof step4Schema>

const steps = ['Datos Personales', 'Familia', 'Contacto', 'Cuenta']

// Step 1: Personal Data
const StepPersonal = ({ form }: { form: UseFormReturn<Step1Data> }) => {
  const {
    control,
    formState: { errors }
  } = form

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-4'>
        <Controller
          name='firstName'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='Nombre'
              autoFocus
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />
        <Controller
          name='lastName'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='Apellido'
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />
      </div>
      <div className='flex gap-4'>
        <Controller
          name='documentType'
          control={control}
          render={({ field }) => (
            <TextField {...field} select fullWidth label='Tipo de Documento'>
              <MenuItem value=''>Seleccionar</MenuItem>
              <MenuItem value='CC'>Cédula de Ciudadanía</MenuItem>
              <MenuItem value='CE'>Cédula de Extranjería</MenuItem>
              <MenuItem value='TI'>Tarjeta de Identidad</MenuItem>
              <MenuItem value='PP'>Pasaporte</MenuItem>
            </TextField>
          )}
        />
        <Controller
          name='documentNumber'
          control={control}
          render={({ field }) => <TextField {...field} fullWidth label='Número de Documento' />}
        />
      </div>
      <Controller
        name='gender'
        control={control}
        render={({ field }) => (
          <FormControl>
            <FormLabel>Género</FormLabel>
            <RadioGroup row {...field}>
              <FormControlLabel value='male' control={<Radio />} label='Masculino' />
              <FormControlLabel value='female' control={<Radio />} label='Femenino' />
              <FormControlLabel value='other' control={<Radio />} label='Otro' />
            </RadioGroup>
          </FormControl>
        )}
      />
      <Controller
        name='birthDate'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type='date'
            label='Fecha de Nacimiento'
            slotProps={{ inputLabel: { shrink: true } }}
          />
        )}
      />
    </div>
  )
}

// Step 2: Family
const StepFamily = ({ form }: { form: UseFormReturn<Step2Data> }) => {
  const { control, watch } = form
  const hasChildren = watch('hasChildren')

  return (
    <div className='flex flex-col gap-4'>
      <Controller
        name='maritalStatus'
        control={control}
        render={({ field }) => (
          <TextField {...field} select fullWidth label='Estado Civil'>
            <MenuItem value=''>Seleccionar</MenuItem>
            <MenuItem value='single'>Soltero/a</MenuItem>
            <MenuItem value='married'>Casado/a</MenuItem>
            <MenuItem value='divorced'>Divorciado/a</MenuItem>
            <MenuItem value='widowed'>Viudo/a</MenuItem>
            <MenuItem value='commonLaw'>Unión Libre</MenuItem>
          </TextField>
        )}
      />
      <Controller
        name='hasChildren'
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value || false} onChange={e => field.onChange(e.target.checked)} />}
            label='¿Tienes hijos?'
          />
        )}
      />
      {hasChildren && (
        <Controller
          name='childrenCount'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type='number'
              label='Cantidad de Hijos'
              onChange={e => field.onChange(Number(e.target.value))}
              slotProps={{ input: { inputProps: { min: 0, max: 20 } } }}
            />
          )}
        />
      )}
    </div>
  )
}

// Step 3: Contact & Location
const StepContact = ({ form }: { form: UseFormReturn<Step3Data> }) => {
  const { control } = form

  return (
    <div className='flex flex-col gap-4'>
      <Controller
        name='phone'
        control={control}
        render={({ field }) => <TextField {...field} fullWidth label='Teléfono' />}
      />
      <div className='flex gap-4'>
        <Controller
          name='country'
          control={control}
          render={({ field }) => (
            <TextField {...field} select fullWidth label='País'>
              <MenuItem value=''>Seleccionar</MenuItem>
              <MenuItem value='CO'>Colombia</MenuItem>
              <MenuItem value='VE'>Venezuela</MenuItem>
              <MenuItem value='EC'>Ecuador</MenuItem>
              <MenuItem value='PE'>Perú</MenuItem>
              <MenuItem value='MX'>México</MenuItem>
              <MenuItem value='AR'>Argentina</MenuItem>
              <MenuItem value='CL'>Chile</MenuItem>
              <MenuItem value='US'>Estados Unidos</MenuItem>
            </TextField>
          )}
        />
        <Controller
          name='city'
          control={control}
          render={({ field }) => <TextField {...field} fullWidth label='Ciudad' />}
        />
      </div>
      <Controller
        name='address'
        control={control}
        render={({ field }) => <TextField {...field} fullWidth label='Dirección' />}
      />
      <Controller
        name='neighborhood'
        control={control}
        render={({ field }) => <TextField {...field} fullWidth label='Barrio' />}
      />
    </div>
  )
}

// Step 4: Account
const StepAccount = ({ form }: { form: UseFormReturn<Step4Data> }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmShown, setIsConfirmShown] = useState(false)
  const {
    control,
    formState: { errors }
  } = form

  return (
    <div className='flex flex-col gap-4'>
      <Controller
        name='email'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type='email'
            label='Email'
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />
      <Controller
        name='password'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label='Contraseña'
            type={isPasswordShown ? 'text' : 'password'}
            error={!!errors.password}
            helperText={errors.password?.message}
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
            type={isConfirmShown ? 'text' : 'password'}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      edge='end'
                      onClick={() => setIsConfirmShown(s => !s)}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className={isConfirmShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        )}
      />
      <Controller
        name='agreeTerms'
        control={control}
        render={({ field }) => (
          <div>
            <FormControlLabel
              control={<Checkbox checked={field.value || false} onChange={e => field.onChange(e.target.checked)} />}
              label={
                <>
                  <span>Acepto los </span>
                  <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                    términos y condiciones
                  </Link>
                </>
              }
            />
            {errors.agreeTerms && <FormHelperText error>{errors.agreeTerms.message}</FormHelperText>}
          </div>
        )}
      />
    </div>
  )
}

type RegisterProps = {
  organizationId?: string | null
}

const Register = ({ organizationId }: RegisterProps) => {
  const [activeStep, setActiveStep] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { lang: locale } = useParams()

  // Form instances per step
  const form1 = useForm<Step1Data>({
    resolver: valibotResolver(step1Schema),
    defaultValues: { firstName: '', lastName: '', documentType: '', documentNumber: '', gender: '', birthDate: '' }
  })

  const form2 = useForm<Step2Data>({
    resolver: valibotResolver(step2Schema),
    defaultValues: { maritalStatus: '', hasChildren: false, childrenCount: 0 }
  })

  const form3 = useForm<Step3Data>({
    resolver: valibotResolver(step3Schema),
    defaultValues: { phone: '', country: '', city: '', address: '', neighborhood: '' }
  })

  const form4 = useForm<Step4Data>({
    resolver: valibotResolver(step4Schema),
    defaultValues: { email: '', password: '', confirmPassword: '', agreeTerms: false as unknown as true }
  })

  const forms = [form1, form2, form3, form4] as UseFormReturn<Record<string, unknown>>[]

  const handleNext = async () => {
    const currentForm = forms[activeStep]
    const isValid = await currentForm.trigger()

    if (!isValid) return

    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit: SubmitHandler<Step4Data> = async data => {
    if (data.password !== data.confirmPassword) {
      form4.setError('confirmPassword', { message: 'Las contraseñas no coinciden' })

      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const allData = {
        ...form1.getValues(),
        ...form2.getValues(),
        ...form3.getValues(),
        email: data.email,
        password: data.password,
        organizationId: organizationId || null
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allData)
      })

      if (!res.ok) {
        const errorData = await res.json()

        setErrorMessage(errorData.message || 'Error al crear la cuenta')
        setIsSubmitting(false)

        return
      }

      // Auto-login after registration
      const signInRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (signInRes?.ok) {
        router.replace('/dashboard')
      } else {
        // Registration succeeded but auto-login failed, redirect to login
        router.replace(getLocalizedUrl('/login', locale as Locale))
      }
    } catch {
      setErrorMessage('Error de conexión. Intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <StepPersonal form={form1} />
      case 1:
        return <StepFamily form={form2} />
      case 2:
        return <StepContact form={form3} />
      case 3:
        return <StepAccount form={form4} />
      default:
        return null
    }
  }

  return (
    <div className='flex bs-full justify-center items-center min-bs-[100dvh] bg-backgroundDefault p-6'>
      <div className='flex flex-col items-center is-full sm:is-auto sm:max-is-[520px]'>
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
                Crear Cuenta
              </Typography>
              <Typography className='mt-1 text-textSecondary'>Completa tus datos para registrarte</Typography>
            </div>

            <Stepper activeStep={activeStep} alternativeLabel className='mbe-6'>
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {errorMessage && (
              <Alert severity='error' className='mbe-4' onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            <form
              noValidate
              onSubmit={
                activeStep === steps.length - 1
                  ? form4.handleSubmit(handleSubmit)
                  : e => {
                      e.preventDefault()
                      handleNext()
                    }
              }
            >
              {renderStep()}

              <div className='flex justify-between mbs-6 gap-4'>
                <Button variant='outlined' disabled={activeStep === 0} onClick={handleBack}>
                  Atrás
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button variant='contained' type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
                  </Button>
                ) : (
                  <Button variant='contained' type='submit'>
                    Siguiente
                  </Button>
                )}
              </div>
            </form>

            <div className='flex justify-center items-center flex-wrap gap-2 mbs-4'>
              <Typography>¿Ya tienes cuenta?</Typography>
              <Typography
                component={Link}
                href={getLocalizedUrl('/login', locale as Locale)}
                className='font-bold'
                color='primary.main'
              >
                Inicia sesión
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Register
