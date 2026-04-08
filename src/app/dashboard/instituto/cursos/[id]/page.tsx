import { notFound } from 'next/navigation'

import PermissionGuard from '@/hocs/PermissionGuard'
import CourseDetailView from '@/views/instituto/cursos/CourseDetail'
import { getCourseById } from '@/app/server/institutoActions'

type Props = { params: Promise<{ id: string }> }

const CourseDetailPage = async ({ params }: Props) => {
  const { id } = await params
  const course = await getCourseById(id)

  if (!course) notFound()

  return (
    <PermissionGuard permission='instituto.ver'>
      <CourseDetailView course={course} />
    </PermissionGuard>
  )
}

export default CourseDetailPage
