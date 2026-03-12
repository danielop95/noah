import Link from 'next/link'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function NotFound() {
  return (
    <Box className='flex flex-col items-center justify-center min-h-screen p-8'>
      <Typography variant='h1' className='mb-2 text-8xl font-bold' color='primary'>
        404
      </Typography>
      <Typography variant='h5' className='mb-4'>
        Página no encontrada
      </Typography>
      <Typography variant='body1' color='text.secondary' className='mb-6'>
        La página que buscas no existe o fue movida.
      </Typography>
      <Link href='/'>
        <Button variant='contained'>Ir al inicio</Button>
      </Link>
    </Box>
  )
}
