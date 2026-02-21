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
    icon: 'ri-home-smile-line',
    section: 'Dashboards'
  },
  {
    id: '2',
    name: 'Mi Cuenta',
    url: '/dashboard/account-settings',
    icon: 'ri-user-settings-line',
    section: 'Paginas'
  },
  {
    id: '3',
    name: 'Usuarios',
    url: '/dashboard/admin/usuarios',
    icon: 'ri-group-line',
    section: 'Administracion'
  }
]

export default data
