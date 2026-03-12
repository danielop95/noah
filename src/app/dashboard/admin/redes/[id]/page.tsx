// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import NetworkDetailView from '@/views/admin/redes/detail'

// Server Action Imports
import { getNetworkFullDetails } from '@/app/server/actions'

export const metadata = {
  title: 'Detalle de Red - Noah',
  description: 'Informacion completa de la red'
}

type Props = {
  params: Promise<{ id: string }>
}

const NetworkDetailPage = async ({ params }: Props) => {
  const { id } = await params

  const network = await getNetworkFullDetails(id)

  if (!network) {
    return (
      <div className='flex justify-center items-center min-bs-[400px]'>
        <p>Red no encontrada</p>
      </div>
    )
  }

  return (
    <AdminGuard>
      <NetworkDetailView network={network} />
    </AdminGuard>
  )
}

export default NetworkDetailPage
