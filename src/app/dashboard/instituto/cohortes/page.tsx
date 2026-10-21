import PermissionGuard from '@/hocs/PermissionGuard'
import CohortesView from '@/views/instituto/cohortes'
import { getAllCohorts, getAllCourses } from '@/app/server/institutoActions'

export const metadata = { title: 'Cohortes — Instituto Life' }

async function PageContent() {
  const [cohorts, courses] = await Promise.all([getAllCohorts(), getAllCourses()])

  return <CohortesView cohorts={cohorts} courses={courses} />
}

export default function CohortesPage() {
  return (
    <PermissionGuard permission='instituto.ver'>
      <PageContent />
    </PermissionGuard>
  )
}
