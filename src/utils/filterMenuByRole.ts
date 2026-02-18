// Type Imports
import type { VerticalMenuDataType, HorizontalMenuDataType } from '@/types/menuTypes'

/**
 * Filtra items del menú vertical basado en el rol del usuario.
 * Items sin `roles` definido son visibles para todos.
 * Items con `roles` solo son visibles si el usuario tiene uno de esos roles.
 */
export function filterVerticalMenuByRole(
  menuData: VerticalMenuDataType[],
  userRole: string | undefined
): VerticalMenuDataType[] {
  return menuData
    .filter(item => {
      // Si no tiene roles definidos, es visible para todos
      if (!('roles' in item) || !item.roles || item.roles.length === 0) {
        return true
      }

      // Si tiene roles, verificar que el usuario tenga uno de ellos
      return item.roles.includes(userRole || 'user')
    })
    .map(item => {
      // Si tiene children, filtrar recursivamente
      if ('children' in item && item.children) {
        return {
          ...item,
          children: filterVerticalMenuByRole(item.children, userRole)
        }
      }

      return item
    })
    // Eliminar secciones vacías (sin children después del filtrado)
    .filter(item => {
      if ('isSection' in item && item.isSection && 'children' in item) {
        return item.children && item.children.length > 0
      }

      return true
    })
}

/**
 * Filtra items del menú horizontal basado en el rol del usuario.
 */
export function filterHorizontalMenuByRole(
  menuData: HorizontalMenuDataType[],
  userRole: string | undefined
): HorizontalMenuDataType[] {
  return menuData
    .filter(item => {
      if (!('roles' in item) || !item.roles || item.roles.length === 0) {
        return true
      }

      return item.roles.includes(userRole || 'user')
    })
    .map(item => {
      if ('children' in item && item.children) {
        return {
          ...item,
          children: filterHorizontalMenuByRole(item.children, userRole)
        }
      }

      return item
    })
    .filter(item => {
      // Eliminar submenús vacíos
      if ('children' in item && item.children) {
        return item.children.length > 0
      }

      return true
    })
}
