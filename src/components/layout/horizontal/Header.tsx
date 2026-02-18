'use client'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'

// Component Imports
import Navigation from './Navigation'
import NavbarContent from './NavbarContent'
import Navbar from '@layouts/components/horizontal/Navbar'
import LayoutHeader from '@layouts/components/horizontal/Header'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

type HeaderProps = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  userRole?: string
}

const Header = ({ dictionary, userRole }: HeaderProps) => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <>
      <LayoutHeader>
        <Navbar>
          <NavbarContent />
        </Navbar>
        {!isBreakpointReached && <Navigation dictionary={dictionary} userRole={userRole} />}
      </LayoutHeader>
      {isBreakpointReached && <Navigation dictionary={dictionary} userRole={userRole} />}
    </>
  )
}

export default Header
