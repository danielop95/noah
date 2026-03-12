// Next Imports
import { getServerSession } from 'next-auth'

// MUI Imports
import Button from '@mui/material/Button'

// Auth Imports
import { authOptions } from '@/libs/auth'

// Type Imports
import type { ChildrenType } from '@core/types'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import HorizontalFooter from '@components/layout/horizontal/Footer'
import ScrollToTop from '@core/components/scroll-to-top'
import AuthGuard from '@/hocs/AuthGuard'

// Util Imports
import { getDictionaryFromCookie, getLocaleFromCookie } from '@/utils/getDictionary'
import { getMode, getSystemMode } from '@core/utils/serverHelpers'

const DashboardLayout = async ({ children }: ChildrenType) => {
  const session = await getServerSession(authOptions)
  const locale = await getLocaleFromCookie()
  const dictionary = await getDictionaryFromCookie()
  const mode = await getMode()
  const systemMode = await getSystemMode()
  const userHierarchy = session?.user?.roleHierarchy ?? 999

  return (
    <AuthGuard>
      <LayoutWrapper
        systemMode={systemMode}
        verticalLayout={
          <VerticalLayout
            navigation={<Navigation dictionary={dictionary} mode={mode} userHierarchy={userHierarchy} />}
            navbar={<Navbar />}
            footer={<VerticalFooter />}
          >
            {children}
          </VerticalLayout>
        }
        horizontalLayout={
          <HorizontalLayout header={<Header dictionary={dictionary} userHierarchy={userHierarchy} />} footer={<HorizontalFooter />}>
            {children}
          </HorizontalLayout>
        }
      />
      <ScrollToTop className='mui-fixed'>
        <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
          <i className='ri-arrow-up-line' />
        </Button>
      </ScrollToTop>
    </AuthGuard>
  )
}

export default DashboardLayout
