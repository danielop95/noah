type SearchData = {
  id: string
  name: string
  url: string
  excludeLang?: boolean
  icon: string
  section: string
  shortcut?: string
}

const data: SearchData[] = [
  {
    id: '1',
    name: 'Inicio',
    url: '/dashboard',
    icon: 'solar-home-smile-linear',
    section: 'Dashboards'
  },
  {
    id: '2',
    name: 'Mi Cuenta',
    url: '/dashboard/account-settings',
    icon: 'solar-user-circle-linear',
    section: 'Paginas'
  },
  {
    id: '3',
    name: 'Usuarios',
    url: '/dashboard/admin/usuarios',
    icon: 'solar-users-group-rounded-linear',
    section: 'Administracion'
  },
  {
    id: 'instituto',
    name: 'Instituto Life',
    url: '/dashboard/instituto',
    icon: 'solar-square-academic-cap-linear',
    section: 'Instituto'
  },
  {
    id: 'instituto-cursos',
    name: 'Cursos del instituto',
    url: '/dashboard/instituto/cursos',
    icon: 'solar-notebook-linear',
    section: 'Instituto'
  },
  {
    id: 'instituto-cohortes',
    name: 'Cohortes',
    url: '/dashboard/instituto/cohortes',
    icon: 'solar-users-group-two-rounded-linear',
    section: 'Instituto'
  },
  {
    id: 'instituto-inscripciones',
    name: 'Inscripciones',
    url: '/dashboard/instituto/inscripciones',
    icon: 'solar-clipboard-list-linear',
    section: 'Instituto'
  },
  {
    id: 'instituto-mis-cursos',
    name: 'Mis cursos (Instituto)',
    url: '/dashboard/instituto/mis-cursos',
    icon: 'solar-book-2-linear',
    section: 'Instituto'
  }
]

export default data
