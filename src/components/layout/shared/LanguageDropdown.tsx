'use client'

import { useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import type { Locale } from '@configs/i18n'
import { useSettings } from '@core/hooks/useSettings'
import { useLocale } from '@/contexts/LocaleContext'

type LanguageDataType = {
  langCode: Locale
  langName: string
  flag: string
}

const languageData: LanguageDataType[] = [
  {
    langCode: 'es',
    langName: 'Español',
    flag: '🇪🇸'
  },
  {
    langCode: 'en',
    langName: 'English',
    flag: '🇺🇸'
  },
  {
    langCode: 'fr',
    langName: 'Français',
    flag: '🇫🇷'
  },
  {
    langCode: 'ar',
    langName: 'العربية',
    flag: '🇸🇦'
  }
]

const LanguageDropdown = () => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()
  const { settings } = useSettings()
  const { locale, setLocale } = useLocale()

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale)
    handleClose()

    // Recargar la página para aplicar traducciones
    router.refresh()
  }

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='!text-textPrimary'>
        <i className='ri-translate-2' />
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-start'
        anchorEl={anchorRef.current}
        className='min-is-[160px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top' }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList onKeyDown={handleClose}>
                  {languageData.map(lang => (
                    <MenuItem
                      key={lang.langCode}
                      onClick={() => handleLanguageChange(lang.langCode)}
                      selected={locale === lang.langCode}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>{lang.flag}</ListItemIcon>
                      <ListItemText>{lang.langName}</ListItemText>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default LanguageDropdown
