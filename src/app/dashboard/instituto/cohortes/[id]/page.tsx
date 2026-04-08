import { notFound } from 'next/navigation'

import PermissionGuard from '@/hocs/PermissionGuard'
import CohortDetailView from '@/views/instituto/cohortes/detail'
import { getCohortById, getEnrollmentsByCohort, getAttendanceByCohort } from '@/app/server/institutoActions'

type Props = { params: Promise<{ id: string }> }

const CohortDetailPage = async ({ params }: Props) => {
  const { id } = await params
  const [cohort, enrollments, attendanceData] = await Promise.all([
    getCohortById(id),
    getEnrollmentsByCohort(id),
    getAttendanceByCohort(id)
  ])

  if (!cohort) notFound()

  return (
    <PermissionGuard permission='instituto.ver'>
      <CohortDetailView cohort={cohort} enrollments={enrollments} attendanceData={attendanceData} />
    </PermissionGuard>
  )
}

export default CohortDetailPage
