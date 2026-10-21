import { notFound } from 'next/navigation'

import PermissionGuard from '@/hocs/PermissionGuard'
import CourseDetailView from '@/views/instituto/cursos/CourseDetail'
import { getCourseById } from '@/app/server/institutoActions'

type Props = { params: Promise<{ id: string }> }

async function PageContent({ id }: { id: string }) {
  const course = await getCourseById(id)

  if (!course) notFound()

  return <CourseDetailView course={course} />
}

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <PermissionGuard permission='instituto.ver'>
      <PageContent id={id} />
    </PermissionGuard>
  )
}
