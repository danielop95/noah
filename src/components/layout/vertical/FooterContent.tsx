'use client'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NOAH_VERSION = 'v0.1.0-alpha'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span>{`© ${new Date().getFullYear()} Noah Church Management`}</span>
      </p>
      <p className='text-textSecondary'>
        <span>{NOAH_VERSION}</span>
      </p>
    </div>
  )
}

export default FooterContent
