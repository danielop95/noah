'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

type Props = {
  user: {
    email: string | null
    phone: string | null
    city: string | null
    country: string | null
    address: string | null
    neighborhood: string | null
    gender: string | null
    birthDate: Date | null
    maritalStatus: string | null
    documentType: string | null
    documentNumber: string | null
    hasChildren: boolean | null
    childrenCount: number | null
    organization: { id: string; name: string; logoUrl: string | null } | null
  }
}

const getCountryName = (code: string | null) => {
  const countries: Record<string, string> = {
    CO: 'Colombia', VE: 'Venezuela', EC: 'Ecuador',
    PE: 'Peru', MX: 'Mexico', AR: 'Argentina'
  }

  return code ? countries[code] || code : null
}

const getGenderLabel = (g: string | null) => {
  const map: Record<string, string> = { male: 'Masculino', female: 'Femenino', other: 'Otro' }

  return g ? map[g] || g : null
}

const getMaritalLabel = (m: string | null) => {
  const map: Record<string, string> = {
    single: 'Soltero/a', married: 'Casado/a', divorced: 'Divorciado/a',
    widowed: 'Viudo/a', separated: 'Separado/a', free_union: 'Union libre'
  }

  return m ? map[m] || m : null
}

const getDocTypeLabel = (d: string | null) => {
  const map: Record<string, string> = {
    CC: 'Cedula de Ciudadania', CE: 'Cedula de Extranjeria',
    TI: 'Tarjeta de Identidad', PP: 'Pasaporte', NIT: 'NIT'
  }

  return d ? map[d] || d : null
}

type InfoRowProps = {
  icon: string
  label: string
  value: string | null | undefined
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => {
  if (!value) return null

  return (
    <div className='flex items-center gap-2'>
      <i className={`${icon} text-textSecondary`} />
      <div className='flex items-center flex-wrap gap-2'>
        <Typography className='font-medium'>{label}:</Typography>
        <Typography color='text.secondary'>{value}</Typography>
      </div>
    </div>
  )
}

const ProfileAbout = ({ user }: Props) => {
  const formatDate = (date: Date | null) => {
    if (!date) return null

    return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const hasPersonalInfo = user.gender || user.birthDate || user.maritalStatus || user.hasChildren || user.documentType
  const hasContactInfo = user.email || user.phone
  const hasLocationInfo = user.city || user.country || user.address || user.neighborhood

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        {/* Contact */}
        {hasContactInfo && (
          <div className='flex flex-col gap-4'>
            <Typography variant='caption' className='uppercase' color='text.disabled'>
              Contacto
            </Typography>
            <InfoRow icon='ri-mail-line' label='Email' value={user.email} />
            <InfoRow icon='ri-phone-line' label='Telefono' value={user.phone} />
            {user.organization && (
              <InfoRow icon='ri-building-2-line' label='Organizacion' value={user.organization.name} />
            )}
          </div>
        )}

        {hasPersonalInfo && (
          <>
            <Divider />
            <div className='flex flex-col gap-4'>
              <Typography variant='caption' className='uppercase' color='text.disabled'>
                Informacion Personal
              </Typography>
              <InfoRow icon='ri-user-line' label='Genero' value={getGenderLabel(user.gender)} />
              <InfoRow icon='ri-cake-2-line' label='Nacimiento' value={formatDate(user.birthDate)} />
              <InfoRow icon='ri-heart-line' label='Estado civil' value={getMaritalLabel(user.maritalStatus)} />
              {user.hasChildren && (
                <InfoRow
                  icon='ri-parent-line'
                  label='Hijos'
                  value={user.childrenCount ? `${user.childrenCount}` : 'Si'}
                />
              )}
              {user.documentType && (
                <InfoRow
                  icon='ri-id-card-line'
                  label={getDocTypeLabel(user.documentType) || 'Documento'}
                  value={user.documentNumber}
                />
              )}
            </div>
          </>
        )}

        {hasLocationInfo && (
          <>
            <Divider />
            <div className='flex flex-col gap-4'>
              <Typography variant='caption' className='uppercase' color='text.disabled'>
                Ubicacion
              </Typography>
              <InfoRow icon='ri-map-pin-2-line' label='Ciudad' value={user.city} />
              <InfoRow icon='ri-global-line' label='Pais' value={getCountryName(user.country)} />
              <InfoRow icon='ri-home-4-line' label='Direccion' value={user.address} />
              <InfoRow icon='ri-community-line' label='Barrio' value={user.neighborhood} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ProfileAbout
