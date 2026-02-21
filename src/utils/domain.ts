/**
 * Helper centralizado para obtener el dominio principal de la aplicación.
 * Usa la variable de entorno NEXT_PUBLIC_MAIN_DOMAIN, con fallback a localhost:3000 en desarrollo.
 */
export const getMainDomain = (): string => {
  return process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
}

/**
 * Construye la URL base del dominio principal con protocolo.
 */
export const getMainDomainUrl = (): string => {
  const domain = getMainDomain()
  const protocol = domain.includes('localhost') ? 'http' : 'https'

  return `${protocol}://${domain}`
}
