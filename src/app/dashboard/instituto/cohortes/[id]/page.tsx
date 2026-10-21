import { notFound } from 'next/navigation'

import PermissionGuard from '@/hocs/PermissionGuard'
import CohortDetailView from '@/views/instituto/cohortes/detail'
import { getCohortById, getEnrollmentsByCohort, getAttendanceByCohort } from '@/app/server/institutoActions'

type Props = { params: Promise<{ id: string }> }

async function PageContent({ id }: { id: string }) {
  const [cohort, enrollments, attendanceData] = await Promise.all([
    getCohortById(id),
    getEnrollmentsByCohort(id),
    getAttendanceByCohort(id)
  ])

  if (!cohort) notFound()

  return <CohortDetailView cohort={cohort} enrollments={enrollments} attendanceData={attendanceData} />
}

export default async function CohortDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <PermissionGuard permission='instituto.ver'>
      <PageContent id={id} />
    </PermissionGuard>
  )
}
