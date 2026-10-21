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
    label: dictionary['navigation'].solicitudes,
    icon: 'solar-clipboard-list-linear',
    href: '/dashboard/solicitudes'
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
        label: dictionary['navigation'].areas,
        icon: 'solar-buildings-3-linear',
        href: '/dashboard/admin/areas',
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
  },
  {
    isSection: true,
    label: dictionary['navigation'].institutoLife,
    children: [
      {
        label: dictionary['navigation'].institutoDashboard,
        icon: 'solar-chart-2-linear',
        href: '/dashboard/instituto'
      },
      {
        label: dictionary['navigation'].institutoCursos,
        icon: 'solar-notebook-linear',
        href: '/dashboard/instituto/cursos',
        maxHierarchy: 2
      },
      {
        label: dictionary['navigation'].institutoCohortes,
        icon: 'solar-users-group-two-rounded-linear',
        href: '/dashboard/instituto/cohortes'
      },
      {
        label: dictionary['navigation'].institutoInscripciones,
        icon: 'solar-clipboard-list-linear',
        href: '/dashboard/instituto/inscripciones',
        maxHierarchy: 2
      },
      {
        label: dictionary['navigation'].institutoMisCursos,
        icon: 'solar-book-2-linear',
        href: '/dashboard/instituto/mis-cursos'
      }
    ]
  }
]

export default verticalMenuData
