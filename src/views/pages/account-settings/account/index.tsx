'use client'

// React Imports
import { useEffect, useState, type ChangeEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import { useSession } from 'next-auth/react'

// Server Action Imports
import { getProfileById, updateProfile } from '@/app/server/actions'

const AccountTab = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: '',
    documentNumber: '',
    gender: '',
    birthDate: '',
    maritalStatus: '',
    hasChildren: false,
    childrenCount: 0,
    country: '',
    city: '',
    address: '',
    neighborhood: '',
    image: ''
  })

  useEffect(() => {
    if (session?.user?.id) {
      getProfileById(session.user.id).then(profile => {
        if (profile) {
          setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            documentType: profile.documentType || '',
            documentNumber: profile.documentNumber || '',
            gender: profile.gender || '',
            birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
            maritalStatus: profile.maritalStatus || '',
            hasChildren: profile.hasChildren || false,
            childrenCount: profile.childrenCount || 0,
            country: profile.country || '',
            city: profile.city || '',
            address: profile.address || '',
            neighborhood: profile.neighborhood || '',
            image: profile.image || ''
          })
        }

        setLoading(false)
      })
    }
  }, [session?.user?.id])

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSuccess(false)
    setError(null)
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no debe superar 2MB')

      return
    }

    setUploading(true)
    setError(null)

    try {
      const formDataUpload = new FormData()

      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'avatars')

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await res.json()

      if (data.url) {
        handleChange('image', data.url)
      } else {
        setError('Error al subir la imagen')
      }
    } catch {
      setError('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!session?.user?.id) return

    setSaving(true)
    setError(null)

    try {
      const { email: _, ...dataToUpdate } = formData

      await updateProfile(session.user.id, {
        ...dataToUpdate,
        birthDate: dataToUpdate.birthDate || null
      })

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box className='flex justify-center p-8'>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      {/* Foto de Perfil */}
      <CardHeader
        title='Foto de Perfil'
        subheader='Sube una foto para personalizar tu perfil'
        className='pbe-0'
      />
      <CardContent>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <Avatar
            src={formData.image || undefined}
            alt={`${formData.firstName} ${formData.lastName}`}
            sx={{ width: 100, height: 100 }}
          />
          <div className='flex grow flex-col gap-4'>
            <div className='flex flex-wrap gap-4'>
              <Button
                component='label'
                variant='contained'
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={16} color='inherit' /> : <i className='ri-upload-2-line' />}
              >
                {uploading ? 'Subiendo...' : 'Subir Foto'}
                <input
                  hidden
                  type='file'
                  accept='image/png, image/jpeg, image/webp'
                  onChange={handleImageChange}
                />
              </Button>
              {formData.image && (
                <Button
                  variant='outlined'
                  color='error'
                  onClick={() => handleChange('image', '')}
                  startIcon={<i className='ri-delete-bin-line' />}
                >
                  Eliminar
                </Button>
              )}
            </div>
            <Typography variant='body2' color='text.secondary'>
              Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 2MB
            </Typography>
          </div>
        </div>
      </CardContent>

      <Divider />

      {/* Información Personal */}
      <CardHeader
        title='Información Personal'
        subheader='Actualiza tu información básica'
        className='pbe-0'
      />
      <CardContent>
        {success && <Alert severity='success' className='mbe-4'>Perfil actualizado correctamente</Alert>}
        {error && <Alert severity='error' className='mbe-4'>{error}</Alert>}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Nombre'
              value={formData.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Apellido'
              value={formData.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Email'
              value={formData.email}
              disabled
              slotProps={{
                input: {
                  startAdornment: <i className='ri-mail-line text-textSecondary mie-2' />
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Teléfono'
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <i className='ri-phone-line text-textSecondary mie-2' />
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              label='Tipo de Documento'
              value={formData.documentType}
              onChange={e => handleChange('documentType', e.target.value)}
            >
              <MenuItem value=''>Seleccionar</MenuItem>
              <MenuItem value='CC'>Cédula de Ciudadanía</MenuItem>
              <MenuItem value='CE'>Cédula de Extranjería</MenuItem>
              <MenuItem value='TI'>Tarjeta de Identidad</MenuItem>
              <MenuItem value='PP'>Pasaporte</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Número de Documento'
              value={formData.documentNumber}
              onChange={e => handleChange('documentNumber', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl>
              <FormLabel>Género</FormLabel>
              <RadioGroup row value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                <FormControlLabel value='male' control={<Radio />} label='Masculino' />
                <FormControlLabel value='female' control={<Radio />} label='Femenino' />
                <FormControlLabel value='other' control={<Radio />} label='Otro' />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type='date'
              label='Fecha de Nacimiento'
              value={formData.birthDate}
              onChange={e => handleChange('birthDate', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              label='Estado Civil'
              value={formData.maritalStatus}
              onChange={e => handleChange('maritalStatus', e.target.value)}
            >
              <MenuItem value=''>Seleccionar</MenuItem>
              <MenuItem value='single'>Soltero/a</MenuItem>
              <MenuItem value='married'>Casado/a</MenuItem>
              <MenuItem value='divorced'>Divorciado/a</MenuItem>
              <MenuItem value='widowed'>Viudo/a</MenuItem>
              <MenuItem value='commonLaw'>Unión Libre</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <div className='flex flex-col gap-2'>
              <FormControlLabel
                control={
                  <Switch checked={formData.hasChildren} onChange={e => handleChange('hasChildren', e.target.checked)} />
                }
                label='¿Tienes hijos?'
              />
              {formData.hasChildren && (
                <TextField
                  fullWidth
                  type='number'
                  label='Cantidad de Hijos'
                  value={formData.childrenCount}
                  onChange={e => handleChange('childrenCount', Number(e.target.value))}
                  slotProps={{ input: { inputProps: { min: 0, max: 20 } } }}
                />
              )}
            </div>
          </Grid>
        </Grid>
      </CardContent>

      <Divider />

      {/* Ubicación */}
      <CardHeader
        title='Ubicación'
        subheader='Tu dirección y ubicación geográfica'
        className='pbe-0'
      />
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              label='País'
              value={formData.country}
              onChange={e => handleChange('country', e.target.value)}
            >
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
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Ciudad'
              value={formData.city}
              onChange={e => handleChange('city', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Dirección'
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label='Barrio'
              value={formData.neighborhood}
              onChange={e => handleChange('neighborhood', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <div className='flex gap-4'>
              <Button
                variant='contained'
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color='inherit' /> : <i className='ri-save-line' />}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </>
  )
}

export default AccountTab
