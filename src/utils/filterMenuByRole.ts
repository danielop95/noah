// Type Imports
import type { VerticalMenuDataType, HorizontalMenuDataType } from '@/types/menuTypes'

/**
 * Filtra items del menú vertical basado en la jerarquía del usuario.
 * Items sin `maxHierarchy` definido son visibles para todos.
 * Items con `maxHierarchy` solo son visibles si la jerarquía del usuario es <= maxHierarchy.
 */
export function filterVerticalMenuByRole(
  menuData: VerticalMenuDataType[],
  userHierarchy: number
): VerticalMenuDataType[] {
  return menuData
    .filter(item => {
      if (!('maxHierarchy' in item) || item.maxHierarchy === undefined) {
        return true
      }

      return userHierarchy <= item.maxHierarchy
    })
    .map(item => {
      if ('children' in item && item.children) {
        return {
          ...item,
          children: filterVerticalMenuByRole(item.children, userHierarchy)
        }
      }

      return item
    })
    .filter(item => {
      if ('isSection' in item && item.isSection && 'children' in item) {
        return item.children && item.children.length > 0
      }

      return true
    })
}

/**
 * Filtra items del menú horizontal basado en la jerarquía del usuario.
 */
export function filterHorizontalMenuByRole(
  menuData: HorizontalMenuDataType[],
  userHierarchy: number
): HorizontalMenuDataType[] {
  return menuData
    .filter(item => {
      if (!('maxHierarchy' in item) || item.maxHierarchy === undefined) {
        return true
      }

      return userHierarchy <= item.maxHierarchy
    })
    .map(item => {
      if ('children' in item && item.children) {
        return {
          ...item,
          children: filterHorizontalMenuByRole(item.children, userHierarchy)
        }
      }

      return item
    })
    .filter(item => {
      if ('children' in item && item.children) {
        return item.children.length > 0
      }

      return true
    })
}
