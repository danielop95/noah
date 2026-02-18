'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import LoginTabContent from './landing/LoginTabContent'
import RegisterTabContent from './landing/RegisterTabContent'

const NoahLanding = ({ mode }: { mode: Mode }) => {
  const [tabValue, setTabValue] = useState('acceder')

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

              <TabPanel value='acceder' sx={{ p: 0 }}>
                <LoginTabContent />
              </TabPanel>

              <TabPanel value='registrar' sx={{ p: 0 }}>
                <RegisterTabContent />
              </TabPanel>
            </TabContext>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NoahLanding
