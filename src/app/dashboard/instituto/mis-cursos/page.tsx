import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/libs/auth'
import MisCursosView from '@/views/instituto/mis-cursos'
import { getEnrollmentsByUser, getAllCourses } from '@/app/server/institutoActions'

export const metadata = { title: 'Mis Cursos — Instituto Life' }

async function PageContent({ userId }: { userId: string }) {
  const [myEnrollments, courses] = await Promise.all([getEnrollmentsByUser(userId), getAllCourses()])

  return <MisCursosView myEnrollments={myEnrollments} courses={courses} userId={userId} />
}

export default async function MisCursosPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect('/login')

  return <PageContent userId={session.user.id} />
}
