import PermissionGuard from '@/hocs/PermissionGuard'
import CohortesView from '@/views/instituto/cohortes'
import { getAllCohorts, getAllCourses } from '@/app/server/institutoActions'

export const metadata = { title: 'Cohortes — Instituto Life' }

const CohortesPage = async () => {
  const [cohorts, courses] = await Promise.all([getAllCohorts(), getAllCourses()])

  return (
    <PermissionGuard permission='instituto.ver'>
      <CohortesView cohorts={cohorts} courses={courses} />
    </PermissionGuard>
  )
}

export default CohortesPage
