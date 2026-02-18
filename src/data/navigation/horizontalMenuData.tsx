// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const horizontalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): HorizontalMenuDataType[] => [
  {
    label: dictionary['navigation'].inicio,
    icon: 'ri-home-smile-line',
    href: '/dashboards'
  },
  {
    label: dictionary['navigation'].miCuenta,
    icon: 'ri-user-settings-line',
    href: '/account-settings'
  },
  {
    label: dictionary['navigation'].administracion,
    icon: 'ri-shield-star-line',
    roles: ['admin'],
    children: [
      {
        label: dictionary['navigation'].usuarios,
        icon: 'ri-group-line',
        href: '/admin/usuarios',
        roles: ['admin']
      },
      {
        label: dictionary['navigation'].configuracion,
        icon: 'ri-settings-3-line',
        href: '/admin/configuracion',
        roles: ['admin']
      }
    ]
  }
]

export default horizontalMenuData
