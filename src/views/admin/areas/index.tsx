'use client'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

import AreaListTable, { type AreaRow } from './AreaListTable'

type AreasViewProps = {
  areas: AreaRow[]
}

const AreasView = ({ areas }: AreasViewProps) => {
  const router = useRouter()

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h4'>Áreas / Ministerios</Typography>
        <Typography variant='body2' color='textSecondary'>
          Administra las áreas operativas de la iglesia y sus líderes para el flujo de solicitudes interáreas
        </Typography>
      </div>

      <Card>
        <AreaListTable areas={areas} onRefresh={() => router.refresh()} />
      </Card>
    </div>
  )
}

export default AreasView
