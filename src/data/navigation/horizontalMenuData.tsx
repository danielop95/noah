// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const horizontalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): HorizontalMenuDataType[] => [
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
    label: dictionary['navigation'].administracion,
    icon: 'ri-shield-star-line',
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
      },
      {
        label: dictionary['navigation'].configuracion,
        icon: 'ri-settings-3-line',
        href: '/dashboard/admin/configuracion',
        roles: ['admin']
      }
    ]
  }
]

export default horizontalMenuData
