// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  {
    label: dictionary['navigation'].inicio,
    icon: 'ri-home-smile-line',
    href: '/dashboard'
  },
  {
    label: dictionary['navigation'].calendario,
    icon: 'ri-calendar-event-line',
    href: '/dashboard/calendario'
  },
  {
    label: dictionary['navigation'].miCuenta,
    icon: 'ri-user-settings-line',
    href: '/dashboard/account-settings'
  },
  {
    label: dictionary['navigation'].reportes,
    icon: 'ri-file-chart-line',
    href: '/dashboard/reportes'
  },
  {
    isSection: true,
    label: dictionary['navigation'].administracion,
    roles: ['admin'],
    children: [
      {
        label: dictionary['navigation'].usuarios,
        icon: 'ri-group-line',
        href: '/dashboard/admin/usuarios',
        roles: ['admin']
      },
      {
        label: dictionary['navigation'].redes,
        icon: 'ri-bubble-chart-line',
        href: '/dashboard/admin/redes',
        roles: ['admin']
      },
      {
        label: dictionary['navigation'].grupos,
        icon: 'ri-team-line',
        href: '/dashboard/admin/grupos',
        roles: ['admin']
      }
    ]
  }
]

export default verticalMenuData
