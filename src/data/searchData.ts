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
    url: '/dashboards',
    icon: 'ri-home-smile-line',
    section: 'Dashboards'
  },
  {
    id: '2',
    name: 'Mi Cuenta',
    url: '/account-settings',
    icon: 'ri-user-settings-line',
    section: 'Páginas'
  },
  {
    id: '3',
    name: 'Usuarios',
    url: '/admin/usuarios',
    icon: 'ri-group-line',
    section: 'Administración'
  }
]

export default data
