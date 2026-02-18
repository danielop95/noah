'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { TenantBranding } from '@/services/organizationService'

// Contexto para el branding del tenant
const TenantContext = createContext<TenantBranding | null>(null)

// Hook para acceder al tenant
export const useTenant = () => {
  return useContext(TenantContext)
}

// Provider props
type TenantProviderProps = {
  children: ReactNode
  tenant: TenantBranding | null
}

// Provider del tenant
export const TenantProvider = ({ children, tenant }: TenantProviderProps) => {
  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>
}

export default TenantContext
