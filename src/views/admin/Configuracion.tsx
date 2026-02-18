'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'

// Component Imports
import LogoUploader from '@/components/LogoUploader'
import ColorPicker from '@/components/ColorPicker'

// Hook Imports
import { useTenant } from '@/contexts/TenantContext'

// Server Action Imports
import { updateOrganizationSettings } from '@/app/server/adminActions'

type OrganizationSettings = {
  name: string
  primaryColor: string
  secondaryColor: string
  logoUrl: string | null
}

const ConfiguracionView = () => {
  const tenant = useTenant()

  const [settings, setSettings] = useState<OrganizationSettings>({
    name: tenant?.name || '',
    primaryColor: tenant?.colors?.primary || '#0466C8',
    secondaryColor: tenant?.colors?.secondary || '#001845',
    logoUrl: tenant?.logoUrl || null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tenant?.id) {
      setMessage({ type: 'error', text: 'No se encontro la organizacion' })

      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      await updateOrganizationSettings(tenant.id, {
        name: settings.name,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor
      })

      setMessage({ type: 'success', text: 'Configuracion guardada exitosamente. La pagina se recargara para aplicar los cambios.' })

      // Recargar para aplicar los nuevos colores
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al guardar la configuracion' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tenant) {
    return (
      <Alert severity='warning'>
        No hay una organizacion asociada. Esta pagina solo esta disponible para tenants configurados.
      </Alert>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Configuracion de la Iglesia</Typography>
        <Typography variant='body2' color='textSecondary'>
          Personaliza la apariencia y datos de tu organizacion
        </Typography>
      </Grid>

      {message && (
        <Grid size={{ xs: 12 }}>
          <Alert severity={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title='Datos de la Iglesia' />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Box className='flex flex-col gap-4'>
                <TextField
                  label='Nombre de la Iglesia'
                  value={settings.name}
                  onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
                  fullWidth
                />

                <Divider className='my-2' />

                <Typography variant='subtitle2' className='font-semibold'>
                  Logo de la Iglesia
                </Typography>

                <LogoUploader
                  currentLogoUrl={settings.logoUrl}
                  onUpload={url => setSettings(s => ({ ...s, logoUrl: url }))}
                  onRemove={() => setSettings(s => ({ ...s, logoUrl: null }))}
                  isPublic={false}
                  disabled={isSubmitting}
                />

                <Divider className='my-4' />

                <Box className='mb-2'>
                  <Typography variant='subtitle2' className='font-semibold'>
                    Colores del Tema
                  </Typography>
                  <Typography variant='caption' className='text-textSecondary'>
                    Pasa el cursor sobre cada color para ver como se vera
                  </Typography>
                </Box>

                <Box className='flex flex-col sm:flex-row gap-4'>
                  <ColorPicker
                    label='Color Primario'
                    value={settings.primaryColor}
                    onChange={color => setSettings(s => ({ ...s, primaryColor: color }))}
                    previewName={settings.name || 'Tu Iglesia'}
                  />
                  <ColorPicker
                    label='Color Secundario'
                    value={settings.secondaryColor}
                    onChange={color => setSettings(s => ({ ...s, secondaryColor: color }))}
                    previewName={settings.name || 'Tu Iglesia'}
                  />
                </Box>

                <Button type='submit' variant='contained' disabled={isSubmitting} className='mt-4'>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title='Vista Previa' />
          <CardContent>
            {/* Preview del Logo */}
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant='caption' className='text-textSecondary mb-2 block'>
                Logo en Sidebar
              </Typography>
              <Box className='flex items-center gap-3'>
                {settings.logoUrl ? (
                  <Box
                    component='img'
                    src={settings.logoUrl}
                    alt='Logo'
                    sx={{ maxWidth: 120, maxHeight: 40, objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant='h6' sx={{ color: settings.primaryColor, fontWeight: 'bold' }}>
                    {settings.name || 'Tu Iglesia'}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Preview de Colores */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`
              }}
            >
              {settings.logoUrl && (
                <Box
                  component='img'
                  src={settings.logoUrl}
                  alt='Logo'
                  sx={{ maxWidth: 100, maxHeight: 32, objectFit: 'contain', mb: 1, filter: 'brightness(0) invert(1)' }}
                />
              )}
              <Typography variant='h6' color='white'>
                {settings.name || 'Tu Iglesia'}
              </Typography>
              <Typography variant='body2' color='white' sx={{ opacity: 0.8 }}>
                Asi se vera tu tema personalizado
              </Typography>
            </Box>

            <Box className='flex gap-2 mt-4'>
              <Button variant='contained' sx={{ bgcolor: settings.primaryColor }}>
                Boton Primario
              </Button>
              <Button variant='outlined' sx={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>
                Boton Secundario
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ConfiguracionView
