'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

type UserData = {
  firstName: string | null
  lastName: string | null
  documentType: string | null
  documentNumber: string | null
  gender: string | null
  birthDate: Date | null
  maritalStatus: string | null
  hasChildren: boolean
  childrenCount: number
  phone: string | null
  country: string | null
  city: string | null
  address: string | null
  neighborhood: string | null
}

const docTypeMap: Record<string, string> = {
  CC: 'Cédula de Ciudadanía',
  CE: 'Cédula de Extranjería',
  TI: 'Tarjeta de Identidad',
  PP: 'Pasaporte'
}

const genderMap: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro'
}

const maritalMap: Record<string, string> = {
  single: 'Soltero/a',
  married: 'Casado/a',
  divorced: 'Divorciado/a',
  widowed: 'Viudo/a',
  commonLaw: 'Unión Libre'
}

const countryMap: Record<string, string> = {
  CO: 'Colombia',
  VE: 'Venezuela',
  EC: 'Ecuador',
  PE: 'Perú',
  MX: 'México',
  AR: 'Argentina',
  CL: 'Chile',
  US: 'Estados Unidos'
}

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Typography variant='body2' className='font-medium text-textSecondary mbe-1'>
      {label}
    </Typography>
    <Typography>{value || '-'}</Typography>
  </Grid>
)

const UserRightTabs = ({ user }: { user: UserData }) => {
  const [activeTab, setActiveTab] = useState('info')

  return (
    <Card>
      <TabContext value={activeTab}>
        <TabList onChange={(_, value) => setActiveTab(value)} className='border-be'>
          <Tab label='Información Personal' value='info' icon={<i className='ri-user-line' />} iconPosition='start' />
          <Tab label='Ubicación' value='location' icon={<i className='ri-map-pin-line' />} iconPosition='start' />
        </TabList>
        <TabPanel value='info'>
          <CardContent>
            <Grid container spacing={4}>
              <InfoRow label='Nombre' value={user.firstName} />
              <InfoRow label='Apellido' value={user.lastName} />
              <InfoRow label='Tipo de Documento' value={user.documentType ? docTypeMap[user.documentType] || user.documentType : null} />
              <InfoRow label='Número de Documento' value={user.documentNumber} />
              <InfoRow label='Género' value={user.gender ? genderMap[user.gender] || user.gender : null} />
              <InfoRow label='Fecha de Nacimiento' value={user.birthDate ? new Date(user.birthDate).toLocaleDateString('es-CO') : null} />
              <InfoRow label='Estado Civil' value={user.maritalStatus ? maritalMap[user.maritalStatus] || user.maritalStatus : null} />
              <InfoRow label='Hijos' value={user.hasChildren ? `Sí (${user.childrenCount})` : 'No'} />
              <InfoRow label='Teléfono' value={user.phone} />
            </Grid>
          </CardContent>
        </TabPanel>
        <TabPanel value='location'>
          <CardContent>
            <Grid container spacing={4}>
              <InfoRow label='País' value={user.country ? countryMap[user.country] || user.country : null} />
              <InfoRow label='Ciudad' value={user.city} />
              <InfoRow label='Dirección' value={user.address} />
              <InfoRow label='Barrio' value={user.neighborhood} />
            </Grid>
          </CardContent>
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default UserRightTabs
