'use client'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

import CohortListTable from './CohortListTable'
import type { CohortWithDetails, CourseWithLevels } from '@/app/server/institutoActions'

type Props = {
  cohorts: CohortWithDetails[]
  courses: CourseWithLevels[]
}

const CohortesView = ({ cohorts, courses }: Props) => {
  const router = useRouter()

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h5'>Cohortes del Instituto</Typography>
        <Typography variant='body2' color='text.secondary'>
          Gestiona las cohortes activas y programadas del Instituto Life
        </Typography>
      </div>
      <Card>
        <CohortListTable cohorts={cohorts} courses={courses} onRefresh={() => router.refresh()} />
      </Card>
    </div>
  )
}

export default CohortesView
