'use client'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

import CourseListTable from './CourseListTable'
import type { CourseWithLevels } from '@/app/server/institutoActions'

type Props = {
  courses: CourseWithLevels[]
}

const CursosView = ({ courses }: Props) => {
  const router = useRouter()

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h5'>Cursos del Instituto</Typography>
        <Typography variant='body2' color='text.secondary'>
          Gestiona los cursos académicos del Instituto Life
        </Typography>
      </div>
      <Card>
        <CourseListTable courses={courses} onRefresh={() => router.refresh()} />
      </Card>
    </div>
  )
}

export default CursosView
