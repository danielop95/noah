// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  {
    label: dictionary['navigation'].inicio,
    icon: 'solar-home-smile-linear',
    href: '/dashboard'
  },
  {
    label: dictionary['navigation'].calendario,
    icon: 'solar-calendar-linear',
    href: '/dashboard/calendario'
  },
  {
    label: dictionary['navigation'].miCuenta,
    icon: 'solar-user-circle-linear',
    href: '/dashboard/account-settings'
  },
  {
    label: dictionary['navigation'].reportes,
    icon: 'solar-chart-square-linear',
    children: [
      {
        label: dictionary['navigation'].reportes,
        icon: 'solar-chart-square-linear',
        href: '/dashboard/reportes'
      },
      {
        label: dictionary['navigation'].pendientes,
        icon: 'solar-clipboard-text-linear',
        href: '/dashboard/reportes/pendientes'
      }
    ]
  },
  {
    isSection: true,
    label: dictionary['navigation'].administracion,
    maxHierarchy: 2,
    children: [
      {
        label: dictionary['navigation'].usuarios,
        icon: 'solar-users-group-rounded-linear',
        href: '/dashboard/admin/usuarios',
        maxHierarchy: 2
      },
      {
        label: dictionary['navigation'].redes,
        icon: 'solar-share-circle-linear',
        href: '/dashboard/admin/redes',
        maxHierarchy: 2
      },
      {
        label: dictionary['navigation'].grupos,
        icon: 'solar-widget-2-linear',
        href: '/dashboard/admin/grupos',
        maxHierarchy: 2
      },
      {
        label: dictionary['navigation'].roles,
        icon: 'solar-shield-keyhole-linear',
        href: '/dashboard/admin/roles',
        maxHierarchy: 2
      },
      {
        label: dictionary['navigation'].configuracion,
        icon: 'solar-settings-minimalistic-linear',
        href: '/dashboard/admin/configuracion',
        maxHierarchy: 2
      }
    ]
  }
]

export default verticalMenuData
