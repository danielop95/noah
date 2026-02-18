'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { CalendarColors, CalendarCategory } from './types'

type Props = {
  isAdmin: boolean
  calendarsColor: CalendarColors
  selectedCategories: CalendarCategory[]
  handleAddEvent: () => void
  handleToggleCategory: (category: CalendarCategory) => void
}

const categoryLabels: Record<CalendarCategory, string> = {
  culto: 'Cultos',
  evento: 'Eventos',
  reunion: 'Reuniones',
  actividad: 'Actividades',
  capacitacion: 'Capacitaciones'
}

const CalendarFiltersBar = (props: Props) => {
  const { isAdmin, calendarsColor, selectedCategories, handleAddEvent, handleToggleCategory } = props

  const theme = useTheme()
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const colorsArr = Object.entries(calendarsColor) as [CalendarCategory, ThemeColor][]

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 1, sm: 2 },
        mb: 2
      }}
    >
      {/* Filtros de categoría - scroll horizontal en móvil */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 0.5,
          // Ocultar scrollbar pero mantener funcionalidad
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        {colorsArr.map(([key, colorName]) => {
          const isSelected = selectedCategories.includes(key)
          const color = theme.palette[colorName].main

          return (
            <Chip
              key={key}
              label={categoryLabels[key]}
              size={isMobile ? 'small' : 'medium'}
              onClick={() => handleToggleCategory(key)}
              sx={{
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                backgroundColor: isSelected ? alpha(color, 0.15) : 'transparent',
                color: isSelected ? color : theme.palette.text.secondary,
                border: `1px solid ${isSelected ? color : theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: alpha(color, 0.1),
                  borderColor: color
                }
              }}
            />
          )
        })}
      </Box>

      {/* Botón agregar evento (solo admin) */}
      {isAdmin && (
        isMobile ? (
          <IconButton
            color='primary'
            onClick={handleAddEvent}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            <i className='ri-add-line' />
          </IconButton>
        ) : (
          <Button
            variant='contained'
            onClick={handleAddEvent}
            startIcon={<i className='ri-add-line' />}
            sx={{
              borderRadius: '10px',
              px: 3,
              flexShrink: 0
            }}
          >
            Agregar Evento
          </Button>
        )
      )}
    </Box>
  )
}

export default CalendarFiltersBar
