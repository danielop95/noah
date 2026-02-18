'use client'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'

// Third-party imports
import classnames from 'classnames'

// Types Imports
import type { ThemeColor } from '@core/types'
import type { CalendarColors, CalendarCategory } from './types'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

type Props = {
  mdAbove: boolean
  calendarApi: any
  leftSidebarOpen: boolean
  isAdmin: boolean
  calendarsColor: CalendarColors
  selectedCategories: CalendarCategory[]
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
  handleToggleCategory: (category: CalendarCategory) => void
  handleToggleAll: (checked: boolean) => void
}

const categoryLabels: Record<CalendarCategory, string> = {
  culto: 'Cultos',
  evento: 'Eventos Especiales',
  reunion: 'Reuniones de Líderes',
  actividad: 'Actividades de Red',
  capacitacion: 'Capacitaciones'
}

const CalendarSidebar = (props: Props) => {
  const {
    mdAbove,
    leftSidebarOpen,
    calendarApi,
    calendarsColor,
    selectedCategories,
    isAdmin,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle,
    handleToggleCategory,
    handleToggleAll
  } = props

  const colorsArr = Object.entries(calendarsColor) as [CalendarCategory, ThemeColor][]

  const renderFilters = colorsArr.map(([key, value]) => {
    return (
      <FormControlLabel
        className='mbe-1'
        key={key}
        label={categoryLabels[key]}
        control={
          <Checkbox
            color={value}
            checked={selectedCategories.includes(key)}
            onChange={() => handleToggleCategory(key)}
          />
        }
      />
    )
  })

  const handleSidebarToggleSidebar = () => {
    handleAddEventSidebarToggle()
  }

  return (
    <Drawer
      open={leftSidebarOpen}
      onClose={handleLeftSidebarToggle}
      variant={mdAbove ? 'permanent' : 'temporary'}
      ModalProps={{
        disablePortal: true,
        disableAutoFocus: true,
        disableScrollLock: true,
        keepMounted: true
      }}
      className={classnames('block', { static: mdAbove, absolute: !mdAbove })}
      slotProps={{
        paper: {
          className: classnames('items-start is-[280px] shadow-none rounded rounded-se-none rounded-ee-none', {
            static: mdAbove,
            absolute: !mdAbove
          })
        }
      }}
      sx={{
        zIndex: 3,
        '& .MuiDrawer-paper': {
          zIndex: mdAbove ? 2 : 'drawer'
        },
        '& .MuiBackdrop-root': {
          borderRadius: 1,
          position: 'absolute'
        }
      }}
    >
      {isAdmin && (
        <>
          <div className='is-full p-5'>
            <Button fullWidth variant='contained' onClick={handleSidebarToggleSidebar} startIcon={<i className='ri-add-line' />}>
              Agregar Evento
            </Button>
          </div>
          <Divider className='is-full' />
        </>
      )}
      <AppReactDatepicker
        inline
        onChange={date => calendarApi?.gotoDate(date)}
        boxProps={{
          className: 'flex justify-center is-full',
          sx: { '& .react-datepicker': { boxShadow: 'none !important', border: 'none !important' } }
        }}
      />
      <Divider className='is-full' />

      <div className='flex flex-col p-5 is-full'>
        <Typography variant='h6' className='mbe-4'>
          Filtrar por Categoría
        </Typography>
        <FormControlLabel
          className='mbe-1'
          label='Ver Todo'
          control={
            <Checkbox
              color='secondary'
              checked={selectedCategories.length === colorsArr.length}
              indeterminate={selectedCategories.length > 0 && selectedCategories.length < colorsArr.length}
              onChange={e => handleToggleAll(e.target.checked)}
            />
          }
        />
        {renderFilters}
      </div>
    </Drawer>
  )
}

export default CalendarSidebar
