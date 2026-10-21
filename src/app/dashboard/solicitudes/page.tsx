import PermissionGuard from '@/hocs/PermissionGuard'
import BandejaView from '@/views/solicitudes/BandejaView'
import {
  getMisSolicitudes,
  getSolicitudesAMiArea,
  getTodasLasSolicitudes,
  getSolicitudesBandejaCounts
} from '@/app/server/solicitudesActions'
import { checkPermission } from '@/app/server/helpers'
import { getAreasForSelect } from '@/app/server/areasActions'

export const metadata = {
  title: 'Solicitudes - Noah',
  description: 'Gestiona solicitudes de apoyo interáreas'
}

const SolicitudesPage = async () => {
  const canVerTodas = await checkPermission('solicitudes', 'verTodas')
  const canCrear = await checkPermission('solicitudes', 'crear')

  const [mis, miAreaLider, miAreaMiembro, todas, counts, areas] = await Promise.all([
    getMisSolicitudes().catch(() => []),
    getSolicitudesAMiArea({ rol: 'lider' }).catch(() => []),
    getSolicitudesAMiArea({ rol: 'miembro' }).catch(() => []),
    canVerTodas ? getTodasLasSolicitudes().catch(() => []) : Promise.resolve([]),
    getSolicitudesBandejaCounts().catch(() => ({ mis: 0, miAreaLider: 0, miAreaMiembro: 0, todas: 0 })),
    getAreasForSelect().catch(() => [])
  ])

  return (
    <PermissionGuard permission='solicitudes.ver'>
      <BandejaView
        mis={mis}
        miAreaLider={miAreaLider}
        miAreaMiembro={miAreaMiembro}
        todas={todas}
        counts={counts}
        areas={areas}
        canVerTodas={canVerTodas}
        canCrear={canCrear}
      />
    </PermissionGuard>
  )
}

export default SolicitudesPage
