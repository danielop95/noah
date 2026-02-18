'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Card from '@mui/material/Card'

// Component Imports
import AccountTab from './account'
import SecurityTab from './security'

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('account')

  return (
    <Card>
      <TabContext value={activeTab}>
        <TabList onChange={(_, value) => setActiveTab(value)} className='border-be'>
          <Tab
            label='Cuenta'
            value='account'
            icon={<i className='ri-user-3-line' />}
            iconPosition='start'
          />
          <Tab
            label='Seguridad'
            value='security'
            icon={<i className='ri-lock-line' />}
            iconPosition='start'
          />
        </TabList>
        <TabPanel value='account'>
          <AccountTab />
        </TabPanel>
        <TabPanel value='security'>
          <SecurityTab />
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default AccountSettings
