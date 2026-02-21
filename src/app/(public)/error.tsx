'use client'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Box className='flex flex-col items-center justify-center min-h-screen p-8'>
      <Typography variant='h4' className='mb-4'>
        Algo salió mal
      </Typography>
      <Typography variant='body1' color='text.secondary' className='mb-6'>
        Ocurrió un error inesperado. Por favor intenta de nuevo.
      </Typography>
      <Button variant='contained' onClick={reset}>
        Reintentar
      </Button>
    </Box>
  )
}
