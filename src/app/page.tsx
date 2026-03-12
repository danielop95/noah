import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

const RootPage = async () => {
  const session = await getServerSession(authOptions)

  redirect(session ? '/dashboard' : '/login')
}

export default RootPage
