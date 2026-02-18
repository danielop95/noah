'use client'

// React Imports
import { useState, useRef } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Fade from '@mui/material/Fade'

type ColorPickerProps = {
  label: string
  value: string
  onChange: (color: string) => void
  previewName?: string
}

// Determinar si el color es oscuro para ajustar el texto
const isColorDark = (hex: string) => {
  if (!hex || hex.length < 7) return false

  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance < 0.5
}

const ColorPicker = ({ label, value, onChange, previewName = 'Tu Iglesia' }: ColorPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const textColor = isColorDark(value) ? '#ffffff' : '#1a1a1a'

  return (
    <Box className='flex-1'>
      <Typography variant='caption' className='text-textSecondary mb-2 block font-medium'>
        {label}
      </Typography>

      <Tooltip
        title={
          <Box sx={{ p: 1.5, minWidth: 200 }}>
            <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 1.5, fontWeight: 500 }}>
              Vista previa del color
            </Typography>
            <Box
              sx={{
                bgcolor: value,
                borderRadius: 2,
                p: 2,
                mb: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <Typography variant='subtitle2' sx={{ color: textColor, fontWeight: 600 }}>
                {previewName}
              </Typography>
              <Typography variant='caption' sx={{ color: textColor, opacity: 0.8 }}>
                Texto de ejemplo
              </Typography>
            </Box>
            <Box className='flex gap-2 items-center'>
              <Button
                size='small'
                variant='contained'
                sx={{
                  bgcolor: value,
                  color: textColor,
                  fontSize: '0.7rem',
                  py: 0.5,
                  px: 1.5,
                  minWidth: 'auto',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: value, filter: 'brightness(0.9)' }
                }}
              >
                Boton
              </Button>
              <Box
                sx={{
                  bgcolor: value,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              />
            </Box>
          </Box>
        }
        placement='top'
        arrow
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: '#1e293b',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              '& .MuiTooltip-arrow': {
                color: '#1e293b'
              }
            }
          }
        }}
      >
        <Box
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            borderRadius: 2,
            border: '2px solid',
            borderColor: isHovered ? value : 'divider',
            bgcolor: isHovered ? `${value}08` : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: `0 0 0 3px ${value}20`
            }
          }}
        >
          {/* Color swatch */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: value,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: '2px solid white',
              outline: '1px solid',
              outlineColor: 'divider',
              transition: 'transform 0.2s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />

          {/* Hex input */}
          <Box className='flex-1'>
            <TextField
              size='small'
              value={value.toUpperCase()}
              onChange={e => {
                const val = e.target.value

                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onChange(val)
                }
              }}
              onClick={e => e.stopPropagation()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }
              }}
              fullWidth
            />
          </Box>

          {/* Hidden color input */}
          <input
            ref={inputRef}
            type='color'
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          />

          {/* Color picker icon */}
          <Box
            sx={{
              color: isHovered ? value : 'text.secondary',
              transition: 'color 0.2s ease'
            }}
          >
            <i className='ri-palette-line text-xl' />
          </Box>
        </Box>
      </Tooltip>
    </Box>
  )
}

export default ColorPicker
