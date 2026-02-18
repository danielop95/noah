// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
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
    isSection: true,
    label: dictionary['navigation'].administracion,
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

export default verticalMenuData
